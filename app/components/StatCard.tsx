interface StatCardProps {
  label: string;
  value: string | number;
  color?: "green" | "red" | "yellow" | "blue";
}

const colorMap = {
  green: "text-green-400",
  red: "text-red-400",
  yellow: "text-yellow-400",
  blue: "text-blue-400",
};

export default function StatCard({ label, value, color = "blue" }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-1 border border-gray-700">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`text-3xl font-bold ${colorMap[color]}`}>{value}</span>
    </div>
  );
}
