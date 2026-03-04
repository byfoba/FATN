create extension if not exists pgcrypto;

create table if not exists users (
  id text primary key,
  email text unique,
  timezone text,
  preferences jsonb default '{}'::jsonb
);

create table if not exists snapshots (
  snapshot_id uuid primary key,
  ticker text not null,
  start_utc timestamptz not null,
  end_utc timestamptz not null,
  raw_ticks_link text,
  context jsonb,
  created_at timestamptz default now()
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id),
  ticker text not null,
  snapshot_id uuid references snapshots(snapshot_id),
  context jsonb not null,
  result jsonb not null,
  created_at timestamptz default now()
);

create table if not exists analysis_queue (
  id bigserial primary key,
  snapshot_id uuid not null,
  user_id text not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);
