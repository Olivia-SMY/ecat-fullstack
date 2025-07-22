import React, { useEffect, useState } from 'react';

const CountdownTimer = ({ timeLimit, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="font-mono text-lg text-red-600">
      ⏰ {minutes}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default CountdownTimer;
