import { type User, type Session, type Task, type Distraction, type InsertUser, type InsertSession, type InsertTask, type InsertDistraction, type TimerSettings, type SessionStats } from "@shared/schema";
import { randomUUID } from "crypto";
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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, Session>;
  private tasks: Map<string, Task>;
  private distractions: Map<string, Distraction>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.tasks = new Map();
    this.distractions = new Map();
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(userData: { email: string; firstName?: string; lastName?: string; password: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user: User = {
      id: randomUUID(),
      email: userData.email,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      passwordHash: hashedPassword,
      settings: {},
      createdAt: new Date(),
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async updateUserSettings(userId: string, settings: Partial<TimerSettings>): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, settings };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async createSession(session: Omit<InsertSession, 'id'>): Promise<Session> {
    const newSession: Session = {
      id: randomUUID(),
      ...session,
    };
    
    this.sessions.set(newSession.id, newSession);
    return newSession;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async getSessionsByUser(userId: string, startDate?: Date, endDate?: Date): Promise<Session[]> {
    let userSessions = Array.from(this.sessions.values()).filter(s => s.userId === userId);
    
    if (startDate && endDate) {
      userSessions = userSessions.filter(s => 
        s.startTime >= startDate && s.startTime <= endDate
      );
    }
    
    return userSessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async getActiveSession(userId: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values())
      .filter(s => s.userId === userId && !s.completed)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
  }

  async createTask(task: Omit<InsertTask, 'id'>): Promise<Task> {
    const newTask: Task = {
      id: randomUUID(),
      ...task,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates, updatedAt: new Date() };
    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    return this.tasks.delete(taskId);
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createDistraction(distraction: Omit<InsertDistraction, 'id'>): Promise<Distraction> {
    const newDistraction: Distraction = {
      id: randomUUID(),
      ...distraction,
      timestamp: new Date(),
    };
    
    this.distractions.set(newDistraction.id, newDistraction);
    return newDistraction;
  }

  async getDistractionsBySession(sessionId: string): Promise<Distraction[]> {
    return Array.from(this.distractions.values())
      .filter(d => d.sessionId === sessionId)
      .sort((a, b) => b.timestamp!.getTime() - a.timestamp!.getTime());
  }

  async getSessionStats(userId: string, startDate?: Date, endDate?: Date): Promise<SessionStats> {
    const allSessions = await this.getSessionsByUser(userId, startDate, endDate);
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

    const userSessions = await this.getSessionsByUser(userId, startDate, endDate);
    const completedSessions = userSessions.filter(s => s.completed);

    const heatmapData: Record<string, number> = {};
    
    completedSessions.forEach((session: Session) => {
      const date = session.startTime.toISOString().split('T')[0];
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    return heatmapData;
  }
}

export const storage = new MemStorage();
