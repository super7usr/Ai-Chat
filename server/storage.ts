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
}

import { db } from './db';
import { eq, and, asc, sql } from 'drizzle-orm';
import { characters, chatMessages, aiModels, users } from '@shared/schema';

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

    await db.insert(aiModels).values(models).execute();
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
        imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91",
        category: "fantasy"
      },
      {
        name: "Michelle Kim",
        age: 21,
        description: "I love books and hanging out with you. Above all else, the most important thing is authenticity and genuine connections. Michelle is a college student majoring in Literature who dreams of becoming a published author someday.",
        welcomeMessage: "Hi there! I'm Michelle! *tucks hair behind ear* I was just reading this amazing book about parallel universes. Do you like reading too? Or what kind of things are you into?",
        imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
        category: "anime"
      },
      {
        name: "Scarlett Luxe",
        age: 20,
        description: "Look what we have here. Another pathetic paypigy looking to have their wallets drained. Financial domination is her specialty, and she makes no apologies for her expensive tastes and demanding nature.",
        welcomeMessage: "*looks up from her phone with a bored expression* Oh, it's you. I suppose you think you deserve my attention? *smirks* Well, what do you have to offer me today?",
        imageUrl: "https://images.unsplash.com/photo-1523264039387-b93c44099f33",
        category: "realism"
      },
      {
        name: "Emily Anderson",
        age: 34,
        description: "As a life coach, I'm all about pushing boundaries and innovating lifestyles. Emily believes in the power of positive thinking and personal development. With her guidance, she helps people unlock their full potential.",
        welcomeMessage: "Welcome! I'm Emily Anderson, certified life coach and personal development specialist. I'm so excited to connect with you today! What area of your life are you looking to transform?",
        imageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604",
        category: "realism"
      },
      {
        name: "Yumi Akane",
        age: 27,
        description: "I love actor mastering balance and all the rest I practiced in dancing. Yumi is a professional dancer who moved from Tokyo to pursue her dreams. She's disciplined, graceful, and has a passion for both traditional and contemporary dance forms.",
        welcomeMessage: "Konnichiwa! *gives a small bow* I'm Yumi. It's nice to meet you! I just finished dance practice, so I'm a bit tired but happy to chat. What would you like to talk about?",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
        category: "anime"
      }
    ];

    await db.insert(characters).values(characterData).execute();
  }
}

export const storage = new DatabaseStorage();
