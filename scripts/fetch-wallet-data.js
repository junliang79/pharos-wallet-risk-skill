#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import path from "path";
import { fetchWalletData } from "./wallet-data.js";

const program = new Command();
program
  .description("Fetch wallet data from a Pharos-compatible RPC and save it as JSON.")
  .requiredOption("-a, --address <address>", "Wallet address to analyze")
  .option("-n, --network <network>", "Network key from networks.json", "pharos-atlantic")
  .option("-o, --output <file>", "Output JSON file", "wallet-data.json");

program.parse(process.argv);
const options = program.opts();

async function main() {
  const result = await fetchWalletData(options.address, options.network);
  const outputPath = path.resolve(process.cwd(), options.output);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`Saved wallet data to ${outputPath}`);
}

main().catch((error) => {
  console.error("Error fetching wallet data:", error.message || error);
  process.exit(1);
});
