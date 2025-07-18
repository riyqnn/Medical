import { AuthClient } from "@dfinity/auth-client";

let authClient;
let identity;

export async function loginInternetIdentity() {
  authClient = await AuthClient.create();
  await authClient.login({
    identityProvider: "https://identity.ic0.app",
    onSuccess: () => {
      identity = authClient.getIdentity();
      console.log("Logged in as:", identity.getPrincipal().toText());
    }
  });
}

export function getPrincipal() {
  return identity ? identity.getPrincipal().toText() : null;
}

export async function logout() {
  if (authClient) await authClient.logout();
  identity = null;
}
