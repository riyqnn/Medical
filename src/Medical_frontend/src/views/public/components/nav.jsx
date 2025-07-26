import { Link } from 'react-router-dom';
import { Menu, X, Wallet, LogOut } from 'lucide-react';
import Logo from '/logo.png'; // Adjust path as needed

const Navigation = ({
  isScrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
  isConnected,
  principal,
  isLoading,
  onConnectWallet,
  onDisconnectWallet,
}) => {
  const formatPrincipal = (principal) => {
    if (!principal) return '';
    return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center">
              <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-[#A2F2EF] transition-colors">
              Features
            </a>
            <a href="#benefits" className="text-gray-700 hover:text-[#A2F2EF] transition-colors">
              Benefits
            </a>
            <a href="#contact" className="text-gray-700 hover:text-[#A2F2EF] transition-colors">
              Contact
            </a>

            {/* Wallet Connection Button */}
            {!isConnected ? (
              <button
                onClick={onConnectWallet}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] hover:from-[#8EEAE7] hover:to-[#7AE7E4] text-gray-900 px-4 py-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="w-4 h-4" />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">{formatPrincipal(principal)}</span>
                </div>
                <button
                  onClick={onDisconnectWallet}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link
              to="/buy"
              className="bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 px-6 py-2 rounded-lg transition-colors hover:scale-105"
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-[#A2F2EF]" />
            ) : (
              <Menu className="w-6 h-6 text-[#A2F2EF]" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t">
          <div className="px-4 py-4 space-y-4">
            <a href="#features" className="block text-gray-700 hover:text-[#A2F2EF]">
              Features
            </a>
            <a href="#benefits" className="block text-gray-700 hover:text-[#A2F2EF]">
              Benefits
            </a>
            <a href="#contact" className="block text-gray-700 hover:text-[#A2F2EF]">
              Contact
            </a>

            {/* Mobile Wallet Connection */}
            {!isConnected ? (
              <button
                onClick={onConnectWallet}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#A2F2EF] to-[#8EEAE7] text-gray-900 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-green-100 text-green-800 px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">{formatPrincipal(principal)}</span>
                  </div>
                  <button
                    onClick={onDisconnectWallet}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <Link
              to="/buy"
              className="w-full bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 py-2 rounded-lg text-center block"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;