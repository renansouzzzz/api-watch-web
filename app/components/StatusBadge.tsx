interface StatusBadgeProps {
  isUp: boolean | null;
}

export default function StatusBadge({ isUp }: StatusBadgeProps) {
  if (isUp === null) {
    return (
      <span className="flex items-center gap-1.5 text-gray-400 text-sm">
        <span className="w-2 h-2 rounded-full bg-gray-500" />
        Pending
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-1.5 text-sm font-medium ${isUp ? "text-green-400" : "text-red-400"}`}>
      <span className={`w-2 h-2 rounded-full ${isUp ? "bg-green-400" : "bg-red-400"}`} />
      {isUp ? "UP" : "DOWN"}
    </span>
  );
}
