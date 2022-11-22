import React from "react";
import { useWeb3 } from "../store/web3_store";
import { formatAddress } from "../utils/helper";
import { Countdown } from "./Countdown";

interface LeaderboardProps {
  tournament: any;
}

export const Leaderboard = ({ tournament }: LeaderboardProps) => {
  const leaderboard: any = useWeb3((state) => state.leaderboard);
  const className =
    "backdrop-blur-sm px-8 py-8 bg-opacity-20 rounded-lg bg-white gradient-container";

  return (
    <>
      <div className="grid grid-cols-12">
        <h6 className="tracking-wider uppercase text-lg"></h6>
        <h6 className="tracking-wider col-span-7 uppercase text-lg">Player</h6>
        <h6 className="tracking-wider col-span-2 uppercase text-lg text-right">
          SCORE
        </h6>
        <h6 className="tracking-wider col-span-2 uppercase text-lg text-right">
          PRIZE
        </h6>
      </div>

      <div className="my-6"></div>

      <div className="w-full text-center text-lg space-y-6">
        {leaderboard.map((player: any, i: any) => {
          return (
            <div className="grid grid-cols-12">
              <h6 className="tracking-wider uppercase text-lg text-left">
                {i + 1}
              </h6>

              <h6 className="tracking-wider col-span-7 text-lg text-left">
                <p className="">
                  {player.name.length > 0
                    ? player.name
                    : player.address.slice(0, 14) + "..."}
                </p>
                <p className="uppercase text-sm">
                  {formatAddress(player.address)}
                </p>
              </h6>
              <h6 className="tracking-wider col-span-2 uppercase text-lg text-right">
                {player.highscore}
              </h6>
              <h6 className="tracking-wider col-span-2 uppercase text-lg text-right">
                {parseFloat(player.prize).toFixed(4)} ETH
              </h6>
            </div>
          );
        })}
      </div>
    </>
  );
};
