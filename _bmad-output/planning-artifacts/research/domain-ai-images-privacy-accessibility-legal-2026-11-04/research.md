---
title: 'Domain research: legal aspects of AI on images, privacy/GDPR and accessibility'
type: 'domain'
topic: 'Legal aspects of AI on images, privacy/GDPR and accessibility (Norway, EU/EEA)'
decision: 'Turn the unverified legal items in the 2026-11-04 PRD into confirmed requirements, and decide what must change in v1 versus at rollout'
source: 'native-run'
status: complete
claims_verified: 24
claims_unverified: 6
claims_disputed: 3
claims_overturned: 1
preset: 'standard'
validation: 'high'
created: '2026-11-04'
updated: '2026-11-04'
---

# Domain research: legal aspects of AI on images, privacy/GDPR and accessibility

**Decision this research serves:** Turn the unverified legal items in the 2026-11-04 PRD into confirmed requirements, and decide what must change in v1 versus at rollout.

**This is research, not legal advice.** Items marked "for the reviewer" need someone legally competent, as the PRD's rollout gate already says.

**How to read this.** *Inference* marks our own reasoning from the cited text. *Opened* and *excerpt* show how a source was seen: fetched, or only in a search summary. The *red team* is an adversarial check of 13 conclusions. The *verifiers* were second checks of the claims. The PRD is [`prd.md`](../../prds/prd-g53-kalland-2026-11-04/prd.md).

## Executive summary

**What to do.** v1 needs no legal rework, because it runs on sample data only. Make two small changes now: a prompt rule (V-1) and clearer wording in NFR-5 (V-2). Before rollout, tighten RG-3, RG-4, RG-5, RG-6 and RG-9, and add two new items on market scope and AI governance. Nothing found blocks the product; the work is paperwork, rights records and a few decisions that have to be made first.

**The three findings that drive this:**

1. **Rights in the image are the real AI risk today, more than the AI Act.** The AI Act is not in force in Norway [2][4], while copyright and GDPR already apply. Uploading a photographer's image makes a copy (inference from åndsverkloven § 3), and Norwegian law has no text-and-data-mining exception yet [12][13]. Anthropic's terms make the customer warrant that it holds the rights to its inputs, and the indemnity excludes claims caused by inputs [16]. So photographer agreements should expressly permit AI processing.
2. **Consent must be recorded per image.** A photo of a person may not be reproduced or shown publicly without consent, subject to exceptions that mostly turn on the image's content [12][24]. A B2B licence cannot serve as the legal basis for the person pictured, who is not a party to it (inference from [31]). If consent is withdrawn, the processing must stop, and Datatilsynet says switching to another basis afterwards breaches the fairness and transparency principles [29][30].
3. **The accessibility floor is lower than the PRD's target, but "warn and publish" has a legal cost if the portal is covered.** Private businesses must meet WCAG 2.0 A and AA, 35 criteria [51][52], so NFR-5's WCAG 2.1 target exceeds it. Whether an invitation-only portal is covered at all is unresolved [52][53]. If it is, an image published with no alt text or with "Untitled image" fails on the published page, and a warning to staff does not change that (inference from [57][58]).

**Biggest caveat.** No authority we looked at answers three questions: whether an invitation-only B2B portal is in scope, what withdrawal does to a licence already sold, and whether analysing an image through an AI API is a permitted use. Treat these as unsettled, not as answered. Much of the evidence is also regulator guidance or law-firm commentary rather than court decisions, and some of it was seen only as search excerpts; the source table marks which.

## Dimension 1: AI on images

### Copyright

**Anthropic's Commercial Terms decide the practical answer, whatever the statute says.**

- The customer warrants it "has all rights and permissions required to submit Inputs" (L.1) [16].
- The IP indemnity excludes claims arising from "Inputs or other data provided by Customer" (K.3(c)), and the customer must defend Anthropic against claims related to its inputs (K.2(a)) [16]. A photographer's claim over an upload is therefore the agency's own risk.
- "Anthropic may not train models on Customer Content" (B) [16], but nothing in åndsverkloven § 3 turns on training [12].
- § 67(2) says an author is not taken to have transferred a wider right than the agreement clearly expresses, and § 68 limits onward transfer [12]. Old photographer agreements are unlikely to cover AI processing (inference).

Rightsholders are already treating AI use as licensable: Kopinor reportedly licenses AI input in limited cases [18] (low confidence, excerpt).

**The statute.** § 3 of åndsverkloven covers temporary and permanent copies, and § 23 gives a photographer the exclusive right to make copies [12]. § 4 exempts temporary copies that are an integral part of a technical process, unless the copy has independent economic significance [12]. No Norwegian authority addresses an API upload, so the position is **unsettled rather than prohibited**. The Hamburg LAION court rejected the German temporary-copy exception because the copy was not transient or incidental, was not deleted automatically and depended on LAION's own involvement [19]. That suggests provider retention matters (inference). The case concerned web scraping for training, so it is only an analogy.

**The text-and-data-mining exception is not available yet.** The current act has no such exception [12], and Prop. 41 LS, which would add §§ 50 d to f, is still in committee [13]. The rendered page did not show the dated timeline, so a very recent step could be missed. The proposed definition has no volume threshold ("enhver automatisert analytisk metode") [14], so one image could arguably fall within it, but rightsholders could reserve their works against the exception [14], and Norges Fotografforbund, among others, is asking the Storting to postpone it [15]. **If this bill passes, this section changes.**

### Who owns the metadata

**Do not promise clients exclusive rights in AI metadata.** Anthropic assigns its rights in outputs "(if any)", conditional on compliance with the terms [16]. Purely AI-generated text likely has no copyright, since there is no human author [17] (one Norwegian law-firm source, excerpt). Staff edits may be protected, but only those contributions. § 24 can protect a collection where gathering, checking or presenting the content is a substantial investment [12]; whether generated metadata qualifies is untested.

### Sensitive inference

**Practical reading (medium confidence):** describing what is visible is defensible, and asserting a protected attribute is not. "A person using a wheelchair" sits on the EDPB's safe side (examples below). "Muslim woman", an ethnicity label or a diagnosis does not. Apparent age is not an Art. 9 category.

Photographs are not automatically special-category data: Recital 51 treats them as biometric data only when processed by specific technical means allowing unique identification [23]. The European Data Protection Board (EDPB) gives two examples that point in different directions, both about video and so an analogy for stills:

- "Video footage showing a data subject wearing glasses or using a wheel chair are not per se considered to be special categories of personal data" [20].
- "if the video footage is processed to deduce special categories of data Article 9 applies" [20].

The Court of Justice of the EU has since read Art. 9 broadly. C-184/20 covers data that indirectly reveals a sensitive attribute [21], and commentary on C-21/23 says the controller's aim and the inference's accuracy are irrelevant [22]. Those judgments were read only through law-firm summaries. **Whether incidental inference triggers Art. 9 is disputed** between the EDPB's purpose test and that commentary. No source applies any of this to AI image captions, and no enforcement in this area was found, though the search was thin.

### AI Act

The AI Act is not in force in Norway. EFTA lists it as "under scrutiny" with no Joint Committee decision [2], and a Norwegian law firm wrote in August 2026 that entry into force is "rather unlikely before mid 2027" [4]. A press report says the minister plans a consultation in autumn 2026 and a bill in spring 2027 [3]. That timing was seen only in a search excerpt, and no government page confirmed it (low confidence).

In the EU, the Omnibus, Regulation (EU) 2026/1744, entered into force on 27 July 2026 and moved Annex III high-risk duties to 2 December 2027 [5][6].

**Serving only Norway is the condition that matters.** Art. 2(1)(c) covers third-country providers and deployers "where the output produced by the AI system is used in the Union" [7], and BAHR, writing for asset managers, reads this to mean a Norwegian firm can be in scope with no EU establishment [4]. One EU client receiving AI-written metadata may be enough. This is a reading of the text; no authority applies it to image metadata.

**Risk class.** No source classifies metadata or alt-text generation. It matches no prohibited or high-risk example the Commission or Nkom gives, so minimal risk is the likely answer (inference, medium), and minimal-risk systems have no specific rules [1][5]. Two duties are not tied to risk class:

- **Art. 4, AI literacy,** binds providers and deployers. As amended by the Omnibus, the duty to take measures remains, but it does not require providers or deployers "to guarantee any specific level of AI literacy of any individual" [9]. A short staff note looks like enough readiness (inference).
- **Art. 50(2), machine-readable marking,** binds providers of systems generating synthetic text, unless the system does not substantially alter the input or its semantics [11]. An agency using an API under its own authority fits "deployer" [8]. Whether a portal offered to clients makes it a "provider" is unresolved (low confidence).

Art. 50(4) very likely does not apply. It covers text informing the public on matters of public interest, and it excepts human-reviewed text [11].

Art. 5(1)(g) bans biometric categorisation of individuals to infer race, religion and similar attributes, and it carves out "labelling or filtering of lawfully acquired biometric datasets, such as images" [10]. The carve-out's scope is ambiguous, so it should not be treated as a safe harbour.

## Dimension 2: Privacy and GDPR

### Portrait right

Åndsverkloven § 104: "Fotografi som avbilder en person, kan ikke gjengis eller vises offentlig uten samtykke av den avbildede, unntatt når":

- (a) the image has current and general public interest;
- (b) the person is less important than the main content;
- (c) it shows gatherings, outdoor processions or events of general interest;
- (d) it is shown as advertising for the photographer's business and the person does not object; or
- (e) §§ 33 or 37 apply.

Protection lasts for life plus 15 years [12][24]. The statute requires neither written consent nor a fee clause, despite what template sites claim [65].

Three qualifications from the red team:

- **The exceptions mostly turn on the image, not the business model** (the red team's reading). Datatilsynet separates portrait images, where the people are the main subject, from situation images, where the activity is [24]. An image where the person is incidental may need no consent for some uses, so a flag saying only "shows identifiable people" is too blunt.
- **Who carries the duty is open.** The text targets public reproduction or display, so the licensee may be the one who breaches it. Whether "offentlig" also qualifies "gjengis" was not resolved. Neither point should be relied on: Datatilsynet expects consent for portrait images even when they are only passed on [24], and GDPR applies separately.
- **Identifiable does not mean a visible face.** Datatilsynet fined Coop Finnmark NOK 400,000 over a clip in which "Ingen ansikt vises", where the children could be distinguished by clothing, hair and shoes [46]. That was surveillance footage, so it is an analogy.

§ 105 adds a separate rule: the author cannot exercise rights in a commissioned portrait without the commissioner's consent [12]. Breaching §§ 99 to 107 can bring fines or up to one year in prison (§ 79) [12]. A 2013 Oslo district court case applied the predecessor of § 104 to model photographs and reportedly required active, informed consent [48] (excerpt, not read). No Supreme Court ruling surfaced.

Datatilsynet's guidance says that in a conflict "er det den som har delt bildene eller filmen som må bevise at et gyldig samtykke virkelig er gitt" [24]. The red team found no statute behind this, but it makes consent records the obvious precaution.

### Legal basis and withdrawal

Portrait images need consent, and for situation images Datatilsynet suggests a balancing of interests [24]. Businesses must choose one basis per purpose [30], and legitimate interest needs a documented balance [32]. Art. 6(1)(b) covers only a contract "som den det gjelder er part i" [31], so a B2B licence does not cover the person pictured, though a model release with that person might (inference).

**Withdrawal.** Art. 7(3) allows withdrawal at any time and protects processing before it [23]. Normally the data must then be deleted [29]. The business "kan ikke bytte behandlingsgrunnlag" afterwards [30], and trying to switch to legitimate interests breaches the fairness and transparency principles and can be a serious violation [29]. Art. 19 requires telling each recipient about erasure unless that is impossible or disproportionate [23], which makes licensees' contact details and licence terms relevant.

**Unresolved.** No source addresses what happens to a licence already sold, whether a licensee may continue or newly publish, or whether a § 104 consent in a paid release can be withdrawn on GDPR terms. Art. 7(3) covers GDPR consent only, and past use only. This is the largest open question for the licensing portal. For the reviewer.

### Children

**Whether both guardians must sign was not answered** by any source we read.

Personopplysningsloven § 5 sets 13 as the age for consent to information society services under Art. 8 [35][23]. On its wording it does not set an age for images of a child held by an agency (inference, high on text). Datatilsynet says guardians consent for children who cannot validly consent, and its 2025 page sets no age [24]. Its 2020 guidance for schools draws a line at 13 for involving the child, and says commercial use "kan være uheldig" [25]; that guidance is written for another sector and is older. Children count as vulnerable data subjects when assessing whether a data protection impact assessment is needed [26].

### Roles

Datatilsynet's test is who decides the purposes and means [33], and the EDPB says decisions on purpose are always the controller's [34]. Neither mentions image agencies. Applied to the agency (inference, medium):

| Situation | Role |
|---|---|
| Holding client-owned images on the client's instructions | Agency is processor |
| Licensing on its own account, deciding what is licensed and to whom | Agency is controller, needing a basis for the disclosure |
| A licensee deciding its own use | Licensee is probably a separate controller |
| Anthropic under the DPA | Anthropic is processor to the agency [36] |

Copyright ownership is not the test, and one agency can hold both roles at once. Anthropic's safety retention may make it a controller for that data; no regulator statement on this point was found.

### Anthropic's terms

**Retention.** Anthropic's privacy article covering the API says inputs and outputs are deleted within 30 days, and flagged content is kept up to 2 years with safety scores up to 7 years [37]. Exceptions cover customer-controlled storage, other agreements, Usage Policy enforcement and legal compliance [37]. This answers most of the check named in RG-3. One discrepancy remains: Anthropic's platform docs say conversation content "is not retained by default; the exception is Covered Models, which require 30-day retention" [38]. That may describe feature-level storage only, but the two pages read differently, so **state 30 days, the longer figure, until Anthropic confirms**. Zero data retention exists by arrangement but excludes flagged content, and whether a small agency can get it is unknown [38].

**Data processing addendum (DPA).** The customer is controller and Anthropic processor, with breach notice within 48 hours, standard contractual clauses (SCCs) incorporated by reference, and 15 days to object to a new sub-processor [36]. **The DPA text contains no mention of the EEA, Norway or the Data Privacy Framework**; its SCC annex speaks of exporters "established in an EU Member State" [36]. That may be harmless, but ask Anthropic how the DPA applies to a Norwegian exporter. For the reviewer.

### Transfers to the US

The Data Privacy Framework (DPF) is available only if the importer is on the DPF list [39]. A manual search for "Anthropic" in the official participant list on 2026-11-04 gave no results [66], although unsourced third-party sites say it is listed. **Treat the DPF as unavailable and rely on the DPA's SCCs.**

The framework itself is under pressure:

- The General Court upheld it on 3 September 2025, and an appeal, C-703/25 P, was lodged [40]. A manual check of the case page on 2026-11-04 shows it still pending, with nothing new [72].
- *Trump v. Slaughter* (mid-2026) reportedly removed protections for FTC commissioners, and law firms report that the EDPB asked the Commission to assess the effect [41][71] (excerpts).
- Datatilsynet, writing about the removals from the US Privacy and Civil Liberties Oversight Board (PCLOB), says the decision still applies and advises businesses to "tenke beredskap og ha en plan" [42]. No Datatilsynet statement clearly later than the *Slaughter* ruling was found, and that page's date is unclear.

SCCs likely do not escape this, since a transfer assessment looks at the same US safeguards (inference). No authority was found holding such transfers unlawful, and the Italian fine against OpenAI was annulled on procedural grounds, so it says nothing on the merits [67].

### Duties and data handling

- **Data protection impact assessment (DPIA) screening.** Datatilsynet lists nine criteria, including vulnerable data subjects and innovative technology. Meeting two criteria creates a presumption that a DPIA is needed, one can be enough, and a decision not to do a DPIA should be justified and documented [26]. Children's images plus the AI pipeline plausibly meet two (inference). Whether a commercial API counts as "innovative" is undecided, and Datatilsynet's list example is health implants [27]. So: **document a screening, and expect a full DPIA if children's images stay in scope.** Failing to do a required DPIA can bring fines up to EUR 10 million or 2% of turnover [69].
- **Record of processing.** The under-250 exemption falls away if processing is "not occasional" [23], and Datatilsynet says "nesten uten unntak" every business keeps one [28]. A spreadsheet is enough [28].
- **Breach.** 72 hours to Datatilsynet where feasible [23]. Anthropic's 48-hour notice to the customer fits inside that [36], since the clock runs from when the controller becomes aware [23] (inference). The no-risk exception is read strictly [49].
- **EXIF and GPS.** Art. 4(1) names location data as an identifier [23], so GPS tied to an identifiable person is personal data (inference). No regulator statement on EXIF was found. Stripping location from client copies (FR-35) is well aimed.

### Erasure and bookkeeping

Bookkeeping material is kept 5 years, and agreements and some correspondence 3.5 years, after the end of the financial year [43]. **The bookkeeping-law change coming on 1 January 2027 does not alter these periods**; it adds that an electronic invoice must be kept in its original format [44]. An agreement an invoice relies on ("Salg i henhold til avtale") can become 5-year material [45], so **keep licence agreements for 5 years** when invoices refer to them. No source addresses licence agreements as such. Art. 17(3)(b) lets a legal retention duty override erasure [23], so accounting records stay, while the image and consent details are a separate question (inference).

### Privacy enforcement

The evidence is thin. Coop Finnmark is the closest Norwegian case [46], and the Spanish regulator's small fines (around EUR 9,000 to 10,000) for photos used without a basis are the closest commercial examples [47] (tracker summaries only). No action against a photo archive, an image-licensing business or any use of AI metadata was found.

## Dimension 3: Accessibility

### Scope

Likestillings- og diskrimineringsloven (LDL) § 18 and the universal-design regulation (forskrift om universell utforming av IKT-løsninger) cover private businesses' main ICT solutions aimed at or made available to users, supporting the business's ordinary functions [50][51]. Company size does not matter, and Uutilsynet says login, membership, registration or a customer relationship does not remove coverage [52].

**An invitation-only B2B portal is unresolved, with real arguments both ways:**

| Toward coverage | Away from coverage |
|---|---|
| B2B customers are covered "så lenge ho er stor og ubestemd" [52] | The regulation defines main solutions by reference to services "til allmennheten" (§ 3 g) [51] |
| What decides is "kven som i teorien kan ta i bruk løysinga" [53] | Uutilsynet separates open websites from solutions for closed, defined groups, which it calls extranets [53] |
| Internet banks count despite login [52] | Extranet duties are stated for public bodies only (§ 4b) [51][52] |
| | Client staff use the portal at work, and § 2 excludes ICT used in work [51] (weak, no authority, and the B2B passage in [52] suggests it is not read this way) |

The red team reads the regulator's framing as pointing toward a private extranet being out of scope. The verifier found the extranet label fits imperfectly, because Uutilsynet describes extranets as one-way internal communication, and this portal is transactional. No tribunal or supervision case on an invitation-only portal was found. If any business can become a client, the "in theory" test is a real risk to relying on the invitation gate. **Only Uutilsynet can settle this quickly, so ask it in writing.**

### Standard

The conflict the PRD addendum noted between WCAG 2.0 and WCAG 2.1 resolves into two tracks [51][52]:

| | Private business (§ 4) | Public body (§ 4b) |
|---|---|---|
| Standard | WCAG 2.0 A and AA, without 1.2.3 to 1.2.5, or equivalent | EN 301 549 V3.2.1, which brings in WCAG 2.1 |
| Accessibility statement | Not required (§ 4e binds public bodies) | Required |
| Intranet and extranet | Not stated | Covered |

A March 2026 supervision report applied the private track to a private company [55]. The regulation's last substantive change was in 2023 [51]. No planned change to WCAG 2.2 or to private-sector rules was found, though that is weak evidence [64]. All businesses must be able to document compliance (§ 5) [51], and § 19 a's active-effort duty also binds private businesses [50].

### Staff pages

§ 2 excludes ICT "som brukes ved utøvelse av arbeid", "med mindre annet fremgår av forskriften", and the only such carve-back found is the public-body intranet duty in § 4b [51]. Staff pages are therefore outside the regulation (inference from the text). Individual accommodation under LDL § 22 and the general active-effort duties remain [50][63]. Arbeidsmiljøloven was not checked. Pages clients can reach should not be treated as staff pages, even when staff write the content (inference).

### Public clients

The procurement duty sits on the buyer (anskaffelsesloven § 5n) [61]. When a public body buys a solution from a private party, Uutilsynet treats it as the public body's own, with public-body requirements applying [53]. So the stricter standard reaches the vendor through the contract. The vendor's own direct duty is § 4, which applies only if the portal is in scope.

Licensing images from a multi-client portal looks different from buying a solution, but no source addresses it (inference). A public client republishing an image carries its own duty for the alt text, so it may ask for alt text as a contract term (inference).

### Alt text

WCAG success criterion 1.1.1 is in the private minimum. Uutilsynet's test rule says meaningful images need a short alternative "som gir samme informasjon som bildet" [57], and "Alle bilder i HTML skal ha alt-attributt" [56]. Weak text is itself cited: the March 2026 report lists five doctor avatars with non-descriptive alt text [55].

For the PRD's fallbacks (inference, since no source names these strings):

- **No alt text:** fails (W3C F65) [58].
- **"Untitled image":** fails. F30 covers text that is not an alternative, such as placeholder text [58].
- **Title as alt text:** depends on the title. A filename-like title fails. A descriptive title may pass for art-like images, because W3C's sensory exception names "works of visual art" and needs only descriptive identification [58]. That wording comes from the WCAG 2.1 Understanding page, and the 2.0 text was not checked separately. That exception requires that the image does not primarily convey important information, and a buyer choosing what to license usually needs to know what an image shows, so it should not be assumed for a whole library.
- **A warning to staff:** changes nothing, since the test looks at the published page. Uutilsynet tells editors that a good tool does not help if the publisher does not use it [60].

**AI alt text is not banned.** The test is the result. The only AI remark found from Uutilsynet is that Facebook's automatic descriptions vary in quality and should be checked [68], and a 2026 W3C post reportedly warns that generated text should not entirely replace authored descriptions [59] (both excerpts). Staff review, which the PRD already designs in, is the right control.

### EAA

A pure B2B portal looks outside the European Accessibility Act, but the directive's own text was not read, so **the B2B limb is unconfirmed** (medium at best).

The Act is not in the EEA Agreement or Norwegian law [62], and this was still true in April 2026 [61]; later status is unconfirmed. Uutilsynet describes covered e-commerce as "retta mot forbrukarar" and says microenterprises with fewer than ten employees are exempt from service requirements [62]. It also says Norwegian businesses selling into the EU must follow the Act there [62]. Recheck if the portal sells to consumers or into the EU.

### Accessibility enforcement

Digitaliseringsdirektoratet, through Uutilsynet, can issue orders and daily fines [50][51]. An individual can also complain to Diskrimineringsnemnda, which treats a breach of § 18 as discrimination [70] (excerpt). Cases seen are broad public-facing services [54][55], and correction after an order appears to be the usual end point (inference from a small sample). The one daily-fine case found was closed quickly once the errors were fixed [54] (excerpt, no amount seen). No case on an invitation-only portal was found.

## Cross-dimension insights

1. **One EU client changes three answers at once.** It brings AI Act Art. 2(1)(c) into play [7], requires rechecking the EAA [62], and raises the AI Act Art. 50(2) question of whether generated text must be marked [11]. Serving only Norway is the assumption several conclusions rest on, so it should be a deliberate decision with a check attached.
2. **Better alt text and sensitive inference pull in opposite directions.** WCAG 1.1.1 wants text that gives the same information as the image [57], while GDPR Art. 9 penalises revealing protected attributes [21]. A prompt that bans all description of people would fail the first, and one that describes everything could fail the second. The EDPB's wheelchair example marks a workable line: describe what is visible, and do not assert what it implies [20]. That line is an analogy from video, so it needs review.
3. **Consent, photographer permission and AI permission fit one record.** Åndsverkloven §§ 67(2), 104 and 105, GDPR Art. 7 and Anthropic's L.1 warranty all ask the same question per image or image set: who agreed to what, for which use, and is it still valid. One rights record can serve all of them, which is cheaper than three features.
4. **Withdrawal only works if licensees can be reached.** GDPR Art. 19 [23] and the unresolved licensee question both depend on knowing who licensed what, and on licence terms that address it. FR-41's transaction log gives the first part, FR-25's revoke for all holders of an image gives a mechanism, and RG-6's licence text must supply the terms. FR-24's rule that licences survive later changes has no exception for withdrawn consent, so the rollout has to decide how the two fit.

## Contrary evidence

The red-team pass covered 13 conclusions. **None was overturned; one survived intact and 12 were weakened**, mostly by being too absolute. The one overturned item in the claims ledger is a separate template-site claim about § 104 [65]. The corrections are already in the text above. The strongest arguments that remain:

- **Against requiring photographers' permission (see Copyright):** an API call with automatic deletion looks closer to the temporary-copy exception than the LAION download was (red team's inference from [19]), and analysing an image may not be "use" of the work at all. Implied licence and the purpose of a commission were not tested. The recommendation survives because L.1 applies whichever way the statute falls [16].
- **Against building the portal as if covered (see Scope):** the page behind the red team's reading does not itself say private extranets are out of scope [53]. Building as if covered is a business choice, not a legal conclusion, and the PRD already makes it.
- **Against saying a DPIA is probably required (see Duties and data handling):** the red team found no support for "probably". The Norwegian list's examples also do not obviously resemble metadata generation (inference from [27]). The report therefore says "document a screening", with a full DPIA expected if children's images stay in scope. That expectation is a judgement call.
- **Against treating the DPA and SCCs as enough (see Transfers to the US):** this omits the transfer assessment, and the US basis moved in 2026 [41]. No authority found these transfers unlawful, but none blessed them.

## Recommendations

### v1 (by 2026-12-05): two small changes

| # | Change | Binds to | Confidence |
|---|---|---|---|
| V-1 | The versioned prompt tells the model to describe what is visible and not to state or infer ethnicity, religion, health, sexual orientation, political opinion or union membership, and not to identify anyone. | FR-12, FR-14 | Medium. Art. 9 applies today [20][21]; prompts are cheap to change now. The line drawn is an analogy from video. |
| V-2 | NFR-5 states the facts: the legal minimum is WCAG 2.0 for a private business and WCAG 2.1 is the project's own higher target. It also says the title and "Untitled image" fallbacks keep the page working but are not compliant text. | NFR-5 | High on the standard [51][52][55]. Medium on the fallbacks, which is inference [57][58]. |

**FR-19 stays as decided in the PRD.** Publishing with a warning is fine for v1, which runs on sample data and is not a real service. The legal cost arises only at rollout, so it belongs in RG-9.

### Rollout gate

RG-14 already exists in the PRD (Baseline), so the new items start at RG-15.

**RG-3 Data protection basis**
- Record roles per data set, and keep an Art. 30 record.
- Document a DPIA screening.
- Do a transfer assessment on the DPA's SCCs that covers *Trump v. Slaughter*, and have a plan if transfers stop.
- Ask Anthropic how the DPA applies to a Norwegian exporter, and which retention statement is right.
- State the 2-year flagged-content retention in the privacy notice.
- *Confidence:* high on the record and the 30-day text, medium on screening.

**RG-4 Erasure**
- Keep invoices 5 years in original format, and licence agreements 5 years when invoices refer to them.
- Notify recipients on erasure (GDPR Art. 19).
- *Confidence:* high on the periods; medium on licence agreements, which rest on a secondary source with no licence-specific authority.

**RG-5 People in images**
- Replace the yes/no flag with: person is the subject, person is incidental, or no person.
- Base "identifiable" on more than faces.
- Add § 105 consent for commissioned portraits.
- Choose one legal basis per purpose in advance, and record the consent's scope and duration.
- Have the reviewer decide on guardians and on children in commercial licensing.
- *Confidence:* high on the § 104 text, medium on the rest. Whether both guardians must sign is unresolved.

**RG-6 Rights and licence terms**
- Make photographer agreements expressly permit sending images to AI providers.
- Make licence terms state what happens if consent is withdrawn, and decide at rollout how that fits FR-24 and FR-25.
- Do not promise exclusive rights in AI metadata.
- Consider one rights record per image set covering RG-5 and RG-6.
- *Confidence:* high on Anthropic's terms and § 67(2). The withdrawal terms rest on an unresolved question.

**RG-9 Accessibility**
- Ask Uutilsynet in writing whether the portal is covered.
- Decide then whether FR-19 must block publishing without alt text, and whether to drop "Untitled image".
- Keep a § 5 compliance record.
- *Confidence:* high on the standard. Scope is disputed.

**New: RG-15 Market scope**
- Decide whether the portal serves EU clients. If it does, recheck the AI Act, including provider status and Art. 50(2), and the EAA.
- *Confidence:* medium. The Art. 2(1)(c) text is high, and its application to this use is inference.

**New: RG-16 AI governance**
- Name an owner to watch the Norwegian AI Act bill and Prop. 41 LS.
- Add a short staff note on AI literacy and on what must not be described in metadata.
- *Confidence:* medium. This is not a current legal duty in Norway.

### PRD edits

Applying any of this changes the PRD, so it needs a `D-xxx` entry in `docs/process/decisions.md`, per CLAUDE.md. Besides V-1, V-2 and the gate items above, make these two edits at the same time:

- **NFR-3** names paid tiers that do not train as the condition for real images. Training is not the only condition, so it should point to RG-3 and RG-6 together.
- **The addendum's "Rollout research" table** should be replaced with a link to this report.

## Open questions

Decided after this report: none of these will be pursued for v1, and the app follows the accessibility target whether or not the portal is covered (D-024 in `docs/process/decisions.md`).

| Question | What would answer it |
|---|---|
| Is an invitation-only B2B portal covered by § 18 and forskrift § 2? | A written question to Uutilsynet; Prop. 81 L (2016-2017) |
| What happens to a sold licence when consent is withdrawn? Can a § 104 consent in a paid release be withdrawn? | A lawyer; the unread model-photo judgments on nored.no |
| Does an API upload for analysis need the photographer's permission as a matter of law? | Ørstavik's article in NIR; the result in C-250/25 Like Company (not found this run); Prop. 41 LS preparatory works |
| Do the Anthropic DPA and its SCCs work for a Norwegian exporter? | Anthropic; the reviewer |
| Must both guardians sign? May a child's image be licensed commercially at all? | Datatilsynet's full children's guide (6 of 7 pages unread); barneloven § 30; Barneombudet |
| Does Art. 9 reach incidental inference? | C-21/23 and C-184/20 read directly; a statement from Datatilsynet, which gave none in searches |
| Is the agency a "provider" under Art. 50(2)? | Commission Art. 50 guidelines; only relevant if EU clients are chosen |
| Does the EAA cover B2B? | Directive 2019/882 Arts. 2 and 3 (EUR-Lex fetches came back empty) |
| Is there enforcement on inferring sensitive attributes from images? | A targeted search, not run this time |

## Source appendix

Evidence: **opened** means the page was fetched, usually through a summarising tool, so check quotes before formal use. **excerpt** means seen only in a search summary. **text read by lead** means the research lead read the extracted text directly. **failed read** means the page could not be read.

| # | Claim/finding it supports | Publisher | Pub date | Accessed | Confidence |
|---|---|---|---|---|---|
| 1 | Minimal risk has no specific requirements; regime being introduced via EEA (opened) | [Nkom](https://nkom.no/ki/i-et-notteskall) | 2026-06-10 | 2026-11-04 | Medium |
| 2 | AI Act "under scrutiny"; no Joint Committee decision (opened; page undated) | [EFTA EEA-Lex](https://www.efta.int/eea-lex/32024R1689) | undated, 2026 | 2026-11-04 | Medium-high |
| 3 | Autumn 2026 consultation, spring 2027 bill (excerpt; direct fetch 404) | [Teknisk Ukeblad/NTB](https://www.tu.no/nyhetsstudio/nye-eu-regler-for-ki-norge-og-eoes-henger-ennaa-langt-etter/127027) | not seen | 2026-11-04 | Low |
| 4 | "Rather unlikely" in force in Norway before mid 2027; Norwegian firm in scope if output is used in EU; written for asset managers (opened) | [BAHR](https://bahr.no/newsletter/asset-management-the-eu-ai-act-a-call-and-guide-to-implementation-for-norwegian-asset-managers) | 2026-08-03 | 2026-11-04 | Medium-high |
| 5 | Omnibus in force 27 July 2026; minimal risk rules (opened) | [European Commission](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) | 2026-10-19 | 2026-11-04 | High |
| 6 | Omnibus dates: OJ 24 July, Annex III to 2 Dec 2027 (opened) | [K&L Gates via National Law Review](https://natlawreview.com/article/eu-digital-omnibus-ai-enters-force) | 2026-07-31 | 2026-11-04 | High |
| 7 | Art. 2(1)(c) output used in the Union (opened) | [AI Act Service Desk, Art. 2](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-2) | 2026-07-27 | 2026-11-04 | High |
| 8 | Provider and deployer definitions (opened) | [AI Act Service Desk, Art. 3](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-3) | 2026-07-27 | 2026-11-04 | High |
| 9 | Art. 4 as amended (opened) | [AI Act Service Desk, Art. 4](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-4) | 2026-07-27 | 2026-11-04 | High |
| 10 | Art. 5(1)(g) and its carve-out (opened) | [AI Act Service Desk, Art. 5](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5) | 2026-07-27 | 2026-11-04 | High |
| 11 | Art. 50(2) and 50(4) (opened) | [AI Act Service Desk, Art. 50](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50) | 2026-07-27 | 2026-11-04 | High |
| 12 | Åndsverkloven §§ 3, 4, 23, 24, 67, 68, 79, 104, 105; no §§ 50 d to f (opened) | [Lovdata](https://lovdata.no/dokument/NL/lov/2018-06-15-40) | edited 2025-11-28 | 2026-11-04 | High |
| 13 | Prop. 41 LS in committee; timeline did not load (opened) | [Stortinget](https://www.stortinget.no/no/Saker-og-publikasjoner/Saker/Sak/?p=200243) | live page | 2026-11-04 | Medium-high |
| 14 | Proposed § 50 d definition and § 50 e reservation (excerpt) | [Kultur- og likestillingsdepartementet](https://www.regjeringen.no/no/dokumenter/prop.-41-ls-20252026/id3154279/?ch=4) | 2025-2026 | 2026-11-04 | Medium |
| 15 | Photographers ask the Storting to postpone Arts. 3 and 4 (opened; advocacy) | [Norges Fotografforbund](https://fotografforbundet.no/wp-content/uploads/Horingsinnspill-Prop.-41-LS-NFF.pdf) | 2026-06 | 2026-11-04 | High for the position |
| 16 | L.1 warranty, K.3(c) exclusion, B no training, output assignment (opened twice; primary contract) | [Anthropic Commercial Terms](https://www.anthropic.com/legal/commercial-terms) | 2025-06-17 | 2026-11-04 | High |
| 17 | AI output likely unprotected under Norwegian law (excerpt) | [Schjødt](https://schjodt.com/news/who-owns-the-code-copyright-and-ai-generated-output-in-the-workplace) | not seen | 2026-11-04 | Medium |
| 18 | Kopinor licenses AI input in limited cases (excerpt; attribution uncertain) | [IKT og skole](https://www.iktogskole.no/2026/02/27/kopinor-og-ki/) | 2026-02-27 (URL) | 2026-11-04 | Low |
| 19 | Hamburg court rejected the temporary-copy exception for LAION (excerpt; attribution inferred) | [Morrison Foerster](https://www.mofo.com/resources/insights/241004-to-scrape-or-not-to-scrape-first-court-decision) | 2024-10-04 | 2026-11-04 | Medium |
| 20 | Wheelchair example; "processed to deduce" (PDF text read by lead; video devices, so analogy) | [EDPB Guidelines 3/2019](https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_201903_video_devices_en_0.pdf) | 2020-01-29 | 2026-11-04 | High for the words |
| 21 | C-184/20: indirect disclosure falls under Art. 9 (excerpt; judgment not opened) | [Covington](https://www.insideprivacy.com/eu-data-protection/special-category-data-by-inference-cjeu-significantly-expands-the-scope-of-article-9-gdpr/) | 2022 | 2026-11-04 | Medium-high |
| 22 | C-21/23: controller's aim said to be irrelevant (excerpt; commentary) | [Baker McKenzie](https://connectontech.bakermckenzie.com/sensitive-data-under-the-cjeus-spotlight-practical-implications/) | not confirmed | 2026-11-04 | Medium |
| 23 | GDPR Arts. 4(1), 6, 7(3), 8(1), 17(3)(b), 19, 30(5), 33, Recital 51 (opened) | [EU Publications Office](https://publications.europa.eu/resource/celex/32016R0679) | 2016-05-04 | 2026-11-04 | High |
| 24 | Datatilsynet on images: § 104 quote, portrait and situation images, burden of proof, guardians (opened; text re-read by lead) | [Datatilsynet](https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bilder-pa-nett/) | 2025-09-16 | 2026-11-04 | High |
| 25 | Children's images: 13-year line, commercial use "uheldig"; school guidance, so analogy (opened) | [Datatilsynet](https://www.datatilsynet.no/personvern-pa-ulike-omrader/skole-barn-unge/bilder-av-barn-pa-nett/?print=true) | 2020-03 | 2026-11-04 | Medium |
| 26 | Nine DPIA criteria, presumption, children as vulnerable (opened) | [Datatilsynet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdering-av-personvernkonsekvenser/nar-er-risiko-hoy/) | 2023-07-27 | 2026-11-04 | High |
| 27 | DPIA list, health-implant example (opened) | [Datatilsynet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdere-personvernkonsekvenser/vurdering-av-personvernkonsekvenser/nar-ma-man-gjennomfore-en-vurdering-av-personvernkonsekvenser/) | 2023-07-27 | 2026-11-04 | High |
| 28 | Record of processing "nesten uten unntak"; no form requirement (opened) | [Datatilsynet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/protokoll-over-behandlingsaktiviteter/) | not captured | 2026-11-04 | High |
| 29 | On withdrawal, data normally deleted; switching basis breaches fairness and transparency (text read by lead) | [Datatilsynet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/om-behandlingsgrunnlag/samtykke/) | not captured | 2026-11-04 | High |
| 30 | One basis per purpose; no switching after withdrawal (opened) | [Datatilsynet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/om-behandlingsgrunnlag/) | not captured | 2026-11-04 | High |
| 31 | Contract basis requires the data subject to be a party (opened) | [Datatilsynet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/om-behandlingsgrunnlag/nodvendig-for-a-oppfylle-en-avtale/) | not captured | 2026-11-04 | High |
| 32 | Legitimate interest conditions (opened) | [Datatilsynet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/om-behandlingsgrunnlag/nodvendig-for-a-ivareta-legitime-interesser---interesseavveiing/) | not captured | 2026-11-04 | High |
| 33 | Controller test; both roles possible (opened) | [Datatilsynet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/behandlingsansvarlig-og-databehandler/hva-er-en-databehandler/) | not captured | 2026-11-04 | High |
| 34 | Purposes are the controller's decision; no image-agency example (opened by keyword search) | [EDPB Guidelines 07/2020](https://www.edpb.europa.eu/system/files/documents/2023-10/EDPB_guidelines_202007_controllerprocessor_final_en.pdf) | 2021-07-07 | 2026-11-04 | High |
| 35 | Personopplysningsloven § 5 (opened) | [Lovdata](https://lovdata.no/dokument/NL/lov/2018-06-15-38/%C2%A75) | 2018 | 2026-11-04 | High |
| 36 | DPA: roles, SCCs, 48 hours, 15 days; no EEA, Norway or DPF wording (text searched by lead) | [Anthropic DPA](https://www.anthropic.com/legal/data-processing-addendum) | 2025-02-24 | 2026-11-04 | High |
| 37 | 30-day deletion; flagged content 2 and 7 years (opened) | [Anthropic privacy article](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data) | 2026-07-01 | 2026-11-04 | High |
| 38 | "Not retained by default"; zero data retention terms (opened, first part) | [Anthropic platform docs](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) | not shown | 2026-11-04 | High for the words; reads differently from [37] |
| 39 | DPF available only for listed importers; covers EEA to US (excerpt) | [Datatilsynet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/overforing-av-personopplysninger-ut-av-eos/omrader-med-tilstrekkelig-beskyttelsesniva/) | not shown | 2026-11-04 | Medium-high |
| 40 | Latombe appeal C-703/25 P lodged (excerpt) | [Official Journal C/2025/6610](https://eur-lex.europa.eu/eli/C/2025/6610/oj) | 2025-12-22 | 2026-11-04 | Medium-high |
| 41 | *Trump v. Slaughter* and the reported EDPB request (excerpt) | [Faegre Drinker](https://www.faegredrinker.com/en/insights/publications/2026/9/trump-v-slaughter-implications-of-the-us-supreme-court-ruling-for-eu-us-data-transfers-and-the-data-privacy-framework) | 2026-09-17 | 2026-11-04 | Medium |
| 42 | Decision still applies after the PCLOB removals; "tenke beredskap" (excerpt; date conflict between URL and summary) | [Datatilsynet](https://www.datatilsynet.no/aktuelt/aktuelle-nyheter-2025/informasjon-om-overforinger-til-usa/) | 2025 (URL) | 2026-11-04 | Medium |
| 43 | § 13 periods: 5 years and 3.5 years (opened) | [Lovdata](https://lovdata.no/dokument/NL/lov/2004-11-19-73/%C2%A713) | in force | 2026-11-04 | High |
| 44 | Change from 2027 keeps the periods; e-invoice in original format (opened) | [Lovdata](https://lovdata.no/dokument/LTI/lov/2026-06-19-39) | 2026-06-19 | 2026-11-04 | High |
| 45 | Agreement an invoice refers to follows the invoice's period (excerpt; attribution inferred) | [Sticos](https://www.sticos.no/fagstoff/regnskapsmateriale-som-ma-oppbevares-lengre-enn-5-ar) | not shown | 2026-11-04 | Medium |
| 46 | Coop Finnmark: NOK 400,000, no faces shown, Art. 6(1)(f) balance failed (opened; surveillance footage, so analogy) | [Datatilsynet](https://www.datatilsynet.no/contentassets/5cd2e76bd5d2481f9578ffe721b7e24d/vedtak-om-overtredelsesgebyr-til-coop-finnmark-sa.pdf) | 2020-12-22 | 2026-11-04 | High |
| 47 | Spanish fines for photos used without a basis (excerpt; tracker) | [CMS GDPR Enforcement Tracker](https://www.enforcementtracker.com/ETid-983) | not captured | 2026-11-04 | Medium |
| 48 | Model photo case: active, informed consent (excerpt; judgment not read) | [Norsk Redaktørforening](https://www.nored.no/content/download/7720/51546/version/1/file/IJ-nr%202013-12%20-%20Fotomodell-saken%20-%20Oslo%20tingrett%202013-05-10.pdf) | 2013-05-10 | 2026-11-04 | Low |
| 49 | No-risk exception read strictly; processor reports to the controller (opened) | [Datatilsynet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/avvik/hvilke-brudd-skal-meldes-til-datatilsynet/) | not captured | 2026-11-04 | High |
| 50 | LDL §§ 18, 19 a, 22, 36 (opened) | [Lovdata](https://lovdata.no/dokument/NL/lov/2017-06-16-51/KAPITTEL_3) | in force | 2026-11-04 | High |
| 51 | Forskrift §§ 2, 3 g, 4, 4b, 4e, 5, 6 (opened) | [Lovdata](https://lovdata.no/dokument/SF/forskrift/2013-06-21-732) | amended 2023-02-01 | 2026-11-04 | High |
| 52 | Login and B2B not excluded "så lenge ho er stor og ubestemd"; 35 criteria (opened) | [Uutilsynet](https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153) | 2026-06-10 | 2026-11-04 | High |
| 53 | "I teorien" test; closed group is an extranet; bought solutions count as the public body's (opened; blog) | [Uutilsynet](https://www.uutilsynet.no/uubloggen/nettstad-intranett-ekstranett-app-eller-fagsystem/1557) | 2023-09-21 | 2026-11-04 | Medium |
| 54 | Helseplattformen daily-fine case closed after fixes (excerpt) | [Uutilsynet](https://www.uutilsynet.no/tilsyn/tilsyn-med-helseplattformen-vert-avslutta/3123) | not shown | 2026-11-04 | Medium |
| 55 | Supervision report on a private company: private track, non-descriptive alt text (opened) | [Uutilsynet](https://www.uutilsynet.no/tilsynsrapportar/tilsynsrapport-drdropin-drdropinno/3167) | 2026-03-12 | 2026-11-04 | High |
| 56 | "Alle bilder i HTML skal ha alt-attributt" (opened) | [Uutilsynet](https://www.uutilsynet.no/veiledning/111-ikke-tekstlig-innhold/1231) | 2025-03-18 | 2026-11-04 | High |
| 57 | Test rule 1.1.1a: same information as the image (opened) | [Uutilsynet](https://www.uutilsynet.no/regelverk/oversikt-over-testregler-nettsteder/709) | 2025-04-15 | 2026-11-04 | High |
| 58 | F30, F65, sensory exception (opened; WCAG 2.1 Understanding page, 2.0 wording not checked) | [W3C WAI](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html) | not stated | 2026-11-04 | High |
| 59 | Generated alt text should not entirely replace authored text (excerpt) | [W3C](https://www.w3.org/2026/10/w3c-and-state-of-web-in-ai-era.html) | 2026-10 (URL) | 2026-11-04 | Medium |
| 60 | Editor's responsibility (opened) | [Uutilsynet](https://www.uutilsynet.no/regelverk/redaktorens-ansvar-universell-utforming/200) | 2024-07-03 | 2026-11-04 | High |
| 61 | Procurement duty on the buyer; EAA not adopted as of April 2026 (opened) | [DFØ](https://www.anskaffelser.no/veileder-til-anskaffelsesloven/16-universell-utforming) | refers to 2026 | 2026-11-04 | Medium-high |
| 62 | EAA not in EEA; consumer scope; microenterprises; EU sales (opened; regulator summary, not directive text) | [Uutilsynet](https://www.uutilsynet.no/tilgjengelighetsdirektivet-eaa/eus-tilgjengelegheitsdirektiv-eaa/268) | 2025-10-01 | 2026-11-04 | Medium-high |
| 63 | Active-effort duties and § 26 (opened; strategy annex, not statute) | [Kultur- og likestillingsdepartementet](https://www.regjeringen.no/no/dokumenter/strategi-for-likestilling-av-personer-med-funksjonsnedsettelse-2026-2032/id3173804/?ch=8) | 2026 | 2026-11-04 | Medium |
| 64 | WCAG 2.2 not joining the rules soon (excerpt; dated 2023) | [Uutilsynet](https://www.uutilsynet.no/fremtidig-regelverk/status-nyere-versjoner-av-wcag/1868) | 2023-11 | 2026-11-04 | Low to medium |
| 65 | Template claim of written consent and fee clause: overturned against [12] (excerpt) | [Forms Legal](https://forms-legal.com/nb/norge/business/contracts/modellkontrakt) | not shown | 2026-11-04 | Low |
| 66 | No results for "Anthropic" in the participant search (manual look-up by the project owner; the tools here could not read the list) | [US Department of Commerce](https://www.dataprivacyframework.gov/list) | live page | 2026-11-04 | Medium-high |
| 67 | Rome court annulled the Garante's OpenAI fine on procedural grounds (excerpt) | [Diritto.it](https://www.diritto.it/?p=249907) | not shown | 2026-11-04 | Medium |
| 68 | Facebook's AI descriptions vary and should be checked (excerpt) | [Uutilsynet](https://www.uutilsynet.no/veiledning/sosiale-medier-og-universell-utforming/202) | undated | 2026-11-04 | Medium |
| 69 | DPIA fine level (opened) | [Datatilsynet](https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdere-personvernkonsekvenser/vurdering-av-personvernkonsekvenser/) | 2023-07-27 | 2026-11-04 | High |
| 70 | Breach of § 18 counts as discrimination (excerpt; attribution across a result set) | [Diskrimineringsnemnda](https://www.diskrimineringsnemnda.no/media/msrnsbeo/22-528-offentlig-versjon-av-uttalelse-og-vedtak.pdf) | not shown | 2026-11-04 | Medium |
| 71 | Slaughter raises the risk to pending EU challenges (excerpt) | [Skadden](https://www.skadden.com/insights/publications/2026/07/supreme-court-decision-raises-new-questions) | 2026-07 | 2026-11-04 | Medium |
| 72 | C-703/25 P still pending, nothing new (manual check by the project owner; the tools here could not read the page) | [Court of Justice of the EU](https://curia.europa.eu/juris/liste.jsf?num=C-703/25) | live page | 2026-11-04 | Medium-high |

## Staleness map

Computed with `recon_kit.py staleness`. Windows: regulatory status 3 months, provider terms 6 months, stable law and regulator guidance 12 months. "Overdue" means the source's own date is older than its window. Each was read live on 2026-11-04 and still served as current, but check it first at the next refresh.

| Claim | Class | Source date | Re-check by |
|---|---|---|---|
| Datatilsynet DPIA criteria | regulator guidance | 2023-07-27 | Overdue (2024-07-27) |
| Anthropic DPA: SCCs, no EEA or Norway wording | provider terms | 2025-02-24 | Overdue (2025-08-24) |
| Anthropic commercial terms: L.1, K.3(c), no training | provider terms | 2025-06-17 | Overdue (2025-12-17) |
| EAA not in the EEA Agreement | regulatory status | 2026-04-01 | Overdue (2026-07-01) |
| Datatilsynet guidance on images of people | regulator guidance | 2025-09-16 | Overdue (2026-09-16) |
| AI Act not in force in Norway or the EEA | regulatory status | 2026-08-03 | Overdue (2026-11-03) |
| Portrait right, § 104 text | stable law | 2025-11-28 | 2026-11-28 |
| *Trump v. Slaughter* effect on the DPF | regulatory status | 2026-09-17 | 2026-12-17 |
| Norwegian AI Act timing | regulatory status | 2026-10-01 | 2027-01-01 |
| Anthropic retention | provider terms | 2026-07-01 | 2027-01-01 |
| Prop. 41 LS in committee; no text-and-data-mining exception | regulatory status | 2026-11-04 | 2027-02-04 |
| DPF in force; appeal C-703/25 P pending | regulatory status | 2026-11-04 | 2027-02-04 |
| Private accessibility standard | stable law | 2026-06-10 | 2027-06-10 |
| Bookkeeping periods | stable law | 2026-06-19 | 2027-06-19 |

**What to re-check first:** Prop. 41 LS and the Norwegian AI Act bill, because either could change Dimension 1. Re-check both before the rollout gate is signed off.

**Earliest re-check by source date:** 2024-07-27, already passed.

The date for the Norwegian AI Act timing is an assumption: [3] shows no date, so the map uses October 2026, the date of vendor material (Opsio) reporting the same timing.
