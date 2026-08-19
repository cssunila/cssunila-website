"use client";

import { useState } from "react";
import Image from "next/image";

interface FlipCardProps {
  logoCss: string;
}

export default function FlipCard({ logoCss }: FlipCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const activeFlipped = isHovered;

  return (
    <div
      className="relative mx-auto flex aspect-square max-w-md w-full items-center justify-center select-none"
      style={{ perspective: "1000px" }}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: activeFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="glass-strong absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-10"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <Image
            src={logoCss}
            width={200}
            height={400}
            alt="Logo CSS 3.0"
            className="w-full max-w-72 object-contain pointer-events-none"
            priority
          />
        </div>

        <div
          className="glass-strong absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-10"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Image
            src="/himakom-logo.png"
            width={200}
            height={400}
            alt="Logo Himakom"
            priority
            className="w-full max-w-65 object-contain pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
