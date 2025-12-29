import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model configuration
export const AI_CONFIG = {
  // Use Sonnet for quality responses
  model: "claude-sonnet-4-20250514",
  // Use Haiku for simpler/faster tasks
  fastModel: "claude-3-5-haiku-20241022",
  // Max tokens for responses
  maxTokens: 1024,
  // Temperature for creativity (lower = more focused)
  temperature: 0.7,
} as const;

export { anthropic };
