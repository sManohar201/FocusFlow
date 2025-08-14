import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSessionSchema, insertTaskSchema, insertDistractionSchema, timerSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.passwordHash);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      req.session.userId = user.id;
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        } 
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already exists" });
      }

      const user = await storage.createUser({ email, password, firstName, lastName });
      req.session.userId = user.id;
      
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        } 
      });
    } catch (error) {
      res.status(500).json({ error: "Signup failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        } 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user info" });
    }
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    next();
  };

  // Timer/Session routes
  app.post("/api/sessions", requireAuth, async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.patch("/api/sessions/:id", requireAuth, async (req, res) => {
    try {
      const session = await storage.updateSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Failed to update session" });
    }
  });

  app.get("/api/sessions", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const sessions = await storage.getSessionsByUser(
        req.session.userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/active", requireAuth, async (req, res) => {
    try {
      const session = await storage.getActiveSession(req.session.userId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active session" });
    }
  });

  // Task routes
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const tasks = await storage.getTasksByUser(req.session.userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId: req.session.userId,
      });
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteTask(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Distraction routes
  app.post("/api/distractions", requireAuth, async (req, res) => {
    try {
      const distractionData = insertDistractionSchema.parse(req.body);
      const distraction = await storage.createDistraction(distractionData);
      res.json(distraction);
    } catch (error) {
      res.status(400).json({ error: "Invalid distraction data" });
    }
  });

  app.get("/api/distractions/session/:sessionId", requireAuth, async (req, res) => {
    try {
      const distractions = await storage.getDistractionsBySession(req.params.sessionId);
      res.json(distractions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch distractions" });
    }
  });

  // Analytics routes
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const stats = await storage.getSessionStats(
        req.session.userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/heatmap/:year", requireAuth, async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const heatmapData = await storage.getHeatmapData(req.session.userId, year);
      res.json(heatmapData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch heatmap data" });
    }
  });

  // Settings routes
  app.patch("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = timerSettingsSchema.partial().parse(req.body);
      const user = await storage.updateUserSettings(req.session.userId, settings);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user.settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
