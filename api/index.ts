
import "dotenv/config";

import express from "express";
import session from "express-session";
import pg from "pg";
import connectPgSimple from "connect-pg-simple";
import { storage } from "../db/storage.ts"; // Adjust path as needed
import { insertUserSchema, insertSessionSchema, insertTaskSchema, insertDistractionSchema } from "@shared/schema.ts"; // Adjust path as needed

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const PgStore = connectPgSimple(session);

app.use(
  session({
    store: new PgStore({
      pool: pgPool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "a-very-strong-secret-that-is-at-least-32-characters-long",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

// All your routes from server/routes.ts go here
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
      
      // Set session (with proper session check)
      if (req.session) {
        req.session.userId = user.id;
      }
      
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
      
      // Set session (with proper session check)
      if (req.session) {
        req.session.userId = user.id;
      }
      
      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        req.session.destroy((err: any) => {});
        return res.status(401).json({ message: "User not found" });
      }

      const { passwordHash, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Authentication check failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Session routes
  app.post("/api/sessions", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const sessionData = insertSessionSchema.parse(req.body);
      sessionData.userId = req.session.userId;
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
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.session.userId;
      const sessions = await storage.getSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get("/api/sessions/active", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.session.userId;
      const session = await storage.getActiveSession(userId);
      res.json(session || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  });

  // Task routes
  app.post("/api/tasks", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const taskData = insertTaskSchema.parse(req.body);
      taskData.userId = req.session.userId;
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
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.session.userId;
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
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.session.userId;
      const stats = await storage.getSessionStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/analytics/heatmap", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.session.userId;
            const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const heatmapData = await storage.getHeatmapData(userId, year);
      res.json(heatmapData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch heatmap data" });
    }
  });


// Export the app instance for Vercel
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
