import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  variant?: "full" | "mark";
}

export default function Logo({ size = 36, className = "", variant = "full" }: LogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/logo.jpg"
        alt="MakeArt"
        width={size}
        height={size}
        className={`object-contain mix-blend-multiply ${className}`}
        priority
      />
    );
  }

  return (
    <Image
      src="/logo.jpg"
      alt="MakeArt - Create with Love"
      width={size}
      height={size}
      className={`object-contain mix-blend-multiply ${className}`}
      priority
    />
  );
}
