import React, { FC } from "react";
import { useWeb3 } from "../store/web3_store";
import { Countdown } from "./Countdown";
import { Leaderboard } from "./Leaderboard";

interface TabsProps {}

export const Tabs = ({}: TabsProps) => {
  const [currentTab, setcurrentTab] = React.useState(0);
  const [currentTId, setcurrentTId] = React.useState<string>("");

  const allTournaments: any = useWeb3((state) => state.allTournaments);
  const getLeaderBoard: any = useWeb3((state) => state.getLeaderBoard);

  const withdrawPrize = useWeb3((state) => state.withdrawPrize);

  const claimPrize = async (tId: string) => {
    await withdrawPrize(tId);

    window.location.reload();
  };

  const myTournaments: any = useWeb3((state) => state.myTournaments);
  const currentTournament: any = useWeb3((state) => state.currentTournament);

  const tabStyle = "cursor-pointer text-lg tracking-wider pr-4 py-2 ";
  const activeStyle = "gradient-text underline underline-offset-4 ";

  const getStyles = (index: number) => {
    if (index === currentTab) {
      return tabStyle + activeStyle;
    }
    return tabStyle;
  };

  const handleTournamentChange = async (tId: string) => {
    setcurrentTId(tId);
    await getLeaderBoard(tId);
  };

  console.log("myTournamnets: ", myTournaments);

  return (
    <>
      <div className="flex gap-4 items-center">
        <div className={getStyles(0)} onClick={() => setcurrentTab(0)}>
          Leaderboard
          <div
            className={
              "gradient-underline " + (currentTab === 1 ? "invisible" : "")
            }
          ></div>
        </div>
        <div className={getStyles(1)} onClick={() => setcurrentTab(1)}>
          My Tournaments
          <div
            className={
              "gradient-underline " + (currentTab === 0 ? "invisible" : "")
            }
          ></div>
        </div>
      </div>

      <div className="my-4"></div>

      {currentTab === 0 ? (
        <>
          <div className="gradient-container">
            <div className="flex justify-between">
              <select
                className="bg-transparent text-2xl tracking-wider outline-none"
                value={
                  currentTId.length > 0 ? currentTId : currentTournament?.id
                }
                onChange={(e) => handleTournamentChange(e.target.value)}
              >
                {allTournaments.map((item: any) => (
                  <option key={item.id} value={item.id} className="text-black">
                    {item.name}
                  </option>
                ))}
              </select>

              <Countdown />
            </div>

            <div className="my-8"></div>

            <Leaderboard tournament={allTournaments[currentTId]} />
          </div>
        </>
      ) : (
        <>
          <div className="gradient-container">
            <div className="grid grid-cols-12 items-center gap-4">
              <h6 className="tracking-wider col-span-4 text-lg text-left">
                Name
              </h6>

              <h6 className="tracking-wider col-span-2 uppercase text-lg text-right">
                RANK
              </h6>
              <h6 className="tracking-wider col-span-2 uppercase text-lg text-right">
                HIGHSCORE
              </h6>
              <h6 className="tracking-wider col-span-2 uppercase text-lg text-right">
                PRIZE
              </h6>
              <div className="col-span-2"></div>
            </div>

            <div className="my-6"></div>

            <div className="w-full text-center text-lg space-y-6">
              {myTournaments.map((tournament: any, i: any) => {
                return (
                  <div className="grid grid-cols-12 items-center gap-4">
                    <h6 className="tracking-wider col-span-4 text-lg text-left">
                      {tournament.name}
                    </h6>

                    <h6 className="tracking-wider col-span-2 uppercase text-lg text-right">
                      {tournament.rank}
                    </h6>
                    <h6 className="tracking-wider col-span-2 uppercase text-lg text-right">
                      {tournament.highscore}
                    </h6>
                    <h6 className="tracking-wider col-span-2 uppercase text-lg text-right">
                      {parseFloat(tournament.allocatedPrize).toFixed(4)} ETH
                    </h6>
                    <div className="col-span-2 text-right">
                      {parseFloat(tournament.unclaimedPrize) === 0 ? (
                        <p className="text-lg tracking-wider gradient-text">
                          Collected
                        </p>
                      ) : (
                        <button
                          className="rounded-button"
                          onClick={() => claimPrize(tournament.id)}
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};
