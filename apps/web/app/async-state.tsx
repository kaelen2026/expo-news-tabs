import type { ReactNode } from "react";

type AsyncStateProps = {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isEmpty: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  children: ReactNode;
  onRetry?: () => void;
};

export function AsyncState({
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  loadingLabel = "Loading…",
  emptyLabel = "Nothing here yet.",
  children,
  onRetry,
}: AsyncStateProps) {
  if (isLoading) {
    return <p className="text-sm opacity-60">{loadingLabel}</p>;
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-300/40 bg-red-50/40 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        <p>Failed to load: {errorMessage ?? "Unknown error"}</p>
        {onRetry && (
          <button type="button" className="mt-2 underline" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return <p className="text-sm opacity-60">{emptyLabel}</p>;
  }

  return <>{children}</>;
}
