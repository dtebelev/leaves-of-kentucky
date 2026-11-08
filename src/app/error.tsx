'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#faf9f4] flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h2 className="font-[family-name:var(--serif)] text-3xl mb-4">Something went wrong</h2>
        <p className="text-[#6c746e] mb-8 font-[family-name:var(--serif)] text-lg">
          We encountered an unexpected error while gathering nature's details.
        </p>
        <button
          onClick={() => reset()}
          className="bg-[#244638] text-white px-8 py-3 text-[10px] tracking-[2px] font-bold hover:bg-[#17372c] transition-colors"
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}
