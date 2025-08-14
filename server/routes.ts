import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSessionSchema, insertTaskSchema, insertDistractionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser({
        email: userData.email,
        firstName: userData.firstName || undefined,
        lastName: userData.lastName || undefined,
        password: userData.password,
      });
      
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || !await storage.verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    // Mock authenticated user for development
    const mockUser = {
      id: "mock-user-id",
      email: "john@example.com",
      firstName: "John",
      lastName: "Smith",
      settings: {},
      createdAt: new Date(),
    };
    res.json({ user: mockUser });
  });

  // Session routes
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      sessionData.userId = "mock-user-id"; // Use mock user for development
      const session = await storage.createSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const sessionId = req.params.id;
      const updates = req.body;
      const session = await storage.updateSession(sessionId, updates);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Update failed" });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const userId = "mock-user-id"; // Use mock user for development
      const sessions = await storage.getSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/active", async (req, res) => {
    try {
      const userId = "mock-user-id"; // Use mock user for development
      const session = await storage.getActiveSession(userId);
      res.json(session || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  });

  // Task routes
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      taskData.userId = "mock-user-id"; // Use mock user for development
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = req.params.id;
      const updates = req.body;
      const task = await storage.updateTask(taskId, updates);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: "Update failed" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = req.params.id;
      const deleted = await storage.deleteTask(taskId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ message: "Task deleted" });
    } catch (error) {
      res.status(400).json({ message: "Delete failed" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      const userId = "mock-user-id"; // Use mock user for development
      const tasks = await storage.getTasksByUser(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Distraction routes
  app.post("/api/distractions", async (req, res) => {
    try {
      const distractionData = insertDistractionSchema.parse(req.body);
      const distraction = await storage.createDistraction(distractionData);
      res.json(distraction);
    } catch (error) {
      res.status(400).json({ message: "Invalid distraction data" });
    }
  });

  app.get("/api/distractions/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const distractions = await storage.getDistractionsBySession(sessionId);
      res.json(distractions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch distractions" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const userId = "mock-user-id"; // Use mock user for development
      const stats = await storage.getSessionStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/analytics/heatmap", async (req, res) => {
    try {
      const userId = "mock-user-id"; // Use mock user for development
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const heatmapData = await storage.getHeatmapData(userId, year);
      res.json(heatmapData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch heatmap data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
