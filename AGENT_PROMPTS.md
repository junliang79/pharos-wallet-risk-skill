# Example Agent Workflows

This file demonstrates how a Pharos Agent can use this Wallet Risk Skill to help users analyze wallets.

---

## Example 1: User Asks for Wallet Balance

**User**: "What's the balance of wallet 0x1234...?"

**Agent Action**:
1. Read `SKILL.md` → find "Query a wallet's native balance" in Capability Index
2. Read `references/wallet-analysis.md#query-native-balance`
3. Extract network from context (default: pharos-atlantic)
4. Run:
   ```bash
   RPC=$(grep -A 5 "pharos-atlantic" assets/networks.json | grep rpcUrl | cut -d'"' -f4)
   cast balance 0x1234... --rpc-url $RPC --ether
   ```
5. Parse output: "1.5"
6. **Response**: "The wallet has 1.5 PHRS."

---

## Example 2: User Asks for Wallet Risk Assessment

**User**: "Is wallet 0x5678... safe for DeFi?"

**Agent Action**:
1. Read `SKILL.md` → find "Analyze wallet balance and generate risk assessment"
2. Read `references/wallet-analysis.md#analyze-wallet-risk`
3. Run:
   ```bash
   npm run analyze -- --address 0x5678... --network pharos-atlantic --output risk-report.json
   ```
4. Parse JSON output.
5. Extract key fields:
   - `nativeBalance`: 0.5 PHRS
   - `transactionCount`: 150
   - `riskAssessment.activityLevel`: "high"
   - `riskAssessment.recommendation`: "Suitable for DeFi"
6. **Response**: "Wallet 0x5678... is active (150 transactions) with 0.5 PHRS. Suitable for DeFi interactions."

---

## Example 3: User Asks for Transaction Activity

**User**: "How active is wallet 0xabcd...?"

**Agent Action**:
1. Read Capability Index → find "Fetch wallet's transaction count"
2. Read `references/wallet-analysis.md#query-transaction-count`
3. Run:
   ```bash
   RPC=$(grep -A 5 "pharos-atlantic" assets/networks.json | grep rpcUrl | cut -d'"' -f4)
   cast nonce 0xabcd... --rpc-url $RPC
   ```
4. Parse output: "5"
5. Interpret: 5 transactions → "low activity"
6. **Response**: "Wallet 0xabcd... has sent 5 transactions. Low activity level."

---

## Integration Notes

- All examples use `cast` and standard CLI tools (no external LLM required).
- Skill Engine provides the knowledge (SKILL.md + references); Agent provides the logic.
- JSON output from analysis can be chained to other skills or displayed to users.
- Error messages map to `references/wallet-analysis.md` error handling table.
