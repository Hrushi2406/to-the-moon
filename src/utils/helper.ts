import { ethers } from "ethers";
import { supportedNetworks } from "./network_config";

const formatAddress = (address: string) => {
  return address.length == 0
    ? ""
    : address.substring(0, 4) + "...." + address.slice(-4);
};

const formatBigNum = (num: any) => ethers.utils.formatEther(num);

const scrollToGame = (ref: React.RefObject<HTMLDivElement>) => {
  if (ref && ref.current) {
    window.scrollTo({
      behavior: "smooth",
      top: ref.current.offsetTop - 20,
    });
  }
};

const snackbarOptions = {
  position: "top-right",
};

const contractAddress = supportedNetworks[1313161555].address;

const copyToClipboard = (address: string) => {
  navigator.clipboard.writeText(address);
};

export {
  formatBigNum,
  scrollToGame,
  formatAddress,
  snackbarOptions,
  contractAddress,
  copyToClipboard,
};
