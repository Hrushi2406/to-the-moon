import create from "zustand";

const appStore = (set: any, get: any) => ({
  tronWeb: null,
  balance: "",
  moonContract: null,
  currentAddress: "",

  // connectWallet: async () => {
  //   if (!window.tronWeb) return;

  //   const tronWeb = window.tronWeb;
  //   const currentAddress = tronWeb.defaultAddress.base58;

  //   const balance = await tronWeb.trx.getBalance(currentAddress);

  //   set({ tronWeb, currentAddress, balance: balance / 1e6 });
  // },
  //
  connectWallet: () => {},
});

export const useAppStore = create(appStore);
