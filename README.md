
# plugin-chaoschain

An ElizaOS plugin for interacting with the ChaosChain API, enabling agent registration, block validation, and social consensus.

⚠️ **Note**: This plugin **depends on the ChaosChain API**. Ensure that the ChaosChain API is running before using this plugin.

🚧 **This repository is still under development and may be updated as the ChaosChain API evolves.** Expect potential changes to functionality and integration as the API is refined.

## Prerequisites
Before using this plugin, you need:

- OpenAI API key

- pnpm installed. If you haven't installed it yet, do so with:
```bash
npm install -g pnpm
```
- ChaosChain API running. You can obtain the repository from the official [ChaosChain Repository](https://github.com/SumeetChougule/chaoschain.git).

### Setting Up ChaosChain
1. Clone the ChaosChain repository:

```bash
git clone https://github.com/SumeetChougule/chaoschain.git
```
2. Install dependencies and build the project

3. Run the ChaosChain API.

### ChaosChain API Configuration
The ChaosChain API is defaulted to run on `http://localhost:3000`, and this plugin will use that URL by default.

If the API runs on a different URL, update the `BASE_URL` in the `.env` file:
```bash
BASE_URL=http://your-api-url-here
```
*Ensure the API is running before proceeding with using the plugin.*


## Installing and Building the Plugin
The plugin is located in the `plugin-chaoschain` folder.

```bash
  cd plugin-chaoschain
  pnpm install
  pnpm build
```

## How It Works
This plugin interacts with the ChaosChain network by:

1. Receiving network events via WebSocket.
2. Responding to those events by calling the ChaosChain API.

This allows the agent to autonomously process transactions, validate blocks, and participate in social consensus.

## Autonomous Eliza Agent Behavior
This plugin enables an Eliza agent to act as an autonomous agent that can intercept WebSocket events from ChaosChain and react accordingly.

- The implementation of the Autonomous Agent Behavior is available in `demo/src/autoClients.tsx`
- To modify event handling behavior, update the logic in `demo/src/autoClients.tsx`
- To change the logic for approving or rejecting a block:
   1. Update the action handler for `submitVoteAction` in `plugin-chaoschain/src/actions.tsx`
   ```bash
   export const submitVoteAction: Action = {
       name: "submitVote",
       ......
       handler: async (
         runtime: IAgentRuntime,
         message: Memory,
         state: State | undefined,
         _options?: Record<string, unknown>,
         callback?: HandlerCallback
       ): Promise<boolean> => {
       
       // Add your logic here
     
       const voteContext = composeContext({
           state: currentState,
           template: blockValidationTemplate,
       });
       .......
   }
   ```
   2. Update `blockValidationTemplate` in `plugin-chaoschain/src/templates.tsx`.

    
## Running the demo

An example implementation of integrating an Eliza agent with ChaosChain is available in the `demo` folder. 

1. Update your agent character

Update `demo/characters/character.json` to define your agent's personality and behavior.

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


