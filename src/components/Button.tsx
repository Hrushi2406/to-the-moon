import React, { useState } from "react";
import { formatAddress } from "../utils/helper";
import { useAppStore } from "../store/app_store";

interface ButtonProps {}

export const Button = ({}: ButtonProps) => {
  const connectWallet = useAppStore((state) => state.connectWallet);
  const isConnected = useAppStore((state) => state.currentAddress !== "");
  const address = useAppStore((state) => state.currentAddress);
  const balance = useAppStore((state) => state.balance);
  const tronWeb = useAppStore((state) => state.tronWeb);

  React.useEffect(() => {
    connectWallet();
  }, []);

  console.log("tronweb: ", tronWeb);

  return (
    <>
      {isConnected ? (
        <div className="flex space-x-2">
          <div className="hidden sm:block tracking-wider px-4 py-2  rounded-lg backdrop-blur-sm bg-opacity-20 bg-white">
            {parseFloat(balance).toFixed(2)} TRX
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
