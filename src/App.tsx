import React from "react";
import { Button } from "./components/Button";
import Game from "./components/Game";
import logo from "./assets/logo.png";
import { MobileView } from "react-device-detect";
import {
  contractAddress,
  copyToClipboard,
  formatAddress,
  scrollToGame,
} from "./utils/helper";
import { useWeb3 } from "./store/web3_store";
import { Leaderboard } from "./components/Leaderboard";
import { Tabs } from "./components/Tabs";

function App() {
  const ref = React.useRef<HTMLDivElement>(null);

  const tournament: any = useWeb3((state) => state.currentTournament);
  const hasJoinedTournament: any = useWeb3(
    (state) => state.hasJoinedTournament
  );

  React.useEffect(() => {
    setTimeout(() => scrollToGame(ref), 170000);
  }, []);

  const prizePool =
    tournament?.prizePool +
    (hasJoinedTournament
      ? 0
      : tournament?.joiningFee *
        (1 - tournament?.commissionPercentage / 10000));

  return (
    <div>
      <div className="gradient-background px-4 sm:px-48 py-6 pb-8">
        <div className="flex justify-between items-center">
          <h1 className="mx-auto flex gap-3 sm:mx-0 items-center">
            <img
              src={logo}
              style={{ width: "24px", height: "24px" }}
              alt="To the Moon - Play to earn logo"
            />
            <p className="text-xl text-white font- ">To the Mooon</p>
          </h1>

          <Button />
        </div>

        <div className="my-12"></div>

        <div className="text-center mx-auto">
          <h3 className="text-6xl tracking-wider gradient-text">
            Play and earn <span className="">$ETH</span>
          </h3>

          <div className="my-4"></div>

          {hasJoinedTournament ? (
            <h6 className="max-w-sm text-center mx-auto tracking-wider">
              You have joined today's tournament. <br></br>Score High and earn
              $MATIC
            </h6>
          ) : (
            <h6 className="max-w-sm text-center mx-auto tracking-wider">
              Take part in today‘s prize pool of{" "}
              <span className="focused-text ">
                {prizePool.toFixed(2)} $ETH!{" "}
              </span>{" "}
              <br></br>
              Pay only{" "}
              <span className="focused-text ">
                {tournament?.joiningFee} $ETH{" "}
              </span>
              to play!
            </h6>
          )}

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

        <Tabs />

        <div className="my-20"></div>

        <footer>
          <div className="gradient-underline"></div>
          <div className="my-4"></div>
          <div className="flex justify-between items-center">
            <h6>© Copyright 2022, All Rights Reserved</h6>
            <p className="text-center"> Get in touch with us</p>

            <p className="">
              Contract Address:{" "}
              <span
                className="uppercase cursor-copy text-lg"
                onClick={() => copyToClipboard(contractAddress)}
              >
                {formatAddress(contractAddress)}
              </span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
