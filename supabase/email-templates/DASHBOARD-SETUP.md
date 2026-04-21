# Supabase Email Templates — Dashboard Setup Guide

Source of truth: HTML files in this directory.
Templates must be manually pasted into the Supabase Dashboard (no CLI deployment available).

---

## Step 1: Paste Signup Confirmation Template

1. Open **Supabase Dashboard** → Select your project
2. Navigate to **Authentication** → **Email Templates**
3. Select **"Confirm signup"** from the template list
4. In the **"Subject"** field, enter:
   ```
   Willkommen bei AI Goldmining — Bestätige deinen Zugang
   ```
5. In the **"Message body (HTML)"** field, paste the entire contents of:
   `supabase/email-templates/signup-confirmation.html`
   (paste everything — the HTML comment at the top will be ignored by email clients)
6. Click **Save**

---

## Step 2: Paste Password Reset Template

1. In **Authentication** → **Email Templates**
2. Select **"Reset password"** from the template list
3. In the **"Subject"** field, enter:
   ```
   Dein AI Goldmining Passwort zurücksetzen
   ```
4. In the **"Message body (HTML)"** field, paste the entire contents of:
   `supabase/email-templates/password-reset.html`
5. Click **Save**

---

## Step 3: Verify SMTP Configuration (Resend)

Resend SMTP should already be configured. To verify:

1. In **Supabase Dashboard** → **Authentication** → **SMTP Settings**
2. Confirm the following values are set:
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (or `587` for TLS)
   - **Username:** `resend`
   - **Password:** Your Resend API key (starts with `re_`)
   - **Sender name:** `Bela Goldmann`
   - **Sender email:** `Bela@goldmvnn.com`
3. If any values are missing, retrieve the Resend API key from the Resend Dashboard and enter them here.

---

## Step 4: Test the Signup Confirmation Email

1. Open the live app and navigate to `/signup` (or `/auth/signup`)
2. Enter a real email address you have access to
3. Submit the signup form
4. Check your inbox for an email from `Bela Goldmann <Bela@goldmvnn.com>`
5. Verify:
   - Sender shows as `Bela Goldmann <Bela@goldmvnn.com>` ✓
   - Subject shows as `Willkommen bei AI Goldmining — Bestätige deinen Zugang` ✓
   - Email renders with dark obsidian background and gold "AI GOLDMINING" header ✓
   - "E-Mail bestätigen" button is present and gold ✓
   - Clicking the button completes account activation ✓

---

## Step 5: Test the Password Reset Email

1. Open the live app and navigate to `/login` (or `/auth/login`)
2. Click "Passwort vergessen" / forgot password link
3. Enter the email used in Step 4
4. Check your inbox for an email from `Bela Goldmann <Bela@goldmvnn.com>`
5. Verify:
   - Sender shows as `Bela Goldmann <Bela@goldmvnn.com>` ✓
   - Subject shows as `Dein AI Goldmining Passwort zurücksetzen` ✓
   - Email renders with dark obsidian background and gold "AI GOLDMINING" header ✓
   - "Neues Passwort setzen" button is present and gold ✓
   - "Falls du das nicht warst, ignoriere diese E-Mail" is visible ✓
   - Clicking the button opens the password reset page ✓

---

## Troubleshooting

**Emails not arriving:**
- Check Supabase Dashboard → Authentication → SMTP Settings — confirm all fields are filled
- Check Resend Dashboard for send logs and delivery errors
- Confirm Resend API key has `Full Access` or `Sending Access` permissions
- Confirm `Bela@goldmvnn.com` domain is verified in Resend (DNS records added)

**Email renders as plain text:**
- Ensure the HTML was pasted into the "Message body (HTML)" field, not the plain text field
- The Supabase template editor may have separate HTML/text tabs

**Sender shows as "no-reply@supabase.io":**
- SMTP is not configured — see Step 3 above

**Template variables `{{ .ConfirmationURL }}` not replaced:**
- This is normal when viewing the raw HTML. Supabase replaces these at send time.
