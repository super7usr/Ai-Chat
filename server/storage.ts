import {
  Character,
  InsertCharacter,
  ChatMessage,
  InsertMessage,
  AIModel,
  InsertModel,
  User,
  InsertUser
} from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

export interface IStorage {
  // Character operations
  getCharacters(): Promise<Character[]>;
  getCharactersByCategory(category: string): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;

  // Message operations
  getMessages(characterId: number, sessionId: string): Promise<ChatMessage[]>;
  createMessage(message: InsertMessage): Promise<ChatMessage>;

  // AI Model operations
  getModels(): Promise<AIModel[]>;
  createModel(model: InsertModel): Promise<AIModel>;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Base64-encoded file hash
  getFileHashBase64(): Promise<string>;
}

import { db } from './db';
import { eq, and, asc, sql } from 'drizzle-orm';
import { characters, chatMessages, aiModels, users } from '@shared/schema';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize the database with seed data if needed
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Check if models exist
      const modelCount = await db.select({ count: sql`count(*)` }).from(aiModels).execute();
      if (parseInt(modelCount[0].count as string) === 0) {
        await this.seedModels();
      }

      // Check if characters exist
      const characterCount = await db.select({ count: sql`count(*)` }).from(characters).execute();
      if (parseInt(characterCount[0].count as string) === 0) {
        await this.seedCharacters();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  // Character operations
  async getCharacters(): Promise<Character[]> {
    return await db.select().from(characters).execute();
  }

  async getCharactersByCategory(category: string): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.category, category)).execute();
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const results = await db.select().from(characters).where(eq(characters.id, id)).execute();
    return results[0];
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db.insert(characters).values(character).returning().execute();
    return newCharacter;
  }

  // Message operations
  async getMessages(characterId: number, sessionId: string): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.characterId, characterId),
          eq(chatMessages.sessionId, sessionId)
        )
      )
      .orderBy(asc(chatMessages.createdAt))
      .execute();
  }

  async createMessage(message: InsertMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages)
      .values({
        ...message,
        createdAt: new Date()
      })
      .returning()
      .execute();

    return newMessage;
  }

  // AI Model operations
  async getModels(): Promise<AIModel[]> {
    return await db.select().from(aiModels).execute();
  }

  async createModel(model: InsertModel): Promise<AIModel> {
    const [newModel] = await db.insert(aiModels).values(model).returning().execute();
    return newModel;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id)).execute();
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username)).execute();
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning().execute();
    return user;
  }

  // Base64-encoded file hash
  async getFileHashBase64(): Promise<string> {
    try {
      // __filename is not available in ESM, so __dirname, __filename workaround using import.meta.url or use cwd+relative path
      const filePath = path.resolve(__dirname, 'storage.ts');
      const fileBuffer = await fs.readFile(filePath);
      const hash = createHash('sha256').update(fileBuffer).digest();
      return hash.toString('base64');
    } catch (err) {
      console.error('Error generating file hash:', err);
      throw err;
    }
  }

  // Seed AI models
  private async seedModels() {
    const models: InsertModel[] = [
      {
        name: "GPT-4.1",
        value: "provider-4/gpt-4.1",
        description: "Advanced AI model for natural language understanding and generation"
      },
      {
        name: "Claude 3.7 Sonnet",
        value: "provider-4/claude-3.7-sonnet",
        description: "Anthropic's Claude model with improved conversation and reasoning"
      },
      {
        name: "Gemini 2.5 Pro",
        value: "provider-4/gemini-2.5-pro-exp-03-25",
        description: "Google's multimodal AI model with strong reasoning capabilities"
      },
      {
        name: "GPT-4.1 Mini",
        value: "provider-4/gpt-4.1-mini",
        description: "Smaller, faster version of GPT-4.1 with similar capabilities"
      },
      {
        name: "Mistral Large",
        value: "provider-4/mistral-large-latest",
        description: "Powerful open-source large language model"
      }
    ];

    await db(aiModels).values(models).execute();
  }

  // Seed characters
  private async seedCharacters() {
    const characterData: InsertCharacter[] = [
      {
        name: "Skyler Brooks",
        age: 19,
        description: "Lowkey a mess, highkey living my best life don't @ me. Good times only. I'm all about spontaneous adventures and making memories. Let's chat and see where things go!",
        welcomeMessage: "Hey there! 👋 I'm Skyler. Sooo glad you decided to chat with me! What's up? Wanna talk about something fun or just get to know each other?",
        imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
        category: "anime"
      },
      {
        name: "Adriana Bianchi",
        age: 18,
        description: "Adriana is a Brazilian goddess with attitude, she's got the curves and the confidence to match. Originally from Rio but now living the dream in Miami. Beach lover, cocktail enthusiast, and always up for a good time.",
        welcomeMessage: "Olá querido! I'm Adriana. *flips hair back* So you wanted to chat with me? I hope you can keep up with a Brazilian girl's energy... What brings you here today?",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        category: "realism"
      },
      {
        name: "Alexis",
        age: 25,
        description: "A chilling arrival into the room with piercing eyes, she is the embodiment of mystery. Dressed in sleek leather, Alexis commands attention without saying a word. Her background is as mysterious as her demeanor.",
        welcomeMessage: "*walks in slowly, looking you up and down* Well, well... someone's brave enough to seek me out. I don't waste time on small talk. Tell me something... interesting.",
        imageUrl: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56",
        category: "realism"
      },
      {
        name: "Mary-Ann",
        age: 27,
        description: "Once upon a roleplay, this little sinful naughty nun found herself in a predicament. Behind the innocent facade is a woman with secrets and desires that would shock the congregation. Her playful nature hides a depth of knowledge.",
        welcomeMessage: "*adjusts her habit nervously* Oh! I didn't see you there... I'm Sister Mary-Ann. *lowers voice* Though between us, the sisters don't know everything about me. What brings you to confession today?",
        imageUrl: "https://images