import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets} from '@rainbow-me/rainbowkit';
import { Chain, configureChains, createClient } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public'

const mumbaiChain: Chain = {
    id: 80001,
    name: 'Polygon Mumbai',
    network: 'mumbai',
    nativeCurrency: {
      decimals: 18,
      name: 'Matic',
      symbol: 'MATIC',
    },
    rpcUrls: {
      default: {
        http: ['https://rpc-mumbai.maticvigil.com'],
      },
    },
    blockExplorers: {
      default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
      etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    },
    testnet: true,
};

const auroraTestChain: Chain = {
    id: 1313161555,
    name: 'Aurora Testnet',
    network: 'aurora',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: ['https://testnet.aurora.dev'],
      },
    },
    blockExplorers: {
      default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
      etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    },
    testnet: true,
};

const { chains, provider } = configureChains(
  [hardhat, mumbaiChain, auroraTestChain],
  [
    publicProvider(),
    publicProvider(),
    jsonRpcProvider({
        rpc: chain => ({ http: chain.rpcUrls.default.http[0] }),
      })
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export  {chains, wagmiClient};