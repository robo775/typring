# Typring Beta Release Checklist

Use this checklist before opening the MVP beta. It assumes the current scope is profile cards, self-declared types, search, prediction votes, handbook pages, and ad-slot foundations.

## 1. Runtime

Use Node.js 20.x LTS.

```bash
node --version
npm --version
npm install
npm run lint
npm run build
```

Expected:

- `npm install` creates `package-lock.json`.
- `npm run lint` has no errors.
- `npm run build` completes.

## 2. Environment Variables

Local `.env.local` and Vercel project variables should include:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
NEXT_PUBLIC_ENABLE_ADS=false
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_ADSENSE_HOME_SLOT=
NEXT_PUBLIC_ADSENSE_SEARCH_SLOT=
NEXT_PUBLIC_ADSENSE_PROFILE_SLOT=
NEXT_PUBLIC_ADSENSE_HANDBOOK_SLOT=
OPENAI_API_KEY=
OPENAI_MODEL=
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

## 3. Supabase

Apply migrations and seed data.

```bash
supabase link
supabase db push
supabase db seed
```

Confirm these tables exist:

- `profiles`
- `type_systems`
- `type_values`
- `user_types`
- `type_votes`
- `social_accounts`
- `x_follow_edges`
- `compatibility_results`
- `ai_usage_logs`
- `admin_logs`

Confirm these functions/policies exist:

- RLS enabled on all application tables
- `public.is_admin()`
- `public.get_type_vote_summary(uuid)`
- Protected profile field trigger from `20260528150000_harden_profile_writes.sql`
- Profile length constraints from `20260528151000_profile_length_constraints.sql`

## 4. Supabase Auth

Configure X/Twitter OAuth in Supabase.

Redirect URLs:

- Local: `http://localhost:3000/auth/callback`
- Production: `https://your-domain.example/auth/callback`

Confirm:

- `/login` starts the OAuth flow.
- `/auth/callback` exchanges the code and redirects to `/me`.
- First login creates a `profiles` row.
- Re-login updates OAuth-derived fields without overwriting `bio`.

## 5. Security Checks

Confirm manually in Supabase SQL editor or with API tests:

- A normal user cannot update another user's `profiles` row.
- A normal user cannot set `profiles.is_admin`.
- A normal user cannot set `profiles.subscription_tier`.
- A normal user cannot update `twitter_id`, `twitter_handle`, or `avatar_url` directly.
- A normal user can update only their own `display_name` and `bio`.
- A normal user can insert/update/delete only their own `user_types`.
- A normal user cannot vote on their own profile.
- Vote summaries expose aggregate counts only.
- X follow edges contain only Typring-registered social account IDs.
- `/mutuals` does not expose unregistered X users.

## 6. Product Flow Checks

Run through these pages on mobile and desktop widths.

- `/`
- `/login`
- `/me`
- `/users/[handle]`
- `/search`
- `/handbook`
- `/handbook/[systemCode]`
- `/handbook/[systemCode]/[typeCode]`

Confirm:

- Type selectors are populated from `type_systems` and `type_values`.
- Profile saves update `profiles` and `user_types`.
- Public profile cards render self-declared types.
- Search by handle works.
- Multiple type filters behave as AND search.
- Prediction voting upserts instead of duplicating.
- Handbook detail pages show description, ad slot, and registered users.
- `/mutuals` redirects logged-out users to login.
- `/mutuals` shows an empty state until follow cache data exists.
- AI compatibility uses cached public type data and does not use X posts.
- AI compatibility is limited to three generations per user per day.
- `/admin` is inaccessible to non-admin users.
- Admins can manually cache X follow edges between registered handles for testing.
- Empty states render cleanly.
- Long text does not overflow on mobile.

## 7. Ads

For beta, keep ads disabled unless AdSense approval and slot IDs are ready.

```bash
NEXT_PUBLIC_ENABLE_ADS=false
```

When enabling ads:

- Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID`.
- Set all slot env vars.
- Confirm slots render on home, search, profile, and handbook detail pages.
- Confirm supporter viewers do not see ads.

## 8. Vercel

Before production deploy:

```bash
npm run build
```

Set Vercel environment variables for Production and Preview.

Confirm:

- `NEXT_PUBLIC_APP_URL` matches the deployed origin.
- Supabase Auth redirect URLs include the deployed origin.
- Server-only variables are not exposed with `NEXT_PUBLIC_`.
- Preview deployments use matching OAuth redirect settings if tested.

## 9. Known Non-Beta Features

Do not block beta on these:

- X mutual follower display
- X follow cache ingestion jobs
- Payment-backed supporter management
- Supporter payment flow
- Admin UI
- X API caching jobs

## 10. Recommended Beta Gate

Open beta only after:

- `npm run lint` passes.
- `npm run build` passes.
- Supabase migrations and seed run successfully.
- At least two test users can log in, set types, search each other, vote, and browse handbook pages.
