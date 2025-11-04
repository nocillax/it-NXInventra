// user.helpers.ts
// Helper functions for the user module

// Checks if a string is a valid search query (at least 2 characters)
export function isValidUserQuery(query: string): boolean {
  return !!query && query.length >= 2;
}

// Maps a user entity to a public profile response
export function mapUserProfile(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    theme: user.theme,
    language: user.language,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// Maps a user entity to a minimal search result
export function mapUserSearch(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
