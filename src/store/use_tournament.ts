import { ethers } from "ethers";
import { useWeb3 } from "./web3_store";

const useTournament = () => {
  const tournament: any = useWeb3((state) => state.tournament);
  const toTheMoon: any = useWeb3((state) => state.toTheMoon);
  const address = useWeb3((state) => state.accounts[0]);

  const join = async () => {
    if (toTheMoon === null) return;
    //console.log("tournament: ", tournament);

    const isPlayerRegistered = (await toTheMoon.isPlayerRegistered(address))[0];

    console.log("isPlayerRegistered: ", isPlayerRegistered);

    const joining = await tournament.playerStatsMap(address);

    const joinedTournaments = await toTheMoon.getJoinedTournamentsByPlayer(
      address
    );
    console.log("joining: ", joinedTournaments.toString());

    if (isPlayerRegistered) {
      console.log("joinTournament: ");
      // await tournament.joinTournament({
      //   value: ethers.utils.parseEther("1"),
      // });
    } else {
      toTheMoon.register("Hrushi.eth", 20);
    }
  };

  return { join };
};

export { useTournament };

// getRewardInfo()
// All info about tournament _> get fees separately
