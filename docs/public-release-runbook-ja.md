# Typring 公開セットアップ手順

この手順は、TypringをVercel + Supabaseで公開するための最短ランブックです。

## 1. 事前に必要なアカウント

- GitHub
- Vercel
- Supabase
- X Developer Portal

## 2. Supabaseプロジェクトを作成

Supabaseで新規プロジェクトを作成し、以下を控えます。

- Project URL
- anon public key
- service role key
- Database password

Vercelに入れる値は、あとで `.env.production.example` を見ながら設定します。

## 3. Supabase SQLを適用

Supabase DashboardのSQL Editorで、以下の順番でSQLを実行します。

1. `supabase/migrations/20260528133000_initial_schema.sql`
2. `supabase/migrations/20260528143000_type_vote_summary.sql`
3. `supabase/migrations/20260528150000_harden_profile_writes.sql`
4. `supabase/migrations/20260528151000_profile_length_constraints.sql`
5. `supabase/migrations/20260528153000_x_mutual_cache.sql`
6. `supabase/migrations/20260528154500_ai_and_admin.sql`
7. `supabase/seed.sql`

実行後、以下のテーブルがあることを確認します。

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

## 4. X/Twitter OAuthを作成

X Developer PortalでOAuthアプリを作成します。

Supabase AuthのX/Twitter Provider設定に、X側のClient ID / Client Secretを入力します。

X Developer Portal側のCallback URLには、Supabaseが表示するコールバックURLを登録します。

```text
https://your-project-ref.supabase.co/auth/v1/callback
```

## 5. Supabase AuthのURL設定

Supabase Dashboard > Authentication > URL Configurationで設定します。

Site URL:

```text
https://your-production-domain.example
```

Redirect URLs:

```text
http://localhost:3000/auth/callback
https://your-production-domain.example/auth/callback
```

VercelのPreview環境でもOAuthを試す場合は、Preview URLの `/auth/callback` も追加します。

## 6. Vercelにデプロイ

GitHubにこのリポジトリを置き、VercelでImportします。

Framework Preset:

```text
Next.js
```

Build Command:

```text
npm run build
```

Install Command:

```text
npm install
```

Node.js Version:

```text
20.x
```

## 7. Vercel環境変数

Vercel Project Settings > Environment Variablesに `.env.production.example` の項目を追加します。

最低限必要です。

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
TWITTER_CLIENT_ID
TWITTER_CLIENT_SECRET
NEXT_PUBLIC_ENABLE_ADS
```

本番公開直後は広告とAIを無効のままで構いません。

```text
NEXT_PUBLIC_ENABLE_ADS=false
OPENAI_API_KEY=
```

## 8. 公開後の動作確認

本番URLで以下を確認します。

- `/` が表示される
- `/login` からXログインできる
- 初回ログイン後に `/me` へ遷移する
- Supabaseの `profiles` に自分の行が作られる
- `/me` で表示名、bio、類型を保存できる
- `/users/[handle]` にプロフィールカードが表示される
- `/search` でユーザー検索できる
- `/handbook` が表示される
- 未ログインで `/me` に入ると `/login` へ誘導される

## 9. 最初の管理者を設定

本番で一度ログインした後、Supabase SQL Editorから自分を管理者にします。

```sql
update public.profiles
set is_admin = true
where twitter_handle = 'your_handle';
```

`your_handle` は `@` なしのXハンドル名に置き換えます。

## 10. 公開前のローカル確認

手元でNode.js 20.xが使える環境では、以下を実行します。

```powershell
npm install
npm run lint
npm run typecheck
npm run build
```

このCodex環境では `npm` がPATH上になく、`node` も実行できないため、上記コマンドは未実行です。

## 11. ベータ公開で後回しにしてよいもの

- X相互フォローの自動取得
- 決済処理
- 支援者プラン管理
- AdSense本番有効化
- AI相性診断の本番有効化

まずはプロフィールカード、類型登録、検索、ハンドブックが動けばベータ公開できます。
