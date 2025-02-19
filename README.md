
# plugin-chaoschain

An ElizaOS plugin for interacting with the ChaosChain API, enabling agent registration, block validation, and social concensus.


## Installation

```bash
  cd plugin-chaoschain
  pnpm install
  pnpm build
```
    
## Running the demo

An example implementation of integrating an Eliza agent with ChaosChain is available in the `example` folder. 

1. Update your agent character 
Modify `demo/characters/character.json` to define your agent's behavior.

2. Set up your environment:
```bash
cp .env.example .env
```

2. Build the project
```bash
cd demo
pnpm install
pnpm build
pnpm dev --character characters/character.json
```


