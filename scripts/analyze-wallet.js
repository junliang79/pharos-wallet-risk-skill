#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { Command } from "commander";
import { fetchWalletData } from "./wallet-data.js";

const program = new Command();
program
  .description("Analyze a wallet and generate a risk assessment report.")
  .option("-a, --address <address>", "Wallet address to analyze")
  .option("-n, --network <network>", "Network key from networks.json", "pharos-atlantic")
  .option("-i, --input <file>", "Input wallet data JSON file")
  .option("-o, --output <file>", "Output report file", "wallet-report.json");

program.parse(process.argv);
const options = program.opts();

function assessRisk(walletData) {
  const nativeBalance = parseFloat(walletData.nativeBalance || "0");
  const transactionCount = walletData.transactionCount || 0;
  const tokenBalances = walletData.tokenBalances || [];

  // Assess activity level
  let activityLevel = "dormant";
  if (transactionCount === 0) activityLevel = "dormant";
  else if (transactionCount < 10) activityLevel = "low";
  else if (transactionCount < 100) activityLevel = "moderate";
  else activityLevel = "high";

  // Assess gas sufficiency
  let gasSufficiency = nativeBalance >= 0.1 ? "sufficient" : "low";

  // Assess concentration risk
  let concentrationRisk = "low";
  let topTokenPercentage = 0;
  if (tokenBalances.length > 0) {
    const totalValue = tokenBalances.reduce((sum, t) => sum + parseFloat(t.balance || "0"), 0);
    if (totalValue > 0) {
      topTokenPercentage = (parseFloat(tokenBalances[0].balance || "0") / totalValue) * 100;
      if (topTokenPercentage > 80) concentrationRisk = "high";
      else if (topTokenPercentage > 50) concentrationRisk = "medium";
    }
  }

  // Determine overall recommendation
  let recommendation = "Suitable for DeFi interactions";
  if (activityLevel === "dormant" && transactionCount === 0) {
    recommendation = "Dormant wallet—consider with caution";
  } else if (gasSufficiency === "low") {
    recommendation = "Low gas balance—top up before transactions";
  } else if (concentrationRisk === "high") {
    recommendation = "High concentration risk—consider diversifying";
  }

  return {
    activityLevel,
    gasSufficiency,
    nativeBalance,
    concentrationRisk,
    topTokenPercentage: topTokenPercentage.toFixed(2),
    tokenCount: tokenBalances.length,
    recommendation,
  };
}

async function main() {
  let walletData;
  if (options.input) {
    walletData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), options.input), "utf8"));
  } else if (options.address) {
    walletData = await fetchWalletData(options.address, options.network);
  } else {
    throw new Error("Either --input or --address must be provided.");
  }

  const riskAssessment = assessRisk(walletData);

  const report = {
    wallet: walletData.address,
    network: walletData.network,
    nativeBalance: walletData.nativeBalance,
    transactionCount: walletData.transactionCount,
    tokenBalances: walletData.tokenBalances,
    riskAssessment,
    generatedAt: new Date().toISOString(),
  };

  const outputPath = path.resolve(process.cwd(), options.output);
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`Saved wallet risk report to ${outputPath}`);
  console.log("\n--- Risk Summary ---");
  console.log(`Activity Level: ${riskAssessment.activityLevel}`);
  console.log(`Native Balance: ${riskAssessment.nativeBalance} PHRS (${riskAssessment.gasSufficiency})`);
  console.log(`Concentration Risk: ${riskAssessment.concentrationRisk}`);
  console.log(`Recommendation: ${riskAssessment.recommendation}`);
}

main().catch((error) => {
  console.error("Error generating wallet analysis:", error.message || error);
  process.exit(1);
});
