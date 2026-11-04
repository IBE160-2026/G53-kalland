# Citation check

Fresh-context check of `research.md`, run 2026-11-04. Budget: 15 tool calls. Eight sources were re-fetched through WebFetch, which passes pages through a summariser, so a mismatch in wording is a flag and not proof of error.

**Result in brief.** No claim was shown to be false, and no mismatch is rated high. All 8 re-fetched sources supported the quotes checked. The problems are dropped hedges, unlabelled inference and a few attributions that the evidence seen does not support.

**Coverage limit, read this first.** The last digest search returned 33 KB and the tool saved it to a file, showing only the first 2 KB. Reading the rest would have gone over the budget, so it was not read. Several planned digest comparisons did not happen, including the § 104 quote. They are listed under "Not checked". The unread output is at `/Users/marthekalland/.claude/projects/-Users-marthekalland-Dev-g53-kalland/238941f7-019f-4a06-913a-a5eb762b9fcc/tool-results/bj51mtn1h.txt`.

**Severity.** Medium means the wording overstates or misattributes on a point in the Executive summary, a Recommendation's basis, or a major open question. Low means a local wording or labelling fix.

## Mismatches

### Medium (10)

| # | Report section | Sentence | [n] | What the source or digest actually says | Suggested action |
|---|---|---|---|---|---|
| M1 | Executive summary, finding 2; Legal basis and withdrawal | "If consent is withdrawn, the agency cannot switch to another basis" | [30], [29] | The [30] wording is confirmed by re-fetch: "Virksomheten kan ikke bytte behandlingsgrunnlag hvis samtykke trekkes tilbake eller samtykke ikke var gyldig innhentet." But `privacy-gdpr-r2-2.md` line 51 records that the consent subpage [29] "addresses a later switch to legitimate interests (sentence truncated in my extract)". That qualifying sentence was never read, and the report does not disclose it. | Read the sentence on [29], then keep the claim or qualify it. Until then, add a hedge. |
| M2 | Anthropic and transfers | Platform docs say conversation content "is not retained by default"; "The two pages ... read differently" | [38] | `privacy-gdpr-r2-1.md` gives the full sentence: "...is not retained by default; the exception is Covered Models, which require 30-day retention", and adds "It may describe feature-level storage only." The report cuts the quote before the exception and drops the possible explanation, so the conflict looks sharper than the digest supports. [38] was compared with the digest, not re-fetched. | Restore the rest of the quote and the digest's hedge. "State 30 days" can stay. |
| M3 | Contrary evidence | "the regulator's framing points toward private extranets being out of scope" | [53] | Re-fetch: the page does not say explicitly whether private extranets are covered. This is red team 3's reading, and its digest (line 48) says of the blog post: "Open the Uutilsynet blog post above ... This verdict depends on them." The Scope section correctly attributes it to the red team, but this bullet states it as what the regulator's framing does. | Add "red-team reading (inference)". The page itself is silent. |
| M4 | Portrait right | "The claim that the sharer carries the burden of proof comes from Datatilsynet's guidance on sharing images" | [24] | A search of all non-lead digests for "burden of proof" or "bevisbyrde" returned only `redteam-2.md` lines 37 and 85: "no support from this run", to be "presented as unverified". No digest hit ties it to [24] under those terms, though other wording (for example "bevise") was not searched. Row 24 also lists it at High. | Check [24] directly. If the page does not say it, remove the attribution and the row's mention. |
| M5 | Anthropic and transfers | "That statement appears to predate the ruling." | [42] | `privacy-gdpr-r2-1.md` lines 33 to 35: the statement is about "the PCLOB removals", and "the search summary said this page refers to the June 2026 Supreme Court ruling, which conflicts with its 2025 URL. Treat that link as unconfirmed." The report keeps one side of a conflict the digest left open, and row 42 does not flag it. | Say the dating is unconfirmed and conflicting, and that the statement addresses the PCLOB removals. |
| M6 | Executive summary, finding 2; Portrait right, first bullet | "exceptions that turn on the image's content"; "The exceptions turn on the image, not the business model." | [12], [24] | This is red team 2's characterisation (`redteam-2.md` line 35), not wording from a source. The report's own list contradicts the absolute form: (d) turns on use as advertising for the photographer's business and on the person not objecting, and (e) turns on other sections. | Change to "mostly turn on" and label as a reading, not a statement by [12] or [24]. |
| M7 | Alt text, title fallback | A descriptive title may pass for art-like images, because W3C's sensory exception names "works of visual art" | [58] | `redteam-3.md` line 119: "this is the 2.1 Understanding page, and the 2.0 wording was not fetched separately". The report applies this to the private track, which it says is WCAG 2.0, and does not carry the limit over. Row 58's "High" hides it. | Add the limit to the text and row 58, or fetch the 2.0 page. |
| M8 | Copyright; Contrary evidence | Hamburg rejected the German equivalent of § 4 "because the copy was not deleted automatically"; an API call with automatic deletion "is closer to the temporary-copy exception than the LAION download was" | [19] | `redteam-1.md` lines 74 and 85: the copy was "not transient or incidental, not deleted automatically, dependent on LAION's involvement", so the report reduces several reasons to one. The link between § 44a UrhG and InfoSoc Art. 5(1) is marked "by background knowledge". Attribution is marked "same, or ipkitten (attribution inferred)", which row 19 does not show. The "closer to" comparison is unlabelled inference, and no source makes it. | List the court's reasons in full, label the comparison as inference, note the attribution in row 19, and consider lowering Medium-high. |
| M9 | Contrary evidence, DPIA bullet | "the Norwegian list examples do not resemble metadata generation" | [27] | The bullet sits under the red-team pass, but `redteam-2.md` line 20 gives a different reason: "'Probably required' could not be supported, because the Norwegian list was not retrieved." The comparison with the list comes from elsewhere in the research and is itself an inference. | State the red team's actual reason, and label the list comparison as inference. |
| M10 | Staff pages; Scope | "Pages clients can reach are not staff pages, even when staff write the content."; "the only exception is for public bodies" | [51] | Re-fetch of § 2: "med mindre annet fremgår av forskriften" names no public-body exception, so "only exception" is a reading from § 4b. `accessibility-r2-1.md` line 58 and `redteam-3.md` line 31 record a text argument that client staff use the portal at work, which "could support exclusion", though both lean against it. The report states the opposite flatly with no citation, and leaves this argument out of the "away from coverage" table. | Label both as inference and add the client-staff argument to the Scope table, marked weak with no authority. |

### Low (13)

| # | Report section | Sentence | [n] | What the source or digest actually says | Suggested action |
|---|---|---|---|---|---|
| L1 | Executive summary, finding 1 | "Uploading a photographer's image makes a copy" | [12], [13] | The citations support the text-and-data-mining clause. Applying § 3 to an API upload is inference, and the body says no Norwegian authority addresses it. | Add "(inference from § 3)". |
| L2 | Alt text | "Uutilsynet's only AI remark is..." | [68] | `accessibility-r1-1.md` lines 124 and 189: "The only AI statement **found**", from a domain-limited search and one page, seen as an excerpt. | Change to "the only AI remark found". |
| L3 | AI Act; row 4 | "a Norwegian firm can be in scope"; row 4 "Not in force in Norway before mid 2027" | [4] | Re-fetch: the article is about "a Norwegian asset manager", with asset-management examples. The authors' wording is "rather unlikely before mid 2027". The body keeps that hedge, but the row hardens it. | Note the article's sector, and restore the hedge in row 4. |
| L4 | AI Act, Art. 4 | "it does not require 'any specific level of AI literacy of any individual'. A short staff note would be enough readiness." | [9] | `ai-on-images-r2-1.md` line 49, cut off at 300 characters when viewed: "does not require providers or deployers to guara[ntee]...". The report seems to drop "to guarantee", and the duty to take measures remains. "Would be enough" is unlabelled inference. | Quote in full and label the second sentence as inference. |
| L5 | Copyright, contract bullets | "A photographer's claim over an upload is therefore the agency's own risk." | [16] | Correct but understated. Re-fetch also shows K.2(a): the customer must defend Anthropic against claims related to "Inputs or other data provided by Customer". | Add K.2(a), since it strengthens the point. |
| L6 | Copyright | "photographers' organisations are asking the Storting to postpone it" | [15] | Row 15 names one body, Norges Fotografforbund, in an advocacy document. | Use the singular, or cite the others. |
| L7 | Portrait right | "Lower courts have applied the predecessor to model photographs" | [48] | Row 48 is one judgment, Oslo tingrett 2013, excerpt only, not read. | Use the singular, or cite more. |
| L8 | Portrait right, third bullet | "the children could be distinguished by clothing, hair and shoes" | [46] | `privacy-gdpr-r2-2.md` line 82 says "the individuals could be told apart". Other digests mention one child. The quote "Ingen ansikt vises" and NOK 400,000 are confirmed by the digest. | Check the decision and use its wording. |
| L9 | Anthropic and transfers | "deleted within 30 days"; "This closes the check named in RG-3." | [37] | Re-fetch confirms 30 days, 2 years and 7 years. The article also has exceptions for customer-controlled storage (Files API) and agreements, and the digest adds legal compliance. "Closes the check" sits badly with "One discrepancy remains", and with RG-3 asking Anthropic which statement is right. | Mention the exceptions and soften "closes". |
| L10 | Source appendix, rows 26, 27, 69 | Row 26 "strict no-risk reading"; row 27 "fine level" | [26], [27], [69] | No sentence citing [26] uses a no-risk reading; the text cites [49] for it. The fine sentence cites [69], not [27]. | Tidy the row descriptions. |
| L11 | Source appendix, rows 39 and 40 | Row 39 "High for the position", row 40 "High for the history" | [39], [40] | Both rows rest on excerpts, yet carry a High label, and the [39] sentence reads as settled. | Lower to Medium-high, or open the pages. |
| L12 | Anthropic and transfers; RG-3 | "*Trump v. Slaughter* (mid-2026) removed protections for FTC commissioners; law firms report..." | [41] | `privacy-gdpr-r2-1.md` line 22 says "reportedly". Line 143 says the analyses "should be opened". Row 41 lists one firm while the text says "law firms" (the digest also has Skadden, which has no row). RG-3 builds a required step on this. | Add "reportedly", add a Skadden row, or open the pages. |
| L13 | Legal basis and withdrawal | "for situation images Datatilsynet suggests a balancing of interests" | [24] | A search of non-lead digests for "situasjonsbilde" returned nothing. The English-term search was in the unread output, so this is unresolved rather than a confirmed gap. | Check against [24] or the saved output. |

## Checked and fine

**Internal arithmetic**
- 13 conclusions (A to M), 12 weakened, 1 survived (J), none overturned. This matches the verdicts in `redteam-1.md`, `redteam-2.md` and `redteam-3.md`.
- Executive summary counts match the Recommendations: 2 v1 changes (V-1, V-2), 5 tightened gate items (RG-3, 4, 5, 6, 9), 2 new items (RG-14, RG-15).

**Re-fetched**
- [2]: "under scrutiny", no Joint Committee decision listed.
- [4]: "rather unlikely before mid 2027", dated 2026-08-03 (see L3).
- [16]: L.1, K.3(c), B no training, output assignment "(if any)" conditional on compliance, date 2025-06-17 (see L5).
- [30]: "ett grunnlag per formål" and "kan ikke bytte behandlingsgrunnlag" (see M1).
- [37]: 30 days, 2 years, 7 years, covers the API, updated 2026-07-01 (see L9).
- [51]: §§ 2, 3 g, 4, 4b, 4e, 5, last changed 2023. Mostly seen as the summariser's paraphrase, with short quotes (see M10).
- [52]: 35 criteria, the 1.2.3 to 1.2.5 exclusion, login, B2B, "stor og ubestemd", internet banks, company size, extranet duties described for public bodies.
- [53]: "i teorien" sentence, extranet as defined and limited groups, one-way description, bought solutions identified with the public body (see M3).

**Digest or lead checks only**
- [7], [20], [36], and [23] for Art. 19: match `lead-checks-r2.md`, including quotes. [36] rests on a keyword search of a local extract, which row 36 discloses.
- [46]: amount, quote and Art. 6(1)(f) reasoning (see L8).
- [5], [6]: in force 27 July 2026, Annex III moved to 2 December 2027.
- [9]: the quoted phrase is present (see L4).
- [12]: §§ 79 and 105 only.
- [14]: § 50 d definition, seen as an excerpt.
- [18]: Kopinor, labelled low in the report.
- [25]: "kan være uheldig".
- [28]: "nesten uten unntak".
- [31]: "som den det gjelder er part i".
- [45]: "Salg i henhold til avtale".
- [54]: Helseplattformen sequence.
- [55]: five doctor avatars.
- [56], [57]: quotes match.
- [58]: F30 and F65 (see M7).
- [62]: consumer framing and the under-ten microenterprise exemption only.
- [67]: annulled on procedural grounds. The digest says "procedural and competence".
- [69]: fine level.
- [70]: the digest confirms the Norwegian Air Shuttle 2022/528 discrimination finding, not the general statement about § 18.

## Not checked

**The most important gap:** the § 104 quote, exceptions (a) to (e) and the life-plus-15-years term [12][24]. This is load-bearing legal wording, and it was neither re-fetched nor compared, because the comparison was in the unread output.

Not compared with a source or digest, for the same budget reason:
- [12]: §§ 3, 4, 23, 24, 67, 68.
- [1], [3], [8], [10], [11], [13], [15], [17], [21], [22].
- [23], except Art. 19.
- [24], other than as noted above.
- [26], [27], [29], [32], [33], [34], [35].
- [38], [39], [40], [41], [42] and [19]: digest lines only, no re-fetch.
- [43], [44]: only the red-team verdict line for the periods.
- [47], [48], [49], [50], [59], [60], [61], [63], [64], [65], [66], [68].
- [62]: "not in the EEA" and "EU sales" limbs.
- The § 4b standard wording, "EN 301 549 V3.2.1".

Out of scope: references to PRD items (FR, NFR, RG numbers), since project files other than the report and digests were not read.
