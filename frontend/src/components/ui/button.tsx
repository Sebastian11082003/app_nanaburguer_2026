import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`
        inline-flex
        items-center
        justify-center
        rounded-xl
        bg-white
        px-4
        py-2
        font-semibold
        text-black
        transition-all
        hover:opacity-90
        disabled:opacity-50
        ${className}
      `}
      {...props}
    />
  );
}
