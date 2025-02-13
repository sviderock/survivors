
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { celo, mainnet, optimism } from '@reown/appkit/networks';
import { CloudAuthSIWX } from '@reown/appkit-siwx'


const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, celo, optimism],
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
  ssr: true,
})

export const appkitModal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, celo, optimism],
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
  siwx: new CloudAuthSIWX()
})

export const { wagmiConfig } = wagmiAdapter


