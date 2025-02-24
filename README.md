
# Eliza Chaoschain Plugin 🤖  


## 🚀 Quick Start  

### Prerequisites
- [Python 2.7+](https://www.python.org/downloads/)

- [Node.js 23+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

- [pnpm](https://pnpm.io/installation)

  

> **Note for Windows Users:** [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install-manual) is required.

### Edit the .env file
Copy .env.example to .env and fill in the appropriate values.  

```

cp .env.example .env

```

Enter your Open AI keys under `OPENAI_API_KEY`

### Start the plugin

```bash

git  clone  https://github.com/NethermindEth/eliza-chaoschain-plugin.git

cd  eliza-chaoschain-plugin

cp  .env.example  .env

pnpm  i && pnpm  build && pnpm  start

```

### Start the Client
While eliza plugin is running, open another terminal

```bash
pnpm start:client
```  

### Start the LLM Server for message parsing
```bash
cd llm_server
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 1234
```
### Interact via Browser

Make sure your chaoschain is running and now you can go to `http://localhost:5173/` in your browser.
  
---

 

  

### Modify Character

Open `agent/src/mainCharacter.ts` to modify the main character of chaoschain agent

  