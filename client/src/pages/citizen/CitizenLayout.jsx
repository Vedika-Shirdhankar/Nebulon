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
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="font-bold text-gray-900 text-lg">Nebulon</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Citizen
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-800 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation (mobile-first) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center max-w-5xl mx-auto px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition ${
                  isActive
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-500 hover:text-gray-800"
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