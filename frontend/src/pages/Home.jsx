import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  const cards = [
    {
      role: "Citizen",
      tagline: "Public Access",
      desc: "Report incidents and view real-time safety alerts in your vicinity.",
      action: () => nav("/feed"),
      accent: "#7DA99C", // Sage
      id: "01"
    },
    {
      role: "Admin",
      tagline: "Control Center",
      desc: "Manage system-wide reports, verify data, and dispatch resources.",
      action: () => nav("/admin/login"),
      accent: "#8A94BB", // Blue-Slate
      id: "02"
    },
    {
      role: "Responder",
      tagline: "Field Operations",
      desc: "Access assigned emergencies and update status from the scene.",
      action: () => nav("/worker/login"),
      accent: "#B08991", // Rose
      id: "03"
    },
  ];

  return (
    <div className="min-h-screen bg-[#D1C4D1] flex items-center justify-center p-4 sm:p-8 font-sans antialiased">
      {/* Outer Shell - mimicking the tablet look from your photo */}
      <div className="max-w-6xl w-full bg-[#F2EDE9] rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border-[12] border-white/40">
        
        <div className="p-8 md:p-16">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#7DA99C] rounded-2xl flex items-center justify-center shadow-sm">
                   <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45"></div>
                </div>
                <span className="text-[#5A5266] font-black text-2xl tracking-tighter uppercase">Em-Grid</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-[#4A4453] tracking-[ -0.04em] leading-none">
                Connecting <br/> 
                <span className="opacity-40 italic font-medium">emergencies</span> to care
              </h1>
            </div>
            
            <div className="hidden md:block text-right">
              <p className="text-[#9A8FAB] text-xs font-bold uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2 text-[#7DA99C] font-bold">
                <span className="w-2 h-2 bg-[#7DA99C] rounded-full animate-pulse"></span>
                System Operational
              </div>
            </div>
          </header>

          {/* Role Selection Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((c) => (
              <div 
                key={c.role}
                className="group relative bg-white/60 p-1 rounded-[2.5rem] transition-all hover:bg-white shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
              >
                <button
                  onClick={c.action}
                  className="w-full h-full text-left p-8 rounded-[2.3rem] flex flex-col justify-between min-h-80 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <span className="text-4xl font-black opacity-10" style={{ color: c.accent }}>{c.id}</span>
                      <div 
                        className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                        style={{ borderColor: `${c.accent}40`, color: c.accent }}
                      >
                        {c.tagline}
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-[#4A4453] mb-3">{c.role}</h3>
                    <p className="text-[#8E8699] text-sm leading-relaxed font-medium">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center text-white transition-transform "
                      style={{ backgroundColor: c.accent }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                    <span className="text-[#BDB4C7] font-bold text-xs uppercase tracking-tighter">Initialize Access</span>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Minimal Footer */}
          
        </div>
      </div>
    </div>
  );
}

