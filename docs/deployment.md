# Deployment Notes

Typring is intended to deploy on Vercel with Supabase as the database and auth provider.

## Vercel Build

Use Node.js 20.x.

```bash
npm install
npm run build
```

Vercel build command:

```bash
npm run build
```

## Required Vercel Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://your-domain.example
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
NEXT_PUBLIC_ENABLE_ADS=false
```

Optional AdSense variables:

```bash
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_ADSENSE_HOME_SLOT=
NEXT_PUBLIC_ADSENSE_SEARCH_SLOT=
NEXT_PUBLIC_ADSENSE_PROFILE_SLOT=
NEXT_PUBLIC_ADSENSE_HANDBOOK_SLOT=
```

Future AI:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=
```

## Supabase Auth

Set the Site URL to the production origin.

Add redirect URLs:

```text
https://your-domain.example/auth/callback
http://localhost:3000/auth/callback
```

If testing Vercel preview deployments with OAuth, add the preview callback URL as well.

## Supabase Database

Apply migrations:

```bash
supabase link
supabase db push
supabase db seed
```

Migrations currently expected:

- `20260528133000_initial_schema.sql`
- `20260528143000_type_vote_summary.sql`
- `20260528150000_harden_profile_writes.sql`
- `20260528151000_profile_length_constraints.sql`
- `20260528153000_x_mutual_cache.sql`
- `20260528154500_ai_and_admin.sql`

## First Admin

There is no admin UI in the beta. Promote the first admin manually through trusted SQL after that user has logged in at least once.

```sql
update public.profiles
set is_admin = true
where twitter_handle = 'your_handle';
```

Only run this from the Supabase dashboard or another trusted admin channel.

## Ads

Leave ads disabled for beta unless AdSense is configured.

```bash
NEXT_PUBLIC_ENABLE_ADS=false
```

When ready:

```bash
NEXT_PUBLIC_ENABLE_ADS=true
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...
NEXT_PUBLIC_ADSENSE_HOME_SLOT=
NEXT_PUBLIC_ADSENSE_SEARCH_SLOT=
NEXT_PUBLIC_ADSENSE_PROFILE_SLOT=
NEXT_PUBLIC_ADSENSE_HANDBOOK_SLOT=
```

Supporter ad hiding already checks `profiles.subscription_tier = 'supporter'`, but payment and supporter management are not implemented yet.

## X Mutuals

The beta code can display cached X mutuals, but it does not call the X API.

Current behavior:

- OAuth login syncs the current user's own X account into `social_accounts`.
- `x_follow_edges` stores cached follow relationships only between registered Typring users.
- `/mutuals` displays mutuals from cached rows.
- `/users/[handle]` shows a mutual badge from cached rows.
- Admins can manually cache registered-user follow edges from `/admin` for testing before X API ingestion exists.

Do not store unregistered X users or X post text.

## AI Compatibility

AI compatibility is cache-first and uses only public Typring type data.

Set:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=
```

If `OPENAI_MODEL` is empty, the app defaults to `gpt-4o-mini`. Free users are limited to three generations per day by `ai_usage_logs`.
