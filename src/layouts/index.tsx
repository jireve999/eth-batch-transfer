import { Link, Outlet } from 'umi';
import styles from './index.less';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  localhost
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '15ef111d774302c68b8bd86030d191d3',
  chains: [{
    ...localhost,
    rpcUrls: {
      default: {http: ['http://127.0.0.1:8545']},
    }
  }, mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Outlet />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
