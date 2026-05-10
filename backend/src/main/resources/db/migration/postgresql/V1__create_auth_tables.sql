create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists users (
    id bigserial primary key,
    email varchar(320),
    name varchar(100) not null,
    profile_image_url text,
    role varchar(20) not null default 'USER',
    status varchar(20) not null default 'ACTIVE',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    last_login_at timestamptz,

    constraint chk_users_role check (role in ('USER', 'ADMIN')),
    constraint chk_users_status check (status in ('ACTIVE', 'SUSPENDED', 'DELETED'))
);

create unique index if not exists ux_users_email
    on users (email)
    where email is not null;

create index if not exists ix_users_status
    on users (status);

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_users_updated_at') then
    create trigger trg_users_updated_at
    before update on users
    for each row
    execute function set_updated_at();
  end if;
end;
$$;

create table if not exists users_oauth_accounts (
    id bigserial primary key,
    user_id bigint not null,
    provider varchar(20) not null,
    provider_user_id varchar(255) not null,
    provider_email varchar(320),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint chk_users_oauth_provider check (provider in ('GOOGLE')),
    constraint fk_users_oauth_accounts_user
        foreign key (user_id) references users (id) on delete cascade
);

create unique index if not exists ux_users_oauth_provider_user
    on users_oauth_accounts (provider, provider_user_id);

create index if not exists ix_users_oauth_user_id
    on users_oauth_accounts (user_id);

create index if not exists ix_users_oauth_provider_email
    on users_oauth_accounts (provider_email);

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_users_oauth_updated_at') then
    create trigger trg_users_oauth_updated_at
    before update on users_oauth_accounts
    for each row
    execute function set_updated_at();
  end if;
end;
$$;

create table if not exists refresh_tokens (
    id bigserial primary key,
    user_id bigint not null,
    token_hash varchar(255) not null,
    expires_at timestamptz not null,
    revoked_at timestamptz,
    created_at timestamptz not null default now(),
    user_agent varchar(500),
    ip_address varchar(45),

    constraint fk_refresh_tokens_user
        foreign key (user_id) references users (id) on delete cascade
);

create unique index if not exists ux_refresh_tokens_token_hash
    on refresh_tokens (token_hash);

create index if not exists ix_refresh_tokens_user_id
    on refresh_tokens (user_id);

create index if not exists ix_refresh_tokens_expires_at
    on refresh_tokens (expires_at);

create index if not exists ix_refresh_tokens_revoked_at
    on refresh_tokens (revoked_at);
