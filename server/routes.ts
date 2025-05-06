import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import fs from "fs/promises";

export async function registerRoutes(app: Express): Promise<Server> {
  // Character routes
  app.get("/api/characters", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      let characters;

      if (category) {
        characters = await storage.getCharactersByCategory(category);
      } else {
        characters = await storage.getCharacters();
      }

      res.json(characters);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const character = await storage.getCharacter(id);

      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      res.json(character);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const character = req.body;
      const newCharacter = await storage.createCharacter(character);
      res.status(201).json(newCharacter);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chat messages routes
  app.get("/api/messages/:characterId/:sessionId", async (req, res) => {
    try {
      const characterId = parseInt(req.params.characterId);
      const sessionId = req.params.sessionId;

      const messages = await storage.getMessages(characterId, sessionId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const message = req.body;
      const newMessage = await storage.createMessage(message);
      res.status(201).json(newMessage);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Models routes
  app.get("/api/models", async (req, res) => {
    try {
      const models = await storage.getModels();
      res.json(models);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chat completion API route
  app.post("/api/chat/completions", async (req, res) => {
    try {
      const { model, messages, character } = req.body;

      // Make request to devsdocode API
      const response = await fetch("https://api.devsdocode.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer ddc-temp-free-e3b73cd814cc4f3ea79b5d4437912663"
        },
        body: JSON.stringify({
          model,
          messages
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          message: `API request failed with status ${response.status}`,
          error: errorText
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Image generation API route
  app.post("/api/images/generations", async (req, res) => {
    const { prompt } = req.body;
    // For demo purposes, using a placeholder image service
    const seed = Math.random().toString(36).substring(7);
    const imageUrl = `https://picsum.photos/seed/${seed}/400/400`;
    res.json({ url: imageUrl });
  });

  const httpServer = createServer(app);
  return httpServer;
}