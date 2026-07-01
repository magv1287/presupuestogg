'use client';

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
}

const sizeClasses = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
};

function getInitial(name?: string | null, email?: string | null): string {
  const source = name?.trim() || email?.trim() || 'G';
  return source.charAt(0).toUpperCase();
}

export function UserAvatar({ name, email, size = 'sm', className = '', title }: UserAvatarProps) {
  const initial = getInitial(name, email);

  return (
    <div
      title={title}
      className={[
        'flex-shrink-0 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center text-white font-bold',
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      {initial}
    </div>
  );
}
