import { Anthropic } from '@anthropic-ai/sdk';
import { TabInfo } from "../types";
import { removeQueryParameters } from "../utils";

export const fetchAnthropic = async (
  apiKey: string,
  tabInfoList: TabInfo[],
  types: string[]
): Promise<string[]> => {
  const anthropic = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  const tabData = tabInfoList.map((tab, index) => ({
    index: index + 1,
    url: removeQueryParameters(tab.url),
    title: tab.title,
  }));

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 2048,
    system: "You will be given information about multiple tabs. For each tab, classify it into one of the provided categories. Respond with a JSON array of category names, one for each tab in the order they were provided.",
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          tabs: tabData,
          categories: types,
        }),
      },
    ],
  });

  const generatedText = response.content[0].text.trim();
  const classifiedTypes = JSON.parse(generatedText);

  // Ensure we have a valid type for each tab
  return classifiedTypes.map((type: string) =>
    types.find(t => t.toLowerCase() === type.toLowerCase()) || types[0]
  );
};
