"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
  images: string[];
}

const HeroSlider = ({ images }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full relative aspect-[16/7.9]">
      {images.map((image, index) => (
        <Image
          key={index}
          src={image}
          alt="products banner"
          layout="fill"
          objectFit="cover"
          unoptimized
          priority={index === 0}
          className={`absolute inset-0 transition-opacity duration-1000 -z-10 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
};

export default HeroSlider;
