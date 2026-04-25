# Settings

## Overview
Workspace configuration. Three sections: connected messaging channels, team member management (invite / remove), and notification preferences (weekly report emails).

---

## Key Files

| File | Purpose |
|------|---------|
| `app/(app)/settings/page.tsx` | Settings page shell with three sections |
| `components/settings/ChannelsSection.tsx` | List and manage connected messaging channels |
| `components/settings/TeamSection.tsx` | Invite staff, list team members, remove members |
| `components/reports/WeeklyReportCard.tsx` | Toggle and configure weekly email digest |
| `hooks/useChannels.ts` | `useChannels()`, `useConnectChannel()`, `useDisconnectChannel()` |
| `hooks/useTeam.ts` | `useTeam()`, `useInviteStaff()`, `useRemoveStaff()` |

---

## How It Works

### Channels section
- Lists all channels connected to this tenant (e.g. WhatsApp Business)
- Each channel shows: platform icon, phone number / handle, status badge (connected / error)
- Disconnect button removes the channel
- "Add channel" button — for adding additional numbers or future platforms

### Team section
- Lists all staff members with their name/email, role, and join date
- **Invite member** flow:
  1. Enter email address → click Invite
  2. Backend creates an invite token → returns a shareable URL
  3. URL copied to clipboard or displayed for the admin to share
  4. Invitee opens the link at `/invite/[token]` to create their account (see `01-authentication.md`)
- **Remove member**: removes staff access for that user

### Weekly report (notifications)
- Toggle to enable/disable weekly email digest
- Digest covers: conversation volume, orders created, revenue collected, top customers
- Uses `WeeklyReportCard` component with its own data fetch

---

## Data Model

```ts
interface StaffMember {
  id: string;
  tenantId: string;
  email: string;
  displayName: string | null;
  role: 'owner' | 'agent';
  createdAt: string;
}

interface Channel {
  id: string;
  tenantId: string;
  platform: 'whatsapp' | 'instagram';
  identifier: string; // phone number or handle
  status: 'connected' | 'error' | 'pending';
}
```

---

## How to Test

### Invite a team member
1. Go to `/settings` → Team section
2. Enter a new email address → click **Invite**
3. An invite URL should be generated (displayed or copied to clipboard)
4. Open the URL in an incognito window → complete the signup form
5. Return to `/settings` → the new member should appear in the team list

### Remove a team member
1. Go to `/settings` → Team section
2. Click **Remove** next to any non-owner member
3. They should disappear from the list

### Channel management
1. Go to `/settings` → Channels section
2. Connected WhatsApp number should be listed
3. (If disconnect is implemented) click Disconnect → channel removed and conversations stop receiving messages

### Weekly report toggle
1. Toggle the weekly report on → save
2. Verify the next Monday a digest email is received at the workspace owner's address
