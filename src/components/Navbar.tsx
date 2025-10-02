import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Home, Shield } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Padel Booking</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            Beranda
          </Link>
          
          <Link to="/booking">
            <Button variant="default" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Booking Sekarang
            </Button>
          </Link>
          
          <Link to="/admin/login">
            <Button variant="ghost" size="sm">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
