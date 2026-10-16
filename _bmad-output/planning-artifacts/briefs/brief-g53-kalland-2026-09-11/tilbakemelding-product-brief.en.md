# Feedback on the product brief

> English translation of [`tilbakemelding-product-brief.md`](tilbakemelding-product-brief.md). The Norwegian original from the course teacher is authoritative and is kept unchanged (D-008).

| | |
|---|---|
| **Group** | G53 – G53-kalland |
| **Product brief** | `_bmad-output/planning-artifacts/briefs/brief-g53-kalland-2026-09-11/brief.md` (commit 176a867), read together with `addendum.md` in the same folder |
| **Feedback from** | Course teacher in IBE160 (prepared with AI support) |
| **Date** | 2026-10-06 |

## Overall assessment

- **Good starting point with adjustments.** The group can move on and incorporate the points below.

**What is good:**

1. The problem is real and concrete: employees at a design agency spend time searching an unstructured image bank, and clients have to send email to get images they already have the rights to. That the agency will use the solution afterwards gives you access to real users and feedback.
2. The access model with two independent properties – visibility (public / restricted / internal) × price (free / one-time purchase) – is an elegant and testable choice. It is also good that the addendum documents that the model was corrected along the way, and that you are honest that AI-generated metadata is standard and not a competitive advantage.

**The most important changes:**

1. V1 is large for one person: CRM, DAM with AI metadata, duplicate control with hashing, versioning, purchases with a log, a client portal with two levels of branding, backup and tenant preparation. Choose the core flow and move the rest to later stages.
2. AI metadata requires an image API (a language model with image understanding), which costs money and requires a key. The brief does not say how the examiner can run the app without your key. Add a plan for a test mode or mock responses.
3. Two success criteria cannot be tested in the course: "meaningfully faster" (no baseline) and "can be extended later without a rewrite". Replace them with concrete, checkable criteria.

## Difficulty and feasibility

### Assessed difficulty

- **Hard**

**Comparable to:** The AI part alone resembles 6) To-do list with smart labels (easy) – AI suggests a title and keywords. But two user groups with login, per-image access control, purchases and file handling make the project clearly more demanding than 2) AI CV and application assistant (medium).

**Rationale:**

| Factor | Level (low / medium / high) | Comment |
|---|---|---|
| Domain logic – how many and how complicated are the rules and calculations that must be right? | Medium | Visibility × price decides what each client sees, can download and must pay for. The rules are few and clear, but must be right every time. |
| Data model – number of entities and relations between them | High | Tenant, client, image, version, visibility list, purchase, download and brand profile, with many-to-many relations. |
| Users, roles and login | High | Administrator and clients with separate portals and per-image access control. A bug here means clients see each other's images. |
| AI functionality in the app, e.g. calls to a language model, prompts in the code and handling of uncertain answers | Medium | One bounded AI feature (metadata on upload). Requires image understanding and handling of errors or poor suggestions. |
| Integrations and external services, e.g. APIs, payment and email | Medium | Language model API in v1. Tripletex is rightly postponed, and it is good that purchases are only logged and do not require a payment solution. |
| Real time, concurrency or several users affecting each other | Low | Little concurrency, but uploading a new version must not break the purchase history. |
| File handling, e.g. upload, PDF reading and export | High | Image upload, storage, download, perceptual hashing for near-duplicates, versions and backup of files and database. |
| Security and privacy | High | Per-client access control, and images can show people. The agency's real images cannot go into a public repo. |

**What the difficulty means for you:**

- _Hard:_ A hard project gives a greater chance of a top grade, but also greater risk. Define a minimal version that can surely be finished, and put the rest in clear stages afterwards. Here the minimal version is already described in your own success criterion about the end-to-end flow: upload → AI metadata → set visibility and price → the client sees and downloads or buys → the purchase is logged.

### Feasibility with BMAD and Claude Code

You will plan with BMAD (product brief → PRD → architecture → epics and stories) and implement with Claude Code. The assessment below takes into account that there must be time for this whole flow, and for testing, fixing and the README at the end.

| Question | Assessment (OK / risk / high risk) | Comment |
|---|---|---|
| **Time and scope** – can v1 realistically be finished and stable during the semester, with time for several iterations? | Risk | The core flow is realistic. Everything in the "In" list at once, for one person with the BMAD flow on top, hardly is. Versioning, near-duplicates, branding and backup should wait. |
| **The BMAD flow** – is the brief concrete enough for the PRD, architecture and stories to be created without big gaps, and will the number of stories be manageable? | OK | The brief and addendum are concrete, with a data model for access and clearly postponed features. It will be easy to create the PRD and stories. |
| **Suited to Claude Code** – does the solution use a common, well-documented tech stack that Claude Code handles well, or does it require niche technology, special hardware or a lot of manual configuration? | OK | A web app with upload, login and a database suits Claude Code well. Stick to one common stack and local file storage. |
| **Control of the AI's work** – can the group itself judge whether the code does the right thing? If the domain requires knowledge the group lacks, e.g. advanced calculations or professional rules, quality assurance is hard. | OK | You know the domain from the agency and can judge yourselves whether access rules and metadata are right. The access rules should still be tested systematically. |
| **Testability** – are there clear rules and expected results that tests can be written against? | OK | Visibility × price gives a clear test matrix (e.g. client A does not see an image restricted to client B). Duplicate control can be tested with known files. |
| **Runnable for the examiner** – can the app be run locally following the README, without the group's keys, paid accounts or own infrastructure? | Risk | Not described. The examiner needs test users (admin and two clients), fictional or freely licensed images and a way to run without your API key. |
| **Dependencies and costs** – does the solution require paid APIs, e.g. language models, and is there a plan for cost, test mode or mock data? | Risk | Image understanding via a language model costs per image. With ~500 test images this becomes noticeable. Plan a mock mode and allow metadata to be filled in manually when AI is not available. |

**Conclusion on feasibility:**

- **Feasible with adjusted scope.** See the suggestions below.

**Suggestions for adjusting scope or difficulty:**

1. V1: client register, upload with AI metadata and manual editing, exact duplicate control (file hash), visibility × price, client portal with search, download and purchase with a log. Move versioning, near-duplicates (perceptual hash), per-client branding and automatic backup to stage 2.
2. Keep `tenant_id` in the data model if it is simple, but do not spend time on multi-tenant preparation beyond that. It gives little visible functionality in v1.
3. Add a mock mode for AI metadata and a set of freely licensed sample images in the repo, so that both tests and the examiner can run the whole flow without a key.

## Why the product brief matters for the portfolio

The product brief is the starting point for the PRD, architecture, stories and finally the code. Part 1 of the portfolio is assessed among other things on whether the examiner can follow a traceable path from plan to finished app. It is also assessed on whether the app does what you have described, whether it is tested, whether it is well designed, and whether it can be run following the README. An unclear, too large or too small brief makes all of this harder later. It is much easier to fix now than late in the semester.

## 1. Review of the parts of the brief

| Part of brief | Status | Comment |
|---|---|---|
| Executive Summary – is it clear what the app is and what problem it solves? | OK | Clear: an internal image bank with AI metadata and a closed client portal for download and purchase. |
| The Problem – is the problem concrete, with real situations and users? | OK | Concrete and based on an actual agency. Honest that there is no baseline for time spent. |
| The Solution – does the solution describe the user experience, not just technology? | OK | Describes what employees and clients do, with good examples of the access model. The section on tenants is more architecture than user experience and can be moved to the addendum. |
| What Makes This Different – is the assessment honest and realistic? | OK | Honest and well supported with a comparison against Bynder, Brandfolder, Canto and Cloudinary. |
| Who This Serves – are the primary users clear, and do we know what they need? | OK | Clear primary user (the agency's employees) and secondary user (clients), with needs described. Avoid naming people in the brief since the repo is public. |
| Success Criteria – can the criteria actually be checked or tested? | Adjust | The end-to-end criterion and "the client manages without email" are good. "Meaningfully faster", "defensible as an IBE160 deliverable" and "can be extended without a rewrite" cannot be tested. Add e.g. "a client never sees an image restricted to another client" and "uploading an identical file is rejected with a message". |
| Scope – is it clear what is in the first version and what is not? | Adjust | Very clear "In" and "Out", with a rationale for each postponed item. "In" is still too large for one person; see the suggestions above. |
| Vision – does the vision fit with the rest without inflating the scope? | OK | Realistic and kept separate from v1. |

## 2. Starting point for part 1 of the portfolio

The points follow the criteria in the grading guide for part 1. The weights in parentheses show how much each criterion counts in part 1.

| Criterion in part 1 | What the brief should enable | Status | Comment |
|---|---|---|---|
| **1. Process and AI governance** (30 %) | A brief precise enough for the PRD and stories to be built directly on it, so that requirements can be traced from brief to code. | OK | The brief is precise enough to build the PRD and stories on. The history so far has only one commit for BMAD and the brief; continue working in smaller, regular commits. |
| **2. Functionality and scope** (20 %) | Realistic scope for the group and the semester: a clear core flow that can be finished and stable, and enough content to show real functionality. | Adjust | Clear core flow with a lot of real functionality. Narrow "In" so that the core flow becomes stable. |
| **3. Quality assurance and testing** (15 %) | Success criteria and features concrete enough to become test cases. | Adjust | The access model and duplicate control give good test cases. Make the success criteria checkable, and test the access rules systematically. |
| **4. Design and user experience** (10 %) | Clear users and usage situations that the design can be built around, preferably with the most important screens or flows sketched. | OK | Two clear user groups and a real user to test the design on. Sketch the upload flow and the client portal early. AI-generated alt text is a good contribution to universal design. |
| **5. Code quality and architecture** (10 %) | Technology choices that are justified and no more complex than the app needs. | Adjust | The modular architecture and tenant preparation are well thought out, but may make v1 more complex than necessary. Keep it simple. |
| **6. README and runnability** (10 %) | A solution others can run locally without paid accounts, and without access to the group's own services and keys. | Adjust | Plan local running with test users, sample images, `.env.example` and a mock mode for AI. |
| **7. Repository tidiness** (5 %) | A plan for where secrets, test data and documentation will live. | Adjust | The agency's real images and client data must not go into the public repo. Uploaded files and API keys must be kept out of git. |

## 3. Next steps for the group

1. Narrow "In" to the core flow, and move versioning, near-duplicates, per-client branding and backup to a list of later stages.
2. Decide which language model will create metadata, and describe the cost, mock mode and how the examiner runs the app without a key.
3. Replace the untestable success criteria with checkable criteria for access, duplicates and the purchase log.
4. Move on to the PRD, and add test users and freely licensed sample images early.

Update the product brief in the repo when you have made the changes, so that the history shows how the plan evolved. That is part of the process the examiner looks for.
