import { type User, type Session, type Task, type Distraction, type InsertUser, type InsertSession, type InsertTask, type InsertDistraction, type TimerSettings, type SessionStats } from "@shared/schema";
import { db } from "./db";
import { eq, gte, lte, sql, and, desc } from "drizzle-orm";
import { users, sessions, tasks, distractions } from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User management
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(userData: { email: string; firstName?: string; lastName?: string; password: string }): Promise<User>;
  updateUserSettings(userId: string, settings: Partial<TimerSettings>): Promise<User | undefined>;

  // Session management
  createSession(session: Omit<InsertSession, 'id'>): Promise<Session>;
  updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined>;
  getSessionsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<Session[]>;
  getActiveSession(userId: string): Promise<Session | undefined>;

  // Task management
  createTask(task: Omit<InsertTask, 'id'>): Promise<Task>;
  updateTask(taskId: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(taskId: string): Promise<boolean>;
  getTasksByUser(userId: string): Promise<Task[]>;

  // Distraction management
  createDistraction(distraction: Omit<InsertDistraction, 'id'>): Promise<Distraction>;
  getDistractionsBySession(sessionId: string): Promise<Distraction[]>;

  // Analytics
  getSessionStats(userId: string, startDate?: Date, endDate?: Date): Promise<SessionStats>;
  getHeatmapData(userId: string, year: number): Promise<Record<string, number>>;

  // Auth helpers
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(userData: { email: string; firstName?: string; lastName?: string; password: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [user] = await db.insert(users).values({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      passwordHash: hashedPassword,
      settings: {},
    }).returning();
    
    return user;
  }

  async updateUserSettings(userId: string, settings: Partial<TimerSettings>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ settings })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async createSession(session: Omit<InsertSession, 'id'>): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
    const [session] = await db.update(sessions)
      .set(updates)
      .where(eq(sessions.id, sessionId))
      .returning();
    return session;
  }

  async getSessionsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<Session[]> {
    const conditions = [eq(sessions.userId, userId)];

    if (startDate && endDate) {
      conditions.push(gte(sessions.startTime, startDate));
      conditions.push(lte(sessions.startTime, endDate));
    }

    return db.select().from(sessions)
      .where(and(...conditions))
      .orderBy(desc(sessions.startTime));
  }

  async getActiveSession(userId: string): Promise<Session | undefined> {
    const [session] = await db.select()
      .from(sessions)
      .where(and(
        eq(sessions.userId, userId),
        eq(sessions.completed, false)
      ))
      .orderBy(desc(sessions.startTime))
      .limit(1);
    return session;
  }

  async createTask(task: Omit<InsertTask, 'id'>): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db.update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();
    return task;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, taskId));
    return (result.rowCount || 0) > 0;
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return db.select().from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async createDistraction(distraction: Omit<InsertDistraction, 'id'>): Promise<Distraction> {
    const [newDistraction] = await db.insert(distractions).values(distraction).returning();
    return newDistraction;
  }

  async getDistractionsBySession(sessionId: string): Promise<Distraction[]> {
    return db.select().from(distractions)
      .where(eq(distractions.sessionId, sessionId))
      .orderBy(desc(distractions.timestamp));
  }

  async getSessionStats(userId: string, startDate?: Date, endDate?: Date): Promise<SessionStats> {
    const conditions = [eq(sessions.userId, userId)];

    if (startDate && endDate) {
      conditions.push(gte(sessions.startTime, startDate));
      conditions.push(lte(sessions.startTime, endDate));
    }

    const allSessions = await db.select().from(sessions)
      .where(and(...conditions));
    const completedSessions = allSessions.filter(s => s.completed);

    return {
      totalSessions: allSessions.length,
      totalHours: completedSessions.reduce((acc, s) => acc + (s.duration / 60), 0),
      completionRate: allSessions.length > 0 ? (completedSessions.length / allSessions.length) * 100 : 0,
      distractionFreeRate: 100, // TODO: Calculate based on distractions
      longestStreak: 0, // TODO: Calculate streak
      currentStreak: 0, // TODO: Calculate current streak
      bestDay: '', // TODO: Calculate best day
      bestHour: 9, // TODO: Calculate best hour
    };
  }

  async getHeatmapData(userId: string, year: number): Promise<Record<string, number>> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const userSessions = await db.select()
      .from(sessions)
      .where(and(
        eq(sessions.userId, userId),
        gte(sessions.startTime, startDate),
        lte(sessions.startTime, endDate),
        eq(sessions.completed, true)
      ));

    const heatmapData: Record<string, number> = {};
    
    userSessions.forEach((session: Session) => {
      const date = session.startTime.toISOString().split('T')[0];
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    return heatmapData;
  }
}

export const storage = new DatabaseStorage();