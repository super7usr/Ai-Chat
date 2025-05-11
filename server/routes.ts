import type { Express } from "expressimport { createServer, type Server } from "http";
import { storage from "./";
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

     .json(characters);
    } catch (error: any) {
 console.error("Error fetching characters:", error);
      res.status(500).json({ message: error.message || "Failed to fetch characters" });
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
      console.error("Error fetching character:", error);
      res.status(500).json({ message: error.message || "Failed to fetch character" });
    }
   app.post("/api/characters", async (req,) => {
    try {
      const character = req.body;
      const newCharacter = await storage.createCharacter(character);
      res.status(201).json(newCharacter    } catch (error: any) {
      console.error("Error creating character error);
      res.status(500).json({ message: error.message || "Failed to create character" });
    }
  });

  // Chat messages routes
  app.get("/api/messages/:characterId/:sessionId", async (, res) => {
    try {
      const characterId = parseInt(req.params.characterId);
      const session = req.params.sessionId;

      const messages = await storage.getMessages(characterId, sessionId);
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: error.message || "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const message = req.body;
      const newMessage = await storage.createMessage(message);
      res.status(201).json(newMessage);
 } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: error.message "Failed to create message" });
    }
  });

  // AI Models routes
  app.get("/api/models", async (req, res => {
    try {
      const models = await storage.getModels();
      res.json(models);
    } catch (error: any) {
     .error("Error fetching models:", error);
      res.status(500).json({ message: error.message || "Failed to fetch models" });
    }
 });

  // Chat completion API route
  app.post("//chat/completions", async (req, res) => {
    try {
      const { model, messages, character } = req.body;

      Make request tonsdecode API
      const response = await fetch("https://api.devnsdecode.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer ddc-temp-free-e3b73cd814cc4f3ea79b5d44437912663"
        },
        body: JSON.stringify({
          model,
          messages
        })
      });

      if (!response.ok)        const errorText = await response.text();
        return res.status(response.status).json({
          message: `API request with status ${response.status}`,
          error: errorText
        });
      }

      const data = await response.json();
      res.json);
    } catch (error: any) {
      console.error("Error making chat completion request:", error);
      res.status(500).json({ message: error.message || "Failed to complete chat" });
    }
  });

  // Image generation API route
  app.post("/api/images/generations async (req, res) => {
    try {
      const { prompt } = req.body;
      // For demo purposes, using a placeholder image service
      const seed = Math.random().toString(36).substring(7);
      const imageUrl = `https://picsum/seed/${seed}/400/400`;
      res.json({ url: imageUrl });
    } catch (error: any) {
      console.error("Error image:", error);
      res.status(500).json({ message: error.message || "Failed to generate image" });
    }
  });

  // Base64 encoded text route
  app.post("/api/base64/decode", async (req, res) => {
    {
      { encodedText } = req.body;

      if (!encodedText) {
        return res.status(400).json({ message: "Encoded text is" });
      }

      try        // Decode the base64 encoded text
        const decodedText = Buffer.from(encodedText, 'base64').String('utf-8');
        res.json({ decodedText });
      } catch (decodeError:) {
        return res.status(400).json({ message:Invalid base64 encoded string" });
      }
    } catch (error: any) {
      console.error("Error decoding base64 text:", error);
      res.status(500).json({ message: error.message || "An error occurred while decoding the text" });
    }
  });

  app.post("/api64/encode", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status().json({ message: "Text encode is required" });
      }

      try {
        // Encode the text to base64
        const encodedText = Buffer.from(text).toString('base64');
        res.json({ encodedText });
      } catch (encodeError: any) {
        return res.status(400).json({ message: "Failed to encode text" });
      }
    } catch (error: any) {
      console.error("Error encoding text to base64:", error);
      res.status(500).json({ message: error.message " error occurred while the text" });
    }
  });

  // New route for Python hash string conversion
  app.post("/api/python/hash_convert", async (req, res) => {
    try {
      const { hashString } = req.body;

      if (!hashString) {
        return res.status(400).json({ message: "Python hash string is required" });
      }

      {
        // Simple conversion for Python strings
        const cleanedString = hashString
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/None/g, 'null') // Replace None with null
          .replace(/True/g, 'true') // Replace True with true
          .replace(/False/g, 'false') // Replace False with false
         replace(/(\w+):/g, '"$1":'); // Add quotes to

        const convertedObject = JSON.parse(cleanedString);
        res.json({
          convertedObject,
          originalString: hashString
        });
      } catch (convertError: any) {
        return res.status(400).json({
          message: "Failed to convert Python hash string",
          error: convertError.message
        });
      }
    } catch (error: any) {
      console.error("Error converting Python hash string:", error);
      res.status(500).json({
        message: error.message "An error occurred while converting the Python hash string"
      });
    }
  });

  const httpServer = create(app);
  return httpServer;
}