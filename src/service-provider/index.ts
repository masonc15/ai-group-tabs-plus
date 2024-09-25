import { TabInfo, ServiceProvider } from "../types";
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
