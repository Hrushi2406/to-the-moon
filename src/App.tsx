import React from "react";
import { Button } from "./components/Button";
import Game from "./components/Game";
import logo from "./assets/logo.png";
import { MobileView } from "react-device-detect";
import { scrollToGame } from "./utils/helper";
import { useWeb3 } from "./store/web3_store";
import { Leaderboard } from "./components/Leaderboard";

function App() {
  const ref = React.useRef<HTMLDivElement>(null);

  const tournament: any = useWeb3((state) => state.currentTournament);
  const hasJoinedTournament = useWeb3((state) => state.hasJoinedTournament);

  const getTournamentInfo = useWeb3((state) => state.getTournamentInfo);

  React.useEffect(() => {
    //getTournamentInfo();
    setTimeout(() => scrollToGame(ref), 170000);
  }, []);

  const prizePool =
    (tournament?.playersJoined + 1) *
    tournament?.joiningFee *
    (1 - tournament?.commissionPercentage / 10000);

  return (
    <div className="bg-black">
      <div className="gradient-background px-4 sm:px-48 py-6 pb-32">
        <div className="flex justify-between items-center">
          <h1 className="mx-auto flex gap-3 sm:mx-0 ">
            <img src={logo} width={30} alt="To the Moon - Play to earn logo" />
            <p className="text-2xl text-white font- ">To the Mooon</p>
          </h1>
          <Button />
        </div>

        <div className="my-6"></div>

        <div className="text-center mx-auto">
          <h3 className="text-4xl tracking-wider">
            Play and earn <span className="text-[#896DD8]">$ETH</span>
          </h3>

          <div className="my-2"></div>

          <h6 className="max-w-sm text-center mx-auto">
            Take part in today‘s prize pool of {prizePool} $ETH! <br></br>Pay
            only {tournament?.joiningFee} $ETH to play!
          </h6>
          <div className="my-2"></div>

          <MobileView className="text-sm">
            Please view on desktop for best experience
          </MobileView>
        </div>

        <div className="my-8"></div>

        <div className="max-w-sm mx-auto " ref={ref}>
          <Game />
        </div>

        <div className="my-6"></div>
        <div className="text-center mx-auto">
          ← Use side arrow keys to move the Bitcoin →
        </div>

        <div className="my-16"></div>

        <Leaderboard tournament={tournament} />
      </div>
    </div>
  );
}

export default App;
