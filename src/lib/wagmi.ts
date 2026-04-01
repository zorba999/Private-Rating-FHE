import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";

export { baseSepolia };

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});
