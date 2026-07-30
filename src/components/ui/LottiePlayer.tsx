"use client";

import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface LottiePlayerProps {
  src: string;
  className?: string;
  recolorToBrandOrange?: boolean;
}

function applyBrandOrangeRecolor(data: any): any {
  if (!data) return data;

  const cloned = JSON.parse(JSON.stringify(data));

  function traverse(obj: any) {
    if (!obj || typeof obj !== "object") return;

    if (Array.isArray(obj)) {
      obj.forEach(traverse);
      return;
    }

    // Only recolor shape fills ("fl") to keep line art/strokes natural and light
    if (obj.c && Array.isArray(obj.c.k)) {
      const k = obj.c.k;
      if (typeof k[0] === "number" && typeof k[1] === "number" && typeof k[2] === "number") {
        const [r, g, b, a = 1] = k;

        // Preserve skin tones (light beige)
        const isSkinTone = r > 0.82 && g > 0.72 && b > 0.55;
        // Preserve dark elements, outlines, hair, and trousers (r < 0.35)
        const isDark = r < 0.35 && g < 0.35 && b < 0.35;
        // Preserve whites and light neutrals
        const isLightNeutral = r > 0.85 && g > 0.85 && b > 0.85 && Math.abs(r - g) < 0.08;

        if (!isSkinTone && !isDark && !isLightNeutral) {
          // If it's a yellow/gold/brownish fill accent, convert to bright, light brand orange
          if (r >= b) {
            if (g > 0.5) {
              // Bright Primary Brand Orange #FF6B00
              obj.c.k = [1, 0.4196, 0, a];
            } else {
              // Soft Light Orange #FF8533 (Light & vibrant, never dark)
              obj.c.k = [1, 0.521, 0.2, a];
            }
          } else {
            // Cool accent -> Bright Orange #FF6B00
            obj.c.k = [1, 0.4196, 0, a];
          }
        }
      }
    }

    Object.keys(obj).forEach((key) => {
      traverse(obj[key]);
    });
  }

  traverse(cloned);
  return cloned;
}

export default function LottiePlayer({ src, className = "w-full h-full", recolorToBrandOrange = false }: LottiePlayerProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load Lottie animation");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          const finalData = recolorToBrandOrange ? applyBrandOrangeRecolor(data) : data;
          setAnimationData(finalData);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Lottie load error:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src, recolorToBrandOrange]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-orange-50/50 rounded-2xl animate-pulse min-h-[250px] ${className}`}>
        <div className="w-8 h-8 rounded-full border-2 border-[#FF6B00] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !animationData) {
    return null;
  }

  return (
    <div className={className}>
      <Lottie animationData={animationData} loop={true} autoplay={true} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
