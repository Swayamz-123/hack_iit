import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  const cards = [
    {
      title: "Citizen",
      desc: "Report and view live incidents",
      action: () => nav("/feed"),
      accent: "from-emerald-500 to-teal-500",
      emoji: "👥",
    },
    {
      title: "Admin",
      desc: "Verify, assign, and resolve incidents",
      action: () => nav("/admin/login"),
      accent: "from-blue-500 to-indigo-500",
      emoji: "🛡️",
    },
    {
      title: "Responder",
      desc: "View assignments and update status",
      action: () => nav("/worker/login"),
      accent: "from-orange-500 to-rose-500",
      emoji: "🚒",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <p className="text-sm font-semibold text-emerald-400 mb-2">Emergency Response Platform</p>
          <h1 className="text-3xl font-black bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Choose your role
          </h1>
          <p className="text-xs text-slate-400 mt-2">Citizen · Admin · Responder</p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <button
              key={c.title}
              onClick={c.action}
              className={`group text-left rounded-xl border border-slate-700/60 bg-slate-900/50 p-5 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1`}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-r ${c.accent} text-white text-lg font-bold mb-3`}>
                {c.emoji}
              </div>
              <h3 className="text-lg font-bold text-white">{c.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{c.desc}</p>
              <span className="mt-3 inline-flex items-center text-xs font-semibold text-emerald-300 group-hover:text-white transition">
                Continue →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
