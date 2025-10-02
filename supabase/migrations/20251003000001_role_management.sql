-- Enable RLS
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.articles enable row level security;

-- Create roles enum
create type public.user_role as enum ('user', 'kasir', 'admin');

-- Create profiles table if not exists
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    username text unique,
    full_name text,
    avatar_url text,
    phone text,
    role user_role default 'user'::user_role,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint username_length check (char_length(username) >= 3)
);

-- Create financial_reports table
create table public.financial_reports (
    id uuid default uuid_generate_v4() primary key,
    report_date date not null,
    total_revenue numeric(10,2) not null default 0,
    total_bookings integer not null default 0,
    created_by uuid references auth.users not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create financial_report_details table
create table public.financial_report_details (
    id uuid default uuid_generate_v4() primary key,
    report_id uuid references public.financial_reports on delete cascade not null,
    booking_id uuid references public.bookings on delete set null,
    amount numeric(10,2) not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Profiles policies
create policy "Public profiles are viewable by everyone"
    on public.profiles for select using (true);

create policy "Users can update own profile"
    on public.profiles for update using (auth.uid() = id);

-- Bookings policies
create policy "Bookings viewable by everyone"
    on public.bookings for select using (true);

create policy "Users can insert own bookings"
    on public.bookings for insert with check (auth.uid() = customer_id);

create policy "Users can update own bookings"
    on public.bookings for update using (
        auth.uid() = customer_id or 
        exists (
            select 1 from public.profiles 
            where id = auth.uid() 
            and role in ('kasir', 'admin')
        )
    );

-- Articles policies
create policy "Articles viewable by everyone"
    on public.articles for select using (true);

create policy "Kasir and admin can manage articles"
    on public.articles for all using (
        exists (
            select 1 from public.profiles 
            where id = auth.uid() 
            and role in ('kasir', 'admin')
        )
    );

-- Financial reports policies
create policy "Only admin can manage financial reports"
    on public.financial_reports for all using (
        exists (
            select 1 from public.profiles 
            where id = auth.uid() 
            and role = 'admin'
        )
    );

create policy "Only admin can manage financial report details"
    on public.financial_report_details for all using (
        exists (
            select 1 from public.profiles 
            where id = auth.uid() 
            and role = 'admin'
        )
    );

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, avatar_url, role)
    values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Update modified column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger handle_updated_at
    before update on public.profiles
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.financial_reports
    for each row execute procedure public.handle_updated_at();