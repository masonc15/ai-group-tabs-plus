# AI Group Tabs Plus

NOTE: This is a fork with added Gemini and Anthropic API capability. Default model for Gemini is `gemini-1.5-pro-exp-0827` and default model for Anthropic is `claude-3-5-sonnet-20240620`.

![Frame 7](https://github.com/MichaelYuhe/ai-group-tabs/assets/63531512/fef62a35-8193-4ef1-8082-cfc771d0b4e6)


## Roadmap

- [x] Group tabs with AI by default categories
- [x] Fill OpenAI API key in popup and save in Chrome storage
- [x] Customize categories in popup
- [x] Group new tabs automatically
- [x] Publish on Chrome store
- [x] Better prompt engineering
- [x] Logo and name
- [x] CI / CD for build and release new version
- [x] Add toast
- [x] Use Vite and pnpm
- [x] Group the updated tab only when a tab is updated
- [x] Custom model and API server

## Download and Start Using

### Download from Chrome Web Store

https://chromewebstore.google.com/detail/ai-group-tabs/hihpejmkeabgeockcemeikfkkbdofhji

### Download from source

Download the latest released `dist.zip` from [the release page](https://github.com/MichaelYuhe/ai-group-tabs/releases), unzip after download, you will get a folder named `dist`.

Open Chrome, go to `chrome://extensions/`, turn on `Developer mode` on the top right corner, click `Load unpacked` on the top left corner, select the `dist` folder you just unzipped.

> You can change the model and API server in the options page.

## Development

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build
pnpm build
```