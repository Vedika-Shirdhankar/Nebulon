import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import NotificationBell from "../../components/shared/NotificationBell";

const navItems = [
  { to: "/citizen", label: "Home", icon: "🏠", end: true },
  { to: "/citizen/report", label: "Report", icon: "📦" },
  { to: "/citizen/segregation-check", label: "Seg. Check", icon: "♻️" },
  { to: "/citizen/complaints", label: "Complaints", icon: "📋" },
  { to: "/citizen/profile", label: "Profile", icon: "👤" },
];

export default function CitizenLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* 🔥 Top Navbar (FULL WIDTH) */}
      <header className="bg-gradient-to-r from-green-500 to-blue-500 text-white sticky top-0 z-40 shadow">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-bold text-lg">Nebulon</span>

            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
              Citizen
            </span>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={handleSignOut}
              className="text-sm bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition"
            >
              Sign Out
            </button>
          </div>

        </div>
      </header>

      {/* 📄 Main Content (FULL WIDTH) */}
      <main className="flex-1 w-full px-4 pb-24">
        <Outlet />
      </main>

      {/* 📱 Bottom Navigation (FULL WIDTH) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow">
        <div className="flex justify-around items-center w-full px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition ${
                  isActive
                    ? "text-blue-500 font-semibold"
                    : "text-gray-500 hover:text-green-500"
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

    </div>
  );
}