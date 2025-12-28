export default function Logo({ className = "" }) {
  return (
    <div className={`w-12 h-12 bg-[#7DA99C] rounded-2xl flex items-center justify-center shadow-sm ${className}`}>
      <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45"></div>
    </div>
  );
}
