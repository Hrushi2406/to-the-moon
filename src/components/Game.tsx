import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useWeb3 } from "../store/web3_store";
import "../styles/game.css";
import { useSnackbar } from "react-simple-snackbar";
import React from "react";
import { snackbarOptions } from "../utils/helper";

type GameProps = {};

function Game({}: GameProps) {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isHighscore, setisHighscore] = useState(false);

  const fetchHighscore = useWeb3((state) => state.getHighscore);
  const checkHasEnded = useWeb3((state) => state.checkHasEnded);
  const hasTournamentEnded = useWeb3((state) => state.hasTournamentEnded);

  const highscore = useWeb3((state) => state.highscore);

  console.log("GAME HIGHSCORE ", highscore);

  useEffect(() => {
    fetchHighscore();
  }, []);

  useEffect(() => {
    checkHasEnded();
  }, [gameOver]);

  const attemptsLeft = useWeb3((state) => state.attemptsLeft);
  const hasJoinedTournament = useWeb3((state) => state.hasJoinedTournament);

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

  console.log("gameover", gameOver);

  const handleGameOver = useCallback(
    (score: any) => {
      setScore(score);
      setisHighscore(score > highscore);
      setGameOver(true);
    },
    [highscore]
  );

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
        hasTournamentEnded ? (
          <Overlay>
            <p className="text-xl tracking-wider ">
              Opps, Tournament has ended
            </p>
            <div className="my-1"></div>
            <GameStartPage
              handleRestart={handleRestart}
              isHighscore={isHighscore}
              score={score}
            />
            <div className="my-2"></div>
            <p className="tracking-wider ">Wait till next tournament is Live</p>
          </Overlay>
        ) : hasJoinedTournament ? (
          <Overlay>
            <GameScore score={score} />
            <div className="my-2"></div>
            <Highscore highscore={highscore} />
            <div className="my-2"></div>

            {isHighscore ? (
              <>
                <p className="text-sm tracking-wider">
                  Do you want to submit this score for tournament?{" "}
                </p>
                <div className="my-2"></div>
                <GameStartPage
                  handleRestart={handleRestart}
                  isHighscore={isHighscore}
                  score={score}
                />
                <div className="my-2"></div>
                <p className="text-sm tracking-wider">
                  Only {attemptsLeft} submission left{" "}
                </p>
              </>
            ) : (
              <>
                <p>Ooops, you didn't beat ur previous Highscore🙁</p>
                <GameStartPage
                  handleRestart={handleRestart}
                  isHighscore={isHighscore}
                  score={score}
                />
              </>
            )}
          </Overlay>
        ) : (
          <Overlay>
            <GameScore score={score} />

            <div className="my-2"></div>
            <GameStartPage
              handleRestart={handleRestart}
              isHighscore={isHighscore}
              score={score}
            />
          </Overlay>
        )
      ) : (
        <></>
      )}

      <Unity className="unity" unityProvider={unityProvider} />
    </div>
  );
}

export default Game;

const Overlay = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="overlay ">
      <div className="flex items-center justify-center flex-col h-full">
        {children}
      </div>
    </div>
  );
};

const Highscore = ({ highscore }: { highscore: number }) => {
  return (
    <div>
      <h6 className="mx-auto text-center text-2xl ">Your Highscore</h6>
      <p className="mx-auto text-center text-6xl ">{highscore}</p>
    </div>
  );
};

const GameScore = ({ score }: { score: number }) => {
  return (
    <div>
      <h6 className="mx-auto text-center text-2xl ">Game Over</h6>
      <p className="mx-auto text-center text-6xl ">{score}</p>
    </div>
  );
};

const GameStartPage = ({
  handleRestart,
  isHighscore,
  score,
}: {
  handleRestart: any;
  isHighscore: boolean;
  score: number;
}) => {
  const joinTournament = useWeb3((state) => state.joinTournament);
  const recordHighscore = useWeb3((state) => state.recordHighscore);
  const hasJoinedTournament = useWeb3((state) => state.hasJoinedTournament);
  const hasTournamentEnded = useWeb3((state) => state.hasTournamentEnded);

  const [openSnackbar, closeSnackbar] = useSnackbar(snackbarOptions);

  const playToEarn = async () => {
    openSnackbar(
      "Transaction submitted, Changes will be reflected in few seconds"
    );
    await joinTournament();
    window.location.reload();
  };

  const saveScore = async () => {
    openSnackbar(
      "Transaction submitted, Your highscore will be reflected in few seconds"
    );
    await recordHighscore(score);
    window.location.reload();
  };

  return (
    <>
      {hasTournamentEnded ? (
        <></>
      ) : hasJoinedTournament ? (
        isHighscore ? (
          <button className="primary-button" onClick={saveScore}>
            Submit Highscore
          </button>
        ) : (
          <></>
        )
      ) : (
        <button className="btn-grad" onClick={playToEarn}>
          Play to earn ETH
        </button>
      )}

      <div className="my-2"></div>
      <button className="btn-grad" onClick={handleRestart}>
        {hasTournamentEnded
          ? "Practice"
          : hasJoinedTournament
          ? "Try Again"
          : "Play for Free"}
      </button>
    </>
  );
};
