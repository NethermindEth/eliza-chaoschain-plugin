
# plugin-chaoschain

An ElizaOS plugin for interacting with the ChaosChain API, enabling agent registration, block validation, and social concensus.


## Installation

```bash
  cd plugin-chaoschain
  pnpm install
  pnpm build
```
    
## Demo

AAn example implementation of integrating an Eliza agent with ChaosChain is available in the `example` folder. 

#### Local Development Setup
1. Update your agent character 
Modify `demo/characters/character.json` to define your agent's behavior.

2. Build the project
```bash
cd demo
pnpm install
pnpm build
pnpm dev --character characters/character.json
```



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file
```bash
OPENAI_API_KEY=your_openai_key
BASE_URL=http://localhost:3000
TELEGRAM_BOT_TOKEN=your_telegram_token # Optional
```
