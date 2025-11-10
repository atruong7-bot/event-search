import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <Link to="/search" className="text-2xl font-bold text-gray-900">
            Events Around
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/search"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/search')
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
            <Link
              to="/favorites"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/favorites')
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-4 h-4" />
              Favorites
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 space-y-2">
            <Link
              to="/search"
              className={`flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium ${
                isActive('/search')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
            <Link
              to="/favorites"
              className={`flex items-center gap-2 py-2 px-3 rounded-md text-sm font-medium ${
                isActive('/favorites')
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="w-4 h-4" />
              Favorites
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
