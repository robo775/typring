# Typring

Typring is a type-based SNS and handbook service for connecting users through MBTI, Enneagram, Socionics, Psychosophy, and other personality type systems.

The MVP should focus on becoming a simple, shareable profile-card SNS before adding expensive or complex integrations such as X mutual detection, AI compatibility, payments, or advanced admin tools.

## Current Repository State

This workspace now contains the initial Next.js project scaffold for Typring. It includes App Router routes, Tailwind configuration, shared UI components, Supabase client helpers, Supabase migrations, authentication actions, and the first profile editing flow.

## Planned Stack

- Framework: Next.js 14 App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Database: Supabase PostgreSQL
- Auth: Supabase Auth with X/Twitter OAuth
- Deployment: Vercel
- Future AI: OpenAI API or compatible provider
- Future monetization: Google AdSense and supporter plans

## MVP Implementation Order

1. Project initialization and repository structure
2. Supabase DB design and SQL migrations
3. X/Twitter OAuth authentication and profile bootstrap
4. Profile editing, self-declared types, and profile cards
5. User search by handle and type combinations
6. Type handbook pages with SEO-ready metadata
7. Type prediction voting
8. AdSlot foundation and monetization layout
9. Security, RLS, lint, build, and UX review

## Post-MVP Implementation Order

1. X follow cache ingestion for registered Typring users only
2. AI compatibility comments using public Typring type data only
3. Supporter plans and ad removal
4. Basic admin screen for type system and type value management
5. Advanced review, monitoring, and operational hardening

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values for local development.

Required for MVP:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

`SUPABASE_SERVICE_ROLE_KEY` is used only in server-side auth bootstrap code to create or refresh OAuth-derived profile fields. Never expose it to browser code.

Required once X/Twitter OAuth is implemented:

- `TWITTER_CLIENT_ID`
- `TWITTER_CLIENT_SECRET`

Optional or future-facing:

- `NEXT_PUBLIC_ENABLE_ADS`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- `NEXT_PUBLIC_ADSENSE_HOME_SLOT`
- `NEXT_PUBLIC_ADSENSE_SEARCH_SLOT`
- `NEXT_PUBLIC_ADSENSE_PROFILE_SLOT`
- `NEXT_PUBLIC_ADSENSE_HANDBOOK_SLOT`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Supabase Notes

- Use `auth.users` as the source of truth for authenticated users.
- Store application profile data in `public.profiles`.
- Do not create a `public.users` table.
- Enable RLS on all application tables.
- Keep type systems and type values in database master tables, not hardcoded in application components.
- Create the first admin user manually through trusted SQL or the Supabase dashboard; regular users cannot promote themselves.

## Database Setup

The initial Supabase SQL artifacts are:

- `supabase/migrations/20260528133000_initial_schema.sql`
- `supabase/seed.sql`

Apply the migration with the Supabase CLI once the project is linked:

```bash
supabase db push
```

Seed local or remote master data:

```bash
supabase db seed
```

The initial schema creates:

- `profiles`
- `type_systems`
- `type_values`
- `user_types`
- `type_votes`
- `social_accounts`
- `x_follow_edges`

The seed inserts MBTI, Enneagram, Socionics, and representative Psychosophy values. Psychosophy intentionally starts with a representative subset so the remaining values can be added later through admin tooling.

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Validate the project:

```bash
npm run lint
npm run build
```

Some non-core pages still intentionally use placeholder data. Supabase migrations and seed data are present under `supabase/`.

If Node.js or npm is unavailable in the execution environment, continue implementation and run the commands above locally once Node.js 20.x is available.

Expected local verification points:

- `npm install` completes and creates `package-lock.json`
- `npm run lint` passes without ESLint errors
- `npm run build` completes a production build
- `/login` redirects to the Supabase X/Twitter OAuth flow
- `/auth/callback` exchanges the OAuth code and redirects to `/me`
- First login creates or updates `public.profiles`
- Existing `bio`, `subscription_tier`, and `is_admin` values are not overwritten by login bootstrap
- Direct client writes cannot set `profiles.is_admin`, `profiles.subscription_tier`, or OAuth identity fields
- `profiles.display_name` and `profiles.bio` are constrained at the database and server-action layers
- `/me` loads active `type_systems` and `type_values` from Supabase
- Saving `/me` updates `profiles.display_name` and `profiles.bio`
- Saving `/me` upserts one `user_types` row per selected type system
- Clearing a type select deletes that user's `user_types` row for the system
- `/users/[handle]` displays the public profile card from `profiles` and `user_types`
- `/search` loads active type filters from `type_systems` and `type_values`
- `/search?q=handle` filters by `profiles.twitter_handle`
- Multiple `/search` type filters return users matching all selected type values
- Search result cards link to `/users/[handle]`
- `/users/[handle]` shows prediction vote controls for logged-in users except on their own profile
- Saving a prediction vote upserts `type_votes` by target user, voter, and type system
- Selecting `No vote` deletes the current user's vote for that type system
- Vote summaries display anonymous aggregate percentages from `get_type_vote_summary`
- `/handbook` lists active type systems from `type_systems`
- `/handbook/[systemCode]` lists active values from `type_values`
- `/handbook/[systemCode]/[typeCode]` renders `type_values.description`, an ad slot, and users who registered that type
- Handbook pages set metadata from database names and descriptions
- Global loading and not-found states render cleanly on mobile and desktop
- Ads are hidden when the current viewer has `profiles.subscription_tier = 'supporter'`
- With `NEXT_PUBLIC_ENABLE_ADS=false`, ad slots render development placeholders
- With ads enabled, configured AdSense slot IDs render on home, search, profile, and handbook pages
- `/mutuals` requires login and displays cached X mutuals among Typring-registered users only
- `/users/[handle]` shows an X mutual badge when cached mutual follow data exists
- `/users/[handle]` can generate cached AI compatibility comments with a daily free limit
- `/admin` requires `profiles.is_admin = true` and edits type systems/type values
- `/admin` can manually cache registered X follow edges for mutual-display testing

See `docs/codex-setup-proposal.md` for a suggested Codex setup step using Node.js 20.

For beta release preparation, follow `docs/beta-release-checklist.md`. For deployment details, see `docs/deployment.md`.

Japanese production setup runbook:

- `docs/public-release-runbook-ja.md`

Production environment variable template:

- `.env.production.example`

## Authentication Setup

Supabase Auth should be configured with the X/Twitter provider.

Recommended Supabase redirect URLs:

- Local: `http://localhost:3000/auth/callback`
- Production: `https://your-domain.example/auth/callback`

Set `NEXT_PUBLIC_APP_URL` to the active app origin. The login server action uses it to build the OAuth callback URL.

## Development Notes

The project should be built incrementally. Each task should be small enough to review as one focused PR. Avoid implementing X mutual display, AI compatibility, payments, or admin screens before the core profile-card SNS experience is working.

## Initial Routes

- `/`: Top page with login, handbook, sample profile card, and ad slot placeholders
- `/login`: X/Twitter OAuth login
- `/me`: Authenticated profile editing and profile preview
- `/users/[handle]`: Public profile card, prediction voting, X mutual badge, and AI compatibility
- `/search`: User search by handle and type combinations
- `/handbook`: Handbook system index
- `/handbook/[systemCode]`: Type system page
- `/handbook/[systemCode]/[typeCode]`: Type value page with metadata, ad slot, and registered users
- `/mutuals`: Cached X mutual users among registered Typring users
- `/admin`: Minimal admin screen for type systems and type values
