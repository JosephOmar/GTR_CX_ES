import React, { useState } from "react";

type ActionButtonProps = {
  label: string;
  onClick: () => void;
  colorClass?: string;
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  colorClass = "bg-blue-600 hover:bg-blue-700",
}) => {
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    setAnimate(true);
    onClick();

    // Restaurar color después de 1 segundo
    setTimeout(() => {
      setAnimate(false);
    }, 1000);
  };

  return (
    <button
      className={`px-4 py-2 text-white rounded transition-colors duration-500 ${animate ? "bg-green-500" : colorClass}`}
      onClick={handleClick}
    >
      {label}
    </button>
  );
};
