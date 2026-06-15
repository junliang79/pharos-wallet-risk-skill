# Pharos Wallet Risk Skill

A Phase 1 Skill for analyzing on-chain wallet balances and generating risk assessments.

---

## Prerequisites

- Node.js 18+ or Python 3.8+
- `cast` from Foundry (optional, for direct RPC queries)
- `jq` for JSON parsing (optional, for script-based workflows)
- Network RPC URL configured in `assets/networks.json`

---

## Network Configuration

> RPC URLs and network details are read from `assets/networks.json`.

```json
{
  "pharos-atlantic": {
    "name": "Pharos Atlantic Testnet",
    "rpcUrl": "https://atlantic.dplabs-internal.com",
    "chainId": 688689,
    "nativeToken": "PHRS",
    "tokens": []
  }
}
```

---

## Capability Index

| User Need | Capability | Detailed Instructions |
|-----------|------------|----------------------|
| Check a wallet's native balance | `cast balance` query | → [references/wallet-analysis.md#query-native-balance](references/wallet-analysis.md#query-native-balance) |
| Fetch wallet's transaction count / activity | `cast getTransactionCount` query | → [references/wallet-analysis.md#query-transaction-count](references/wallet-analysis.md#query-transaction-count) |
| Analyze wallet balance and generate risk assessment | Node.js CLI tool `npm run analyze` | → [references/wallet-analysis.md#analyze-wallet-risk](references/wallet-analysis.md#analyze-wallet-risk) |
| Query ERC20 token balance for a wallet | `cast call` to balanceOf | → [references/wallet-analysis.md#query-erc20-balance](references/wallet-analysis.md#query-erc20-balance) |

---

## General Error Handling

| Error | Cause | Suggested Action |
|-------|-------|------------------|
| `RPC connection refused` | Invalid or unreachable RPC URL | Check `assets/networks.json` and verify network is accessible |
| `Invalid address format` | Wallet address is not a valid Ethereum address | Ensure address is prefixed with `0x` and is 40 hex characters |
| `Contract not found` | ERC20 token address not deployed on network | Verify token address in `assets/tokens.json` |
| `Method not found` | Agent called an unsupported operation | Refer to Capability Index for available operations |

---

## Security Reminders

- **Private Keys**: This Skill is read-only. It does not require or store private keys.
- **Address Privacy**: Wallet analysis is on-chain; use public addresses only.
- **Rate Limits**: If using a public RPC, respect rate limits. Consider using a dedicated endpoint.

---

## Agent Guidelines

1. When a user asks to "analyze a wallet," check the Capability Index.
2. Extract the wallet address and network key from the request.
3. Call the appropriate operation in `references/wallet-analysis.md`.
4. Parse the output per the reference file's output parsing rules.
5. Return the risk assessment to the user.
