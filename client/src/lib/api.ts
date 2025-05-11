import { InsertMessage, ChatMessage } from "@shared/schema";
import { apiRequest from "./queryClient";

export interfaceGenerationRequest {
  prompt: string;
  style?: "vivid" |natural";
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
  messages: ChatMessage[];
  character?: {
    id: number;
    name: string;
    description: string;
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: string  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage:    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Encodes a string to base64 * @param text - The text to encode
 * @returns Base64 encoded string
 */
export functionBase64(text: string string {
  try {
    return btoa(text);
  } catch (error) {
    console.error("Error encoding text to base64:", error);
    throw new Error("Failed to encode text to base64");
  }
}

/**
 * Dec a base64 string to text
 * @param base64 - The base64 string to decode
 * @returns Decoded text
 */
export function decodeBase(base64: string): string {
  try {
    return atob(base64);
  } catch (error) {
    console.error("Error decoding base64 to text:", error);
    throw new Error("Failed to decode base64 to text  }
}

export async function sendChatMessage: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  try    const response = await apiRequest("POST", "/api/chat/completions", request);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

export async function saveMessage(message: InsertMessage): Promise<Message> {
  try {
    const response = await api("POST", "/api/messages", message);
    if (!response)      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

export async function generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
  try {
    const response = await apiRequest("POST", "//images/generations", request);
    if (!response.ok) {
      throw new Error error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}