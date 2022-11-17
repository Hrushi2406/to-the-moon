import { ethers } from "ethers";
import { supportedNetworks } from "./network_config";
import ToTheMoon from "../artifacts/contracts/ToTheMooon.sol/ToTheMooon.json";

const fetchContracts = async (provider: any, chainId: number) => {
  const toTheMoon = new ethers.Contract(
    supportedNetworks[chainId].address,
    ToTheMoon.abi,
    provider
  );

  return { toTheMoon };
};

export { fetchContracts };
