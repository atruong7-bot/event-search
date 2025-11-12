import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

const FORM_STORAGE_KEY = 'searchFormState';
const RESULTS_STORAGE_KEY = 'searchResultsState';
const SCROLL_STORAGE_KEY = 'searchScrollPosition';

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    // Clear all search-related data from sessionStorage
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(FORM_STORAGE_KEY);
      window.sessionStorage.removeItem(RESULTS_STORAGE_KEY);
      window.sessionStorage.removeItem(SCROLL_STORAGE_KEY);
    }
    // Force a page reload to reset everything
    window.location.href = '/search';
  };

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <a
            href="/search"
            onClick={handleLogoClick}
            className="text-xl md:text-2xl font-bold text-gray-900 cursor-pointer"
          >
            Events Around
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/search"
              className={`flex items-center gap-2 text-sm transition-colors ${
                isActive('/search')
                  ? 'text-black font-bold'
                  : 'text-gray-600 font-medium hover:text-gray-900'
              }`}
            >
              <Search className={`w-4 h-4 ${isActive('/search') ? 'stroke-[2.5]' : ''}`} />
              Search
            </Link>
            <Link
              to="/favorites"
              className={`flex items-center gap-2 text-sm transition-colors ${
                isActive('/favorites')
                  ? 'text-black font-bold'
                  : 'text-gray-600 font-medium hover:text-gray-900'
              }`}
            >
              <Heart className={`w-4 h-4 ${isActive('/favorites') ? 'stroke-[2.5]' : ''}`} />
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

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2 space-y-2">
            <Link
              to="/search"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive('/search')
                  ? 'bg-gray-100 text-black font-bold'
                  : 'text-gray-600 font-medium hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className={`w-4 h-4 ${isActive('/search') ? 'stroke-[2.5]' : ''}`} />
              Search
            </Link>
            <Link
              to="/favorites"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive('/favorites')
                  ? 'bg-gray-100 text-black font-bold'
                  : 'text-gray-600 font-medium hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className={`w-4 h-4 ${isActive('/favorites') ? 'stroke-[2.5]' : ''}`} />
              Favorites
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
