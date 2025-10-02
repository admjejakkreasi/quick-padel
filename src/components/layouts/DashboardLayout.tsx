import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  ScrollText,
  UserCog,
  Users,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface SidebarItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  roles: ("user" | "kasir" | "admin")[];
}

const sidebarItems: SidebarItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
    roles: ["user", "kasir", "admin"],
  },
  {
    icon: Calendar,
    label: "Booking Saya",
    href: "/dashboard/bookings",
    roles: ["user", "kasir", "admin"],
  },
  {
    icon: Calendar,
    label: "Manajemen Booking",
    href: "/dashboard/manage-bookings",
    roles: ["kasir", "admin"],
  },
  {
    icon: ScrollText,
    label: "Artikel",
    href: "/dashboard/articles",
    roles: ["kasir", "admin"],
  },
  {
    icon: Users,
    label: "User Management",
    href: "/dashboard/users",
    roles: ["admin"],
  },
  {
    icon: ScrollText,
    label: "Laporan Keuangan",
    href: "/dashboard/finance",
    roles: ["admin"],
  },
  {
    icon: Settings,
    label: "Pengaturan",
    href: "/dashboard/settings",
    roles: ["admin"],
  },
  {
    icon: UserCog,
    label: "Profile",
    href: "/dashboard/profile",
    roles: ["user", "kasir", "admin"],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const filteredItems = sidebarItems.filter((item) =>
    item.roles.includes(profile?.role as "user" | "kasir" | "admin")
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r bg-background transition-transform lg:translate-x-0",
          isSidebarOpen && "translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b p-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Quick Padel</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {filteredItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center space-x-2 rounded-lg px-2 py-2 hover:bg-accent"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout button */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start space-x-2"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-50 border-b bg-background lg:hidden">
        <div className="flex h-16 items-center space-x-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-xl font-bold">Quick Padel</span>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="container py-8">{children}</div>
      </div>
    </div>
  );
}