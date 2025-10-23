'use client';
import * as React from 'react';
export function Card({className='', children}: {className?: string; children?: React.ReactNode}) {
  return <div className={`rounded-2xl shadow p-4 ${className}`}>{children}</div>;
}
export function CardContent({className='', children}: {className?: string; children?: React.ReactNode}) {
  return <div className={className}>{children}</div>;
}
export default Card;
