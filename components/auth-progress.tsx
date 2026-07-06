type AuthProgressProps = {
  label: string;
};

export function AuthProgress({ label }: AuthProgressProps) {
  return (
    <div className="rounded-2xl border border-[#1DA1F2]/30 bg-[#1DA1F2]/10 px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-[#1DA1F2]">
        <span>{label}</span>
        <span className="animate-pulse text-gray-300">Processing...</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
        <div className="h-full w-3/4 rounded-full bg-[#1DA1F2] transition-all duration-700" />
      </div>
    </div>
  );
}
