# Digest: privacy and GDPR for an image archive and licensing system (Norway, then EU/EEA)

Researcher digest, run of 2026-11-04. All `accessed` dates are 2026-11-04.

**How to read the evidence.**
- "Read" means the page was fetched with WebFetch. WebFetch answers through a small summarising model, so short quotes are likely accurate but have not been compared by eye with the source. Check any quote before relying on it word for word.
- "Snippet only" means the claim comes from a WebSearch result summary and the underlying page was not fetched.
- "Unverified belief" means no evidence was retrieved this run. It is a hypothesis, not a finding.
- "Inference" means the researcher's reading of a retrieved text, with no source stating it directly.
- This is not legal advice.

**Coverage.** Questions 2, 5, 7 and most of 8 have primary-source evidence. Questions 1, 3, 6 and 10 are partial. Questions 4, 9 and 11 have almost none, because the budget ran out first.

## Findings by question

### Q1. When is a photograph personal data?

- **claim:** A photo in which individuals can be recognised is processing of personal data, even when no consent is needed: "vil det fortsatt være en behandling av personopplysninger hvis man kan kjenne igjen enkeltpersoner." Identifiability is the test Datatilsynet uses here. The statement is made about situation pictures.
  - source: https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bilder-pa-nett/
  - publisher: Datatilsynet | pub_date: last updated 2025-09-16 | accessed: 2026-11-04 | confidence: medium | class: personal-data
  - One source read. Second source: GDPR Art. 4(1) was not retrieved.
- **claim:** Datatilsynet's image-sharing page says nothing about archives of images. It mentions businesses only in general terms.
  - source: same as above | confidence: medium (absence on one page, not across the whole site) | class: personal-data

### Q2. Portrait right, åndsverkloven § 104

- **claim:** Core rule of § 104: "Fotografi som avbilder en person, kan ikke gjengis eller vises offentlig uten samtykke av den avbildede." Datatilsynet quotes the same sentence, which gives two sources.
  - source: https://lovdata.no/dokument/NL/lov/2018-06-15-40/KAPITTEL_6 and https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bilder-pa-nett/
  - publisher: Lovdata; Datatilsynet | pub_date: law last amended by LOV-2024-12-13-76 from 2025-01-01, page corrected 2025-11-28; Datatilsynet 2025-09-16 | accessed: 2026-11-04 | confidence: high | class: portrait-right
- **claim:** § 104 exceptions, no consent needed when: (a) the image has current and general public interest; (b) the person is less important than the main content of the image; (c) it shows gatherings, outdoor processions or events of general interest; (d) copies are shown in the usual way as advertising for the photographer's business and the person does not object; (e) the image is used as provided in § 33 second paragraph or § 37 third paragraph. Exceptions are paraphrased by the fetch tool, not quoted.
  - source: https://lovdata.no/dokument/NL/lov/2018-06-15-40/KAPITTEL_6 | publisher: Lovdata | pub_date: as above | confidence: high for the structure, medium for exact wording | class: portrait-right
- **claim:** Protection lasts for the depicted person's lifetime plus 15 years after the end of the year of death: "Vernet gjelder i den avbildedes levetid og 15 år etter utløpet av avbildedes dødsår." Two sources (Lovdata, Datatilsynet).
  - source: as for the core rule | confidence: high | class: portrait-right
- **claim:** Inference: no § 104 exception covers commercial licensing to third parties. Exception (d) reaches only advertising for the photographer's own business. So a portrait licensed to a client for publication needs the depicted person's consent unless (a), (b) or (c) fits. Consent should cover third-party licensing explicitly. No source states this directly, and no licensing-specific authority or case law was retrieved.
  - source: https://lovdata.no/dokument/NL/lov/2018-06-15-40/KAPITTEL_6 | confidence: medium (inference from the text) | class: portrait-right
- **claim:** § 105, commissioned portraits: "Opphaveren kan ikke utøve sine rettigheter til et bestilt portrettbilde uten samtykke fra bestilleren." This is a second consent, separate from § 104. For a commissioned portrait in the library, licensing needs the commissioner's consent as well as the depicted person's (the second half is inference).
  - source: https://lovdata.no/dokument/NL/lov/2018-06-15-40/KAPITTEL_6 | publisher: Lovdata | confidence: high for the text, medium for the application | class: portrait-right | single source
- **claim:** Sanctions. § 79: breaches of §§ 99 to 107, which includes § 104, carry "bøter eller fengsel inntil ett år". § 81: anyone who "forsettlig eller uaktsomt gjør inngrep i en annens rett" owes reasonable payment, damages or the profit gained, whichever favours the injured party most. Double reasonable payment is possible on request for intentional or grossly negligent breach. § 81 does not name § 104, so its application to § 104 is the tool's and researcher's reading.
  - source: https://lovdata.no/dokument/NL/lov/2018-06-15-40/KAPITTEL_6 | publisher: Lovdata | confidence: medium | class: portrait-right | single source
- **claim:** Relation to GDPR: Datatilsynet quotes § 104 on the same page as personal-data rules and treats both as applying to a recognisable person. It does not explain how the two interact. Inference: the regimes run side by side, so meeting a § 104 exception does not remove the need for a GDPR basis. The page's point on situation pictures supports this.
  - source: https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bilder-pa-nett/ | publisher: Datatilsynet | pub_date: 2025-09-16 | confidence: medium | class: portrait-right

### Q3. Legal basis, withdrawal, children

- **claim:** For portraits, Datatilsynet's position is consent before sharing: "Samtykke skal hentes inn før bildet eller filmen deles." This covers closed groups and live streaming even if nothing is stored. In a dispute, the person who shared the image must prove valid consent. Consent records are therefore a build requirement (inference).
  - source: https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bilder-pa-nett/ | publisher: Datatilsynet | pub_date: 2025-09-16 | confidence: high that this is Datatilsynet's stated position; written mainly for sharing, not licensing | class: legal-basis
- **claim:** For situation pictures, public sharing without consent is possible when they show gatherings or events of public interest, but Datatilsynet still recommends a balancing of interests and, as a general rule, asking for consent. That is the only retrieved support for legitimate interest as a basis in this domain.
  - source: same | confidence: medium | class: legal-basis
- **claim:** Employment analogy: employers generally need consent for portrait photos of staff on web or intranet, while situation photos from employer events can go on the intranet without it. Snippet only.
  - source: https://www.datatilsynet.no/personvern-pa-ulike-omrader/personvern-pa-arbeidsplassen/bilder-ansatte_nett/ | publisher: Datatilsynet | pub_date: not seen | confidence: medium | class: legal-basis | analogy (employment)
- **claim:** Withdrawal: "Et samtykke kan dessuten trekkes tilbake når som helst og opplysningene må slettes", and on deletion requests from a guardian or child: "Ikke spør om årsak, bare slett med en gang."
  - source: https://www.datatilsynet.no/personvern-pa-ulike-omrader/skole-barn-unge/bilder-av-barn-pa-nett/?print=true | publisher: Datatilsynet | pub_date: last updated 2020-03-11 | confidence: medium | class: legal-basis | analogy (school and kindergarten guidance, and six years old)
- **claim:** Children, age: "Frem til et barn er 13 år, er det de foresatte som har det overordnede ansvaret for å godkjenne bildepubliseringen", and "fra og med 13 år må man involvere barna når samtykkeskjemaer skal underskrives." The child also signs from 13. A younger child should be asked as well, and a no "bør ... respekteres uten diskusjon". See the contradiction on age below.
  - source: same | confidence: medium | class: legal-basis | analogy (school guidance)
- **claim:** Guardians: the page says "de foresatte" and does not say whether one or both must consent. Children who cannot consent validly: "må foresatte gi samtykke på disses vegne."
  - source: same, and https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bilder-pa-nett/ | confidence: medium | class: legal-basis
- **claim:** Commercial use of children: "Det kan være uheldig når barna benyttes i kommersielle sammenhenger." Datatilsynet discourages it but states no ban on this page. A school also cannot consent on parents' behalf for an external photographer. Snippet from Datatilsynet's guidance also says publishing children's pictures clearly against their interests is not permitted.
  - source: https://www.datatilsynet.no/personvern-pa-ulike-omrader/skole-barn-unge/bilder-av-barn-pa-nett/?print=true | confidence: medium | class: legal-basis | analogy (school guidance)
- **claim:** Unverified belief, not evidenced this run: GDPR Art. 7(3) says withdrawal does not affect the lawfulness of processing before withdrawal. Personopplysningsloven § 5 sets 13 as the age for information society services. That age concerns a child using an online service and is not obviously the rule for images of a child held by an agency. Chapter 2 of the law was fetched, but § 5's text was not in the returned content.
  - source: attempted https://lovdata.no/dokument/NL/lov/2018-06-15-38/KAPITTEL_2 | confidence: low | class: legal-basis
- **claim:** Personopplysningsloven § 3 exempts processing for journalistic purposes or academic, artistic or literary expression "så langt det er nødvendig for utøvelsen av retten til ytrings- og informasjonsfrihet". Inference: commercial licensing by an agency is a weak fit for this exemption. No source addresses that.
  - source: https://lovdata.no/dokument/NL/lov/2018-06-15-38/KAPITTEL_2 | publisher: Lovdata | pub_date: § 3 last amended by lov 18 juni 2021 nr. 124, in force 2022-01-01 | confidence: high for the text, low for the application | class: legal-basis | single source

### Q4. Controller and processor roles

- **claim:** Under Anthropic's DPA, "Customer is the controller and Anthropic is Customer's processor" (B.1). Anthropic processes only to provide or maintain the Services, on the Customer's documented instructions (B.2). This is the only role evidence retrieved, and it is the provider's own contract, not an authority's characterisation.
  - source: https://www.anthropic.com/legal/data-processing-addendum | publisher: Anthropic | pub_date: effective 2025-02-24 (page metadata) | confidence: high for the text | class: roles | single publisher
- **claim:** Unverified belief, not evidenced this run: an agency holding client-owned images on the client's instructions is likely a processor for those images and a controller for its own archive and CRM, and licensees are likely separate controllers. No Datatilsynet, EDPB or legal source on this was read. The Art. 28 and EDPB Guidelines 07/2020 lead remains open.
  - confidence: low | class: roles

### Q5. Anthropic: terms, retention, sub-processors, transfers

- **claim:** API retention: "we automatically delete inputs and outputs on our backend within 30 days of receipt or generation", unless otherwise agreed, for example a zero data retention agreement. The article does not define ZDR terms.
  - source: https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data | publisher: Anthropic | pub_date: last updated 2026-07-01 | confidence: high | class: provider-terms | single publisher
- **claim:** Flagged content: "We retain inputs and outputs for up to 2 years and trust and safety classification scores for up to 7 years if your chat is flagged." Retention can be longer where law requires. The wording says "chat", and the fetch did not confirm whether every word applies to API traffic, though the article covers organisational data. Treat as applying until Anthropic says otherwise. Images of people could stay up to 2 years if flagged.
  - source: same | confidence: medium for API scope, high for the text | class: provider-terms | single publisher
- **claim:** Deletion at contract end (H.1): "Within thirty (30) days of the date of termination or expiration of the Agreement", Anthropic returns data on request and deletes copies, subject to legal, dispute-resolution and harmful-use exceptions. This is a different 30 days from the rolling API deletion above.
  - source: https://www.anthropic.com/legal/data-processing-addendum | publisher: Anthropic | pub_date: effective 2025-02-24 | confidence: high | class: provider-terms | single publisher
- **claim:** Sub-processors: Schedule 4 points to https://www.anthropic.com/subprocessors, which was not read. C.3 gives "reasonable notice" before a new sub-processor gets access. The customer may object on reasonable privacy or security grounds within 15 days, otherwise it is deemed to consent.
  - source: same | confidence: high | class: provider-terms | single publisher
- **claim:** Transfers (I.1): SCC Module Two (controller to processor) and/or Module Three (processor to processor) are incorporated by reference and "will be deemed to have been executed by the parties". Schedule 3 adds UK and Swiss addenda. The DPF is not mentioned. Norway and the EEA are not named: the fetched page refers to GDPR and EU Member States only.
  - source: same | confidence: high for the SCCs, medium for the absence (tool summary, not a word search) | class: transfers | single publisher
- **claim:** Breach (G.1): Anthropic notifies the customer "without undue delay, but in any event within 48 hours" of becoming aware, and cooperates with details (G.2). The DPA is dated February 2025, so check that this is still the current version.
  - source: same | confidence: high | class: provider-terms | single publisher

### Q6. EEA to US transfers

- **claim:** The General Court dismissed Latombe's annulment action against Implementing Decision (EU) 2023/1795 on 3 September 2025 (T-553/23). Latombe appealed on 31 October 2025 (C-703/25 P). The grounds are published in the OJ, notice C/2025/6610. They attack the Court's handling of bulk collection under Schrems II and of safeguards. Snippets only.
  - source: https://eur-lex.europa.eu/eli/C/2025/6610/oj/deu/pdf ; https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework ; https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission
  - publisher: Official Journal; WilmerHale; Digital Policy Alert | pub_date: OJ 2025; WilmerHale 2025-12-01 | accessed: 2026-11-04 | confidence: high for the history | class: transfers
- **claim:** Current status: the DPF remains in place and the appeal was pending on the latest sources found, but those date from about December 2025. No hearing, Advocate General opinion or judgment was found, and curia.europa.eu was not checked. Status as of November 2026 is **not verified**, about 11 months stale on a claim that must be current.
  - source: as above | confidence: low for the current position | class: transfers
- **claim:** The DPF covers EEA transfers only to US companies that have self-certified and are on the DPF List. Non-certified recipients need another mechanism such as SCCs. Snippet only.
  - source: https://svw.no/en/new-framework-for-data-transfers-to-the-us/ | publisher: Simonsen Vogt Wiig (law firm) | pub_date: undated (2023 event) | confidence: medium | class: transfers
- **claim:** Applies to Norway: the SVW snippet says it covers transfers "from the EEA", and Google's Norwegian policy page says EU decisions let data flow from the EU and Norway, Liechtenstein and Iceland. No EEA Joint Committee decision, regjeringen.no or Datatilsynet text was read.
  - source: https://svw.no/en/new-framework-for-data-transfers-to-the-us/ ; https://policies.google.com/privacy/frameworks?hl=nb | publisher: SVW; Google | confidence: medium | class: transfers | no primary source
- **claim:** Datatilsynet, as reported by Schjødt: the framework stays valid unless the CJEU repeals it, and the Commission's assessment can be relied on for transfers to non-certified companies, provided the US recipient is not subject to unusually extensive disclosure rules. Second-hand and from around 2023. Datatilsynet's own page "Nye regler for overføring av personopplysninger til USA" was not retrieved.
  - source: https://schjodt.com/news/practical-consequences-of-the-eu-u-s-data-privacy-framework | publisher: Schjødt (law firm) | pub_date: undated | confidence: medium | class: transfers | single secondary source
- **claim:** Anthropic's DPF certification is **not confirmed**. Third-party compliance sites say it participates, but they carry low-quality signals and tell readers to verify it themselves. Anthropic's DPA does not mention the DPF, and the visible snippet of its certifications article lists HIPAA Configurable and ISO 27001:2022 only. The official list at dataprivacyframework.gov was not checked. Plan on the SCCs in the DPA as the mechanism until the list is checked (inference).
  - source: https://compound-website.pages.dev/en-DE/compliance/anthropic-gdpr-compliance/ ; https://privacy.claude.com/en/articles/10015870-what-certifications-has-anthropic-obtained ; https://www.anthropic.com/legal/data-processing-addendum | publisher: third party; Anthropic | confidence: low | class: transfers

### Q7. DPIA and record of processing

- **claim:** Datatilsynet's list of processing that always requires a DPIA includes, each "i følge med minst ett annet kriterium": innovative technology ("Behandling av personopplysninger med innovativ teknologi"), biometric data used to identify individuals, and location data. It also lists evaluating learning, coping and wellbeing in schools or kindergartens, camera surveillance there, and large-scale systematic monitoring of public areas. The criteria themselves are on a separate page ("Når er det høy risiko?") that was not read.
  - source: https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdere-personvernkonsekvenser/vurdering-av-personvernkonsekvenser/nar-ma-man-gjennomfore-en-vurdering-av-personvernkonsekvenser/ | publisher: Datatilsynet | pub_date: last updated 2023-07-27 | confidence: high for the list; the 2023 date predates much generative AI guidance | class: dpia | single source
- **claim:** Inference: the system is not named on the list, but sending images of identifiable people and children to a third-party LLM plausibly meets "innovative technology" plus at least one other criterion (vulnerable data subjects, if the unread criteria page confirms that). The cautious reading is that a DPIA is required before real images are used. No authority has been found saying this for AI metadata on images. The biometric item would apply only if the system identifies people, which argues for not using the AI to name or match faces.
  - source: same | confidence: medium (inference) | class: dpia
- **claim:** Failing to carry out a required DPIA, or doing it incorrectly, can bring fines of up to EUR 10 million or 2 % of global annual turnover, whichever is higher. In some cases prior consultation with Datatilsynet is required.
  - source: https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdere-personvernkonsekvenser/vurdering-av-personvernkonsekvenser/ | publisher: Datatilsynet | pub_date: 2023-07-27 | confidence: high | class: dpia | single source
- **claim:** Art. 30 record of processing for a small agency: nothing retrieved. Unverified belief: the under-250-employees exemption in Art. 30(5) falls away when processing is not occasional or involves certain risks, so a small agency running a continuing image library would likely need a record.
  - confidence: low | class: dpia

### Q8. Erasure versus retention

- **claim:** Bokføringsloven § 13 second paragraph: "Regnskapsmateriale som nevnt i første ledd nr. 1 til 4 skal oppbevares i Norge i fem år etter regnskapsårets slutt", and material under nr. 5 to 8 "i tre år og seks måneder". Nr. 1 to 4: annual accounts and mandatory reporting, specifications and the booked information behind them, documentation of booked and deleted information, the audit trail and balance documentation, and auditor communications. Nr. 5 to 8: agreements concerning the business (except minor ones), correspondence adding essential information to a booked item, outgoing packing slips, and price lists required by law. Five years confirmed as well by Skatteetaten's notice (snippet).
  - source: https://lovdata.no/dokument/NL/lov/2004-11-19-73/KAPITTEL_5 ; https://www.skatteetaten.no/nn/rettskjelder/type/kunngjoringer/redusert-oppbevaringstid-for-regnskapsmateriale/ | publisher: Lovdata; Skatteetaten | pub_date: law version last amended by LOV-2020-11-20-128, in force 2021-01-01 | confidence: high | class: retention
- **claim:** **Pending change.** Lovdata marks § 13 "Endres" by lov 19. juni 2026 nr. 39, in force 2027-01-01. The content of the change was **not established**. So the periods above are current only until 2026-12-31 and need rechecking before the v1 retention rules are fixed. See leads.
  - source: https://lovdata.no/dokument/NL/lov/2004-11-19-73/KAPITTEL_5 | publisher: Lovdata | confidence: high that a change is coming, none on its content | class: retention | single source
- **claim:** Inference: invoices are documentation of booked information, so 5 years after the end of the accounting year. Licence agreements fall under "avtaler" at 3.5 years, unless they are also the documentation for a booked amount, in which case 5 years is the safe reading. No source addresses licence agreements specifically.
  - source: https://lovdata.no/dokument/NL/lov/2004-11-19-73/KAPITTEL_5 | confidence: medium (inference) | class: retention
- **claim:** Unverified belief: Art. 17(3)(b) lets a legal obligation override erasure, so bookkeeping data stays for the period and other personal data goes. Whether names on invoices can be anonymised within the period, and whether a licence record can be anonymised afterwards, was not evidenced. Deletion or anonymisation of the image and consent details are separate questions from the accounting record (inference). § 13 first paragraph's reference to documenting "slettede opplysninger" suggests that deletions in booked data must themselves be traceable.
  - confidence: low | class: retention

### Q9. EXIF and GPS

- **claim:** Nothing retrieved. No search was run, for budget reasons. Datatilsynet's DPIA list treats location data as a trigger when combined with another criterion, which shows it regards location as sensitive in risk terms, but that is not a statement about EXIF. Unverified belief: GPS and device data in a file tied to an identifiable person are personal data.
  - source: https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdere-personvernkonsekvenser/vurdering-av-personvernkonsekvenser/nar-ma-man-gjennomfore-en-vurdering-av-personvernkonsekvenser/ | confidence: low | class: personal-data

### Q10. Enforcement

- **claim:** Coop Finnmark SA was fined NOK 400,000 for a Facebook post identifying a child who stole Christmas decorations; the violation of the child's privacy weighed heavily. The closest case found to images and children, though it is not clear from the snippet that an image was involved. The decision was not read.
  - source: https://www.datatilsynet.no/contentassets/5cd2e76bd5d2481f9578ffe721b7e24d/vedtak-om-overtredelsesgebyr-til-coop-finnmark-sa.pdf | publisher: Datatilsynet | pub_date: not seen, "several years old" | confidence: medium | class: enforcement | snippet only
- **claim:** Asker kommune fined NOK 1 million after publishing confidential personal data and national ID numbers on its website. Oslo kommune fined NOK 400,000 for publishing documents with sensitive data. Other results concern NAV publishing CVs at the workplace and Lillestrøm kommune on breach reporting. Pattern in this small sample: publishing the wrong thing and missing safeguards, in the range NOK 400,000 to 1 million, mostly public bodies. This sample comes from one search and is not a survey.
  - source: https://www.datatilsynet.no/contentassets/65e913da425949d985baf76849a5929b/vedtak-om-overtredelsesgebyr---asker-kommune.pdf ; https://www.datatilsynet.no/contentassets/92b3164171544950b52f46e9d698d7a2/vedtak-om-overtredelsesgebyr---publisering-av-cv-pa-arbeidsplassen.pdf ; https://www.datatilsynet.no/contentassets/425ef2f0fb5e4af3ac8e0cd97da648b8/vedtak-om-overtredelsesgebyr---melding-om-avvik---lillestrom-kommune-sentraladministrasjonen.pdf | publisher: Datatilsynet | pub_date: not seen | confidence: medium | class: enforcement | snippet only
- **claim:** No enforcement against a photo archive, DAM or image-licensing business, or against an AI provider, was found. Other EEA regulators were not searched, so this says little about whether such cases exist.
  - confidence: low | class: enforcement

### Q11. Breach notification

- **claim:** The 72-hour rule and Datatilsynet's reporting content were **not confirmed this run** (unverified belief: Art. 33 requires notice within 72 hours of becoming aware). The one retrieved related point: Anthropic must notify the customer within 48 hours (DPA G.1), which leaves the agency a margin only if the 72 hours run from the agency's own awareness. That last point is also unverified.
  - source: https://www.anthropic.com/legal/data-processing-addendum | confidence: low for the rule, high for the DPA text | class: breach

## Contradictions

1. **Does § 104 reach non-public sharing?** § 104's text concerns reproducing or showing "offentlig", while Datatilsynet says consent is needed for portraits shared with others even in closed groups. These are likely two regimes (portrait right versus personal-data rules), but Datatilsynet does not separate them. It also matters whether "offentlig" qualifies "gjengis" as well as "vises". If it does, internal archive storage would not engage § 104 but licensing for publication would. That reading is the researcher's and is not sourced. https://lovdata.no/dokument/NL/lov/2018-06-15-40/KAPITTEL_6 versus https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bilder-pa-nett/
2. **Age for images of children.** Datatilsynet's 2020 children's page gives a 13-year line. Its 2025 image-sharing page "does not set a specific age limit" and speaks of children who cannot consent validly. By recency the 2025 page wins on being current, but it is silent rather than contrary, so the 13-year line stays usable as a minimum involving the child, not as a point where guardian consent stops. https://www.datatilsynet.no/personvern-pa-ulike-omrader/skole-barn-unge/bilder-av-barn-pa-nett/?print=true versus https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bilder-pa-nett/
3. **Processor on instructions versus retention for Anthropic's own safety purposes.** DPA B.1 and B.2 present Anthropic as a processor acting on instructions, while the privacy article keeps flagged inputs and outputs up to 2 years and scores up to 7 years. The DPA's harmful-use exception partly bridges this, but whether Anthropic is a controller for that retention was not resolved. https://www.anthropic.com/legal/data-processing-addendum versus https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data
4. **Anthropic and the DPF.** Third-party sites say it participates. Its DPA relies on SCCs without mentioning the DPF, and the visible part of its certifications page does not list it. Not resolved, and the third-party sources are the weakest here. Sources under Q6.
5. **Deletion versus the bookkeeping duty.** Datatilsynet says withdrawal means delete at once ("bare slett med en gang", school guidance), while bokføringsloven § 13 requires records to be kept for 3.5 or 5 years. Probably reconciled by keeping only the accounting record, but no retrieved source says so.

## Leads worth chasing

- **Bokføringsloven § 13 change, lov 19. juni 2026 nr. 39, in force 2027-01-01.** Stortinget's lovvedtak 52 (2025–2026) may be the source: a search snippet mentions keeping electronic invoices in original format, but the link to this law is unconfirmed. The PDF fetch returned raw binary with no readable text. It was saved, unread, at `/Users/marthekalland/.claude/projects/-Users-marthekalland-Dev-g53-kalland/238941f7-019f-4a06-913a-a5eb762b9fcc/tool-results/webfetch-1793775815155-j3gqkr.pdf`. Also try https://lovdata.no/dokument/NL/lov/2004-11-19-73/%C2%A713 and the source URL https://stortinget.no/globalassets/pdf/lovvedtak/2025-2026/vedtak-202526-052.pdf.
- **C-703/25 P on curia.europa.eu:** hearing, Advocate General opinion or judgment during 2026.
- **dataprivacyframework.gov participant list:** look up Anthropic directly.
- **Datatilsynet's own page:** "Nye regler for overføring av personopplysninger til USA", linked from SVW.
- **https://www.anthropic.com/subprocessors,** and whether a newer DPA replaces the February 2025 version. Also whether the flagged-content retention applies to API traffic in those terms.
- **Datatilsynet "Når er det høy risiko?"** for the criteria, and any newer Datatilsynet or EDPB material on AI and DPIAs (for example EDPB Opinion 28/2024).
- **Personopplysningsloven § 5:** https://lovdata.no/dokument/NL/lov/2018-06-15-38/%C2%A75
- **Roles:** EDPB Guidelines 07/2020 and Datatilsynet's page on processors.
- **Art. 7(3), 17, 30, 33 on eur-lex, and Datatilsynet's breach page.** None was read.
- **Coop Finnmark, read in full,** to see whether an image was involved and how the fine was reasoned. Also the Datatilsynet decision index at https://www.datatilsynet.no/regelverk-og-verktoy/lover-og-regler/avgjorelser-fra-datatilsynet/?p=3, and other EEA regulators on image data and AI providers.
- **Personvernnemnda and Norwegian case law on § 104 and on commercial licensing.**

## Looked for and could not find

- What happens to a licence already sold when consent is withdrawn. No source of any kind was found. This remains the largest open legal question for the licensing portal.
- Any Datatilsynet statement on archives of images. The image-sharing page has none.
- Datatilsynet's old legal-basis page: https://www.datatilsynet.no/rettigheter-og-plikter/personvernprinsippene/behandlingsgrunnlag/ returned HTTP 404, so the URL has moved. No replacement was fetched.
- Confirmation from a primary source that Anthropic is DPF-certified.
- Any mention of Norway or the EEA in Anthropic's DPA, as read through the fetch tool.
- A retrievable statement of the content of the 2027 bokføringsloven § 13 change. A dedicated search also failed to find the law by date, even though Lovdata's marker exists.
- Personopplysningsloven § 5 text: Lovdata's chapter page returned only §§ 2 to 4.
- Lovdata did not block access, but chapter pages are long and truncated, needing an offset read or a section URL.

Not searched at all, for budget reasons: Q9 (EXIF and GPS authority views), Q11 (Datatilsynet breach page), Art. 30 guidance, the Q4 role guidance, and non-Norwegian enforcement. The absence of findings on those is not evidence of absence.

## Round notes

- **Round 1 (8 calls, 1 ToolSearch before it):** broad across Q2, Q3, Q5, Q6, Q7 and Q8. It produced Anthropic's terms, the retention text, the Latombe appeal history, § 13's periods and, unexpectedly, the 2027 amendment marker. The § 104 text was cut off and the DPIA page was only an introduction.
- **Round 2 (10 calls):** obtained § 104, §§ 79, 81 and 105, the DPIA list, the guidance on images and on children, the DPF evidence and the fine decisions. Two calls failed to add much: the personopplysningsloven chapter lacked § 5, and the Stortinget PDF came back as binary.
- **Why stopped:** budget, not coverage or novelty exhaustion. Round 2 was still adding load-bearing claims at the end. 18 research calls plus ToolSearch plus this Write make 20 tool calls. 11 distinct URLs were fetched, 9 of them readable. Other cited pages are snippets from 6 searches.
