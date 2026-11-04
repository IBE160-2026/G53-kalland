# Digest: AI on images (AI Act, copyright, sensitive inference)

Run date: 2026-11-04. All sources accessed 2026-11-04. Not legal advice.

**How to read the evidence.** Three evidence levels are used in this digest.

- `opened`: the page was fetched. WebFetch passes pages through a small summarising model, so quotes are close to the source but were not checked against raw text. The only exception is the Norges Fotografforbund PDF, which was read directly.
- `excerpt`: seen only through a search-result summary. The page was not opened.
- `inference`: my own reasoning from the cited texts. No source states it.

**Discarded result.** The EUR-Lex fetch of Regulation 2024/1689 returned no page text. The tool replied with an unsourced paraphrase, which is not used as evidence here. As a result, the following were not retrieved from an official text: AI Act Art. 3(34), Art. 3(40), Art. 4, Art. 5(1)(g) and Annex III point 1(b).

## Findings by question

### Q1. AI Act status in Norway, the EEA and the EU

- **claim:** The AI Act is not yet part of Norwegian law. Nkom says: "Det jobbes med å innføre regelverket i norsk rett", through "EØS-avtalen". The page gives no Norwegian application date.
  - source: https://nkom.no/ki/i-et-notteskall | publisher: Nkom (Norwegian coordinating AI supervisor) | pub_date: 2026-06-10 (unlabelled date on page) | confidence: medium, because the page is five months old | class: ai-act-status | evidence: opened
  - Second source: a search summary of a vendor guide dated October 2026 says the Act is not incorporated in the EEA Agreement and KI-loven is not adopted. It is one of https://opsiocloud.com/no/knowledge-base/ki-loven-ai-act-norge/ or https://opsiocloud.com/no/knowledge-base/ki-forordningen-tidslinje/. The summary did not say which, so attribution is uncertain. | evidence: excerpt
- **claim:** The Norwegian target date has slipped. In March 2025 the government expected the Act to take effect in "late summer 2026" and named Nkom as coordinating supervisor. That date has passed with no Norwegian act in force.
  - source: https://regjeringen.no/en/aktuelt/gjor-norge-klar-for-trygg-og-innovativ-ki-bruk/id3093081 | publisher: Ministry of Digitalisation and Public Governance | pub_date: 2025-03-26 (page flagged as more than one year old) | confidence: high for what it said in 2025; it is stale as a forecast | class: ai-act-status | evidence: opened
- **claim:** The first consultation on a Norwegian KI-lov opened on 30 June 2025, and the bill was then meant to apply from late summer 2026. In May 2026 Minister Karianne Tung said the aim is for Norwegian rules to take effect as soon as possible after EEA incorporation, and that the omnibus changes would go to consultation once published.
  - source: https://www.datatilsynet.no/aktuelt/aktuelle-nyheter-2025/ny-lov-om-ki-sendt-pa-horing/ and https://www.stortinget.no/no/Saker-og-publikasjoner/Sporsmal/Skriftlige-sporsmal-og-svar/Skriftlig-sporsmal/?qnid=99992 (the minister's statement is probably from this written question; attribution inferred from the result list) | publisher: Datatilsynet; Stortinget | pub_date: 2025; May 2026 | confidence: medium | class: ai-act-status | evidence: excerpt
- **claim:** A vendor summary of a government announcement dated 4 August 2026 reports a new consultation in autumn 2026 and a bill to the Storting in spring 2027. **One source only, and unconfirmed.** A domain-limited search of regjeringen.no, nkom.no, datatilsynet.no, stortinget.no and efta.int did not confirm it.
  - source: Opsio pages as above | publisher: vendor | pub_date: October 2026 | confidence: low | class: ai-act-status | evidence: excerpt
- **claim:** In the EU, the AI Omnibus "entered into force on 27 July 2026". Annex III high-risk use cases move to 2 December 2027, and product-integrated high-risk systems to 2 August 2028. A ninth prohibition (non-consensual sexual content and CSAM, such as "nudification") applies from December 2026. The page links the final text as OJ:L_202601744, and the vendor guide cites Regulation (EU) 2026/1744. The Act "became applicable on 2 August 2026, with some exceptions".
  - source: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai | publisher: European Commission | pub_date: last updated 2026-10-19 | confidence: high | class: ai-act-status | evidence: opened
  - Second source for the agreement and dates: https://www.stortinget.no/no/Hva-skjer-pa-Stortinget/EU-EOS-informasjon/EU-EOS-nytt/2026/eueos-nytt---27.-mars-2026/radet-og-ep-klare-til-forhandlinger-om-ki-omnibus/ (excerpt), plus https://www.iubenda.com/en/blog/ai-omnibus-parliament-adoption-june-2026 (excerpt; secondary).
- **claim:** The Omnibus itself has no EEA incorporation decision yet, per the vendor guide. **One source only.**
  - source: Opsio pages as above | pub_date: October 2026 | confidence: low to medium | class: ai-act-status | evidence: excerpt
- **claim (inference):** As of today the AI Act creates no directly binding duty for a business operating only in Norway. GDPR and åndsverkloven apply regardless. The same vendor summary says EU rules can still reach Norwegian firms whose AI output is used in the EU. This matters if the portal serves EU clients. The Art. 2 text was not retrieved.
  - confidence: medium for the Norway position, low for the extraterritorial point | class: ai-act-status

### Q2. Regulated category, Art. 50, Art. 4

- **claim:** Most AI systems are minimal risk, and the Act "does not introduce rules for AI that is deemed minimal or no risk".
  - source: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai | publisher: European Commission | pub_date: 2026-10-19 | confidence: high | class: risk-class | evidence: opened
  - Second source: Nkom's table lists minimal risk as "Ingen spesifikke krav". https://nkom.no/ki/i-et-notteskall | pub_date: 2026-06-10 | evidence: opened
- **claim (inference):** An AI system that writes image titles, descriptions, alt text and keywords matches no prohibited or high-risk example in the Commission or Nkom pages. It is most likely minimal risk, with a possible Art. 50(2) question (below). No source addresses this use case directly.
  - confidence: medium | class: risk-class
- **claim:** Art. 50(4) deployer duties cover deep fakes and text "published with the purpose of informing the public on matters of public interest". The text duty does not apply where content "has undergone a process of human review or editorial control" and a person "holds editorial responsibility".
  - source: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50 | publisher: European Commission AI Act Service Desk (consolidated text as at 27 July 2026; paragraphs 1 to 6 carry no omnibus-amendment marker, paragraph 7 is marked AMENDED) | confidence: high for the text | class: transparency | evidence: opened
  - Second source: the Commission page describes "deepfakes and certain public-interest text" as what must be labelled. (opened)
- **claim (inference):** Image metadata in a gated B2B portal is not text informing the public on matters of public interest, and no deep fake is generated, so Art. 50(4) is very unlikely to apply. If images or captions are later published for news or public-affairs purposes, human review would still bring it within the exception.
  - confidence: medium to high | class: transparency
- **claim:** Art. 50(2) binds "Providers of AI systems, including general-purpose AI systems, generating synthetic audio, image, video or text content" to machine-readable marking. It does not apply where systems "perform an assistive function for standard editing or do not substantially alter the input data provided by the deployer or the semantics thereof". Art. 50(1) binds providers of systems "intended to interact directly with natural persons".
  - source: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50 | confidence: high for the text | class: transparency | evidence: opened
- **claim (inference, open point):** Anthropic is plainly a provider. Whether an agency that builds its own tool on the API also becomes a "provider" of an AI system is unresolved here, because Art. 3(3) was not retrieved and no guidance was read. If it does, generated metadata is synthetic text, and fit with the "do not substantially alter" exception is doubtful, because a description created from an image is new text and not an edit of input text. The risk is low in practice while the AI Act does not apply in Norway.
  - confidence: low | class: transparency
- **claim:** "AI literacy obligations" have applied in the EU since 2 February 2025. The Commission page describes no Omnibus change to them. Art. 4 does not depend on risk class in the Commission's timeline, and the page attaches it to no risk category.
  - source: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai | pub_date: 2026-10-19 | confidence: medium. **One source only.** Art. 4's text and any Omnibus edit to it were not retrieved. | class: ai-literacy | evidence: opened
- **claim:** Nkom's business guidance does not mention Art. 4 or AI literacy. It tells businesses to map AI systems, assess risk categories, and set up testing, documentation and labelling routines.
  - source: https://nkom.no/ki/i-et-notteskall | pub_date: 2026-06-10 | confidence: high that the page omits it; this says nothing about the law | class: ai-literacy | evidence: opened
- **claim (inference):** If Art. 4 reaches Norway unchanged, a deploying agency would be in scope. Today it does not bind the agency in Norway, so a light training note is a low-cost readiness step and not a current legal duty.
  - confidence: medium | class: ai-literacy

### Q3. Copyright: sending a photographer's image to an AI API

- **claim:** The exclusive right covers making "varig eller midlertidig eksemplar av åndsverket, uavhengig av på hvilken måte og i hvilken form dette skjer" (§ 3). For photographs without work status, § 23 says: "Den som lager et fotografisk bilde, har enerett til å fremstille eksemplar av det". The term is the photographer's life plus 15 years, and at least 50 years from the year the image was made.
  - source: https://lovdata.no/dokument/NL/lov/2018-06-15-40 | publisher: Lovdata (statute text; last amended by LOV-2024-12-13-76 from 2025-01-01; edited 2025-11-28) | confidence: high | class: copyright | evidence: opened (lovdata did not block)
  - Second source: Norges Fotografforbund says a photograph is normally protected either as "fotografisk bilde" or "fotografisk verk". https://fotografforbundet.no/wp-content/uploads/Horingsinnspill-Prop.-41-LS-NFF.pdf | pub_date: PDF metadata 2026-06-09 | evidence: opened, read directly
- **claim:** § 4 "Visse midlertidige eksemplar" exempts temporary copying that is "en integrert og vesentlig del av en teknisk prosess", unless the copy has independent economic significance. The exemption does not apply to computer programs and databases.
  - source: https://lovdata.no/dokument/NL/lov/2018-06-15-40 | confidence: high for the text, as summarised. The full conditions of § 4 were not quoted. **One source only.** | class: copyright | evidence: opened
- **claim (inference):** Uploading an image to a third-party API makes at least one copy and hands it to another company, so it engages § 3. § 4 is a weak thing to rely on, for three reasons: the agency's own permanent DAM copy falls outside it, the provider's retention of the copy is not established as purely transient, and generating saleable metadata may give the copy independent economic significance. No Norwegian decision, ministry statement or commentary addressing this scenario was found. **Treat the position as unsettled, not as prohibited.**
  - confidence: medium for "engages § 3", low for how § 4 comes out | class: copyright
- **claim:** Norway has not yet implemented DSM Arts. 3 and 4. The current act goes from § 50 directly to chapter V (§ 51), with no §§ 50 d to 50 f.
  - source: https://lovdata.no/dokument/NL/lov/2018-06-15-40 | confidence: high | class: copyright-tdm | evidence: opened
- **claim:** Prop. 41 LS (2025-2026) is the implementing bill. Status: "Lovforslaget er til behandling i komiteen" (Familie- og kulturkomiteen). The page shows no procedural dates. A search summary says it was presented on 27.03.2026, referred on 09.04.2026, and had a new written-hearing deadline of 28 September.
  - source: https://www.stortinget.no/no/Saker-og-publikasjoner/Saker/Sak/?p=200243 | publisher: Stortinget | pub_date: undated | confidence: high for "in committee"; the page shows no date, so a very recent step could be missed | class: copyright-tdm | evidence: opened, dates by excerpt
- **claim:** The bill places the Art. 4 opt-out in a new § 50 e and the Art. 3 research exception in a new § 50 f. NFF says § 50 e means rightsholders must actively reserve "på en hensiktsmessig måte", and that no such method exists for the visual field. NFF and Grafill ask the Storting to postpone Arts. 3 and 4. Creo makes the same request.
  - source: https://fotografforbundet.no/wp-content/uploads/Horingsinnspill-Prop.-41-LS-NFF.pdf (opened, advocacy) and https://creokultur.no/wp-content/uploads/2026/06/Creos-horingsnotat-til-Prop-41-LS.pdf (excerpt) | publisher: rightsholder organisations | pub_date: June 2026 | confidence: high that the proposal says this; the outcome is uncertain | class: copyright-tdm
- **claim (inference):** There is no TDM exception to rely on in Norway today. Even if § 50 e passes, its fit is doubtful, because analysing one image to describe it may not be "text and data mining" and rightsholders can reserve. The definition proposed in § 50 d was not read.
  - confidence: high for "no exception today", low for fit | class: copyright-tdm
- **claim:** Anthropic's commercial terms have the customer state that it "has all rights and permissions required to submit Inputs to the Services" (L.1). The customer "retains all rights to its Inputs" (B).
  - source: https://www.anthropic.com/legal/commercial-terms | publisher: Anthropic | pub_date: effective 2025-06-17 | confidence: high | class: provider-terms | evidence: opened. **One source only** (primary).
- **claim (inference):** A no-training promise reduces the harm and the argument a photographer would raise, but it does not remove the copy. § 3 as retrieved has no condition about training. The practical answer does not depend on the exception analysis: L.1 makes the agency warrant the permission, so the photographer agreement should expressly cover sending images to AI providers for analysis. Where the photographer keeps rights, the agency has only what the licence gives.
  - Unverified belief: Norwegian law construes rights transfers narrowly (§§ 67 and 68). The body text of those sections was truncated and not read; only the headings were confirmed.
  - confidence: medium | class: copyright

### Q4. Who owns AI-generated metadata text?

- **claim:** Copyright attaches to works "som er uttrykk for original og individuell skapende åndsinnsats", and the creator "har opphavsrett til verket" (§ 2). § 1 gives rights to those who create, perform or invest.
  - source: https://lovdata.no/dokument/NL/lov/2018-06-15-40 | confidence: high | class: ownership | evidence: opened
- **claim:** Under Norwegian law AI cannot be an author or rights holder. Purely AI-generated output likely lacks protection because there is "no human author whose intellectual creation it is". Human edits may be protected, but only those contributions.
  - source: https://schjodt.com/news/who-owns-the-code-copyright-and-ai-generated-output-in-the-workplace | publisher: Schjødt (law firm; article is about code) | pub_date: not seen | confidence: medium. **One Norwegian source, secondary.** No court decision or ministry view found. | class: ownership | evidence: excerpt
- **claim:** EU originality turns on the author's own intellectual creation. A 2024 Council questionnaire reportedly found consensus that protection requires significant human involvement.
  - source: https://arxiv.org/pdf/2512.13750, https://www.utupub.fi/handle/11111/20678 and https://cms.law/en/pol/publication/ai-created-works-creative-original-or-just-sweat-of-the-brow (the summary did not clearly attribute each point) | publisher: academic and law firm | confidence: medium. CJEU judgments and the Council document were not read. | class: ownership | evidence: excerpt
- **claim:** Anthropic: customer "owns its Outputs", and "Anthropic hereby assigns to Customer its right, title and interest (if any) in and to Outputs" (B).
  - source: https://www.anthropic.com/legal/commercial-terms | pub_date: effective 2025-06-17 | confidence: high | class: ownership | evidence: opened
- **claim (inference):** The agency holds the contractual position against Anthropic, but "(if any)" assigns only what exists. Raw metadata is likely unprotected, so clients or competitors could reuse it, and the agency cannot license exclusive rights in it as if it were copyrighted. Human-edited text may be protected to the extent of the edits. Short keywords and factual alt text are weak candidates for protection in any case.
  - confidence: medium | class: ownership

### Q5. Provider terms

- **claim:** "Anthropic may not train models on Customer Content from Services" (B). Ownership and assignment are as in Q4. Inputs warranty is as in Q3 (L.1). Indemnity (K.1): Anthropic will defend and indemnify a "Customer Claim", meaning a claim that the customer's paid use "violates any third-party intellectual property right".
  - source: https://www.anthropic.com/legal/commercial-terms | publisher: Anthropic | pub_date: effective 2025-06-17 | confidence: high for the quoted words | class: provider-terms | evidence: opened
  - **One source only.** No independent second source was read, within budget. Exclusions to K.1, feedback carve-outs, retention periods, the DPA and sub-processors were not read or not reported. Do not read K.1 as covering claims caused by the agency's own Inputs without checking the exclusions.
- **claim (inference):** The terms apply to API use on a commercial account. They do not establish how long inputs are retained, so "no training" must not be restated as "not stored".
  - confidence: medium | class: provider-terms

### Q6. Sensitive inference

- **claim:** GDPR Recital 51: processing of photographs "should not systematically be considered to be processing of special categories of personal data", because they count as biometric data only when processed through specific technical means allowing unique identification.
  - source: https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_201903_video_devices_en_0.pdf (and EU documents in the same search) | publisher: EDPB / GDPR recital | confidence: high | class: special-category | evidence: excerpt
- **claim:** EDPB Guidelines 3/2019: political opinions "could for example be deduced from images showing identifiable data subjects taking part in an event, engaging in a strike, etc. This would fall under Article 9". Also: "if the video footage is processed to deduce special categories of data Article 9 applies".
  - source: same EDPB URL | publisher: EDPB | pub_date: guidelines adopted 2019/2020 (the text retrieved concerns video devices) | confidence: high for the words, medium for applying them to still images by analogy | class: special-category | evidence: excerpt
- **claim:** CJEU C-184/20 (OT v Vyriausioji): publishing personal data that indirectly discloses a person's sexual orientation is processing of special-category data under Art. 9(1), in light of the Article's aim of enhanced protection. The search did not surface any passage on photographs.
  - source: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A62020CJ0184 | publisher: CJEU | pub_date: 2022 (ECLI:EU:C:2022:601) | confidence: high for the holding as summarised; paragraphs not checked | class: special-category | evidence: excerpt
- **claim (inference):** A neutral visual description of an identifiable person ("a woman wearing a red scarf") is ordinary personal data, not automatically Art. 9. It tips into Art. 9 when the system infers or states a protected attribute ("Muslim woman", "appears to have diabetes", ethnicity labels), because output of that kind deduces or indirectly discloses it. Apparent age is not an Art. 9 category. A stored, searchable keyword increases the exposure. The safest design is for the prompt and a review step to exclude such attributes.
  - confidence: medium to high on direction; no source applies this to LLM image captions | class: special-category
- **claim:** Art. 5(1)(g) targets biometric categorisation inferring race, political opinions, trade union membership, religious or philosophical beliefs, sex life or sexual orientation, and has applied in the EU since 2 February 2025. Non-binding Commission guidelines were published on 4 February 2025.
  - source: https://production.jdsupra.com/legalnews/eu-commission-publishes-guidelines-on-9450260 and https://myctrl.tools/frameworks/eu-ai-act/art-5-1-g | publisher: secondary | confidence: medium. The official article text and the guidelines' section on Art. 5(1)(g) were not read. | class: biometric-categorisation | evidence: excerpt
- **claim:** Recital 16 excludes features "purely ancillary" to another commercial service that cannot objectively be used without it. Its examples are marketplace filters on facial or body features and social-network filters for editing pictures or videos.
  - source: https://ai-act-service-desk.ec.europa.eu/en/ai-act/recital-16 | publisher: European Commission Service Desk | confidence: high | class: biometric-categorisation | evidence: excerpt
- **claim (inference):** Art. 5(1)(g) and Annex III point 1(b) are a real concern only if the system assigns individuals to categories based on biometric data (for example face-based processing). A general-purpose caption model describing a photo is not clearly that, but a metadata pipeline deliberately producing "ethnicity" tags per person would move toward it. Do not rely on Recital 16 as a shield: its examples are narrow. This does not bind in Norway today, while GDPR Art. 9 does. Annex III 1(b) text was not retrieved.
  - confidence: low to medium | class: biometric-categorisation

## Contradictions

1. **When the Norwegian act applies.** Regjeringen (March 2025) said "late summer 2026". Nkom (June 2026) says work is ongoing, and vendor material (October 2026) says it is not adopted. A consumer tool found in search still claims August 2026. Resolved by recency: not in force.
2. **Next Norwegian step.** Vendor material reports a government announcement of 4 August 2026 (consultation in autumn 2026, Storting in spring 2027). A domain-limited search of official sites found no confirmation, and the latest official statement found (May 2026) gives no date. Unresolved; do not cite spring 2027 as fact.
3. **Art. 50(2) timing.** Several secondary sources report a grace period to 2 December 2026 for systems already on the market on 2 August 2026 (https://www.iubenda.com/en/blog/ai-omnibus-parliament-adoption-june-2026 among the search results), and one says the Omnibus left Art. 50 untouched. The Commission page says transparency rules apply from August 2026 and mentions no grace period. The Service Desk marks only Art. 50(7) as amended. These are compatible if the grace period sits in a transitional article, which I believe but did not verify. It affects providers more than this agency.
4. **"Minimal risk means no rules" against AI literacy.** The Commission and Nkom both say minimal risk has no specific rules. The Commission also lists AI literacy obligations as applying from February 2025, with no risk-class limit stated, and Nkom omits them. Art. 4's text would settle this; I did not retrieve it.
5. **Should Norway implement Arts. 3 and 4 now?** The ministry proposes §§ 50 d to f (Prop. 41 LS). NFF, Grafill and Creo ask for postponement. Unresolved until the committee reports.

## Leads worth chasing

- The committee recommendation (innstilling) on Prop. 41 LS and the proposed text of § 50 d (definition) and § 50 e. A vote during autumn 2026 would change Q3.
- Regjeringen's reported 4 August 2026 announcement, and any autumn 2026 consultation.
- Official text of Art. 4, Art. 3(3), Art. 3(34), Art. 3(40), Art. 5(1)(g), Art. 111 and Annex III 1(b), via the Service Desk pages, which worked where EUR-Lex did not.
- Commission guidelines on prohibited practices, section on Art. 5(1)(g), and the Commission's Art. 50 guidelines or code of practice on marking.
- Lovdata offset 100000 for §§ 67 and 68 (the page was only part-read), plus the full conditions of § 4. Also whether § 24 (the catalogue right, by my recollection) could protect the metadata collection as a whole. Unverified.
- Anthropic DPA, retention policy, sub-processors and K.1 exclusions.
- CJEU C-21/23 and C-667/21, which surfaced in search and were not read, and the full paragraphs of C-184/20.
- Datatilsynet on AI image analysis and Art. 9.

## Looked for and could not find

- Any Norwegian judgment, ministry statement or Datatilsynet text on sending images to an AI API for analysis (one-off description, not training).
- Any source classifying AI metadata or alt-text generation under the AI Act.
- Any official confirmation of a spring 2027 Storting timeline.
- An EEA Joint Committee decision incorporating the AI Act or the Omnibus. Not found, though I ran no dedicated search of EFTA's EEA-Lex.
- A Norwegian source applying § 2 to AI text beyond the Schjødt article.
- A Datatilsynet statement on inferring sensitive attributes from images. None surfaced in a domain-limited search that included datatilsynet.no.
- Commission guideline text on Art. 5(1)(g): the search returned recitals and commentary only.

**Not searched, for lack of budget:** enforcement actions under GDPR Art. 9 for image inference and under the AI Act. The brief asked for these. This digest therefore says nothing about what is actually punished.

## Round notes

- **Round 1:** four searches and fetches across Q1, Q3 and Q5, then the regjeringen, NFF, EUR-Lex and Stortinget lookups. It established the Omnibus, Prop. 41 LS in committee, and the Anthropic terms. The EUR-Lex fetch failed.
- **Round 2:** chased contradictions and gaps with Service Desk Art. 50, the Commission timeline, Nkom, lovdata, an official-domain search on the Norwegian timeline, Art. 5(1)(g), C-184/20 and EDPB, and AI output ownership. It added new load-bearing claims throughout (§§ 3 and 4, absence of §§ 50 d to f, Art. 50 wording, EDPB deduction language), so novelty was not exhausted.
- **Why I stopped:** budget, not coverage.
- **Tool use:** 20 calls in total: 1 ToolSearch, 8 WebSearch, 9 WebFetch (1 failed), 1 Read of the NFF PDF that WebFetch had saved to its own tool-results folder (no project file was read), and 1 Write. 8 sources were opened and about 8 more were relied on through search excerpts.
- **Weakest evidence:** everything marked excerpt, especially Art. 5(1)(g), C-184/20 and Schjødt, which were not opened. Verify those before they carry a requirement.
