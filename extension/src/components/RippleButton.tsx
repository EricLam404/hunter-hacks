import React from "react";
import "../RippleButton.css";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
};
const RippleButton: React.FC<Props> = ({ children, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.className = "ripple";
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;

    const ripple = button.querySelector(".ripple");
    if (ripple) ripple.remove();

    button.appendChild(circle);

    setTimeout(() => {
      onClick(); 
    }, 400); 
  };

  return (
    <button className="ripple-button" onClick={handleClick}>
      {children}
    </button>
  );
};

export default RippleButton;
