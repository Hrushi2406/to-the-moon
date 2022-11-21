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
  highscore: 0,
  attemptsLeft: 0,
  balance: 0,
  error: "",
  leaderboard: [],
  myTournaments: [],
  allTournaments: [],
  hasTournamentEnded: false,

  getAllTournaments: async () => {
    const nTournaments = await get().toTheMoon.currentTournamentId();
    const allTournaments = [];

    for (let i = 1; i <= nTournaments; i++) {
      const { id, name } = await get().toTheMoon.tournaments(i);
      allTournaments.push({
        id: id.toNumber(),
        name,
      });
    }

    set({ allTournaments: allTournaments.reverse() });
  },

  getMyTournaments: async () => {
    const resp = await get().toTheMoon.getJoinedTournamentsByPlayer(
      get().accounts[0]
    );

    const data = await Promise.all(
      resp
        .filter((arr: any) => arr.id.toNumber() !== 0)
        .map(async (arr: any) => {
          const tournament = await loadTournament(
            get().signer,
            get().chainId,
            arr.id
          );
          //Fetch contract
          const { unclaimedPrize, rank, highscore, allocatedPrize } =
            await tournament.playerStatsMap(get().accounts[0]);

          const { name, id } = arr;

          return {
            name,
            id: id.toNumber(),
            rank: rank.toNumber(),
            highscore: highscore.toNumber(),
            unclaimedPrize: formatBigNum(unclaimedPrize),
            allocatedPrize: formatBigNum(allocatedPrize),
          };
        })
    );

    set({ myTournaments: data });
  },

  recordHighscore: async (highscore: number) => {
    try {
      // const data = await fetch("http://127.0.0.1:8000/current_tournament").then(
      //   (resp) => resp.json()
      // );

      //console.log("DATA ", data);

      await fetch("https://to-the-mooon-admin.onrender.com/record_score", {
        // await fetch("http://127.0.0.1:8000/record_score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: highscore,
          address: get().accounts[0],
        }),
      });
    } catch (e: any) {
      console.log("Error from Server: ", e);
    }
  },

  withdrawPrize: async (tId: string) => {
    const provider = get().signer;
    const chainId = get().chainId;
    const prevTournament = await loadTournament(provider, chainId, tId);

    const hasEnded = await get().tournament.hasEnded();

    const tx = await get().tournament.endTournament();

    await tx.wait();

    await prevTournament.withdrawPrize();
  },

  getLeaderBoard: async (id: string) => {
    const tournament = await loadTournament(get().signer, get().chainId, id);
    const data = await tournament.getLeaderBoard();
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

  getTournamentInfo: async (id: string) => {
    const name = await get().tournament.name();
    const timeLimit = await get().tournament.timeLimit();
    let startTime = await get().tournament.startTime();
    const info = await get().tournament.getRewardInfo();
    const joiningFee = parseFloat(ethers.utils.formatEther(info[1]));
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
        id: parseInt(id),
        commissionPercentage: commissionPercentage.toNumber(),
        prizePool: parseFloat(ethers.utils.formatEther(prizePool)),
      },
    });

    console.log("commissionPercentage.toNumber(): ", get().currentTournament);
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

      const balance = formatBigNum(await provider.getBalance(accounts[0]));

      set({
        accounts,
        chainId,
        signer,
        balance: parseFloat(balance),
        ...contracts,
      });
      const id = await get().toTheMoon.currentTournamentId();
      get().getTournamentInfo(id.toString());
      get().getLeaderBoard(id.toString());
      get().checkHasJoinedTournament();
      get().getHighscore();
      get().getMyTournaments();
      get().getAllTournaments();
    } catch (e: any) {
      set({ error: e.message });

      console.log("useWeb3 : connectWallet failed -> " + e.message);
    }
  },

  checkHasEnded: async () => {
    const tournament = get().currentTournament;
    const now = new Date().getTime();
    const endsAt = tournament.endsIn.getTime();

    if (now >= endsAt) set({ hasTournamentEnded: true });
  },

  getHighscore: async () => {
    const { highscore, attemptsLeft } = await get().tournament.playerStatsMap(
      get().accounts[0]
    );

    set({
      highscore: highscore.toNumber(),
      attemptsLeft: attemptsLeft.toNumber(),
    });

    console.log("highscore: ", get().highscore);
  },

  joinTournament: async () => {
    const joiningFees = await get().tournament.joiningFees();

    const tx = await get().tournament.joinTournament({
      value: joiningFees,
    });

    await tx.wait(1);

    return;
  },

  // joinTournament: async () => {
  //   const isPlayerRegistered = await get().toTheMoon.isPlayerRegistered(
  //     get().accounts[0]
  //   );

  //   console.log("isPlayerRegistered: ", isPlayerRegistered);
  // },
});

export const useWeb3 = create(web3Store);
