import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

export const spicyTestnet = defineChain({
  id: 88882,
  name: "Chiliz Spicy Testnet",
  nativeCurrency: { name: "CHZ", symbol: "CHZ", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://spicy-rpc.chiliz.com/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Chiliz Spicy Explorer",
      url: "https://testnet.chiliscan.com",
    },
  },
});
