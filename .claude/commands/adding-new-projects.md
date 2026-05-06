# Add a New Project

Use this skill when adding a new interactive demo to the projects section of this site. Follow the 7 steps below in order.

---

## Step 1 — Info page (technical writeup)

Create `info/[category]/[project-name].md` with YAML front matter:

```yaml
---
Title: "Project Name"
Start: Mon YYYY
End: Mon YYYY
Link: /projects/[slug]
---
```

Use H1 and H3 only (the embedding script splits on H1/H3; H2 and H4 are not supported).
The `Link:` field causes the info page to render a "Project →" CTA linking to the live demo.
This page is auto-discovered by `getSortedInfo()` and appears in the header nav under the appropriate category.

---

## Step 2 — Types and lib logic

Create `lib/projects/[slug]/types.ts`, `similarity.ts` (if embeddings needed), `prompt.ts` (if LLM synthesis needed).
Mirror the structure in `lib/projects/dental-eligibility/`.

---

## Step 3 — Data (if embedding-backed)

Add `data/[slug]-cases.json` with pre-computed embeddings.
Seed script lives at `scripts/seed-[slug]-embeddings.ts`.
Run: `npx tsx --env-file=.env.local scripts/seed-[slug]-embeddings.ts --force`

---

## Step 4 — API route

Create `app/api/projects/[slug]/route.ts`.
Use Zod for request validation. Return structured JSON.

---

## Step 5 — Demo page

```
app/(marketing)/projects/[slug]/
  page.tsx              # Server Component: metadata, SiteHeader/Footer, passes baseCases
  page.module.css
  [ProjectName]Demo.tsx # 'use client' — all interactive state lives here
```

`page.tsx` reads static data (if any) and passes it as props to the client component.

---

## Step 6 — Components

Create `components/projects/[ProjectName]/` with component files.
Each component gets its own `.module.css`. No shared CSS between projects.

---

## Step 7 — Wire into the listing pages

**`app/(marketing)/projects/page.tsx`** — add an entry to the `DEMOS` array:
```ts
{
  slug: '/projects/[slug]',
  title: '...',
  description: '...',
  tags: ['...'],
  infoSlug: '/info/[category]/[project-name]',
  stat: '...',           // optional
  statLabel: '...',      // optional
}
```

**`app/page.tsx`** — add an entry to the `PROJECTS` array on the homepage carousel:
```ts
{
  title: '...',
  description: '...',
  demoSlug: '/projects/[slug]',   // shows "Live Demo" badge; set null if not live yet
  infoSlug: '/info/[category]/[project-name]',
  tags: ['...'],
  stat: '...',   // optional, shown in green
}
```

If `demoSlug` is null and the project is the personal website itself, use `WebsiteProjectCard` instead of a `<Link>` (already handled in the render loop via the `infoSlug === '/info/projects/personal-website'` check).

---

## Notes

- No changes needed to `SiteHeader.tsx` — nav is auto-populated from `getSortedInfo()`
- The `app/globals.css` `--success` variable and projects CSS infrastructure are already in place
- No em-dashes in any UI text (house style)
- The Dental Eligibility demo at `lib/projects/dental-eligibility/` is the canonical reference implementation
