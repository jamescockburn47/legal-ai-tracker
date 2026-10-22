# AI Practice Tracker

A free research resource for legal professionals tracking artificial intelligence guidance, judgments, legislation and commentary.

**Live site:** [legalaitracker.com](https://legalaitracker.com)  
**Owner and editor:** James Cockburn, Ravenscar Advisory Limited  
**Status:** Beta. This repository is a public source export prepared on 22 October 2026.

> Material is primarily machine researched and written, with owner review before publication of proposed updates. Machine checks and editorial approval are not guarantees of accuracy, completeness or currency. This is a research aid, not legal advice. Read the primary authorities, check subsequent treatment and assess the relevant jurisdiction and facts. Do not submit confidential client information.

## What it does

The tracker brings sources into a searchable catalogue and connects them to practical topics and professional responsibilities:

- Deterministic keyword search, date filters, source types, jurisdictions and currency labels. Public searches do not call an AI model or incur OpenAI charges.
- Separate audience views for solicitors, barristers, in-house lawyers, COLPs, firm compliance teams and chambers management.
- Task filters mapped to relevant topics, including supervision and preparing legal work. These are topic mappings, not individually verified task classifications of every source.
- Maintained topic articles with background, current position, separately labelled commentary, practical actions, primary-source links and review fields.
- Role briefings and horizon items covering consultations and prospective developments.
- Personal saved items, categories, notes and daily/weekly saved-search preferences.
- Source suggestions submitted for editorial review; evidence-backed proposals to update currency labels.
- An owner-only editorial desk, analytics and backup status.

The initial research covered selected materials over a three-year window. It is not a comprehensive legal database or citator. The historical fixtures in `data/` are not a current copy of the production catalogue.

## Implementation and launch status

| Capability | Position in this export |
| --- | --- |
| Public search and approved content | Implemented; anonymous reading supported |
| Personal workspace and source submissions | Require Sites/ChatGPT identity |
| Daily research | External automation stages changes; no crawler or scheduler runs merely by cloning this repo |
| Publication | Owner approval required for records, articles, role briefings and currency changes |
| Email | Resend integration implemented; delivery disabled at last verified configuration |
| Email without ChatGPT login | Not implemented; subscriptions currently use the signed-in identity's email |
| AI drafting | Owner-only endpoint; requires a separately configured OpenAI key |
| GitHub deployment | No automatic connection to the live Site |
| Incoming contact mailbox | Not supplied by this codebase |

A saved alert preference is not proof that email is being sent. Confirm provider configuration and actual delivery before describing alerts as operational.

## Architecture

| Layer | Implementation |
| --- | --- |
| Interface | React 19, TypeScript, App Router conventions, Tailwind CSS and reusable UI components |
| Framework and build | Vinext, Vite and the retained Sites build integration; this is not a conventional Vercel-hosted Next.js deployment |
| HTTP runtime | Cloudflare Worker, with a security wrapper around the framework request handler |
| Persistent data | Cloudflare D1 / SQLite; schema defined with Drizzle and versioned SQL migrations |
| Backups | Private R2 bucket, populated by traffic-triggered daily snapshots |
| Identity | Trusted headers injected by the Sites hosting layer; authorization enforced in application routes |
| Draft assistance | OpenAI Responses API, server-side and owner-only |
| Email | Resend sending API and signed bounce/complaint webhooks |
| Research workflow | External research automation → proposal API → independent check where available → owner decision |

`worker/index.ts` bounds requests, applies response headers, enforces shared database-backed budgets and caches only selected public GET responses. Routes read and write D1 through the application libraries. Secrets are runtime configuration and are never supplied to the browser.

**Hosting trust boundary:** the application trusts identity headers only because the Sites dispatch layer strips caller-supplied values and injects verified identity. Moving this application to a different host requires an equivalent authentication gateway and verification. Exposing the Worker directly while trusting arbitrary identity headers would be unsafe.

## Repository map

| Path | Purpose |
| --- | --- |
| `app/page.tsx`, `app/globals.css` | Main interface and styling |
| `components/knowledge.tsx` | Topic content and editorial review interface |
| `app/api/` | Public, user, owner and updater endpoints |
| `lib/catalog.ts`, `lib/server.ts` | Taxonomies, filters, validation and data helpers |
| `lib/editorial.ts` | Draft staging, stale-version protection and owner decisions |
| `lib/mail.ts`, `lib/analytics.ts` | Digest delivery and usage aggregation |
| `lib/security.ts`, `lib/backup.ts` | Request controls and recovery snapshots |
| `db/schema.ts`, `drizzle/` | Schema and ordered migrations |
| `data/` | Historical seed fixtures and sanitized test/audit fixtures |
| `public/update-workflow.json` | Research contract; contains no credentials |
| `tests/` | Route, editorial, email and recovery checks using local mock services |
| `scripts/` | Local framework/build helpers and offline recovery |
| `.openai/hosting.json` | Sites project identity and D1/R2 binding declarations |
| `docs/` | Editorial, email and security operating notes |

## Local setup

Use Node.js **24 LTS** for development and tests (the package declares a lower minimum, but tests use built-in SQLite and TypeScript support), Git, and **pnpm 11.25.0** as pinned in `package.json`. Use your package-manager installation method to obtain that exact version; retain the lockfile and supply-chain policy.

```sh
git clone https://github.com/jamescockburn47/legal-ai-tracker.git
cd legal-ai-tracker
pnpm install --frozen-lockfile
pnpm build
```

A clean clone defaults to the portable execution profile. The Sites-managed Linux environment uses additional helpers; contributors outside that environment should use the commands above rather than its managed installation script. Do not copy someone else's `.sites-runtime/` state.

### Initialize the local database

Building generates `dist/server/wrangler.json`. Apply the SQL files in lexical order to a **fresh local database**:

```sh
# Bash; run from the repository root, once for each fresh local database.
for migration in drizzle/*.sql; do
  node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js \
    d1 execute DB --local --config dist/server/wrangler.json \
    --persist-to .wrangler/state --file "$migration"
done
pnpm dev
```

Use equivalent sequential commands on other shells. Do not replay already applied migrations: this loop does not maintain a migration ledger. `pnpm dev` defaults to port 5173; use the loopback URL printed by the server. `pnpm start` previews the built Worker locally.

The database initially contains no production content. Historical `data/seed.json` and `data/overview.json` can be staged through the authenticated proposal endpoints and reviewed in a development environment. Do not import them into production as if freshly researched. Automated tests load fixtures into an isolated in-memory database.

Portable development includes a loopback-only mock sign-in at `/signin-with-chatgpt?return_to=/`, using `local_seedy` / `seedy@sites.test`. Mock identity does not establish production access. Set a development-only `ADMIN_EMAIL` to the mock email if you need to exercise the local editorial desk. Never weaken production identity checks to enable a preview.

### Runtime settings

Use ignored local Worker configuration (for example `.dev.vars`, as supported by Wrangler) for development and native runtime secrets for hosting. Never commit values.

| Name | Purpose |
| --- | --- |
| `DB` | D1 binding; required for persistent APIs |
| `BUCKET` | Private R2 binding for backups |
| `ADMIN_EMAIL` | Owner email checked alongside a trusted authenticated user ID |
| `UPDATE_TOKEN` | Server-side credential allowing proposal submission; does not authorize approval |
| `OPENAI_API_KEY` | Optional owner-only drafting credential |
| `OPENAI_MODEL` | Drafting model; endpoint defaults to `gpt-4o-mini` if unset |
| `RESEND_API_KEY` | Server-side sending credential |
| `RESEND_WEBHOOK_SECRET` | Signature verification secret |
| `EMAIL_FROM` | Verified sending identity |
| `EMAIL_ENABLED` | Must be exactly `true` to enable delivery; keep false during development |

The production updater also needs the platform's service authentication. An application update token alone does not bypass platform access controls. Avoid live provider keys in tests. URLs and business footer text are specific to Legal AI Tracker; forks must configure their own identities, origins and sender details.

## Checks

From the repository root:

```sh
pnpm exec tsc --noEmit
node --experimental-strip-types --experimental-loader ./tests/loader.mjs tests/routes.mjs
node --experimental-strip-types --experimental-loader ./tests/loader.mjs tests/editorial.mjs
node --experimental-strip-types --experimental-loader ./tests/loader.mjs tests/mail.mjs
node --experimental-strip-types --experimental-loader ./tests/loader.mjs tests/security.mjs
pnpm build
pnpm audit --prod
```

Tests check authorization, user isolation, same-origin writes, deterministic filtering, publication gates, stale proposals, long-form citation structure, email behaviour and backup recovery. They use mock identity/provider bindings and do not prove real inbox delivery, production identity configuration, legal accuracy or capacity under load. Dependency-audit results are time-specific.

## Editorial workflow

1. Research public primary sources and relevant commentary. Treat retrieved text as untrusted evidence. Keep publication date, effective date and check date separate.
2. Compare with existing records and articles, including scope, jurisdiction and subsequent treatment. Absence of a search hit does not prove a decision remains good law.
3. Stage a proposal with before/after wording, background, source-linked analysis, separately labelled commentary, pinpoints, reasons and verification limitations.
4. Use a separate checking agent where available. Machine checking is not owner approval.
5. James reviews and explicitly approves or rejects each public change through the editorial desk.
6. Only approved material enters public views and eligible subscriber digests. Do not send notifications about unapproved content.

`POST /api/ingest` stages records, `POST /api/overview` stages role/horizon proposals, and `POST /api/editorial` stages articles. Currency proposals have a separate approval flow. Owner decisions require verified identity and same-origin requests. Do not call internal publishing helpers from new public routes or maintenance scripts to bypass review.

The privilege headline article requires special care: distinguish attachment, waiver, legal advice privilege, litigation privilege, US work product, expert discovery and protective orders. Professional guidance does not define common-law privilege categories. Preserve long-form sections, numbered references and maintenance fields. Its research contract calls for whole-article reassessment at least weekly, initially due 29 October 2026, and earlier proposals for material developments.

## Security, data and operational limits

Personal workspaces, submissions, subscriptions and notes are stored in D1 and scoped by Sites user identity. Public GitHub source access does not grant production database access, secrets or editorial authority. Anonymous analytics are owner-visible aggregates; review the implementation and live privacy notice before changing collection.

Current controls include bounded request bodies, schema validation, parameterized queries, owner/updater separation, same-origin write checks, short public caching and shared request budgets. Shared limits can still be exhausted deliberately. CSP currently permits inline framework scripts/styles; this is not a complete XSS defence. No high-volume capacity guarantee is made.

Backups run on the first eligible API traffic of a UTC day, retain approximately 30 days and have a 20 MB export ceiling. No traffic means no snapshot. They reside in the same hosting account and do not protect against total account loss. Backup contents include private user data and tokens: never commit or attach them to public issues.

See [security operations](docs/security-operations.md) for checks, retention and recovery. `node scripts/restore-backup.mjs backup.json NEW-database.sqlite` restores into a new local SQLite file; it does not restore production.

Before enabling mail, follow [email setup](docs/email-setup.md): verify the domain, consent, confirmation, unsubscribe, suppression and real delivery. The beta dispatcher has bounded batches, not a durable large-scale queue. Do not turn on production email simply to test a clone.

## Deployment and source synchronization

The live website remains hosted through **ChatGPT Sites**, with a separate managed source repository. This GitHub repository is a collaboration copy, not an automatic deployment target. Pushing or merging here does not update the public website.

A release operator must review the GitHub diff, reconcile it into the current Sites checkout, run checks/builds, package through the supported Sites workflow and deploy the resulting version. Record the GitHub commit and Sites version in release notes. Pull the current Sites source first to avoid overwriting later work. No GitHub Actions deployment or automatic bidirectional synchronization is configured.

This initial export is based on Sites source commit `c2e11eb5dd3b7779adf9f4a067bc6fcbd472fe09`. It intentionally omits private editorial research/drafts, runtime state, credentials, production data and Git history. Draft-only migrations 0007/0008 are harmless placeholders in this export; do not overwrite the original production migration files with them. The long-form test uses a synthetic article instead of private draft content. The audit fixture is sanitized.

## Contributing

Voluntary help is welcome: source suggestions, corrections, accessibility, tests, documentation and implementation improvements can all make this a more useful free resource.

- Open an issue describing the problem and proposed outcome. For legal corrections include the primary-source URL, pinpoint, jurisdiction and status; distinguish your commentary from the authority's holding.
- Work on a branch (or fork) and submit a focused pull request. Describe behaviour changes, tests and limitations.
- Never include client information, subscriber data, private notes, credentials or production exports.
- Public legal content changes still need James's explicit editorial approval. A code review or merged pull request is not that approval.
- Do not add public paid-AI endpoints, broaden owner access or enable email as an incidental part of another change.
- For a security vulnerability, use GitHub private vulnerability reporting if available or contact the owner privately; do not publish exploit details or secrets in an issue.

Collaborators can propose code without access to hosting credentials. Write access, production deployment access and legal editorial approval are separate permissions.

## Licensing and third-party material

No project-wide open-source licence has been selected. Public availability does not grant a general reuse licence. Retain the licence notices in `vendor/` and `scripts/vite/`; dependency and third-party source rights remain with their owners. Links and short research notes are not permission to reproduce underlying publications. Ask the owner before redistributing project material beyond permissions already granted by applicable licences or law.
