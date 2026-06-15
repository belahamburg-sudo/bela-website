-- ───────────────────────────────────────────────────────────────────────────
-- Migration 015: Storage policies for admin resumable (TUS) uploads
--
-- Large course videos are uploaded straight from the browser via the resumable
-- (TUS) protocol, which authenticates with the admin's OWN session JWT instead
-- of a service-role-signed URL. That means storage.objects RLS must explicitly
-- allow the admin accounts to read/write in the relevant buckets.
--
-- The admin set mirrors the email allowlist in lib/admin.ts
-- (DEFAULT_ADMIN_EMAILS). If you add an admin via the ADMIN_EMAILS env var,
-- add the same address here too.
--
-- Service-role operations (signed URLs, watermarking, the media manager) bypass
-- RLS and are unaffected. Member downloads keep using server-issued signed URLs,
-- so no public read policy is added to the private course-content bucket.
--
-- Idempotent. Run in the Supabase SQL editor.
-- ───────────────────────────────────────────────────────────────────────────

do $$
begin
  -- course-content (private): admins may manage all objects.
  drop policy if exists "admins manage course-content" on storage.objects;
  create policy "admins manage course-content"
    on storage.objects for all to authenticated
    using (
      bucket_id = 'course-content'
      and (auth.jwt() ->> 'email') in ('bela.hamburg@gmail.com', 'dr.eddi@icloud.com')
    )
    with check (
      bucket_id = 'course-content'
      and (auth.jwt() ->> 'email') in ('bela.hamburg@gmail.com', 'dr.eddi@icloud.com')
    );

  -- media (public read): admins may manage all objects (covers, marketing).
  drop policy if exists "admins manage media" on storage.objects;
  create policy "admins manage media"
    on storage.objects for all to authenticated
    using (
      bucket_id = 'media'
      and (auth.jwt() ->> 'email') in ('bela.hamburg@gmail.com', 'dr.eddi@icloud.com')
    )
    with check (
      bucket_id = 'media'
      and (auth.jwt() ->> 'email') in ('bela.hamburg@gmail.com', 'dr.eddi@icloud.com')
    );
end $$;
