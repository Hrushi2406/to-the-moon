import { ethers } from "ethers";
import create from "zustand";
import { fetchContracts, loadTournament } from "../utils/fetch_contracts";
import { formatBigNum } from "../utils/helper";
import { defaultChainId, supportedNetworks } from "../utils/network_config";

const web3Store = (set: any, get: any) => ({
  ethers: ethers,
  chainId: defaultChainId,
  accounts: [],
  signer: null,
  toTheMoon: null,
  tournament: null,
  currentTournament: null,
  hasJoinedTournament: false,
  hasRegistered: false,
  error: "",
  leaderboard: [],

  withdrawPrize: async (tId: string) => {
    const provider = get().signer;
    const chainId = get().chainId;
    const prevTournament = await loadTournament(provider, chainId, tId);

    await prevTournament.withdrawPrize();
  },

  getLeaderBoard: async () => {
    const data = await get().tournament.getLeaderBoard();
    let tempArr: any = [];

    data.forEach((arr: any) => {
      tempArr.push({
        address: arr[0],
        name: arr[1],
        highscore: arr[2].toString(),
        prize: formatBigNum(arr[3]),
      });
    });

    set({ leaderboard: tempArr });
  },

  getTournamentInfo: async () => {
    const name = await get().tournament.name();
    const timeLimit = await get().tournament.timeLimit();
    let startTime = await get().tournament.startTime();
    const info = await get().tournament.getRewardInfo();
    const id = await get().tournament.id();
    const joiningFee = ethers.utils.formatEther(info[1]).toString();
    const playersJoined = info[2].toNumber();
    const { prizePool, commissionPercentage, isSponsored } = info[0];
    const endsInNum = startTime.toNumber() + timeLimit.toNumber();

    const endsIn = new Date(endsInNum * 1000);

    set({
      currentTournament: {
        joiningFee,
        playersJoined,
        isSponsored,
        name,
        endsIn,
        id: id.toString(),
        commissionPercentage: commissionPercentage.toNumber(),
        prizePool: ethers.utils.formatEther(prizePool),
      },
    });

    console.log(
      "commissionPercentage.toNumber(): ",
      commissionPercentage.toNumber()
    );
  },

  checkHasRegistered: async () => {
    const isPlayerRegistered = (
      await get().toTheMoon.isPlayerRegistered(get().accounts[0])
    )[0];

    set({ hasRegistered: isPlayerRegistered });
  },

  checkHasJoinedTournament: async () => {
    const tournaments = await get().toTheMoon.getJoinedTournamentsByPlayer(
      get().accounts[0]
    );
    const tId = await get().toTheMoon.currentTournamentId();

    const hasJoinedTournament = tournaments.some(
      (t: any) => t[0].toString() == tId.toString()
    );

    set({ hasJoinedTournament });
  },

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

      const contracts = await fetchContracts(signer, chainId);

      set({
        accounts,
        chainId,
        signer,
        ...contracts,
      });
      get().getLeaderBoard();
    } catch (e: any) {
      set({ error: e.message });

      console.log("useWeb3 : connectWallet failed -> " + e.message);
    }
  },

  joinTournament: async () => {
    const joiningFees = await get().tournament.joiningFees();

    await get().tournament.joinTournament({
      value: joiningFees,
    });
  },

  // joinTournament: async () => {
  //   const isPlayerRegistered = await get().toTheMoon.isPlayerRegistered(
  //     get().accounts[0]
  //   );

  //   console.log("isPlayerRegistered: ", isPlayerRegistered);
  // },
});

export const useWeb3 = create(web3Store);
