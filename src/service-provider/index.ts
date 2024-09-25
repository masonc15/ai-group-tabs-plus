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
  serviceProvider: ServiceProvider = "GPT"
) => {
  if (!fetchMap[serviceProvider]) {
    console.warn(`Unexpected serviceProvider: ${serviceProvider}, falling back to GPT`);
    serviceProvider = "GPT";
  }
  return fetchMap[serviceProvider](apiKey, tabInfo, types);
};
