import React, { useState } from "react";
import { useWeb3 } from "../store/web3_store";
import { copyToClipboard, formatAddress } from "../utils/helper";

interface ButtonProps {}

export const Button = ({}: ButtonProps) => {
  const connectWallet = useWeb3((state) => state.connectWallet);

  const address = useWeb3((state) => state.accounts[0]);
  const balance = useWeb3((state) => state.balance);

  React.useEffect(() => {
    connectWallet();
  }, []);

  return (
    <>
      {address ? (
        <div className="flex space-x-2">
          <div className="hidden sm:block text-sm tracking-wider px-4 py-2  rounded-lg backdrop-blur-sm bg-opacity-20 bg-white">
            {balance.toFixed(2)} ETH
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
