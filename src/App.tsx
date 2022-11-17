import React from "react";
import { Button } from "./components/Button";
import Game from "./components/Game";
import logo from "./assets/logo.png";
import { MobileView } from "react-device-detect";

function App() {
  const gameRef = React.useRef<HTMLDivElement>(null);

  const scrollToGame = () => {
    if (gameRef && gameRef.current) {
      window.scrollTo({
        behavior: "smooth",
        top: gameRef.current.offsetTop - 20,
      });
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      scrollToGame();
    }, 1700);
  }, []);

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
            Play and earn <span className="text-[#896DD8]">$TRON</span>
          </h3>

          <div className="my-2"></div>

          <h6 className="max-w-sm text-center mx-auto">
            {/* Tournament will be launched soon */}
            Take part in today‘s prize pool of 200.0 $TRX! <br></br>Pay only 10
            $TRX to play!
          </h6>
          <div className="my-2"></div>

          <MobileView className="text-sm">
            Please view on desktop for best experience
          </MobileView>
        </div>

        <div className="my-8"></div>

        <div className="max-w-sm mx-auto " ref={gameRef}>
          <Game />
        </div>

        <div className="my-6"></div>
        <div className="text-center mx-auto">
          ← Use side arrow keys to move the Bitcoin →
        </div>

        <div className="my-16"></div>

        <div className="backdrop-blur-sm px-8 py-8 bg-opacity-10 rounded-lg bg-white">
          <div className="flex justify-between items-center">
            <h4 className="text-3xl font-bold tracking-wider">Tournament #1</h4>
            <h6 className="text-xl tracking-wider">
              Ends in <span className="text-[#B98DDB]">0H : 0M : 0S </span>
            </h6>
          </div>

          <div className="my-6"></div>

          <div className="grid grid-cols-4">
            <h6 className="tracking-wider col-span-2 uppercase text-lg">
              Player
            </h6>
            <h6 className="tracking-wider uppercase text-lg text-right">
              SCORE
            </h6>
            <h6 className="tracking-wider uppercase text-lg text-right">
              PRIZE
            </h6>
          </div>

          <div className="w-full text-center text-lg my-4">
            Tournaments will be launched soon
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
