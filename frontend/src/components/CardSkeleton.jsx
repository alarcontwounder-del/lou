import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white border border-stone-100 shadow-sm rounded-2xl overflow-hidden animate-pulse">
      <div className="m-3 mb-0 rounded-xl bg-stone-200 aspect-[4/3]" />
      <div className="p-5 pt-4 space-y-3">
        <div className="h-3 bg-stone-200 rounded w-1/3" />
        <div className="h-5 bg-stone-200 rounded w-3/4" />
        <div className="h-3 bg-stone-200 rounded w-full" />
        <div className="h-3 bg-stone-200 rounded w-2/3" />
      </div>
    </div>
  );
}
