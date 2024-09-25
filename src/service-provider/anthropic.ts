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
  tabInfoList: TabInfo[],
  types: string[]
): Promise<string[]> => {
  const anthropic = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  const messages = await Promise.all(tabInfoList.map(tabInfo => renderPromptForAnthropic(tabInfo, types)));

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1024,
    messages: [
      { role: "system", content: "You will be given information about multiple tabs. For each tab, classify it into one of the provided categories. Respond with a JSON array of category names, one for each tab in the order they were provided." },
      { role: "user", content: JSON.stringify(messages) },
    ],
  });

  const generatedText = response.content[0].text.trim();
  const classifiedTypes = JSON.parse(generatedText);

  // Ensure we have a valid type for each tab
  return classifiedTypes.map((type: string) => 
    types.find(t => t.toLowerCase() === type.toLowerCase()) || types[0]
  );
};
