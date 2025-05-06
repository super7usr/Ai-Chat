import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
let openai: OpenAI | null = null;

// Initialize OpenAI client only if API key is available
if (typeof process !== 'undefined' && process.env && process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Image generation function using DALL-E
export async function generateAvatarImage(prompt: string, style: 'vivid' | 'natural' = 'natural'): Promise<string> {
  try {
    // First check if we have an API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    
    if (!openai) {
      throw new Error('OpenAI client is not initialized');
    }
    
    const enhancedPrompt = `Create a photorealistic portrait photo of ${prompt}. 
The image should be a highly detailed, professional portrait photograph with soft studio lighting, 
shallow depth of field, and a neutral background. Focus on creating a lifelike, 
attractive person with natural skin texture, realistic eyes, and detailed hair. 
The portrait should frame the face and upper shoulders, similar to a professional 
headshot or modeling portrait. Ensure the image has high-quality details and photorealistic qualities.`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: style
    });

    if (response.data && response.data[0] && response.data[0].url) {
      return response.data[0].url;
    }
    throw new Error('No image URL returned from OpenAI');
  } catch (error) {
    console.error('Error generating image with OpenAI:', error);
    throw error;
  }
}
