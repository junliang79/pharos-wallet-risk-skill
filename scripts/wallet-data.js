import fs from "fs";
import path from "path";
import { ethers } from "ethers";

const networksPath = path.resolve(process.cwd(), "networks.json");

export async function fetchWalletData(address, networkKey = "pharos-atlantic") {
  if (!address) {
    throw new Error("Missing wallet address.");
  }

  // Normalize address: validate format and convert to checksum
  const addressRegex = /^0x[0-9a-fA-F]{40}$/;
  if (!addressRegex.test(address)) {
    throw new Error(`Invalid address format: ${address}. Address must be 0x + 40 hex characters.`);
  }

  // Use lowercase to avoid checksum issues, then try to get proper checksum
  let normalizedAddress = address.toLowerCase();
  try {
    normalizedAddress = ethers.getAddress(normalizedAddress);
  } catch (err) {
    // If checksum fails, use lowercase as fallback
    console.warn(`Warning: Could not validate checksum for ${address}, using lowercase.`);
  }

  if (!fs.existsSync(networksPath)) {
    throw new Error(`Network configuration not found: ${networksPath}`);
  }

  const raw = fs.readFileSync(networksPath, "utf8");
  const networks = JSON.parse(raw);
  const network = networks[networkKey];

  if (!network) {
    throw new Error(`Network key not found in networks.json: ${networkKey}`);
  }

  if (!network.rpcUrl) {
    throw new Error(`Missing rpcUrl for network ${networkKey}`);
  }

  const provider = new ethers.JsonRpcProvider(network.rpcUrl, {
    name: network.name,
    chainId: network.chainId || 1,
  });

  const [nativeBalance, transactionCount] = await Promise.all([
    provider.getBalance(normalizedAddress),
    provider.getTransactionCount(normalizedAddress),
  ]);

  const tokenBalances = [];
  if (Array.isArray(network.tokens) && network.tokens.length) {
    for (const token of network.tokens) {
      try {
        const erc20 = new ethers.Contract(
          token.address,
          [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)",
          ],
          provider,
        );

        const [balance, decimals, symbol] = await Promise.all([
          erc20.balanceOf(normalizedAddress),
          erc20.decimals(),
          erc20.symbol(),
        ]);

        tokenBalances.push({
          name: token.name || symbol,
          symbol,
          address: token.address,
          balance: ethers.formatUnits(balance, decimals),
          decimals,
        });
      } catch (error) {
        tokenBalances.push({
          name: token.name || token.symbol || "unknown",
          symbol: token.symbol || "UNKNOWN",
          address: token.address,
          balance: "error",
          error: error.message,
        });
      }
    }
  }

  return {
    address: normalizedAddress,
    network: {
      key: networkKey,
      name: network.name,
      rpcUrl: network.rpcUrl,
      chainId: network.chainId || 1,
      nativeToken: network.nativeToken || "NATIVE",
    },
    nativeBalance: ethers.formatEther(nativeBalance),
    transactionCount,
    tokenBalances,
    fetchedAt: new Date().toISOString(),
  };
}
