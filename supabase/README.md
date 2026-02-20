# Supabase Migrations

## Running migrations

### Option 1: Supabase Dashboard (no CLI)

1. Open your project: https://supabase.com/dashboard/project/uzcgkpyzwmpsdbrkfoyo
2. Go to **SQL Editor** → **New query**
3. Copy the contents of `migrations/20260219000000_initial_schema.sql`
4. Paste and click **Run**

### Option 2: Supabase CLI

1. Log in: `npx supabase login`
2. Link the project: `npx supabase link --project-ref uzcgkpyzwmpsdbrkfoyo`
3. Push migrations: `npx supabase db push`

### Option 3: Direct database connection

If you have the database password from **Project Settings → Database**:

```bash
npx supabase db push --db-url "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
```

Replace `[PROJECT_REF]`, `[PASSWORD]`, and `[REGION]` with your values.
