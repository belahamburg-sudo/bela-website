# Supabase Email Templates — Dashboard Setup Guide

6 branded templates, all consistent design: obsidian background, gold header, Bela photo, Arial inline CSS only.
Paste each into: **Supabase Dashboard → Authentication → Email Templates**

---

## Template 1: Confirm signup

1. Select **"Confirm signup"**
2. **Subject:** `Willkommen bei AI Goldmining — Bestätige deinen Zugang`
3. Paste full contents of `signup-confirmation.html`
4. **Save**

---

## Template 2: Invite user

1. Select **"Invite user"**
2. **Subject:** `Du wurdest zu AI Goldmining eingeladen`
3. Paste full contents of `invite-user.html`
4. **Save**

---

## Template 3: Magic link

1. Select **"Magic link"**
2. **Subject:** `Dein AI Goldmining Login-Link`
3. Paste full contents of `magic-link.html`
4. **Save**

---

## Template 4: Change email address

1. Select **"Change email address"**
2. **Subject:** `Neue E-Mail-Adresse bestätigen — AI Goldmining`
3. Paste full contents of `change-email.html`
4. **Save**

---

## Template 5: Reset password

1. Select **"Reset password"**
2. **Subject:** `Dein AI Goldmining Passwort zurücksetzen`
3. Paste full contents of `password-reset.html`
4. **Save**

---

## Template 6: Reauthentication

1. Select **"Reauthentication"**
2. **Subject:** `Sicherheitscode — AI Goldmining`
3. Paste full contents of `reauthentication.html`
4. **Save**

---

## SMTP Configuration (Resend)

**Authentication → Settings → SMTP:**

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your Resend API key (`re_...`) |
| Sender name | `Bela Goldmann` |
| Sender email | `Bela@goldmvnn.com` |

**Important:** `goldmvnn.com` must be verified at [resend.com/domains](https://resend.com/domains) — add the DNS records they provide.

---

## Template Variables Reference

| Template | Variables used |
|---|---|
| Confirm signup | `{{ .ConfirmationURL }}`, `{{ .Email }}` |
| Invite user | `{{ .ConfirmationURL }}`, `{{ .Email }}` |
| Magic link | `{{ .MagicLink }}`, `{{ .Email }}` |
| Change email | `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}` |
| Reset password | `{{ .ConfirmationURL }}`, `{{ .Email }}` |
| Reauthentication | `{{ .Token }}`, `{{ .Email }}` |

---

## Troubleshooting

**"550 domain not verified"** → Verify `goldmvnn.com` at resend.com/domains, add DNS records, wait for propagation (5–30 min), then re-test.

**Sender shows "no-reply@supabase.io"** → SMTP not configured. See section above.

**Template renders as plain text** → Paste into the HTML tab, not plain text tab.

**Bela photo not showing** → Ensure `https://goldmvnn.com/assets/bela-character.jpeg` is publicly accessible.
