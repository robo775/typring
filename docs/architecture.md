# Typring Architecture

## Purpose

Typring is an SNS and handbook service where users connect through personality type systems such as MBTI, Enneagram, Socionics, and Psychosophy. The product should first work as a profile-card SNS: users log in with X/Twitter, register self-declared types, view profile cards, search users, and browse type handbook pages.

## Initial Repository Assessment

The repository has been initialized as a Next.js 14 App Router project scaffold. It has route placeholders, Tailwind setup, shared components, Supabase client helper locations, database migrations, seed data, authentication actions, and the first profile editing flow. Fully generated database types are still deferred until Supabase is available locally.

## Recommended Directory Structure

```text
.
+-- app/
|   +-- (public)/
|   |   +-- page.tsx
|   |   +-- login/
|   |   +-- search/
|   |   +-- handbook/
|   +-- (app)/
|   |   +-- me/
|   |   +-- users/[handle]/
|   |   +-- mutuals/
|   +-- admin/
|   +-- auth/callback/
|   +-- layout.tsx
|   +-- globals.css
+-- components/
|   +-- ads/
|   +-- auth/
|   +-- profiles/
|   +-- search/
|   +-- types/
|   +-- ui/
+-- docs/
|   +-- architecture.md
+-- lib/
|   +-- supabase/
|   +-- auth/
|   +-- profiles/
|   +-- types/
|   +-- utils/
+-- supabase/
|   +-- migrations/
|   +-- seed.sql
+-- types/
|   +-- database.ts
|   +-- domain.ts
+-- .env.example
+-- README.md
```

This structure separates route groups, reusable UI, Supabase access, domain helpers, generated or shared types, and database artifacts.

The `supabase/` directory contains the initial schema migration and seed data. Future schema changes should be added as separate timestamped migrations.

## MVP Scope

The MVP should include:

- X/Twitter OAuth login through Supabase Auth
- Profile creation in `public.profiles`
- Type system and type value master data
- Self-declared type registration and updates
- Profile card display
- User search by handle and type combinations
- Type handbook pages
- Layout slots where AdSense can be added later

The MVP should not include:

- X mutual follower display
- AI compatibility diagnosis
- Payment processing
- Supporter-only features
- Advanced admin screens
- Heavy X API usage

## Data Model Principles

Use Supabase Auth `auth.users` as the authentication source of truth. Store app-specific user data in `public.profiles`, keyed by the same UUID as `auth.users.id`.

Do not create `public.users`.

Required initial tables:

- `profiles`
- `type_systems`
- `type_values`
- `user_types`
- `type_votes`

Future tables:

- `social_accounts`
- `x_follow_edges`
- `compatibility_results`
- `ai_usage_logs`
- `admin_logs`

Type system names and type values must be database-driven. Application UI should fetch `type_systems` and `type_values` dynamically instead of hardcoding values like `MBTI` or `INFJ` in components.

## RLS Principles

Enable RLS on every application table.

Suggested policy direction:

- `profiles`: publicly readable, owner editable, admin-only for admin fields
- `type_systems` and `type_values`: publicly readable, admin writable
- `user_types`: publicly readable, owner writable
- `type_votes`: authenticated insert/update by voter, anonymous aggregate display only

Self-voting must be blocked at the database level for `type_votes`.

## Authentication Principles

Supabase Auth should handle X/Twitter OAuth. On successful login, bootstrap or update `profiles` with provider-derived fields:

- `twitter_id`
- `twitter_handle`
- `display_name`
- `avatar_url`

Do not overwrite user-edited fields such as `bio` on every login.

## UI Principles

Typring should be mobile-first, card-based, and screenshot-friendly. The visual direction is soft cards, readable type tags, and a blue-green to purple gradient associated with rings and connection.

Operational pages such as search, profile editing, and handbook browsing should prioritize scanning and repeated use over marketing-style hero layouts.

## Ads And Monetization

Create an `AdSlot` component once pages exist. Ads should be controlled by environment variables and show placeholders in development. The profile and handbook layouts should leave natural space for ads without interrupting core flows.

Supporter ad hiding should be designed around `profiles.subscription_tier`, but payment implementation should wait until after MVP.

## AI And X API Cost Controls

Post-MVP X mutual display must only compare Typring-registered users. Do not fetch or analyze X post bodies. Cache X follow data and limit refreshes to once per 24 hours.

Post-MVP AI compatibility should use only public Typring type data. Results should be cached and regenerated only when the relevant type inputs change. Free users should be rate-limited, for example to three generations per day.

## Implementation Rules

- Keep one feature per task or PR.
- Confirm existing structure before changing it.
- Do not hardcode type master data in UI code.
- Do not create `public.users`.
- Add RLS with each database table.
- Update README whenever setup steps change.
- Keep `npm run lint` and `npm run build` passing once the app exists.
