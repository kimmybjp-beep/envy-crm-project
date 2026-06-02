// Legacy compatibility exports for earlier auth-oriented pages.
// The current core CRM flow uses public store onboarding, admin review, and scan actions.
export async function getSessionContext() {
  return { user: null, profile: null, stores: [] };
}

export async function requireProfile() {
  throw new Error("Authentication is not configured for the simplified CRM workflow.");
}

export function tierForRole() {
  return null;
}
