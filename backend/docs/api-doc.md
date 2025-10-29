# API Documentation

## Authentication Endpoints

### GET /api/auth/google

**Description**: Google OAuth login
**Response**: Redirect

### GET /api/auth/google/callback

**Description**: Google OAuth callback
**Response**: Sets cookie & redirects

### GET /api/auth/github

**Description**: GitHub OAuth login  
**Response**: Redirect

### GET /api/auth/github/callback

**Description**: GitHub OAuth callback
**Response**: Sets cookie & redirects

### GET /api/auth/me

**Description**: Get current user
**Auth**: Required
**Response**:

```typescript
{
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'github';
  createdAt: string;
  updatedAt: string;
}
```

### POST /api/auth/logout

**Description**: Logout user
**Response**:

```typescript
{
  success: boolean;
  message: string;
}
```

### GET /api/auth/logout

**Description**: Logout (GET alternative)
**Response**:

```typescript
{
  success: boolean;
  message: string;
}
```

## User Endpoints

### GET /api/user/search

**Description**: Search users
**Query**: `q` (string), `limit` (number, default: 10)
**Response**:

```typescript
Array<{
  id: string;
  name: string;
  email: string;
}>;
```

### GET /api/user/me

**Description**: Get current user profile
**Auth**: Required
**Response**:

```typescript
{
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'bn';
  createdAt: string;
}
```

### PATCH /api/user/me

**Description**: Update user preferences
**Auth**: Required
**Body**:

```typescript
{
  name?: string;      // max 100 chars
  theme?: 'light' | 'dark';
  language?: 'en' | 'bn';
}
```

### PATCH /api/user/:id/block

**Description**: Block user (admin only)
**Auth**: Required

### PATCH /api/user/:id/unblock

**Description**: Unblock user (admin only)
**Auth**: Required

### PATCH /api/user/:id/promote

**Description**: Promote to admin (admin only)
**Auth**: Required

### PATCH /api/user/:id/demote

**Description**: Demote from admin (admin only)
**Auth**: Required

### DELETE /api/user/:id

**Description**: Delete user (admin or self)
**Auth**: Required
**Response**:

```typescript
{
  message: string;
}
```

## Type Definitions

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'github';
  isAdmin: boolean;
  blocked: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'bn';
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  providerId: string;
  provider: 'google' | 'github';
  email: string;
  name: string;
}
```
