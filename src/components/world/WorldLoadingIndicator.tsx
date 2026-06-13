interface Props {
  progress: number;
}

export default function WorldLoadingIndicator({ progress }: Props) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="flex flex-col items-center gap-3 min-w-[220px] px-4">
      <span className="font-mono text-text-primary text-sm tracking-wider">
        Loading...
      </span>
      <div className="w-full h-3 border border-divider rounded-sm bg-bgcolor-light overflow-hidden">
        <div
          className="h-full bg-yellow-500"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
