/**
 * Utility functions for image manipulation
 */

/**
 * Generates a modified version of the character avatar based on user prompt
 * This simulates different "poses" by applying CSS transformations
 */
export function generateCharacterPose(baseImageUrl: string, prompt: string): string {
  if (!baseImageUrl) {
    throw new Error('Base image URL is required');
  }

  // Create a unique identifier for this pose based on the prompt
  const poseId = encodeURIComponent((prompt || '').toLowerCase().trim());

  // Return a URL that includes the pose ID as a query parameter
  // The actual ChatMessage component will apply CSS effects based on this
  return `${baseImageUrl}?pose=${poseId}`;
}

/**
 * Extracts pose information from an image URL if present
 */
export function extractPoseInfo(imageUrl: string): { url: string, pose: string | null } {
  if (!imageUrl) return { url: '', pose: null };

  try {
    const url = new URL(imageUrl);
    const pose = url.searchParams.get('pose');

    // Return the base URL and the pose parameter
    return {
      url: imageUrl.split('?')[0], // Base URL without query parameters
      pose
    };
  } catch {
    // If the URL is invalid, just return the original
    return { url: imageUrl, pose: null };
  }
}

/**
 * Checks if a string is a valid base64 encoded image
 */
export function isBase64Image(str: string): boolean {
  if (!str) return false;

  try {
    // Check if it's a valid base64 string
    const base64Regex = /^image\/(png|jpg|jpeg|gif|webp);base64,([A-Za-z0-9+/=]+)$/;
    return base64Regex.test(str);
  } catch {
    return false;
  }
}

/**
 * Converts a base64 encoded image to a Blob URL
 */
export function base64ToUrl(base64String: string): string {
  if (!base64String) {
    throw new Error('Base64 string is required');
  }

  try {
    // Extract the MIME type and actual base64 data
    const matches = base64String.match(/^([A-Za-z+/]+);base64,(.*)$/);

    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string format');
    }

    const contentType = matches[1];
    const base64Data = matches[2];

    // Convert base64 to binary
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);

      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return URL.createObjectURL(blob);
  } catch (error) {
    throw new Error(`Failed to convert base64 to URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Returns CSS filters/transforms for an image based on a pose prompt
 */
export function getPoseStyles(posePrompt: string | null): {
  filter: string;
  transform: string;
} {
  if (!posePrompt) return { filter: '', transform: '' };

  // Default styles
  let filter = '';
  let transform = '';

  // Extract key terms from the prompt
  const prompt = posePrompt.toLowerCase();

  // Apply different effects based on detected keywords in the prompt
  if (prompt.includes('happy') || prompt.includes('smile') || prompt.includes('joy') || prompt.includes('laughing')) {
    filter = 'brightness(1.15) saturate(1.25) contrast(1.05)';
    transform = 'scale(1.05)';
  } else if (prompt.includes('sad') || prompt.includes('upset') || prompt.includes('unhappy') || prompt.includes('crying')) {
    filter = 'brightness(0.85) saturate(0.8) grayscale(0.25) contrast(1.05)';
    transform = 'scale(0.97)';
  } else if (prompt.includes('angry') || prompt.includes('mad') || prompt.includes('furious') || prompt.includes('rage')) {
    filter = 'brightness(1.1) saturate(1.4) contrast(1.15) hue-rotate(-5deg)';
    transform = 'scale(1.08)';
  } else if (prompt.includes('surprised') || prompt.includes('shocked') || prompt.includes('amazed') || prompt.includes('astonished')) {
    filter = 'brightness(1.2) contrast(1.15) saturate(1.1)';
    transform = 'scale(1.1)';
  } else if (prompt.includes('scared') || prompt.includes('afraid') || prompt.includes('frightened') || prompt.includes('terrified')) {
    filter = 'brightness(0.9) contrast(1.15) saturate(0.85) hue-rotate(-10deg)';
    transform = 'scale(0.92)';
  } else if (prompt.includes('confused') || prompt.includes('puzzled') || prompt.includes('perplexed')) {
    filter = 'brightness(1) saturate(0.9) hue-rotate(5deg) sepia(0.1)';
    transform = 'rotate(2deg) scale(1.02)';
  } else if (prompt.includes('tired') || prompt.includes('sleepy') || prompt.includes('exhausted') || prompt.includes('yawn')) {
    filter = 'brightness(0.88) saturate(0.75) blur(0.5px) contrast(0.95)';
    transform = 'scale(0.94)';
  } else if (prompt.includes('excited') || prompt.includes('enthusiastic') || prompt.includes('thrilled')) {
    filter = 'brightness(1.25) saturate(1.35) contrast(1.1)';
    transform = 'scale(1.12) rotate(1deg)';
  } else if (prompt.includes('calm') || prompt.includes('peaceful') || prompt.includes('relaxed') || prompt.includes('serene')) {
    filter = 'brightness(1.05) saturate(0.9) sepia(0.15)';
    transform = 'scale(1)';
  } else if (prompt.includes('romantic') || prompt.includes('love') || prompt.includes('flirty') || prompt.includes('seductive')) {
    filter = 'brightness(1.05) saturate(1.1) contrast(1.05) hue-rotate(2deg) sepia(0.2)';
    transform = 'scale(1.03)';
  } else if (prompt.includes('cute') || prompt.includes('kawaii') || prompt.includes('adorable')) {
    filter = 'brightness(1.15) saturate(1.2) contrast(1.05)';
    transform = 'scale(1.05) rotate(-1deg)';
  } else if (prompt.includes('serious') || prompt.includes('stern') || prompt.includes('determined')) {
    filter = 'brightness(0.95) contrast(1.2) saturate(0.9) sepia(0.1)';
    transform = 'scale(1.02)';
  } else if (prompt.includes('shy') || prompt.includes('embarrassed') || prompt.includes('blushing')) {
    filter = 'brightness(1.05) saturate(1.15) contrast(1) hue-rotate(2deg)';
    transform = 'scale(0.97) rotate(-1deg)';
  } else if (prompt.includes('thinking') || prompt.includes('thoughtful') || prompt.includes('contemplating')) {
    filter = 'brightness(1) saturate(0.95) contrast(1.05) sepia(0.1)';
    transform = 'scale(1)scale(1)scale(