import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import iconBloodHeart from "@/assets/icon-blood-heart.jpg";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        const isAuth = !!data.user;
        setIsAuthenticated(isAuth);
        
        // Check if user is admin
        const isAdminUser = data.user?.user_metadata?.user_type === 'admin';
        setIsAdmin(isAdminUser);
      } catch (err) {
        console.error("Error checking auth state:", err);
      }
    };

    checkUser();

    // Listen to auth state changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsAuthenticated(!!session?.user);
      const isAdminUser = session?.user?.user_metadata?.user_type === 'admin';
      setIsAdmin(isAdminUser);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={iconBloodHeart} alt="LifeLink" className="w-10 h-10" />
            <span className="text-2xl font-bold text-primary">LifeLink</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
            {isAdmin && (
              <Link to="/admin/hospitals/pending" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                <span>🔐</span> Admin
              </Link>
            )}
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero">Sign Up</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile">
                  <Button variant="ghost">Account</Button>
                </Link>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            {isAdmin && (
              <Link
                to="/admin/hospitals/pending"
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                🔐 Admin Dashboard
              </Link>
            )}
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="hero" className="w-full">Sign Up</Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">Account</Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={() => { setIsMenuOpen(false); handleLogout(); }}>Logout</Button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
