import { log } from "console";
import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import "../styles/game.css";

type GameProps = {};

function Game({}: GameProps) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

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
        <div className="overlay ">
          <div className="flex items-center justify-center flex-col h-full">
            <h6 className="mx-auto text-center text-2xl ">Game Over</h6>
            <p className="mx-auto text-center text-6xl ">{score}</p>
            <div className="my-2"></div>
            <GameStartPage handleRestart={handleRestart} />
          </div>
        </div>
      ) : (
        <></>
      )}

      <Unity className="unity" unityProvider={unityProvider} />
    </div>
  );
}

export default Game;

const GameStartPage = ({ handleRestart }: { handleRestart: any }) => {
  return (
    <>
      <button className="primary-button" onClick={handleRestart}>
        Play for Free
      </button>
      <div className="my-2"></div>
      <button
        className="disabled-button"
        onClick={handleRestart}
        disabled={true}
      >
        Play to earn $TRON (soon)
      </button>
    </>
  );
};
