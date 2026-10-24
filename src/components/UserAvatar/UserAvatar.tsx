import { useState } from 'react';

export function UserAvatar({
  name,
  photo,
  className = '',
}: {
  name: string;
  photo?: string | null;
  className?: string;
}) {
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'CW';
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent font-bold text-on-accent ${className}`}
    >
      {photo && photo !== failedPhoto ? (
        <img
          src={photo}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailedPhoto(photo)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
