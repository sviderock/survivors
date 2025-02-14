
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { celo, mainnet, optimism } from '@reown/appkit/networks';


const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, celo, optimism],
  projectId: process.env.VITE_REOWN_PROJECT_ID,
  ssr: true,

})

export const appkitModal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, celo, optimism],
  projectId: process.env.VITE_REOWN_PROJECT_ID,
  enableAuthLogger: false,
  features: {
    analytics: false,
  }
})

export const { wagmiConfig } = wagmiAdapter


