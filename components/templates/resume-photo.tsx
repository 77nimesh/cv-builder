import type { CSSProperties } from "react";

type ResumePhotoProps = {
  src: string;
  alt: string;
  shape: "circle" | "square";
  className?: string;
  squareClassName?: string;
  style?: CSSProperties;
};

export default function ResumePhoto({
  src,
  alt,
  shape,
  className = "",
  squareClassName = "rounded-2xl",
  style,
}: ResumePhotoProps) {
  const shapeClassName =
    shape === "circle" ? "rounded-full" : squareClassName;

  return (
    <img
      src={src}
      alt={alt}
      loading="eager"
      decoding="sync"
      fetchPriority="high"
      draggable={false}
      className={`resume-photo ${shapeClassName} ${className}`.trim()}
      style={style}
    />
  );
}