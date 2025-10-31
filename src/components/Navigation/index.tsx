import { Map, Info, Users, Shield, type LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { NavLink } from "react-router-dom";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

const navItems: NavItem[] = [
  { id: "Home", label: "Informasi Gempa", icon: Info, path: "/" },
  { id: "map", label: "Peta GIS", icon: Map, path: "/map" },
  { id: "about", label: "Tentang", icon: Users, path: "/about" },
];

export default function Navigation() {
  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Title */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-blue-900 font-semibold">
                Sistem Informasi Gempa
              </h1>
              <p className="text-xs text-gray-500">
                Geographic Information System
              </p>
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex gap-2">
            {navItems.map(({ id, label, icon: Icon, path }) => (
              <NavLink
                key={id}
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  isActive ? "text-white" : "text-blue-900"
                }
              >
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{label}</span>
                  </Button>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
