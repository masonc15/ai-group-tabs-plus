import { TabInfo, ServiceProvider } from "../types";
import { fetchGemini } from "./gemini";
import { fetchGpt } from "./gpt";
import { fetchAnthropic } from "./anthropic";

const fetchMap = {
  GPT: fetchGpt,
  Gemini: fetchGemini,
  Anthropic: fetchAnthropic,
} as const;

export const fetchTypes = async (
  apiKey: string,
  tabInfoList: TabInfo[],
  types: string[],
  serviceProvider: ServiceProvider = "GPT"
) => {
  if (!fetchMap[serviceProvider]) {
    console.warn(`Unexpected serviceProvider: ${serviceProvider}, falling back to GPT`);
    serviceProvider = "GPT";
  }
  return fetchMap[serviceProvider](apiKey, tabInfoList, types);
};
