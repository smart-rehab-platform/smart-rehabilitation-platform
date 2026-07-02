const { GoogleGenAI } = require("@google/genai");

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = 30000;

class GeminiService {
  constructor() {
    this.client = null;
    this.model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  }

  initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    if (!apiKey || !apiKey.trim()) {
      throw new Error("Gemini API key is missing. Set GEMINI_API_KEY in the environment.");
    }

    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: apiKey.trim() });
    }

    return this.client;
  }

  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  }

  getModel() {
    return process.env.GEMINI_MODEL || DEFAULT_MODEL;
  }

  async generateText(prompt) {
    const client = this.initialize();

    if (!prompt || !String(prompt).trim()) {
      throw new Error("Gemini prompt is required.");
    }

    try {
      const response = await this.#withTimeout(
        client.models.generateContent({
          model: this.getModel(),
          contents: String(prompt)
        })
      );

      const text = this.#extractText(response);
      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      return text;
    } catch (error) {
      throw this.#formatError(error);
    }
  }

  async generateJson(prompt) {
    const client = this.initialize();

    if (!prompt || !String(prompt).trim()) {
      throw new Error("Gemini prompt is required.");
    }

    const jsonPrompt = [
      "Return ONLY valid JSON.",
      "Do not include markdown, code fences, or any extra text.",
      String(prompt)
    ].join("\n\n");

    try {
      const response = await this.#withTimeout(
        client.models.generateContent({
          model: this.getModel(),
          contents: jsonPrompt,
          config: {
            responseMimeType: "application/json"
          }
        })
      );

      const text = this.#extractText(response);
      if (!text) {
        throw new Error("Gemini returned an empty JSON response.");
      }

      try {
        return JSON.parse(this.#sanitizeJsonText(text));
      } catch (parseError) {
        throw new Error(
          `Gemini returned invalid JSON: ${parseError.message}`
        );
      }
    } catch (error) {
      throw this.#formatError(error);
    }
  }

  async #withTimeout(promise, timeoutMs = DEFAULT_TIMEOUT_MS) {
    let timeoutId;

    try {
      return await Promise.race([
        promise,
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(
              new Error(`Gemini request timed out after ${timeoutMs}ms.`)
            );
          }, timeoutMs);
        })
      ]);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  #extractText(response) {
    if (!response) {
      return "";
    }

    if (typeof response.text === "string") {
      return response.text.trim();
    }

    if (typeof response.text === "function") {
      const result = response.text();
      return typeof result === "string" ? result.trim() : "";
    }

    return "";
  }

  #sanitizeJsonText(text) {
    return text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  #formatError(error) {
    if (
      error &&
      typeof error.message === "string" &&
      error.message.startsWith("Gemini")
    ) {
      return error;
    }

    const apiMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message;

    return new Error(
      `Gemini request failed: ${apiMessage || "Unknown Gemini error."}`
    );
  }
}

module.exports = new GeminiService();
