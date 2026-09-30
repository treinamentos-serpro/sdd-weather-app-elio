interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="w-full rounded-lg border border-red-300/30 bg-red-950/30 p-6 text-white shadow-glass backdrop-blur-md"
      role="alert"
    >
      <p className="font-medium">{message}</p>
      <button
        className="mt-4 min-h-11 bg-accent-600 px-4 py-2 font-semibold text-white transition-shadow hover:ring-2 hover:ring-accent-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-night-900"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </div>
  );
}
