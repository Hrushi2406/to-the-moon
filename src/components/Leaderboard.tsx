import { useWeb3 } from "../store/web3_store";
import { formatAddress } from "../utils/helper";
import { Countdown } from "./Countdown";

interface LeaderboardProps {
  tournament: any;
}

export const Leaderboard = ({ tournament }: LeaderboardProps) => {
  const leaderboard: any = useWeb3((state) => state.leaderboard);
  const hasJoinedTournament = useWeb3((state) => state.hasJoinedTournament);
  const withdrawPrize = useWeb3((state) => state.withdrawPrize);

  const claimPrize = () => withdrawPrize(tournament?.id);

  return (
    <>
      <div className="backdrop-blur-sm px-8 py-8 bg-opacity-10 rounded-lg bg-white">
        <div className="flex justify-between items-center">
          <h4 className="text-3xl font-bold tracking-wider">
            {tournament?.name}
          </h4>
          <Countdown />
        </div>

        <div className="my-6"></div>

        <div className="grid grid-cols-4">
          <h6 className="tracking-wider col-span-2 uppercase text-lg">
            Player
          </h6>
          <h6 className="tracking-wider uppercase text-lg text-right">SCORE</h6>
          <h6 className="tracking-wider uppercase text-lg text-right">PRIZE</h6>
        </div>

        <div className="w-full text-center text-lg my-4">
          {leaderboard.map((player: any) => {
            return (
              <div className="grid grid-cols-4">
                <h6 className="tracking-wider col-span-2 uppercase text-lg text-left">
                  {formatAddress(player.address)}/{player.name}
                </h6>
                <h6 className="tracking-wider uppercase text-lg text-right">
                  {player.highscore}
                </h6>
                <h6 className="tracking-wider uppercase text-lg text-right">
                  {parseFloat(player.prize).toFixed(2)} ETH
                </h6>
                {hasJoinedTournament ? (
                  <button className="disabled-button" onClick={claimPrize}>
                    Claim
                  </button>
                ) : (
                  <></>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
