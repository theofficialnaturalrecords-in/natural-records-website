# Natural Records — setup notes

## 1. Email marketing: Mailchimp

The website already has a styled newsletter section. It is intentionally wired as a static HTML form so you control the mailing list and can see exactly where every subscriber goes.

Recommended setup:

1. Create a Mailchimp account.
2. Create one Audience for **Natural Records** (for example, `Natural Records — Mailing List`).
3. In Mailchimp, open **Audience → Signup forms → Embedded forms** and choose that Audience.
4. Keep the email field enabled. You can add first name later if useful.
5. Enable reCAPTCHA in the Audience settings to reduce fake signups.
6. Decide whether you want single or double opt-in. Double opt-in is a good choice if you expect subscribers from multiple countries.
7. Generate the embedded form code.
8. Find the form's `action` URL. It will look roughly like:
   `https://xxxx.list-manage.com/subscribe/post?u=...&id=...`
9. Open `script.js` and replace the empty `MAILCHIMP_FORM_ACTION` value with that URL.
10. Upload the whole folder to your web host.

Once connected, submissions from the website go into the selected Mailchimp Audience. Mailchimp can then be used to send release announcements, pre-save reminders, new-song drops, artist updates and other campaigns.

For a useful first campaign, consider this flow:

- **Welcome email:** Thanks for joining + what Natural Records is.
- **New release:** One clear listen button + artwork + short story behind the song.
- **Release day:** Streaming links and a simple ask to save/share the song.
- **Occasional artist update:** Only when there is something genuinely worth opening.

Keep the list permission-based and include an unsubscribe option in your marketing emails.

## 2. Artist link

The current artist card links to:
https://linktr.ee/tejassharma_music

Change it in `index.html` whenever the artist roster expands.

## 3. Donations

The Donate tile is deliberately marked **Coming soon**. Once you create a donation destination (for example, a payment/donation page), replace its `href="#"` in `index.html` with the real URL and remove `data-coming-soon`.

## 4. Merch

The Merch tile is also intentionally marked **Coming soon**. Once you have a store, replace its link and remove `data-coming-soon`.

## 5. Files

- `index.html` — page structure/content
- `styles.css` — visual design/responsive layout
- `script.js` — Mailchimp connection + small interactions
- `assets/natural-records-stamp.png` — the Natural Records stamp logo

## 6. Community: login + messages

The Community section uses **Supabase Auth + a Supabase Postgres table**. This gives you real accounts and a real database instead of pretending a static website can securely store messages.

### Create the backend

1. Create a free project at Supabase.
2. In **Authentication → Providers**, make sure **Email** is enabled.
3. In **Authentication → URL Configuration**, add your deployed website URL to the allowed site URLs. If you test locally, add your local URL too.
4. Open **SQL Editor** in Supabase.
5. Paste and run the complete `community.sql` file included with this website.
6. Go to **Project Settings → API** and copy the **Project URL** and the **anon/public key**.
7. Open `script.js` and set:

```js
const SUPABASE_URL = "your-project-url";
const SUPABASE_ANON_KEY = "your-anon-public-key";
```

**Never put a Supabase `service_role` key in this website.** The anon/public key is designed to be used in the browser; the Row Level Security policies in `community.sql` control what people can do.

### What the community does

- Anyone can read the community feed.
- Visitors must create an account or log in before posting.
- Accounts use email + password.
- New accounts can have a display name.
- Users can delete their own messages.
- Messages are limited to 1,000 characters.
- The feed shows the newest 100 messages.

### Recommended moderation settings

Before opening the community publicly, use Supabase Auth's email verification and consider adding a simple reporting/moderation workflow later. If the community grows, we can add admin-only deletion, pinned posts, profiles, reactions, reporting, rate limits and spam protection.

### Important

This is intentionally a real backend setup. A static HTML page alone cannot securely enforce “must be logged in to post.” Supabase handles authentication, database storage and Row Level Security for the Community section.
