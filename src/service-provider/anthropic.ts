import { Anthropic } from '@anthropic-ai/sdk';
import { TabInfo } from "../types";
import { getStorage, removeQueryParameters } from "../utils";
import Mustache from "mustache";
import { DEFAULT_PROMPT } from "../const";

const renderPromptForAnthropic = async (
  tab: TabInfo,
  types: string[]
): Promise<{ role: string; content: string }[]> => {
  const prompt: string = (await getStorage("prompt")) || DEFAULT_PROMPT;
  return [
    {
      role: "user",
      content: Mustache.render(prompt, {
        tabURL: removeQueryParameters(tab.url),
        tabTitle: tab.title,
        types: types.join(", "),
      }),
    },
  ];
};

export const fetchAnthropic = async (
  apiKey: string,
  tabInfo: TabInfo,
  types: string[]
): Promise<string> => {
  const anthropic = new Anthropic({
    apiKey: apiKey,
  });

  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    messages: await renderPromptForAnthropic(tabInfo, types),
  });

  const generatedText = response.content[0].text.trim();

  // Find the best matching type
  const bestMatch = types.find(type => generatedText.toLowerCase().includes(type.toLowerCase())) || types[0];

  return bestMatch;
};
