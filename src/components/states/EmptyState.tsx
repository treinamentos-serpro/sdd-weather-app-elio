interface EmptyStateProps {
  hint: string;
  title: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div
      className="w-full rounded-lg border border-white/10 bg-white/5 p-6 text-center text-white shadow-glass backdrop-blur-md"
      role="status"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-white/70">{hint}</p>
    </div>
  );
}
