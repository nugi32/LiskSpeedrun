import { defineChain } from "viem";

export const liskSepolia = defineChain({
  id: 4202,
  name: "Lisk Sepolia",
  network: "lisk-sepolia",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia-api.lisk.com"] },
    public: { http: ["https://rpc.sepolia-api.lisk.com"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://sepolia-blockscout.lisk.com" },
  },
  testnet: true,
});
