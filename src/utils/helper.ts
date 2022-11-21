import { ethers } from "ethers";
import { useSnackbar } from "react-simple-snackbar";

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

const contractAddress = "0x9477Ae1FEA1e16fA954C246F6bDd0c10df57c338";

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
