# Supabase setup for EventConnect

This folder holds the SQL you need to bootstrap a Supabase project for the demo.

```
supabase/
  migrations/0001_init.sql   # schema + RLS policies (run once)
  seed.sql                   # 30 fake attendees for the demo (idempotent)
```

## 1. Apply the migration

1. Open your Supabase project in the dashboard.
2. Go to **SQL Editor** -> **New query**.
3. Paste the contents of `migrations/0001_init.sql` and click **Run**.

This creates the `public.users` and `public.connections` tables, an index, and the
Row Level Security policies the app expects. It is safe to re-run (everything uses
`if not exists` / `drop policy if exists`).

## 2. Seed the demo attendees

1. Still in the **SQL Editor**, open another **New query**.
2. Paste the contents of `seed.sql` and click **Run**.

This inserts 30 attendees into both `auth.users` (so the foreign key on
`public.users.id` is satisfied) and `public.users`. The whole script runs inside
a transaction and uses `ON CONFLICT` everywhere, so re-running just refreshes the
profile data without erroring.

The seed users all share the password `seed-password-99` and use
`*.example.test` emails so they will not collide with real signups.

## 3. Verify

```sql
select count(*) from public.users;          -- expect >= 30
select name, headline, company, college     -- spot check
from public.users
order by created_at desc
limit 5;
```

Now ask the agent something like *"find me Flutter devs"* and you should get a
rich, varied list of matches.

## Notes

- The seed assumes the `pgcrypto` extension (Supabase has it on by default); the
  script enables it defensively.
- `seed.sql` is for local/demo use only. Do not run it against a production
  project.
- If you want to wipe the seed: `delete from auth.users where email like '%@example.test';`
  (the cascade on `public.users.id` removes the profile rows too).
