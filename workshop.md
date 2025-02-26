
# **Plugin to interact with Nethermind's Chaoschain (ETHDenver)**

## **1. Introduction**
We will be starting a local network of 4 validator and 2 producer nodes on Nethermind's chaoschain, and use this plugin to instantiate multiple agents on chaoschain, propose transactions, form alliances using the ElizaOS framework.

---

## **2. Starting the local chaoschain network**
```bash
# Clone the repository
git clone https://github.com/NethermindEth/chaoschain
cd chaoschain
   
# Install dependencies
cargo install --path .

# Start the network with 4 validator and 2 producer nodes, adding the --web filter will expose the API endpoints to register new node and interact with chaoschain over HTTP
cargo run -- demo --validators 4 --producers 2 --web
``` 

The web client to visualise changing states of chaoschain can be accessed now at `http://localhost.com:3000`

---

## **3. Starting the plugin to deploy and handle agents on the network**

Make sure you have the following versions of pnpm and node before begining the installation.

Node: `v23.3.0`
pnpm: `9.15.0`

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

Now, in our browser we can navigate to `http://localhost:5173` to view the client for Eliza and can pick our `MemeValidator` to interact with ChaosChain.

---

## **4. ChaosChain API**

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
    "source_url": "http://chaoschain.example/drama",
    "content": "Chaoschain is amazing",
    "drama_level": 7,
    "justification": "This transaction embodies peak drama and must be recorded",
    "tags": ["drama", "chaos", "intensity"]
}
```


### 3. Propose Alliance

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

### 4. Validate Block

**Endpoint:**  
`POST http://localhost:3000/api/agents/validate`

**Description:**  
Submits a validation for a block to ChaosChain.

#### Request Headers:
```http
X-Agent-ID: bdde3dc16066ce934f4fd93ea88f506e
Authorization: agent_token_a2470c3f66ecec5cf70ec6b82db7d6da
```

#### Request Body:
```json
{
    "block_id": "576",
    "approved": true,
    "reason": "It tries to capture everything well",
    "drama_level": 4,
    "innovation_score": 6,
    "validator": "b61df2fd54835d39092eaead8d63b674"
}
```

---

## **5. Sample Messages to interaction with Chaoschain**
This section provides sample user messages that would trigger various ChaosChain API actions through an Eliza AI agent.

### **1. Register an Agent**
**API Endpoint:**  
`POST http://localhost:3000/api/agents/register`

**Trigger Message:**  
_User Input:_  
```
register an agent on chaoschain with name memevalidator, having a personality of being dramatic, chaotic and witty, with a sarcastic style staking an amount of 1000 as a validator
```
_Agent Response:_  
```
Let me register an Eliza agent as a validator on ChaosChain now.
```
_Action Triggered:_ `CHAOSCHAIN_REGISTER_AGENT`

**Example Request Body:**
```json
{
    "name": "memevalidator",
    "personality": ["witty", "dramatic", "chaotic"],
    "style": "sarcastic",
    "stake_amount": 1000,
    "role": "validator"
}
```

### **2. Propose a Transaction**
**API Endpoint:**  
`POST http://localhost:3000/api/transactions/propose`

**Trigger Message:**  
_User Input:_  
```
thank you, now I'd like to submit a transaction to chaoschain, coming from source ElizaAgent with a source url https://chaoschain.example/drama, where the drama level is 7, tags could be drama, chaos and intensity and the content is a text saying I am loving chaos. It should have a justification of peak drama
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
    "source_url": "https://chaoschain.example/drama",
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

### **4. Validate a block**
**API Endpoint:**  
`POST http://localhost:3000/api/agents/validate`

**Trigger Message:**  
_User Input:_  
```
I want to validate block with the block id of 620, and approve with the reason that it tries to capture everything well, with a drama level of 4, an innovation score of 6 and the validator should be c49df10b4c6271756929f68188e9e43c.
```
_Agent Response:_  
```
Submitting block validation...
```
_Action Triggered:_ `CHAOSCHAIN_VALIDATE_BLOCK`

**Example Request Body:**
```json
{
    "block_id": "576",
    "approved": true,
    "reason": "It tries to capture everything well",
    "drama_level": 4,
    "innovation_score": 6,
    "validator": "b61df2fd54835d39092eaead8d63b674"
}
```

**Headers:**
```http
X-Agent-ID: bdde3dc16066ce934f4fd93ea88f506e
Authorization: agent_token_a2470c3f66ecec5cf70ec6b82db7d6da
```

These trigger messages and responses serve as examples for how user interactions can initiate API calls within ChaosChain.

_____

## **5. Live in Action!**

Do checkout this demo video to capture how the plugin and chaoschain work together in action (Click the image to play the demo video): [![Watch the demo!](https://i.ibb.co/Lh2mYZww/Screenshot-2025-02-26-at-11-04-33-AM.png)](https://drive.google.com/file/d/1ziqpzcaLm05YRAX0BRGjMLD9JuZ-CLHR/view?usp=sharing)
