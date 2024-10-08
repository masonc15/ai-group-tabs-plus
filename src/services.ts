import { getStorage, matchesRule } from "./utils";
import { FilterRuleItem, ServiceProvider, TabInfo } from "./types";
import { fetchTypes } from "./service-provider";
import { toast } from "./components/toast";
import { Anthropic } from '@anthropic-ai/sdk';

interface TabGroup {
  type: string;
  tabIds: (number | undefined)[];
}

const filterTabInfo = (tabInfo: TabInfo, filterRules: FilterRuleItem[]) => {
  if (!filterRules || !filterRules?.length) return true;
  const url = new URL(tabInfo.url ?? "");
  return !filterRules.some((rule) => {
    return matchesRule(url, rule);
  });
};


export async function batchGroupTabs(
  tabs: chrome.tabs.Tab[],
  types: string[],
  apiKey: string
) {
  const filterRules = (await getStorage<FilterRuleItem[]>("filterRules")) || [];
  const tabInfoList: TabInfo[] = tabs
    .map((tab) => ({
      id: tab.id,
      title: tab.title || "",
      url: tab.url,
    }))
    .filter((tab) => filterTabInfo(tab, filterRules));

  const result: TabGroup[] = types.map((type) => {
    return {
      type,
      tabIds: [],
    };
  });

  const serviceProvider = await getStorage<ServiceProvider>("serviceProvider") || "GPT";
  const actualApiKey = serviceProvider === "Gemini" ? await getStorage<string>("gemini_key") : apiKey;

  const tabTypes = await fetchTypes(actualApiKey, tabInfoList, types, serviceProvider);
  tabTypes.forEach((type, index) => {
    const tabInfo = tabInfoList[index];
    const typeIndex = types.indexOf(type);
    if (typeIndex !== -1 && tabInfo.id) {
      result[typeIndex].tabIds.push(tabInfo.id);
    }
  });
  return result;
}

export async function handleMultipleTabs(
  tabs: chrome.tabs.Tab[],
  types: string[],
  apiKey: string
) {
  const filterRules = (await getStorage<FilterRuleItem[]>("filterRules")) || [];
  const serviceProvider = await getStorage<ServiceProvider>("serviceProvider") || "GPT";
  const actualApiKey = serviceProvider === "Gemini" ? await getStorage<string>("gemini_key") : apiKey;

  const tabInfoList: TabInfo[] = tabs
    .map((tab) => ({ id: tab.id, title: tab.title, url: tab.url }))
    .filter((tabInfo) => filterTabInfo(tabInfo, filterRules));

  const tabTypes = await fetchTypes(actualApiKey, tabInfoList, types, serviceProvider);
  return tabTypes;
}

// TODO merge this to service-provider
/**
 * This function will show a toast!
 */
export const validateApiKey = async (
  apiKey: string,
  serviceProvider: ServiceProvider
) => {
  try {
    if (serviceProvider === "Gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-exp-0827:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "This is a test" }] }],
            generationConfig: {
              temperature: 1,
              topK: 64,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        }
      );
      if (response.ok) {
        toast.success("Valid Gemini Key");
        return true;
      } else {
        const txt = await response.text();
        toast.error("Invalid Gemini Key: " + response.status + " " + txt);
        return false;
      }
    } else if (serviceProvider === "Anthropic") {
      try {
        const client = new Anthropic({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true,
        });
        await client.messages.create({
          max_tokens: 1024,
          messages: [{ role: "user", content: "ping" }],
          model: "claude-3-5-sonnet-20240620",
        });
        toast.success("Valid Anthropic Key");
        return true;
      } catch (error) {
        console.error("Anthropic API error:", error);
        if (error instanceof Error) {
          toast.error("Invalid Anthropic Key: " + error.message);
        } else {
          toast.error("Invalid Anthropic Key");
        }
        return false;
      }
    } else {
      const apiURL =
        (await getStorage("apiURL")) ||
        "https://api.openai.com/v1/chat/completions";
      const model = (await getStorage("model")) || "gpt-3.5-turbo";

      // https://platform.openai.com/docs/api-reference/chat/create
      const response = await fetch(apiURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "ping",
            },
          ],
          max_tokens: 1,
          temperature: 0.5,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          stop: ["\n"],
        }),
      });
      if (response.ok) {
        toast.success("Valid OpenAI Key");
        return true;
      } else {
        const txt = await response.text();
        toast.error("Invalid OpenAI Key: " + response.status + " " + txt);
        return false;
      }
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      toast.error("Invalid API Key: " + error.message);
    } else {
      toast.error("Invalid API Key");
    }
    return false;
  }
};
