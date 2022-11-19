import React, { FC } from "react";
import { useWeb3 } from "../store/web3_store";

interface CountdownProps {}

export const Countdown = ({}: CountdownProps) => {
  const [hour, sethour] = React.useState(0);
  const [min, setmin] = React.useState(0);
  const [sec, setsec] = React.useState(0);
  const [hasEnded, sethasEnded] = React.useState(false);

  const setCountdown = (date: Date) => {
    var end: any = new Date(date);

    const _second = 1000;
    const _minute = _second * 60;
    const _hour = _minute * 60;
    const _day = _hour * 24;
    let timer: any;

    function showRemaining() {
      let now: any = new Date();
      let distance = end - now;
      if (distance < 0) {
        clearInterval(timer);

        sethasEnded(true);

        return;
      }

      const hours = Math.floor((distance % _day) / _hour);
      const minutes = Math.floor((distance % _hour) / _minute);
      const seconds = Math.floor((distance % _minute) / _second);

      sethour(hours);
      setmin(minutes);
      setsec(seconds);
    }

    timer = setInterval(showRemaining, 1000);
  };

  const tournament: any = useWeb3((state) => state.currentTournament);

  React.useEffect(() => {
    if (!tournament) return;

    setCountdown(tournament.endsIn);
  }, [tournament]);

  return (
    <>
      {hasEnded ? (
        <span className="text-[#B98DDB] text-xl tracking-wider">Ended</span>
      ) : (
        <h6 className="text-xl tracking-wider">
          Ends in{" "}
          <span className="text-[#B98DDB]">
            {hour}H : {min}M : {sec}S{" "}
          </span>
        </h6>
      )}
    </>
  );
};
