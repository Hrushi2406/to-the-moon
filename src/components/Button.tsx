import React, { useState } from "react";
import { useWeb3 } from "../store/web3_store";
import { copyToClipboard, formatAddress } from "../utils/helper";
import { supportedNetworks } from "../utils/network_config";

interface ButtonProps {}

export const Button = ({}: ButtonProps) => {
  const connectWallet = useWeb3((state) => state.connectWallet);

  const address = useWeb3((state) => state.accounts[0]);
  const balance = useWeb3((state) => state.balance);
  const chainId = useWeb3((state) => state.chainId);

  React.useEffect(() => {
    connectWallet();
    if (window.ethereum) {
      // Detect metamask account change
      window.ethereum.on("accountsChanged", async function () {
        connectWallet();
      });

      // Detect metamask network change
      window.ethereum.on("chainChanged", function () {
        connectWallet();
      });
    }
  }, []);

  return (
    <>
      {address ? (
        <div className="flex space-x-2">
          <div className="hidden sm:block text-sm tracking-wider px-4 py-2  rounded-lg backdrop-blur-sm bg-opacity-20 bg-white">
            {supportedNetworks[chainId].name}
          </div>
          <div className="hidden sm:block text-sm tracking-wider px-4 py-2  rounded-lg backdrop-blur-sm bg-opacity-20 bg-white">
            {balance.toFixed(4)} ETH
          </div>
          <div
            className="hidden cursor-copy text-sm sm:block tracking-wider px-4 py-2  rounded-lg backdrop-blur-sm bg-opacity-20 bg-white"
            onClick={() => copyToClipboard(address)}
          >
            {formatAddress(address)}
          </div>
        </div>
      ) : (
        <button
          className="hidden sm:block tracking-wider px-8 py-2  rounded-lg backdrop-blur-sm bg-opacity-20 bg-white"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}
    </>
  );
};
