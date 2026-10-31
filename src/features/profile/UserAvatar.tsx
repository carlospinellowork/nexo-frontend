import { AVATAR_GRADIENTS, initialsOf } from "./avatar";
import type { AvatarColor } from "./types";

interface UserAvatarProps {
  name?: string | null;
  color?: AvatarColor | null;
  image?: string | null;
  size?: number;
  className?: string;
}

/** Avatar da pessoa: a foto, ou as iniciais sobre a cor escolhida. */
export function UserAvatar({ name, color, image, size = 32, className = "" }: UserAvatarProps) {
  if (image) {
    return <img src={image} alt="" width={size} height={size} className={`shrink-0 rounded-full object-cover ${className}`} style={{ width: size, height: size }} />;
  }
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-bold text-white shadow-[inset_0_-1px_0_rgb(0_0_0/0.12)] ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4, background: AVATAR_GRADIENTS[color ?? "violet"], letterSpacing: "-0.02em" }}
    >
      {initialsOf(name)}
    </span>
  );
}
