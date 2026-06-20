-- ───────────────────────────────────────────────────────────────────────────
-- Migration 024: Security hardening (RLS tightening + atomic rate limiting)
--
-- Follows a security review. All of these close client-side write/read holes
-- that the anon key could otherwise reach directly (bypassing the server routes
-- that already validate the same things). Idempotent — safe to re-run in the
-- Supabase SQL editor.
--
-- Net effect:
--   • referral_codes  — no more anonymous enumeration of every discount code
--   • course_reviews  — reviews can only be written by the server route (which
--                       checks "buyer only"); is_verified/is_published can no
--                       longer be self-set by a direct client write
--   • member_state    — points/level/rewards can no longer be self-inflated
--   • member_rewards  — rewards can no longer be self-granted
--   • check_rate_limit — race-free, single-round-trip rate limiting
--
-- IMPORTANT: the matching app code (this PR) now writes course_reviews,
-- member_state and member_rewards with the SERVICE ROLE, so removing the client
-- write policies does NOT break those flows.
-- ───────────────────────────────────────────────────────────────────────────

-- 1) referral_codes: stop anonymous enumeration of all codes + their discount/
--    commission percentages. The checkout/referral/affiliate code paths all read
--    via the service role, so they are unaffected. A logged-in user may still
--    read their OWN code (for the affiliate/share UI).
drop policy if exists "Referral codes readable" on public.referral_codes;
drop policy if exists "Referral codes readable by owner" on public.referral_codes;
create policy "Referral codes readable by owner" on public.referral_codes
  for select using (auth.uid() = user_id);

-- 2) course_reviews: remove the client INSERT/UPDATE policies. The /api/reviews
--    route (service role) is the only writer and it enforces "buyers only".
--    Public SELECT of published reviews stays as-is.
drop policy if exists "Users insert own review" on public.course_reviews;
drop policy if exists "Users update own review" on public.course_reviews;

-- 3) member_state: remove client INSERT/UPDATE. Written by the service role now
--    (signup, auth callback, dashboard sync, avatar action). SELECT-own stays.
drop policy if exists "Member state is insertable by owner" on public.member_state;
drop policy if exists "Member state is editable by owner" on public.member_state;

-- 4) member_rewards: remove client INSERT. Written by the service role now.
--    SELECT-own stays.
drop policy if exists "Member rewards are insertable by owner" on public.member_rewards;

-- 5) Atomic rate limiting. Replaces the read-then-write counter (which a burst of
--    concurrent requests could sail past) with one race-free statement.
--    Returns {"allowed": true} or {"allowed": false, "retry_after": <seconds>}.
create or replace function public.check_rate_limit(
  p_key text,
  p_window_seconds integer,
  p_limit integer
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz := v_now - make_interval(secs => p_window_seconds);
  v_count integer;
begin
  insert into public.rate_limits (key, count, window_start)
  values (p_key, 1, v_now)
  on conflict (key) do update
    set count = case
                  when public.rate_limits.window_start < v_window_start then 1
                  else public.rate_limits.count + 1
                end,
        window_start = case
                  when public.rate_limits.window_start < v_window_start then v_now
                  else public.rate_limits.window_start
                end
  returning count into v_count;

  if v_count > p_limit then
    return jsonb_build_object('allowed', false, 'retry_after', p_window_seconds);
  end if;
  return jsonb_build_object('allowed', true);
end;
$$;

-- Only the server (service role) calls this. Keep it off the public API surface.
revoke all on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
