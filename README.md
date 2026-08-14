# Check-In System (Netlify + Netlify Blobs)

A single-use link/QR check-in system. The guest list lives in **Netlify Blobs**
(Netlify's built-in free key-value store), accessed through one small
serverless function — no external database or API keys needed.

## What's in this folder

```
public/index.html            <- the whole app (admin dashboard + guest check-in page)
netlify/functions/storage.js <- tiny API: GET/POST to read & write Blobs
netlify.toml                 <- tells Netlify where the site + functions live
package.json                 <- declares the @netlify/blobs dependency
```

## Deploy it — Option A: GitHub + Netlify (recommended, free)

This is the most reliable free path because Netlify's build step installs
the function's dependency automatically.

1. Create a new GitHub repo and push this folder to it (or upload the files
   via GitHub's web UI — "Add file" → "Upload files").
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** →
   **Import an existing project** → connect GitHub → pick the repo.
3. Netlify will detect `netlify.toml` automatically. Leave the build command
   blank and click **Deploy site**.
4. Once deployed, open the site once yourself to set your admin PIN, then
   start pasting your guest list.

## Deploy it — Option B: Netlify CLI (no GitHub needed)

1. Install the CLI: `npm install -g netlify-cli`
2. From inside this folder: `netlify deploy --prod`
3. Follow the prompts to log in / create a site. The CLI bundles the
   function's dependencies for you.

## What NOT to do

Don't use Netlify's plain drag-and-drop "Deploys" upload for this project —
it only uploads static files and won't install `@netlify/blobs` for the
function, so check-ins won't save. Use Option A or B above instead.

## How it works

- `public/index.html` is the entire frontend — same admin dashboard and
  guest check-in flow as before, just talking to `/.netlify/functions/storage`
  instead of Claude's `window.storage`.
- `storage.js` exposes a minimal API:
  - `GET /.netlify/functions/storage?key=guest:abc123` → `{ key, value }`
  - `POST /.netlify/functions/storage` with `{ key, value }` → saves it
- Netlify Blobs is a single shared store per site — every guest and the
  admin dashboard read/write the same data automatically, in real time.

## After deploying

- Your admin dashboard: `https://YOUR-SITE.netlify.app/`
- Guest links: `https://YOUR-SITE.netlify.app/?token=xxxx` (generated
  automatically for each guest inside the dashboard)

## Free tier notes

Netlify Blobs and Functions are both included in Netlify's free tier at
volumes far beyond what a single event's guest list will use. No credit
card or paid plan required for this project.
