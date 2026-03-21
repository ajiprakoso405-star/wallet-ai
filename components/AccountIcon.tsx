"use client";

import Image from "next/image";

interface Props {
  icon: string;
  size?: number;
  className?: string;
}

export default function AccountIcon({ icon, size = 28, className = "" }: Props) {
  const isUrl = icon.startsWith("http");

  if (isUrl) {
    return (
      <Image
        src={icon}
        alt="logo"
        width={size}
        height={size}
        className={`object-contain rounded ${className}`}
        onError={(e) => {
          // fallback ke teks jika logo gagal load
          const parent = e.currentTarget.parentElement;
          if (parent) {
            e.currentTarget.style.display = "none";
            parent.textContent = "🏦";
          }
        }}
      />
    );
  }

  return <span style={{ fontSize: size * 0.75 }}>{icon}</span>;
}
