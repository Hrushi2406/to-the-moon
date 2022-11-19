import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useTournament } from "../store/use_tournament";
import { useWeb3 } from "../store/web3_store";
import "../styles/game.css";

type GameProps = {};

function Game({}: GameProps) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const tournaments = useTournament();
  const getTournamentInfo = useWeb3((state) => state.getTournamentInfo);

  const checkHasJoinedTournament = useWeb3(
    (state) => state.checkHasJoinedTournament
  );

  const highscore = useWeb3((state) => state.highscore);
  const attemptsLeft = useWeb3((state) => state.attemptsLeft);

  const hasJoinedTournament = true;
  //const hasJoinedTournament = useWeb3((state) => state.hasJoinedTournament);

  const tournament = useWeb3((state) => state.tournament);

  useEffect(() => {
    //tournaments.join();
    //getTournamentInfo();
    //checkHasJoinedTournament();
  }, [tournament]);

  const {
    unityProvider,
    isLoaded,
    loadingProgression,
    sendMessage,
    addEventListener,
    removeEventListener,
  } = useUnityContext({
    loaderUrl: "Build/webBuild.loader.js",
    dataUrl: "Build/webBuild.data",
    frameworkUrl: "Build/webBuild.framework.js",
    codeUrl: "Build/webBuild.wasm",
  });

  const handleGameOver = useCallback((score: any) => {
    setScore(score);
    setGameOver(true);
  }, []);

  const handleRestart = () => {
    sendMessage("GameManager", "Restart");
    setGameOver(false);
  };

  const loadingPercentage = Math.round(loadingProgression * 100);

  useEffect(() => {
    addEventListener("GameOver", handleGameOver);
    return () => {
      removeEventListener("GameOver", handleGameOver);
    };
  }, [addEventListener, removeEventListener, handleGameOver]);

  return (
    <div className="container ">
      {isLoaded === false && (
        <div className="loading-overlay">
          <p>Loading... ({loadingPercentage}%)</p>
        </div>
      )}

      {gameOver ? (
        hasJoinedTournament ? (
          <div className="overlay ">
            <div className="flex items-center justify-center flex-col h-full">
              <h6 className="mx-auto text-center text-2xl ">Game Over</h6>
              <p className="mx-auto text-center text-6xl ">{score}</p>
              <div className="my-2"></div>
              <h6 className="mx-auto text-center text-2xl ">Highscore</h6>
              <p className="mx-auto text-center text-6xl ">{highscore}</p>
              <p>Do you want to submit this score for tournament? </p>
              <p>Only {attemptsLeft} submission left </p>
              <GameStartPage handleRestart={handleRestart} />
            </div>
          </div>
        ) : (
          <div className="overlay ">
            <div className="flex items-center justify-center flex-col h-full">
              <h6 className="mx-auto text-center text-2xl ">Game Over</h6>
              <p className="mx-auto text-center text-6xl ">{score}</p>
              <div className="my-2"></div>
              <GameStartPage handleRestart={handleRestart} />
            </div>
          </div>
        )
      ) : (
        <></>
      )}

      <Unity className="unity" unityProvider={unityProvider} />
    </div>
  );
}

export default Game;

const GameStartPage = ({ handleRestart }: { handleRestart: any }) => {
  const joinTournament = useWeb3((state) => state.joinTournament);

  const playToEarn = async () => {
    await joinTournament();
    window.location.reload();
  };

  return (
    <>
      <button className="primary-button" onClick={playToEarn}>
        Play to earn ETH
      </button>
      <div className="my-2"></div>
      <button className="disabled-button" onClick={handleRestart}>
        Play for Free
      </button>
    </>
  );
};
