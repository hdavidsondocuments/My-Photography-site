# Setting Up Your Free, In-Browser Website Editor

This turns your site into something you can log into and edit — add photos, journal entries, essays — directly in the browser, with zero monthly cost. It uses three free services together:

- **GitHub** — stores your website's files (free)
- **Netlify** — hosts your site live and re-publishes it automatically whenever you make an edit (free tier)
- **Decap CMS** — the actual editor screen you'll use, built into your site at `/admin` (free, open-source)

You will not touch any code after this setup is done. Everything below is a one-time process — expect 20–30 minutes.

---

## What's in this folder

```
index.html              ← your website
admin/index.html        ← the editor login page
admin/config.yml         ← tells the editor what fields to show
content/dispatches.json  ← homepage photo strip
content/essays.json      ← your photo essays
content/journal.json     ← journal entries
content/press.json       ← press mentions
content/about.json       ← bio, contact info, social links
images/uploads/           ← where photos you upload will land
```

Keep this folder structure exactly as-is — don't rename or move files.

---

## Step 1 — Create a GitHub account and repository

1. Go to **github.com** and sign up (free).
2. Click the **+** icon top-right → **New repository**.
3. Name it something like `my-photography-site`. Keep it **Public**. Click **Create repository**.
4. On the new repo page, click **uploading an existing file** (or drag files directly onto the page).
5. Drag your **entire folder's contents** in — all the files and folders listed above, keeping the same structure (GitHub preserves folders when you drag them in).
6. Scroll down, click **Commit changes**.

You don't need to install Git or use the command line — GitHub's website handles the upload.

---

## Step 2 — Connect it to Netlify

1. Go to **netlify.com** and sign up (free) — easiest is "Sign up with GitHub."
2. Click **Add new site → Import an existing project**.
3. Choose **GitHub**, then select your `my-photography-site` repository.
4. Leave the build settings blank (no build command needed) and set the **publish directory** to `/` (the root).
5. Click **Deploy site**.

Within a minute, you'll get a live link like `random-name-123.netlify.app` — that's your site, live on the internet.

---

## Step 3 — Turn on the login system (Identity)

1. In your Netlify site dashboard, go to **Site configuration → Identity**.
2. Click **Enable Identity**.
3. Scroll to **Registration preferences** and set it to **Invite only** (important — this stops strangers from signing up to your editor).
4. Scroll to **Services → Git Gateway** and click **Enable Git Gateway**. This is what lets the editor save changes back to GitHub for you, invisibly.

---

## Step 4 — Invite yourself as the editor

1. Still in the Identity tab, click **Invite users**.
2. Enter your own email address, send the invite.
3. Check your email, click the invite link — it'll ask you to set a password.

---

## Step 5 — Start editing

Go to `your-site-name.netlify.app/admin` and log in with the password you just set.

You'll see a clean dashboard with sections for **Recent Dispatches**, **Photo Essays**, **Journal Entries**, **Press & Publications**, and **About & Contact** — each with an "Add" or "New" button, text fields, and image upload boxes you can drag photos straight into.

When you click **Publish**, your change goes live automatically — usually within 30–60 seconds, no file uploads, no re-deploying, nothing else to do.

---

## Getting future changes made

There are two different kinds of updates, and they work differently:

**Content changes** (new photos, journal entries, essays, bio text, contact info) — you don't need Claude for these at all. Just log into `/admin` and edit directly, as described above.

**Structural or design changes** (layout, colors, fonts, new sections, new features) — these need code changes, so bring the files back to a conversation with Claude:

1. Go to your GitHub repository in a browser.
2. Click the green **Code** button → **Download ZIP** (this gets you the current, up-to-date version of every file, including any content you've added through the editor).
3. Start a conversation with Claude and upload that zip (or just the specific file that needs to change, like `index.html`).
4. Describe what you'd like changed.
5. Claude will hand back the updated file(s).
6. Go to your GitHub repo and drag the updated file(s) in the same way you did during initial setup — this overwrites the old version. Netlify will automatically redeploy within about a minute.

**Note:** always download fresh from GitHub before asking for changes, rather than reusing an old copy — since the CMS may have updated the content files since your last download.

---

## Notes

- **Custom domain:** once you're happy with things, you can connect a real domain name (like yourname.com) under **Site configuration → Domain management** — this is optional and separate from everything above.
- **Photos:** the editor automatically stores anything you upload in the `images/uploads` folder in your GitHub repo — you never have to manage that yourself.
- **Cost:** GitHub, Netlify's free tier, and Decap CMS are all free for a site of this size. You will not be charged unless you later choose to buy a custom domain or outgrow Netlify's generous free usage limits (very unlikely for a portfolio site).
- **If you ever want to go back to hand-editing:** the `content/*.json` files are plain text — you can still open and edit them directly if you'd rather, same as before.
