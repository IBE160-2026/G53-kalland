---
title: 'Brainstorm intent: client model and access'
source: '.memlog.md (bmad-brainstorming, Ideate-for-me, 2026-10-28)'
status: final
feeds: 'bmad-prd (functional requirements, access rules, test matrix)'
---

# Brainstorm intent: client model and access

Decisions the PRD adopts as given. Rationale lives in `.memlog.md`.

## Client model
- A **client is an organisation** with one or more **contacts** (users). In v1 each contact belongs to exactly one org.
- The **org is the unit of access, licences and history**. The contact is the unit of login and audit. Every contact in an org sees the org's full licence history.
- **Only agency admins create orgs and contacts.** There is no self-signup and no client-admin role in v1. The `role` field leaves room for one later.
- **Minimal org record:** name, org number (optional, 9 digits with a mod-11 check), status active/inactive, billing email, account manager (agency user), staff-only notes, `tenant_id`.
- **Contact record:** name, email (unique login id, user id stays stable if it changes), phone (optional), role, active flag, last login.
- The **client card** (org details, contacts, shared images, licence history) is the visible CRM backbone in v1.

## Login
- Contacts log in with **email and password**. No 2FA or other methods in v1. Passwords are hashed and never visible to admins.
- **New contact or password reset:** the admin generates a **single-use setup link** (expires after about 72 h) and copies it into their own email. The contact chooses the password. v1 sends no email; in stage 2 the same token is sent by SMTP.
- An expired or used link gives a clear message telling the contact to ask the agency. Login is rate-limited or locked after repeated failures (nice to have).
- Deactivating a contact or org takes effect on the **next request**, because active status is checked on every request. The last active admin cannot be deactivated.

## Licences (replace "purchases")
- What a client acquires is a **licence**. In v1 every image has one licence type, **standard commercial use**, with one standard licence text shown before purchase and in the licence list. Editorial, private and free-use licences and the full texts come later.
- A licence row is created:
  - when an org **buys** a paid image, at the price at that time;
  - when an org **first downloads** a free image, at 0 kr.
- **Licence row:** org, buying or downloading contact, asset, licence type, licence-text version, price in øre excl. VAT, timestamp, asset title snapshot, plus revoked_at, revoked_by and reason when revoked.
- An org can hold only one licence per asset (unique constraint), so two simultaneous purchases give one row. Buying a free asset is refused. Re-downloading is unlimited.
- The **invoicing view and export only include licences above 0 kr**. Prices are stored as integer øre excl. VAT and shown as "ekskl. mva". No refunds in v1.

## Access rules
- **Two sources of access:**
  - a **visibility grant**, which is live and follows the current visibility (and covers paid previews);
  - a **licence**, which is permanent.
- **A licence survives** a change of visibility (internal-only, or the org removed from a restricted list), a change of price (free to paid or paid to free), archiving, and the contact leaving. Orgs without a licence lose access when an image is unshared.
- **Revoke access** is a separate, deliberate admin action, on the image page or the client card, for one org or all:
  1. A warning lists the affected licences.
  2. A reason is required.
  3. The admin confirms with "Remove anyway".
  4. The licence is marked **revoked**, never deleted.
  5. Revoked paid licences are flagged "may need a credit".
  6. The client's history shows the image as "Removed by the agency".
- **Nothing with history is hard-deleted.** Images with licences are archived: hidden from the shop, still in licence holders' "Mine bilder". Images without licences may be deleted. Orgs are only deactivated. **Permanent file deletion is out of v1.**
- Restricted with an empty list behaves as internal-only, and the admin is warned. New uploads default to **internal-only**.
- An inaccessible asset returns **404**, never 403. Originals and previews are served only through access-checked endpoints. Search, thumbnails and result counts run on the access-filtered set. Previews have all metadata stripped.
- All decisions go through one access module (`canSee`, `canDownloadOriginal`, `canBuy`). Every admin route returns 403 for client sessions.

## Truth table (one org's contact, active asset)

| Row | Visibility for this org | Price | Licence | See | Download original | Buy |
|---|---|---|---|---|---|---|
| A1 | Public | Free | – | yes | yes (creates licence) | no |
| A2 | Public | Paid | no | preview | no | yes |
| A3 | Public | Paid | yes | yes | yes | no |
| A4 | Restricted, on list | Free | – | yes | yes (creates licence) | no |
| A5 | Restricted, on list | Paid | no | preview | no | yes |
| A6 | Restricted, on list | Paid | yes | yes | yes | no |
| A7 | Restricted, not on list | any | no | 404 | no | no |
| A8 | Restricted, not on list | any | yes | yes | yes | no |
| A9 | Internal-only | any | no | 404 | no | no |
| A10 | Internal-only | any | yes | yes | yes | no |

**Edge tests:**

| ID | Case | Expected |
|---|---|---|
| S1 | Deactivated contact | Rejected on the next request |
| S2 | Deactivated org | All its contacts rejected |
| S3 | Archived image | Licence holders keep it; gone from the shop |
| S4 | Restricted with an empty list | Behaves as internal-only |
| S5 | Simultaneous purchases | One licence row |
| S6 | Admin routes with a client session | 403 |
| S7 | Buying a free image | Refused |
| S8 | Setup link reused or expired | Refused |
| S9 | Last admin deactivated | Refused |
| S10 | Deleting an org with licences | Refused |
| S11 | Revoke without a reason | Refused |
| S12 | Revoked licence | Download 404; shown as "removed" in history |
| S13 | Revoked paid licence | Stays in the log, flagged for credit |
| S14 | Re-sharing after a revoke | Normal rules apply; licence not reactivated |
| S15 | Free image downloaded, then org unshared or price set | Still accessible |

## Seed data
- **Fjordkaffe AS:** 2 contacts, to show shared licences.
- **Nordlys Sykkel AS:** 1 contact.
- **Gammel Kunde AS:** inactive.
- The README lists the seed passwords.

## Later (not v1)
- **Accounts and roles:** "view as client" (admin read-only preview of an org's dashboard), client-admin role, contacts in several orgs, sub-orgs, emailed setup links and notifications, 2FA.
- **Licensing:** editorial, private and free-use licences with full texts, time-limited licences, price tiers, per-org prices.
- **Purchasing:** spending limits and approvals, refunds and credits in the app.
- **Other:** permanent file deletion, merging orgs, share links without an account, access requests from clients.
