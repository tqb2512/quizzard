import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface TimeBarProps {
  totalTime: number; // Total time in seconds
  timeLeft: number; // Time left in seconds
}

export function TimeBar({ totalTime, timeLeft }: TimeBarProps) {
  //const [timeLeft, setTimeLeft] = useState(totalTime);

  //useEffect(() => {
  //  const timer = setInterval(() => {
  //    setTimeLeft((prevTime) => {
  //      if (prevTime <= 1) {
  //        clearInterval(timer);
  //        onTimeUp();
  //        return 0;
  //      }
  //      return prevTime - 1;
  //    });
  //  }, 1000);

  //  return () => clearInterval(timer);
  //}, [totalTime, onTimeUp]);

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="w-full">
      <Progress value={progress} className="w-full h-2" />
    </div>
  );
}

