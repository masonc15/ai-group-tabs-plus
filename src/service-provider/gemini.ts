import { TabInfo } from "../types";
import Mustache from "mustache";
import { getStorage, removeQueryParameters } from "../utils";
import { DEFAULT_PROMPT } from "../const";

const renderPromptForGemini = async (
  tab: TabInfo,
  types: string[]
): Promise<{ role: string; parts: [{ text: string }] }[]> => {
  const prompt: string = (await getStorage("prompt")) || DEFAULT_PROMPT;
  return [
    {
      role: "user",
      parts: [
        {
          text: "",
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "You are a browser tab group classifier",
        },
      ],
    },
    {
      role: "user",
      parts: [
        {
          text: Mustache.render(prompt, {
            tabURL: removeQueryParameters(tab.url),
            tabTitle: tab.title,
            types: types.join(", "),
          }),
        },
      ],
    },
  ];
};

export const fetchGemini = async (
  apiKey: string,
  tabInfo: TabInfo,
  types: string[]
): Promise<string> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: await renderPromptForGemini(tabInfo, types),
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
};
