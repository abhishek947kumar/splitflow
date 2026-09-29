import React from 'react';

export function Avatar({ name = '', emoji = '', color = '#6366f1', size = 36, className = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    fontSize: emoji ? `${size * 0.55}px` : `${Math.max(11, size * 0.38)}px`,
  };

  return (
    <div
      className={`member-avatar ${className}`}
      style={style}
      title={name}
      aria-label={name}
    >
      {emoji ? <span>{emoji}</span> : <span>{initials}</span>}
    </div>
  );
}
