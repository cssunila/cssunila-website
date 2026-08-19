"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface VideoBackgroundProps {
  opacity?: number;
  bgImageSrc?: string;
  bgImageOpacity?: number;
}

export default function VideoBackground({
  opacity = 0.55,
  bgImageSrc,
  bgImageOpacity = 0.2,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showBg, setShowBg] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const startPlay = () => {
      video.play().catch(() => {});
    };

    startPlay();

    const handleEnded = () => {
      setIsPlaying(false);
      setShowBg(true);
    };

  
    const handlePause = () => {
      if (!video.ended) {
        video.play().catch(() => {});
      }
    };

    const handleStalled = () => {
      video.load();
      video.play().catch(() => {});
    };

    video.addEventListener("ended", handleEnded);
    video.addEventListener("pause", handlePause);
    video.addEventListener("stalled", handleStalled);

    const unlockPlay = () => {
      if (video.paused && !video.ended) {
        video.play().catch(() => {});
      }
    };
    window.addEventListener("touchstart", unlockPlay, { once: true });
    window.addEventListener("click", unlockPlay, { once: true });

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("stalled", handleStalled);
      window.removeEventListener("touchstart", unlockPlay);
      window.removeEventListener("click", unlockPlay);
    };
  }, []);

  const handleHeroClick = () => {
    const video = videoRef.current;
    if (!video || isPlaying) return;

    setShowBg(false);
    setIsPlaying(true);
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  return (
    <div
      aria-hidden
      onClick={handleHeroClick}
      className={`absolute inset-0 -z-10 overflow-hidden ${
        !isPlaying ? "cursor-default" : "pointer-events-none"
      }`}
    >
      {bgImageSrc && (
        <Image
          src={bgImageSrc}
          alt="Logo CSS"
          width={1920}
          height={1080}
          priority
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: showBg ? bgImageOpacity : 0,
            transition: "opacity 0.8s ease-in-out",
            zIndex: 0,
          }}
        />
      )}

      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        style={{
          opacity: isPlaying ? opacity : 0,
          transition: "opacity 1s ease-in-out",
          zIndex: 1,
        }}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
      >
        <source src="/video/animasi-css3.webm" type="video/webm" />
        <source src="/video/animasi-css3.mp4" type="video/mp4" />
      </video>
      
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-background/50 via-background/80 to-background" />
    </div>
  );
}
