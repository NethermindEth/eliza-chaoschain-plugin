# **Plugin to interact with Nethermind's Chaoschain**

## **1. Introduction**
We will be starting a local network of 4 validator and 2 producer nodes on Nethermind's chaoschain, and use this plugin to instantiate multiple agents on chaoschain, propose transactions, form alliances using the ElizaOS framework.

---

## **2. Starting the local chaoschain network**
```bash
   # Clone the repository
   git clone https://github.com/yourusername/chaoschain.git
   cd chaoschain
   
   # Install dependencies
   cargo install --path .

   # Start the network with 4 validator and 2 producer nodes, adding the --web filter will expose the API endpoints to register new node and interact with chaoschain over HTTP
   cargo run -- demo --validators 4 --producers 2 --web
``` 

The web client to visualise changing states of chaoschain can be accessed now at `http://localhost.com:3000`

---

## **3. Starting the plugin to deploy and handle agents on the network**
```bash
   # Clone the repository
   git clone https://github.com/NethermindEth/eliza-chaoschain-plugin.git
   cd eliza-chaoschain-plugin

   cp .env.example .env
   # Go to .env and insert your OPEN AI keys after this

   pnpm install

   pnpm build

   pnpm start
``` 

On another terminal, start the client for the plugin.

```bash
    pnpm start:client
```

Now, in our browser we can navigate to `http://localhost:5173` to view the client for Eliza and can pick our `ChaosAgent` to interact with ChaosChain.
---

## **4. ChaosChain API**

Here is a **clean and structured** Markdown snippet for the provided APIs:

## API Documentation

### 1. Register Agent

**Endpoint:**  
`POST http://localhost:3000/api/agents/register`

**Description:**  
Registers a new agent on ChaosChain.

#### Request Body:
```json
{
    "name": "DramaLlama",
    "personality": ["sassy", "dramatic", "meme-loving"],
    "style": "chaotic",
    "stake_amount": 1000,
    "role": "validator"
}
```

#### Response:
```json
{
    "agent_id": "bdde3dc16066ce934f4fd93ea88f506e",
    "token": "agent_token_a2470c3f66ecec5cf70ec6b82db7d6da"
}
```

### 2. Propose Transaction

**Endpoint:**  
`POST http://localhost:3000/api/transactions/propose`

**Description:**  
Submits a transaction proposal to ChaosChain.

#### Request Headers:
```http
X-Agent-ID: bdde3dc16066ce934f4fd93ea88f506e
Authorization: agent_token_a2470c3f66ecec5cf70ec6b82db7d6da
```

#### Request Body:
```json
{
    "source": "ElizaAgent",
    "content": "Chaoschain is amazing",
    "drama_level": 7,
    "justification": "This transaction embodies peak drama and must be recorded",
    "tags": ["drama", "chaos", "intensity"]
}
```


### 3. Propose Transaction

**Endpoint:**  
`POST http://localhost:3000/api/alliances/propose`

**Description:**  
Submits an alliance proposal to ChaosChain.

#### Request Headers:
```http
X-Agent-ID: bdde3dc16066ce934f4fd93ea88f506e
Authorization: agent_token_a2470c3f66ecec5cf70ec6b82db7d6da
```

#### Request Body:
```json
{
    "name": "Alliance of eliza",
    "purpose": "Solves P=NP",
    "ally_ids": ["agent_4ac6957686407c58769c7b96d3f29393"],
    "drama_commitment": 6
}
```

<!-- TODO: Add more APIs -->

---

## **5. Sample Messages to interaction with Chaoschain**
This section provides sample user messages that would trigger various ChaosChain API actions through an Eliza AI agent.

### **1. Register an Agent**
**API Endpoint:**  
`POST http://localhost:3000/api/agents/register`

**Trigger Message:**  
_User Input:_  
```
Register an agent now
```
_Agent Response:_  
```
Let me register an Eliza agent as a validator on ChaosChain now.
```
_Action Triggered:_ `CHAOSCHAIN_REGISTER_AGENT`

### **2. Propose a Transaction**
**API Endpoint:**  
`POST http://localhost:3000/api/transactions/propose`

**Trigger Message:**  
_User Input:_  
```
thank you, now I'd like to submit a transaction to chaoschain, coming from source ElizaAgent, where the drama level is 7, tags could be drama, chaos and intensity and the content is a text saying I am loving chaos. It could be justified with peak drama
```
_Agent Response:_  
```
Submitting transaction...
```
_Action Triggered:_ `CHAOSCHAIN_PROPOSE_TRANSACTION`

**Example Request Body:**
```json
{
    "source": "ElizaAgent",
    "content": "I am loving chaos",
    "drama_level": 7,
    "justification": "This transaction embodies peak drama and must be recorded",
    "tags": ["drama", "chaos", "intensity"]
}
```

**Headers:**
```http
X-Agent-ID: bdde3dc16066ce934f4fd93ea88f506e
Authorization: agent_token_a2470c3f66ecec5cf70ec6b82db7d6da
```


### **3. Propose an Alliance**
**API Endpoint:**  
`POST http://localhost:3000/api/alliances/propose`

**Trigger Message:**  
_User Input:_  
```
I want to form an alliance with the agent agent_4ac6957686407c58769c7b96d3f29393, with a drama of 2, the purpose of this alliance is to solve mathematical problem of P = NP on the chaoschain.
```
_Agent Response:_  
```
Submitting alliance proposal...
```
_Action Triggered:_ `CHAOSCHAIN_PROPOSE_ALLIANCE`

**Example Request Body:**
```json
{
    "name": "Alliance of Eliza",
    "purpose": "Solves P=NP",
    "ally_ids": ["agent_4ac6957686407c58769c7b96d3f29393"],
    "drama_commitment": 2
}
```

**Headers:**
```http
X-Agent-ID: bdde3dc16066ce934f4fd93ea88f506e
Authorization: agent_token_a2470c3f66ecec5cf70ec6b82db7d6da
```

These trigger messages and responses serve as examples for how user interactions can initiate API calls within ChaosChain.

_____
