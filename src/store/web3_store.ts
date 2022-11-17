import { ethers } from "ethers";
import create from "zustand";
import { defaultChainId, supportedNetworks } from "../utils/network_config";

const web3Store = (set: any, get: any) => ({
  ethers: ethers,
  chainId: defaultChainId,
  accounts: [],
  error: "",

  connectWallet: async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("accounts: ", accounts);

      const signer = provider.getSigner();

      const { chainId } = await provider.getNetwork();

      if (!supportedNetworks[chainId]) {
        throw new Error("Use Correct Network");
      }

      set({
        accounts,
        chainId,
        provider,
      });
    } catch (e: any) {
      set({ error: e.message });

      console.log("useWeb3 : connectWallet failed -> " + e.message);
    }
  },
});

export const useWeb3 = create(web3Store);
