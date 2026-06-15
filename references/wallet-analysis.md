# Wallet Analysis Operations

> Network Configuration: RPC URL is read from `assets/networks.json`.
> All queries are read-only (no gas required).

---

## Query Native Balance

### Overview

Fetch the native token (PHRS) balance for a given wallet address on Pharos.

### Command Template

```bash
cast balance <wallet_address> --rpc-url <rpc_url> --ether
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `<wallet_address>` | string | Yes | Wallet address (0x-prefixed, 40 hex chars) |
| `<rpc_url>` | string | Yes | RPC URL from `assets/networks.json` |

### Output Parsing

The command returns a decimal number representing PHRS balance.

```
1.5  # wallet has 1.5 PHRS
```

Parse as: balance in native tokens (wei divided by 10^18).

### Error Handling

| Error | Cause | Suggested Action |
|-------|-------|------------------|
| `Invalid address` | Address format is incorrect | Ensure 0x prefix and 40 hex characters |
| `connection refused` | RPC unreachable | Verify RPC URL in networks.json |
| `Not an RPC endpoint` | Wrong URL provided | Double-check networks.json |

### Agent Guidelines

1. Extract wallet address from user input.
2. Read RPC URL from `assets/networks.json` for the requested network (default: `pharos-atlantic`).
3. Run `cast balance` command.
4. Parse numeric output as PHRS balance.
5. Return balance to user (e.g., "Wallet has 1.5 PHRS").

---

## Query Transaction Count

### Overview

Fetch the transaction count (nonce) for a wallet, indicating how many transactions it has sent.

### Command Template

```bash
cast nonce <wallet_address> --rpc-url <rpc_url>
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `<wallet_address>` | string | Yes | Wallet address (0x-prefixed) |
| `<rpc_url>` | string | Yes | RPC URL from `assets/networks.json` |

### Output Parsing

The command returns a decimal integer.

```
42  # wallet has sent 42 transactions
```

Interpretation: Transaction count indicates wallet activity level. 
- `0` → dormant wallet
- `1-10` → low activity
- `10-100` → moderate activity
- `100+` → high activity

### Error Handling

| Error | Cause | Suggested Action |
|-------|-------|------------------|
| `Invalid address` | Address format is incorrect | Verify 0x prefix and format |
| `connection refused` | RPC unreachable | Check networks.json RPC URL |

### Agent Guidelines

1. Extract wallet address.
2. Read RPC URL from networks.json.
3. Run `cast nonce` command.
4. Parse integer output as transaction count.
5. Interpret activity level and return to user.

---

## Query ERC20 Balance

### Overview

Fetch the balance of an ERC20 token for a wallet address.

### Command Template

```bash
cast call <token_address> "balanceOf(address)(uint256)" <wallet_address> --rpc-url <rpc_url>
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `<token_address>` | string | Yes | ERC20 contract address (0x-prefixed) |
| `<wallet_address>` | string | Yes | Wallet address to query |
| `<rpc_url>` | string | Yes | RPC URL from `assets/networks.json` |

### Output Parsing

The command returns a hex or decimal integer representing token balance in smallest units (wei-like).

```
1000000000000000000  # 1 token (assuming 18 decimals)
```

To convert to human-readable: divide by 10^(token decimals).

### Error Handling

| Error | Cause | Suggested Action |
|-------|-------|------------------|
| `Contract not found` | Token address not deployed on network | Verify token address and network |
| `Method not found` | Not a valid ERC20 contract | Check token address |

### Agent Guidelines

1. Extract token address and wallet address from request.
2. Look up token decimals in `assets/tokens.json` or query directly.
3. Run `cast call` command.
4. Parse output as integer, divide by 10^decimals.
5. Return human-readable balance to user.

---

## Analyze Wallet Risk

### Overview

Generate a risk assessment for a wallet based on balance, transaction history, and concentration.

### Command Template

Using Node.js CLI:

```bash
npm run analyze -- --address <wallet_address> --network <network_key> --output <report_file>
```

Or using Python CLI (if available):

```bash
python scripts/analyze_wallet.py --address <wallet_address> --network <network_key>
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `--address` | string | Yes | Wallet address to analyze |
| `--network` | string | No | Network key from networks.json (default: pharos-atlantic) |
| `--output` | string | No | Output report filename (default: wallet-report.json) |

### Output Parsing

The command generates a JSON report:

```json
{
  "wallet": "0x...",
  "network": { "key": "pharos-atlantic", "name": "Pharos Atlantic Testnet" },
  "nativeBalance": "1.5",
  "transactionCount": 42,
  "tokenBalances": [],
  "riskAssessment": {
    "activityLevel": "moderate",
    "concentrationRisk": "low",
    "recommendation": "Wallet is suitable for DeFi interactions"
  }
}
```

### Error Handling

| Error | Cause | Suggested Action |
|-------|-------|------------------|
| `Missing OPENAI_API_KEY` | Deprecated: no longer required | Just use the wallet analysis without LLM |
| `RPC connection failed` | Network unreachable | Verify RPC URL in networks.json |
| `Invalid JSON output` | Parsing error | Check output file format |

### Agent Guidelines

1. Extract wallet address from user request.
2. Determine network (default to pharos-atlantic if not specified).
3. Run the analyze command.
4. Read the output report JSON.
5. Summarize key findings (balance, activity, concentration) to user.
6. Provide recommendation based on risk assessment.

---

## Common Risk Assessment Rules

| Condition | Risk Level | Reason |
|-----------|-----------|--------|
| Native balance < 0.1 PHRS | High | Insufficient gas for transactions |
| Transaction count = 0 | Medium | Dormant wallet, less trusted |
| Single token >80% of holdings | High | Concentration risk |
| Transaction count > 100 | Low | Established, active wallet |
| Multiple token holdings | Low | Diversified portfolio |
