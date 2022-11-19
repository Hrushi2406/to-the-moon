const defaultChainId = 31337;

const supportedNetworks: any = {
  // npx hardhat node
  // npx hardhat run scripts/deployForHardhat.js --network localhost
  // Copy console address
  31337: {
    name: "Hardhat",
    tokenSymbol: "ETH",
    rpcURL: "http://localhost:8545",
    address: "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
  },
  // npx hardhat run scripts/deploy.js --network mumbai
  // Returned address is wrong. https://github.com/nomiclabs/hardhat/issues/2162.
  // Copy address from polygonscan
  80001: {
    name: "Mumbai",
    tokenSymbol: "MATIC",
    rpcURL: "https://rpc-mumbai.maticvigil.com",
    address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  },
};

export { defaultChainId, supportedNetworks };
