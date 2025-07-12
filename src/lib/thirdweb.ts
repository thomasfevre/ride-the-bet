import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

export { baseSepolia as spicyTestnet }; // Export baseSepolia as spicyTestnet to avoid changing imports throughout the app
