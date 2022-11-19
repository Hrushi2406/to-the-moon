import React, { useState } from "react";
import { useWeb3 } from "../store/web3_store";
import { formatAddress } from "../utils/helper";

interface ButtonProps {}

export const Button = ({}: ButtonProps) => {
  const connectWallet = useWeb3((state) => state.connectWallet);

  const address = useWeb3((state) => state.accounts[0]);

  React.useEffect(() => {
    connectWallet();
  }, []);

  return (
    <>
      {address ? (
        <div className="flex space-x-2">
          <div className="hidden sm:block tracking-wider px-4 py-2  rounded-lg backdrop-blur-sm bg-opacity-20 bg-white">
            {parseFloat("10").toFixed(2)} NEAR
          </div>
          <div
            className="hidden cursor-copy sm:block tracking-wider px-4 py-2  rounded-lg backdrop-blur-sm bg-opacity-20 bg-white"
            onClick={() => {
              navigator.clipboard.writeText(address);
            }}
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
