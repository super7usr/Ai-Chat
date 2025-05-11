import { InsertMessage, ChatMessage } from "@shared/schema";
import { apiRequest } from "./queryClient";

export interface ImageGenerationRequest {
  prompt: string;
  style?: "vivid" | "natural";
}

export interface ImageGenerationResponse {
  url: string;
}

export interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessage[];
  character?: {
    id: number;
    name: string;
    description: string;
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function sendChatMessage(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  try {
    const response = await apiRequest("POST", "/api/chat/completions", request);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

export async function saveMessage(message: InsertMessage): Promise<ChatMessage> {
  try {
    const response = await apiRequest("POST", "/api/messages", message);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    const response = await apiRequest("POST", "/api/images/generations", request);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}
