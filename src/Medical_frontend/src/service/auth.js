import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor } from '@dfinity/agent';
import { idlFactory } from 'declarations/Medical_backend'; // Adjust path to your generated IDL

// Canister IDs from dfx deploy
const MEDICAL_BACKEND_CANISTER_ID = process.env.CANISTER_ID_MEDICAL_BACKEND;
const INTERNET_IDENTITY_CANISTER_ID = process.env.CANISTER_ID_INTERNET_IDENTITY;


// Determine if running locally or on mainnet
const isLocal = process.env.NODE_ENV === 'development';
const IDENTITY_PROVIDER = isLocal
  ? `http://${INTERNET_IDENTITY_CANISTER_ID}.localhost:4943`
  : 'https://identity.ic0.app';

let authClient = null;
let identity = null;
let actor = null;

// Initialize auth client
export async function initAuthClient() {
  if (!authClient) {
    authClient = await AuthClient.create({
      idleOptions: {
        disableIdle: true, // Disable idle timeout for testing
      },
    });
    identity = authClient.getIdentity();
    console.log('Auth client initialized, identity:', identity.getPrincipal().toText());
  }
  return authClient;
}

// Create actor with proper configuration
export function createActor(canisterId, options = {}) {
  const host = isLocal ? 'http://localhost:4943' : 'https://icp0.io';
  const agentOptions = { ...options.agentOptions, identity };
  const agent = new HttpAgent({ ...agentOptions, host });

  // Fetch root key for local development
  if (isLocal) {
    agent.fetchRootKey().catch((err) => {
      console.warn('Unable to fetch root key. Ensure your local replica is running:', err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
}

// Login with Internet Identity
export async function loginInternetIdentity() {
  try {
    await initAuthClient();
    return new Promise((resolve, reject) => {
      authClient.login({
        identityProvider: IDENTITY_PROVIDER,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000000000), // 7 days
        onSuccess: async () => {
          identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toText();
          console.log('Logged in as:', principal);
          if (principal === '2vxsx-fae') {
            console.warn('Anonymous principal detected. Please ensure you are logged in with a valid Internet Identity.');
            reject(new Error('Anonymous principal detected'));
            return;
          }
          actor = createActor(MEDICAL_BACKEND_CANISTER_ID, {
            agentOptions: { identity },
          });
          console.log('Actor created for canister:', MEDICAL_BACKEND_CANISTER_ID);
          resolve(identity);
        },
        onError: (error) => {
          console.error('Login failed:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Failed to initialize auth client:', error);
    throw error;
  }
}

// Get principal ID
export function getPrincipal() {
  const principal = identity && !identity.getPrincipal().isAnonymous()
    ? identity.getPrincipal().toText()
    : null;
  console.log('getPrincipal called, returning:', principal);
  return principal;
}

// Check if user is authenticated
export async function isAuthenticated() {
  await initAuthClient();
  const isAuth = await authClient.isAuthenticated();
  console.log('Is authenticated:', isAuth);
  return isAuth;
}

// Get actor instance
export function getActor() {
  if (!actor) {
    console.warn('Actor not initialized. Attempting to create with current identity.');
    if (identity && !identity.getPrincipal().isAnonymous()) {
      actor = createActor(MEDICAL_BACKEND_CANISTER_ID, {
        agentOptions: { identity },
      });
    }
  }
  console.log('getActor called, returning actor for principal:', identity?.getPrincipal().toText());
  return actor;
}

// Logout
export async function logout() {
  try {
    if (authClient) {
      await authClient.logout();
    }
    identity = null;
    actor = null;
    authClient = null;
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

// Initialize on page load
export async function initializeAuth() {
  try {
    await initAuthClient();
    if (await authClient.isAuthenticated()) {
      identity = authClient.getIdentity();
      const principal = identity.getPrincipal().toText();
      console.log('Session restored, principal:', principal);
      if (principal === '2vxsx-fae') {
        console.warn('Anonymous principal detected during session restoration.');
        return false;
      }
      actor = createActor(MEDICAL_BACKEND_CANISTER_ID, {
        agentOptions: { identity },
      });
      return true;
    }
    console.log('No active session found');
    return false;
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    return false;
  }
}