
export default function SeverityBadge({ level }) {
  const base =
    "inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize text-white";

  const variants = {
    low: "bg-green-500",
    medium: "bg-amber-500",
    high: "bg-red-600",
  };

  return (
    <span className={`${base} ${variants[level] || "bg-slate-400"}`}>
      {level}
    </span>
  );
}
