# Pharos Wallet Risk Skill

A Phase 1 Skill for the Pharos Skill-to-Agent Dual Cascade Hackathon.

This skill provides a reusable, on-chain wallet risk analysis module for Pharos AI Agents.

## What It Does

- Queries on-chain wallet balances (native token + ERC-20s)
- Fetches wallet transaction activity
- Generates risk assessments based on:
  - Gas sufficiency
  - Activity level
  - Token concentration
- Returns structured risk reports for Agent use

## Why It Matters

Agents need quick, actionable risk context before DeFi operations. This Skill turns raw wallet data into reusable risk signals.

## Structure

This project follows the **Pharos Skill Engine** standard:

```
pharos-phase1/
├── SKILL.md                    # Agent entry point + Capability Index
├── references/
│   └── wallet-analysis.md      # Operation specs and command templates
├── assets/
│   ├── networks.json           # Network RPC configuration
│   └── tokens.json             # ERC-20 token registry (extensible)
├── scripts/
│   ├── fetch-wallet-data.js    # Query wallet data from RPC
│   └── analyze-wallet.js       # Generate risk assessment
└── package.json
```

## No External Dependencies Required

- **No OpenAI Key needed.** Risk assessment uses rule-based analysis.
- **No LLM calls.** All operations are deterministic, on-chain queries.
- When deployed on Pharos, the Agent reads `SKILL.md` and understands the available operations.

## Installation

```bash
cd pharos-phase1
npm install
```

## Usage

### Fetch Wallet Data

```bash
npm run fetch -- --address 0x1234567890123456789012345678901234567890 --network pharos-atlantic
```

Outputs: `wallet-data.json`

### Analyze Wallet Risk

```bash
npm run analyze -- --address 0x1234567890123456789012345678901234567890 --network pharos-atlantic
```

Outputs: `wallet-report.json`

### Using Existing Data

```bash
npm run analyze -- --input wallet-data.json
```

## Example Output

```json
{
  "wallet": "0x...",
  "network": { "key": "pharos-atlantic", "name": "Pharos Atlantic Testnet" },
  "nativeBalance": "1.5",
  "transactionCount": 42,
  "tokenBalances": [],
  "riskAssessment": {
    "activityLevel": "moderate",
    "gasSufficiency": "sufficient",
    "concentrationRisk": "low",
    "recommendation": "Suitable for DeFi interactions"
  }
}
```

## Agent Integration

To use this Skill in a Pharos Agent workflow:

1. Agent reads `SKILL.md` → finds relevant Capability in the index
2. Agent reads `references/wallet-analysis.md` → gets operation specs
3. Agent executes the operation (fetch or analyze)
4. Agent parses JSON output and returns result to user

See `AGENT_PROMPTS.md` for workflow examples.

## Configuration

Edit `assets/networks.json` to add more networks:

```json
{
  "pharos-pacific": {
    "name": "Pharos Pacific Mainnet",
    "rpcUrl": "https://rpc.pacific.pharos.org",
    "chainId": 8888,
    "nativeToken": "PHRS",
    "tokens": []
  }
}
```

## Requirements

- Node.js 18+
- A valid Pharos (or EVM-compatible) RPC URL in `networks.json`
- No API keys, no external LLM calls

## Submission

Built for **Pharos Skill-to-Agent Dual Cascade Hackathon - Phase 1**.

- **GitHub**: [Link to your repo]
- **Skill Engine Format**: Follows official Pharos Skill Engine standard
- **Deployable on Pharos**: Ready for Phase 2 Agent Arena

## License

MIT-0 (Free to use, modify, and redistribute)
