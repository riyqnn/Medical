import React, { useState, useEffect } from 'react';
import { Cog6ToothIcon, BellIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import { loginInternetIdentity, getPrincipal, logout } from '../../../service/auth';

const Header = () => {
  const [principal, setPrincipal] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const p = getPrincipal();
    if (p) setPrincipal(p);
  }, []);

  const handleLogin = async () => {
    setIsConnecting(true);
    try {
      await loginInternetIdentity();
      const p = getPrincipal();
      setPrincipal(p);
    } catch (e) {
      console.error('Login failed:', e);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setPrincipal('');
    setShowDropdown(false);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Tentukan judul kiri tergantung halaman
  let leftContent;
  if (location.pathname === '/' || location.pathname === '/dashboard') {
    leftContent = (
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
        <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m0 0A7 7 0 105 5a7 7 0 0012 12z" />
        </svg>
        <input
          type="text"
          placeholder="Search anything"
          className="bg-transparent focus:outline-none text-sm text-gray-700"
        />
      </div>
    );
  } else {
    const title = location.pathname.replace('/', '').replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());
    leftContent = <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>;
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {leftContent}

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Cog6ToothIcon className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <BellIcon className="w-6 h-6" />
          </button>

          {!principal ? (
            <button
              onClick={handleLogin}
              disabled={isConnecting}
              className="px-4 py-2 bg-[#A2F2EF] text-gray-800 rounded-lg font-medium hover:bg-[#8EEAE7] disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Login'}
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{principal.slice(0,2).toUpperCase()}</span>
                </div>
                <span className="font-medium text-gray-800">{formatAddress(principal)}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
