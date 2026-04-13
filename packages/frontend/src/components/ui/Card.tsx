'use client';

import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}

export default function Card({ className, variant = 'default', children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white rounded-xl shadow-sm border border-gray-100',
    bordered: 'bg-white rounded-xl border-2 border-gray-200',
    elevated: 'bg-white rounded-xl shadow-lg',
  };

  return (
    <div className={cn(variants[variant], 'p-6', className)} {...props}>
      {children}
    </div>
  );
}
