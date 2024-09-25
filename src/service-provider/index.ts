import { TabInfo } from "../types";
import { getStorage } from "../utils";

export async function fetchGemini(
  apiKey: string,
  tabInfo: TabInfo,
  types: string[]
): Promise<string> {
  const prompt = await getStorage<string>("prompt") || "Classify the tab group based on the provided URL ({{tabURL}}) and title ({{tabTitle}}) into one of the categories: {{types}}. Response with the category only, without any comments.";
  
  const formattedPrompt = prompt
    .replace("{{tabURL}}", tabInfo.url || "")
    .replace("{{tabTitle}}", tabInfo.title || "")
    .replace("{{types}}", types.join(", "));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: formattedPrompt }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const generatedText = data.candidates[0].content.parts[0].text.trim();

  // Find the best matching type
  const bestMatch = types.find(type => generatedText.toLowerCase().includes(type.toLowerCase())) || types[0];

  return bestMatch;
}
import { getServiceProvider } from "../utils";
import { fetchGemini } from "./gemini";
import { fetchGpt } from "./gpt";

const fetchMap = {
  GPT: fetchGpt,
  Gemini: fetchGemini,
} as const;

export const fetchType = async (
  apiKey: string,
  tabInfo: TabInfo,
  types: string[],
  serviceProvider: ServiceProvider
) => {
  if (!fetchMap[serviceProvider]) {
    throw new Error("unexpected serviceProvider: " + serviceProvider);
  }
  return fetchMap[serviceProvider](apiKey, tabInfo, types);
};
