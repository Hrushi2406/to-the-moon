import { ethers } from "ethers";
import { supportedNetworks } from "./network_config";
import ToTheMoon from "../artifacts/contracts/ToTheMooon.sol/ToTheMooon.json";
import Tournament from "../artifacts/contracts/Tournament.sol/Tournament.json";

const fetchContracts = async (provider: any, chainId: number) => {
  const toTheMoon = new ethers.Contract(
    supportedNetworks[chainId].address,
    ToTheMoon.abi,
    provider
  );

  const tId = await toTheMoon.currentTournamentId();

  const tAtId = await toTheMoon.tournaments(tId);

  const tournament = new ethers.Contract(
    tAtId.contractAddress,
    Tournament.abi,
    provider
  );

  return { toTheMoon, tournament };
};

export { fetchContracts };
