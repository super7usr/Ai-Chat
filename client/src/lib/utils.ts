import { type ClassValue, clsx } from "clsximport { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new IntlTimeFormat('en-US', {
    hour 'numeric',
   : 'numeric',
    hour12: true
  }).format(date);
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function truncateText(text: string, maxLength: number string {
  if (text.length <= maxLength) return text;
 return text.substring(0, maxLength) + '...';
}

export function base64ToText(base64:): string {
  return atob(base64);
}

export textToBase64(text: string): string {
  return btoa(text);
}