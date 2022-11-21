const defaultChainId = 31337;

const supportedNetworks: any = {
  // npx hardhat node
  // npx hardhat run scripts/deployForHardhat.js --network localhost
  // Copy console address
  31337: {
    name: "Hardhat",
    tokenSymbol: "ETH",
    rpcURL: "http://localhost:8545",
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
  // npx hardhat run scripts/deploy.js --network mumbai
  // Returned address is wrong. https://github.com/nomiclabs/hardhat/issues/2162.
  // Copy address from polygonscan
  80001: {
    name: "Polygon Mumbai Testnet",
    tokenSymbol: "MATIC",
    rpcURL: "https://rpc-mumbai.maticvigil.com",
    address: "0xDA7Ffea2CAA2A22159d23CB4C59a1B149a33e0d7",
  },

  1313161555: {
    name: "Aurora Testnet",
    tokenSymbol: "ETH",
    rpcURL: "https://testnet.aurora.dev",
    address: "0x0720A5a185F71F4203a0217Bd8a32faa5C2A1528",
  },
};

export { defaultChainId, supportedNetworks };
