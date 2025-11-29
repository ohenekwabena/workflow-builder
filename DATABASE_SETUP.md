# Database Setup Guide

## Issue: User Profile Not Created

When users sign up, they don't automatically get a profile in the `user_profiles` table, which causes workflow creation to fail due to the foreign key constraint.

## Solution

Run the following SQL migration in your Supabase SQL Editor to:
1. Create a trigger that automatically creates user profiles
2. Backfill profiles for existing users

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Migration

Copy and paste the following SQL and click "Run":

```sql
-- Create a trigger to automatically create user_profiles when a user signs up

-- Function to create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function after user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users who don't have profiles
INSERT INTO public.user_profiles (id, email, full_name)
SELECT 
  id, 
  email,
  raw_user_meta_data->>'full_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;
```

### Step 3: Verify

Run this query to check if your user profile exists:

```sql
SELECT * FROM public.user_profiles;
```

You should see your user profile listed.

### Step 4: Test Workflow Creation

1. Go back to your app at `http://localhost:3000`
2. Navigate to `/protected/workflows`
3. Click "New Workflow"
4. It should now work!

## Alternative: Manual Profile Creation

If you prefer to create the profile manually for testing, run:

```sql
INSERT INTO public.user_profiles (id, email)
SELECT id, email FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;
```

Replace `your-email@example.com` with your actual email.

## What This Does

1. **Creates a trigger function** (`handle_new_user`) that runs whenever a new user signs up
2. **Attaches the trigger** to the `auth.users` table
3. **Backfills profiles** for any existing users who don't have profiles yet
4. **The API route** now also handles creating profiles if they don't exist (fallback)

## Testing

After running the migration:
1. Try creating a new workflow
2. The error should be gone
3. You should be redirected to the workflow editor

## Future User Signups

All future user signups will automatically get a profile created, so this issue won't happen again!
