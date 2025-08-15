import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import SearchButton from '../ui/SearchButton';
import NotificationButton from '../ui/NotificationButton';

const Header = ({ isHovered = false, onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // const location = useLocation(); // unused after search removal
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);


  const dropdownRef = useRef(null);
  const searchRef = useRef(null);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Escape key closes search results
      if (event.key === 'Escape' && showSearchResults) {
        setShowSearchResults(false);
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearchResults]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  // Handle profile navigation
  const handleProfileClick = () => {
    navigate('/app/profile');
    setIsDropdownOpen(false);
  };

  // Search functionality removed - not used in current implementation

  return (
    <header
      className={`bg-white shadow-sm border-b border-warmGray-200 transition-all duration-300 ease-in-out ${
        // Desktop: adjust margin based on sidebar hover state, mobile: full width
        isHovered ? 'lg:ml-96' : 'lg:ml-24'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        zIndex: 30
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 py-2">
          {/* Left side - Mobile Menu Button + Search */}
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#E8C4A0] to-[#D4A574] shadow-lg border border-[#E8C4A0]/30 hover:from-[#D4A574] hover:to-[#C19660] transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Ouvrir le menu"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <SearchButton />
          </div>

          {/* Right Side - Notifications & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Notification Button */}
            <NotificationButton />

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group flex items-center justify-center rounded-full p-1 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#E8C4A0] focus:ring-offset-2 transform hover:scale-[1.05] active:scale-[0.95] bg-gradient-to-r from-[#E8C4A0]/60 to-cream/70 hover:from-[#E8C4A0]/70 hover:to-cream/80 border border-[#E8C4A0]/40 backdrop-blur-sm"
              title={`${user?.name || 'User'} - Click to open menu`}
            >
              {/* User Avatar with Ring */}
              <div className="relative">
                <div className="flex items-center justify-center w-8 h-8 rounded-full shadow-md overflow-hidden ring-1 ring-white/50 group-hover:ring-white/70 transition-all duration-300">
                  {user?.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt={`${user?.name || 'User'}'s profile`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`flex items-center justify-center w-full h-full bg-gradient-to-br from-[#E8C4A0] to-[#DDB892] ${
                      user?.profile_picture_url ? 'hidden' : 'flex'
                    }`}
                  >
                    <span className="text-[#8B6F47] font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                {/* Online Status Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border border-white rounded-full shadow-sm"></div>
              </div>
            </button>

            {/* Simplified Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-[#E8C4A0]/30 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-[#E8C4A0]/20">
                  <p className="text-sm font-medium text-[#8B6F47] text-center truncate">
                    {user?.name || 'User Name'}
                  </p>
                  <p className="text-xs text-[#8B6F47]/70 text-center mt-1">
                    {user?.role === 'hr_manager' ? 'Responsable RH' : 'Utilisateur'}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-3 text-sm text-warmGray-700 hover:bg-gradient-to-r hover:from-[#E8C4A0]/10 hover:to-cream/10 hover:text-[#8B6F47] transition-all duration-200 group"
                  >
                    <UserIcon className="w-4 h-4 mr-3 text-[#8B6F47]/60 group-hover:text-[#8B6F47] transition-colors" />
                    <span className="font-medium">Profil</span>
                  </button>

                  <div className="mx-4 my-2 border-t border-[#E8C4A0]/20"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-warmGray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-50 hover:text-red-600 transition-all duration-200 group"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-600 transition-colors" />
                    <span className="font-medium">Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
