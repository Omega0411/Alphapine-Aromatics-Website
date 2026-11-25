# CMS setup — Supabase + Vercel

The CMS lives at **`/admin`** on the website (for example `https://alphapine.in/admin`).
Admins use it to manage:

| Area | What you can do |
|---|---|
| **Responses** | Every submission from the Request a Quote pop-up, the contact form and the TDS / MSDS form. Filter by form, status and date; search; sort; open one to see all fields; set a status (New, In progress, Responded, Closed, Spam); add internal notes; reply by email or WhatsApp; bulk-update; export to CSV. |
| **Products** | The catalogue grid and every product page: edit every field, reorder the grid, hide or show products, duplicate, add or delete products. |
| **FAQs** | Add, edit, reorder, hide or delete questions. |
| **Page content & forms** | Catalogue and FAQ section headings and intros; form titles, button labels, inquiry-type options, the TDS / MSDS confirmation message and the consent text. |
| **Settings** | The Vercel Deploy Hook used by **Publish to website**; how to add admins. |

**How publishing works.** Saving in the CMS stores the change in Supabase immediately, but the
public site does not change yet. Click **Publish to website** and Vercel rebuilds the static
pages from the CMS, usually within 1–2 minutes. Form responses are different: they appear in
**Responses** the moment a visitor submits.

---

## One-time setup (about 15 minutes)

### 1. Create the Supabase project
1. Sign up at **supabase.com**, then click **New project**.
2. Name it `alphapine`. Set a strong database password and keep it somewhere safe (it is not
   needed for the website). Choose the region closest to your customers, e.g. **Mumbai (ap-south-1)**.

### 2. Create the tables and load today's content
1. In the project, open **SQL Editor → New query**.
2. Paste all of [`schema.sql`](schema.sql) and click **Run**.
3. Open a new query, paste all of [`seed.sql`](seed.sql) and click **Run**. This loads the
   16 products, 8 FAQs and section copy exactly as they are on the site today.

Both files are safe to run again: they never overwrite content already in the CMS.

### 3. Create the admin login(s)
1. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up".
   Admins are added only by you.
2. **Authentication → Users → Add user → Create new user**: enter the admin's email and a
   password, tick **Auto Confirm User**, and save.
3. **SQL Editor**, run (with that email):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@yourcompany.com';
   ```
   Repeat steps 2–3 for each admin. To remove an admin, delete the user under
   **Authentication → Users**.
4. **Authentication → URL Configuration**: set **Site URL** to `https://<your-domain>/admin`
   and add the same address under **Redirect URLs**. Password-reset emails link there.

### 4. Connect the website (Vercel)
1. In Supabase, open **Project Settings → API** (or **Data API / API Keys**) and copy:
   - **Project URL**, e.g. `https://abcdxyz.supabase.co`
   - the **anon / public** key

   Never use the **service_role** (secret) key anywhere on the website.
2. In Vercel, open **Project → Settings → Environment Variables** and add both, for
   **Production** and **Preview**:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | the Project URL |
   | `SUPABASE_ANON_KEY` | the anon / public key |

3. Redeploy: **Deployments → … on the latest → Redeploy**.

The anon key is designed to be public: it is shipped to browsers so the forms can submit. What
it can do is limited by the access rules in `schema.sql`. Visitors can only *add* responses.
They can never read them, and they cannot change content.

### 5. Turn on the Publish button
1. In Vercel, open **Project → Settings → Git → Deploy Hooks**. Create a hook named `CMS publish`
   for branch `main`, then copy its URL.
2. Open `https://<your-domain>/admin`, sign in, go to **Settings**, paste the URL and click **Save**.

Setup is complete. Make a small edit (for example an FAQ), click **Publish to website** and
check the live site after about 2 minutes.

---

## Things to know

- **Supabase free plan pauses inactive projects** (after about a week with no activity). While
  paused:
  - Form responses cannot be saved. Visitors automatically get the "send by email / WhatsApp"
    option instead, so no enquiry is lost.
  - Deploys stop with a clear error, so the live site stays on its last good version instead of
    reverting to old content.

  Restore the project from the Supabase dashboard, or use a paid plan to avoid pausing.
  `CMS_ALLOW_FALLBACK=1` in Vercel makes a deploy use the bundled `src/data` content instead.
- **Without the Supabase variables** the site builds exactly as before, from `src/data`, and
  `/admin` shows "CMS not connected".
- **Back-ups:** export responses any time with **Export CSV**. Supabase also has
  **Database → Backups** (daily on paid plans).
- **Spam:** the forms include a hidden field that bots fill in and people never see; those
  submissions are discarded. Mark any remaining junk as **Spam** in Responses.
- **Product fields** match `src/data/products.mjs` one to one. Illustration fields (molecule,
  source and process drawings, icons, physical form) are dropdowns, so only drawings the site
  can render can be chosen. **Advanced — raw data (JSON)** in the product editor shows every
  field. A product saved with required fields missing is skipped at build time and named in the
  Vercel build log; it is not published broken.
- **Changing a product's URL slug** changes its page address. Old links to it stop working.
- **Updating the bundled defaults:** after editing `src/data` in code, run `npm run cms:seed`
  to regenerate `seed.sql`. It only adds rows that do not exist yet.
