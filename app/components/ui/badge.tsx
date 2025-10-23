'use client';
import * as React from 'react';
export function Badge({className='', children}: {className?: string; children?: React.ReactNode}) {
  return <span className={`inline-block px-2 py-1 text-xs rounded-full border ${className}`}>{children}</span>;
}
export default Badge;
