# Supabase Integration

This project uses a **hosted Supabase project** (no Docker required).

## Project

- **Dashboard**: https://supabase.com/dashboard/project/yplwssfgmbqjpuvhknzv
- **Project ref**: `yplwssfgmbqjpuvhknzv`

## Quick Start

1. `.env.local` is configured with the project URL and anon key
2. Run the app: `yarn dev`

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn supabase:link` | Link to the remote Supabase project |
| `yarn supabase:db:push` | Push migrations to the remote database |
| `yarn supabase:gen:types` | Generate TypeScript types (requires `supabase link` first) |

## Migrations

Migrations live in `supabase/migrations/`. The initial migration creates the `trades` table with RLS policies.

To create a new migration after schema changes:
```bash
npx supabase db diff -f my_migration_name
```

Then push: `yarn supabase:db:push`
