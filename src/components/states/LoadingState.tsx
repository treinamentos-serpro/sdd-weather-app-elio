interface LoadingStateProps {
  message: string;
}

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <div
      className="flex min-h-32 w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 p-6 text-white shadow-glass backdrop-blur-md"
      role="status"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-accent-400 motion-reduce:animate-none"
      />
      <p className="font-medium">{message}</p>
    </div>
  );
}
