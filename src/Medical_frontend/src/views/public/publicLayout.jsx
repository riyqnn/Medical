import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/nav'; // Adjust path as needed
import { initializeAuth, getPrincipal, getActor, loginInternetIdentity, logout } from '../../service/auth'; // Adjust path as needed

const PublicLayout = () => {
  const [authState, setAuthState] = useState({
    principal: null,
    actor: null,
    isLoading: true,
  });

  // Initialize authentication on mount
  useEffect(() => {
    const init = async () => {
      try {
        const isAuth = await initializeAuth();
        if (isAuth) {
          const principalId = getPrincipal();
          const actorInstance = getActor();
          if (principalId && actorInstance) {
            setAuthState({ principal: principalId, actor: actorInstance, isLoading: false });
          } else {
            setAuthState({ principal: null, actor: null, isLoading: false });
          }
        } else {
          setAuthState({ principal: null, actor: null, isLoading: false });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setAuthState({ principal: null, actor: null, isLoading: false });
      }
    };
    init();
  }, []);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    try {
      await loginInternetIdentity();
      const principalId = getPrincipal();
      const actorInstance = getActor();
      if (principalId && actorInstance) {
        setAuthState({ principal: principalId, actor: actorInstance, isLoading: false });
      } else {
        throw new Error('Failed to retrieve principal or actor');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = async () => {
    try {
      await logout();
      setAuthState({ principal: null, actor: null, isLoading: false });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <>
      <Navbar
        isScrolled={false} // Adjust as needed
        mobileMenuOpen={false} // Adjust as needed
        setMobileMenuOpen={() => {}} // Adjust as needed
        isConnected={!!authState.principal}
        principal={authState.principal}
        isLoading={authState.isLoading}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
      />
      <main className="pt-16 min-h-[calc(100vh-120px)]">
        <Outlet context={{ principal: authState.principal, actor: authState.actor }} />
      </main>
    </>
  );
};

export default PublicLayout;