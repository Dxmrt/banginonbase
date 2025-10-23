'use client';

import * as React from 'react';

type DialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  // Keep API compatible with shadcn usage: only render when open
  if (!open) return null;
  return <>{children}</>;
}

export function DialogContent({
  children,
  className = '',
  onClose,
}: {
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
}) {
  // Basic centered modal with backdrop
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-[90vw] max-w-md rounded-2xl bg-zinc-900 p-6 shadow ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-3 ${className}`}>{children}</div>;
}

export function DialogTitle({
  children,
  className = '',
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}
