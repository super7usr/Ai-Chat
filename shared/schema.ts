import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import crypto from "crypto";

/**
 * Returns the SHA256 hash of the input string, base64 encoded.
 * @param input - The input string to hash.
 * @returns The base64-encoded SHA256 hash.
 */
export function hashBase64(input: string): string {
  return crypto.createHash("sha256").update(input).digest("base64");
}

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text  age: integer("age").notNull(),
  description: text("description").notNull(),
  welcomeMessage: text("welcome_message").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull().default("anime"),
});

export const insertCharacterSchema = createInsertSchema(characters);
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").notNull(),
  sessionId: text("session_id").notNull(),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(),
  messageType: text("message_type").notNull().default("text"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export const aiModels = pgTable("ai_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  description: text("description"),
});

export const insertModelSchema = createInsertSchema(aiModels).omit({ id: true });
export type InsertModel = z.infer<typeof insertModelSchema>;
export type AIModel = typeof aiModels.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;