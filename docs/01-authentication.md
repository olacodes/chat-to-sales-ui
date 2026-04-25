# Authentication

## Overview
Handles user identity for the ChatToSales workspace. Supports email/password and Google OAuth for both signup and login. New team members join via invite links rather than self-signup. After account creation, the onboarding flow connects the tenant's WhatsApp Business channel.

---

## Key Files

| File | Purpose |
|------|---------|
| `app/(auth)/login/page.tsx` | Email + Google login form |
| `app/(auth)/signup/page.tsx` | Account creation form |
| `app/(auth)/onboarding/page.tsx` | WhatsApp channel connection (Meta Embedded Signup) |
| `app/(auth)/invite/[token]/page.tsx` | Team member invite acceptance |
| `lib/auth/service.ts` | `loginWithEmail`, `loginWithGoogle`, `applyInviteSession` |
| `lib/auth/tokenStore.ts` | JWT / session token storage helpers |
| `store/useAuthStore.ts` | Zustand store: current user, `user_id`, `tenant_id` |

---

## How It Works

### Signup (new owner)
1. User visits `/signup`
2. Enters email + password (min 6 chars, validated with Zod)
3. `POST /api/v1/auth/signup/email` → creates user + tenant
4. Immediately calls `loginWithEmail` to establish a session
5. Redirects to `/onboarding` after 700 ms

### Login (returning user)
1. User visits `/login` (or is redirected with `?next=/path`)
2. Email + password submitted → `POST /api/v1/auth/login/email`
3. On success, session token stored; redirects to `next` or `/dashboard`
4. Google login sends a mock token (`mock_google_token`) — replace with real OAuth in production

### Onboarding — WhatsApp Channel Connect
1. After signup, user lands on `/onboarding`
2. Meta Embedded Signup SDK loads via `useMetaEmbeddedSignup` hook
3. User clicks **WhatsApp Business** → Meta popup opens
4. On completion, `session` object (`code`, `phone_number_id`, `waba_id`) returned
5. Frontend immediately calls `POST /api/v1/channels/whatsapp/connect` (code has 30-second TTL)
6. Backend exchanges code, registers webhooks, stores channel credentials
7. On success → **Go to Dashboard** button shown

### Team Member Invite
1. Admin generates an invite link from Settings → Team
2. Link format: `/invite/[token]`
3. Page validates token on mount via `GET /api/v1/staff/invites/{token}`
4. If valid: user fills name, email, password
5. `POST /api/v1/staff/invites/{token}/accept` → creates staff account
6. `applyInviteSession(result)` stores session → redirects to `/conversations`
7. If invalid/expired: shows error message with instructions to request a new link

---

## Data Model

```ts
// useAuthStore
interface AuthUser {
  user_id: string;
  tenant_id: string;
  email: string;
}
```

---

## How to Test

### Email signup → onboarding
1. Go to `/signup` → create an account with a new email
2. Should redirect to `/onboarding`
3. Click **WhatsApp Business** (Meta SDK must be configured in env)
4. Complete Meta flow → should show success and "Go to Dashboard" button

### Login
1. Go to `/login` → enter credentials from signup
2. Should redirect to `/dashboard`
3. Test wrong password → should show "Invalid email or password"

### Invite flow
1. Go to Settings → Team → generate invite link
2. Open the link in an incognito window
3. Fill name, email, password → submit
4. Should redirect to `/conversations` with a valid session

### Session persistence
1. Login, close browser tab, reopen `/dashboard`
2. Should remain logged in without redirect to `/login`
