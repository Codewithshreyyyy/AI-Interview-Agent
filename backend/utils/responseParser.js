// Utilities for validating/parsing structured Gemini responses.
// We will expand this once Gemini response format is finalized.

function parseJsonResponse(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty or invalid AI response.");
  }

  // Remove common markdown JSON fences if Gemini returns them.
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error("AI response was not valid JSON.");
  }
}

module.exports = {
  parseJsonResponse
};
