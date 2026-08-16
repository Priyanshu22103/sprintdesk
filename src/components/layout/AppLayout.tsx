import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "../../stores/authStore";
import NotificationBell from "../../components/NotificationBell";

function AppLayout() {
  const navigate = useNavigate();

  const user = useAuthStore(
    (state) => state.user,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  function handleLogout() {
    logout();
    navigate("/login", {
      replace: true,
    });
  }

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: "▦",
    },
    {
      to: "/board",
      label: "Sprint Board",
      icon: "☷",
    },
    {
      to: "/analytics",
      label: "Analytics",
      icon: "◒",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}

      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 md:flex md:flex-col">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
            SprintDesk
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Sprint cockpit
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Manage your sprint
          </p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")
              }
            >
              <span className="w-5 text-center text-base">
                {item.icon}
              </span>

              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              Current sprint
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              Sprint 01
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Active workspace
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <span className="w-5 text-center">
              ↪
            </span>

            Logout
          </button>
        </div>
      </aside>

      {/* Main */}

      <div className="min-w-0 flex-1">
        {/* Header */}

        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-indigo-500">
                SprintDesk
              </p>

              <p className="text-sm font-semibold text-slate-900">
                Sprint 01
              </p>
            </div>

            <div className="hidden md:block">
              <p className="text-xs text-slate-500">
                Current sprint
              </p>

              <p className="font-semibold text-slate-900">
                Sprint 01
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user?.firstName ||
                  user?.username ||
                  "User"}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>

            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:inline-flex">
              ● Active
            </span>

            <NotificationBell />
          </div>
        </header>

        {/* Mobile navigation */}

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-100",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50"
          >
            Logout
          </button>
        </nav>

        {/* Page content */}

        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;