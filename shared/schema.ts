import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  passwordHash: text("password_hash").notNull(),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'work' | 'break'
  duration: integer("duration").notNull(), // in minutes
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  completed: boolean("completed").default(false),
  distractions: jsonb("distractions").default([]),
  taskId: varchar("task_id"),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default('todo'), // 'todo' | 'inprogress' | 'done'
  priority: text("priority").default('medium'), // 'low' | 'medium' | 'high'
  estimatedSessions: integer("estimated_sessions").default(1),
  completedSessions: integer("completed_sessions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const distractions = pgTable("distractions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => sessions.id).notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  password: z.string().min(6),
}).omit({
  passwordHash: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDistractionSchema = createInsertSchema(distractions).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Distraction = typeof distractions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertDistraction = z.infer<typeof insertDistractionSchema>;

// Additional types for settings
export const timerSettingsSchema = z.object({
  sessionDuration: z.number().min(1).max(120).default(50),
  shortBreak: z.number().min(1).max(30).default(10),
  longBreak: z.number().min(1).max(60).default(30),
  sessionsPerCycle: z.number().min(2).max(8).default(4),
  soundEnabled: z.boolean().default(true),
  browserNotifications: z.boolean().default(false),
  theme: z.enum(['light', 'dark']).default('light'),
});

export type TimerSettings = z.infer<typeof timerSettingsSchema>;

export const sessionStatsSchema = z.object({
  totalSessions: z.number(),
  totalHours: z.number(),
  completionRate: z.number(),
  distractionFreeRate: z.number(),
  longestStreak: z.number(),
  currentStreak: z.number(),
  bestDay: z.string(),
  bestHour: z.number(),
});

export type SessionStats = z.infer<typeof sessionStatsSchema>;
