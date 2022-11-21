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
    name: "Mumbai",
    tokenSymbol: "MATIC",
    rpcURL: "https://rpc-mumbai.maticvigil.com",
    address: "0x9477Ae1FEA1e16fA954C246F6bDd0c10df57c338",
  },

  1313161555: {
    name: "Aurora Testnet",
    tokenSymbol: "ETH",
    rpcURL: "https://testnet.aurora.dev",
    address: "0xf949D6f9F94FaFADF5908285c77e303c3347a0f5",
  },
};

export { defaultChainId, supportedNetworks };
