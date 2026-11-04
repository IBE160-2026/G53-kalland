# Accessibility verification, round 2, pass 1

Fresh-context check. Accessed date for every source: 2026-11-04.

**How to read the evidence field**
- `opened`: the page was fetched this run. WebFetch passes pages through a summarising model with a quote limit of about 125 characters, so long provisions come back as consecutive fragments, shown with `/`. Fragments are as returned; not checked character by character against the source.
- `excerpt`: seen only as a search result summary. Page not opened. Treat as a lead.
- `inference`: my reading of the sources, not a statement by any source. Not evidence in its own right.

Short names used below:
- **Forskrift**: https://lovdata.no/dokument/SF/forskrift/2013-06-21-732, Lovdata, last amended by FOR-2023-01-17-87 from 2023-02-01
- **Kva seier**: https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153, Uutilsynet, created 2016-03-16, last changed 2026-06-10
- **Blog**: https://www.uutilsynet.no/uubloggen/nettstad-intranett-ekstranett-app-eller-fagsystem/1557, Uutilsynet (Råsberg, Digdir), published 2023-01-19, last changed 2023-09-21

---

## 1. GAP: is a closed, invitation-only B2B portal in scope of LDL § 18 and forskrift § 2?

**status: open. No source addresses this fact pattern directly.** The sources establish that B2B and login do not exclude coverage on their own. They do not settle a closed, invitation-only group of contracted clients. The regulator's language points both ways. "Out of scope" cannot be stated as established.

**Points toward coverage**
- {claim: B2B customers do not take a solution out of scope, and Uutilsynet deals with this under its own heading "Avgrensa målgruppe eller B2B". source: Kva seier. publisher: Uutilsynet. pub_date: changed 2026-06-10. confidence: high (for what it says). class: regulator guidance. evidence: opened.}
  - "Sjølv om verksemda rettar seg mot bestemte mål- eller kundegrupper," / "vil dei likevel vere omfatta av regelverket, så lenge ho er stor og ubestemd."
  - "Det gjeld også dersom kundane er andre bedrifter/næringsdrivande (B2B)."
  - Its example is a site "retta inn mot andre verksemder" / "for å promotere deira tenester opp mot kundane i bedriftsmarknaden", counted as aimed at "brukarar" / "sjølv om denne målgruppa er avgrensa." The example is a promotional site, not a closed portal.
- {claim: Login, membership, registration or a customer relationship does not exclude coverage. source: Kva seier. publisher: Uutilsynet. pub_date: changed 2026-06-10. confidence: high. class: regulator guidance. evidence: opened.}
  - "Ein nettstad eller app er omfatta av regelverket, også om det er nødvendig å logge seg inn," / "den krev medlemskap, registrering eller eit kundeforhold. Til dømes skal nettbankar følgje krava,"
  - Limit of the analogy (inference): a bank's customer base is open-ended, while here the agency chooses who gets in.
- {claim: The "brukere" condition in § 2 is mainly a boundary against the private sphere, which is a low bar. source: Kva seier. publisher: Uutilsynet. pub_date: changed 2026-06-10. confidence: medium. class: regulator guidance. evidence: opened.}
  - "Vilkåret må forståast som ikt-løysingar som er opne for, eller kan brukast av, innbyggjarar." / "Det avgrensar mot ikt-løysingar innanfor den private sfære."
- {claim: A website's intended audience matters little; what decides is who could in theory use it. source: Blog. publisher: Uutilsynet. pub_date: 2023-01-19, changed 2023-09-21. confidence: medium, because the post is written around public-sector rules. class: regulator blog. evidence: opened.}
  - "Kven innhaldet primært er retta mot, har som hovudregel ikkje så mykje å seie." / "Det avgjerande er kven som i teorien kan ta i bruk løysinga."
  - Risk (inference): if any business can become a client, the "in theory" group may be argued to be undefined even when access is by invitation. This is the strongest argument against relying on the invitation gate.

**Points away from coverage**
- {claim: The statutory definition of hovedløsning refers to services to the public. source: Forskrift § 3 g. publisher: Lovdata. pub_date: last amended 2023-02-01. confidence: high. class: primary law. evidence: opened.}
  - "IKT-løsninger som er en integrert del av den måten virksomheten informerer og tilbyr sine tjenester til allmennheten"
  - § 2 first sentence: "Forskriften gjelder for IKT-løsninger som underbygger virksomhetens alminnelige funksjoner," / "og som er hovedløsninger rettet mot eller stilt til rådighet for brukere."
  - Note: § 2 itself does not use "allmennheten". § 3 f and § 3 g do.
- {claim: The Blog separates websites (open, undefined group) from closed-group solutions and treats a portal for defined organisations as an extranet. source: Blog. publisher: Uutilsynet. pub_date: changed 2023-09-21. confidence: medium. class: regulator blog. evidence: opened.}
  - "Nettstadar er kjenneteikna av at dei er ei samling nettsider som er tilgjengelege for ei større og ikkje-avgrensa gruppe."
  - "Er det derimot tilsette i fleire definerte, men klart avgrensa, verksemder som har tilgang, er det eit ekstranett."
  - "Kravet om avgrensing til ei lukka gruppe personar gjer at ein ikkje berre kan sjå på kva innhald som er publisert," / "men også kven som har tilgang."
- {claim: Intranet and extranet duties are stated for public bodies only. source: Forskrift § 4b; Kva seier. publisher: Lovdata; Uutilsynet. pub_date: as above. confidence: high that the text is limited this way. class: primary law and regulator guidance. evidence: opened.}
  - § 4b: "Offentlige virksomheter har plikt til universell utforming av innhold på intranett og ekstranett"
  - Kva seier: "For offentlege verksemder gjeld krava til universell utforming også for intranett og ekstranett"
  - Neither says in terms that a private extranet is out of scope. Reading it as excluded is an inference from the express limit to public bodies.
- {claim: Fagsystem are outside the requirements, and input by the user is a marker. source: Blog; Kva seier. publisher: Uutilsynet. pub_date: as above. confidence: medium. class: regulator guidance. evidence: opened, partly paraphrased by the fetch model.}
  - "fagsystem er ein sekkekategori som femner om alle andre ikt-løysingar" / "enn dei som er omtala over"
  - "fagsystem skil seg frå intranett ved at dei krev inndata frå brukaren."
  - Whether a client browse-and-license portal is a fagsystem is untested (inference: its function resembles a shop more than a work system).
- {claim: A narrow-audience negative example exists: a company football team's site. source: Kva seier. publisher: Uutilsynet. confidence: medium. class: regulator guidance. evidence: opened, paraphrase only.}

**Limits on the Blog as evidence**
- The fetch model reports that the Blog "does not explicitly address private businesses' extranets" and does not cite § 4 or § 4b by number. Its intranet and extranet definitions also describe "interne ein-vegs kommunikasjonsplattformar for nyhende, generisk personalinformasjon". A transactional licensing portal does not fit that description well, so the extranet label is imperfect.

**Unresolved textual point (inference)**
- § 2 excludes "IKT-løsninger i virksomheter som sysselsetter arbeidstaker," / "og som brukes ved utøvelse av arbeid". Client staff use the portal at work. The sentence could be read to reach them, but Uutilsynet's B2B passage suggests it is not read as removing customer-facing B2B solutions. No source was found on this.

**Tribunal decisions (excerpts only, none opened)**
- {claim: Nemnda decisions on ICT found in this search concern public-facing or school and health services, and none concern a closed B2B portal. Items: Norwegian Air Shuttle 2022/528 (app, discrimination found), UNN 2022/607 (automats), LEXIN 22/75, Showbie 2022/591, Oslo UDE school app. source: https://www.diskrimineringsnemnda.no/media/msrnsbeo/22-528-offentlig-versjon-av-uttalelse-og-vedtak.pdf, https://www.diskrimineringsnemnda.no/media/ugslg24o/offentlig-versjon-av-nemndas-avgjoerelse-2022-607.pdf, https://www.diskrimineringsnemnda.no/showcase/2022000075, https://www.diskrimineringsnemnda.no/media/kqtc2rld/21-663-offentlig-versjon-av-nemndas-avgjoerelse.pdf. publisher: Diskrimineringsnemnda. confidence: low to medium. class: tribunal. evidence: excerpt.}
- {claim: Nemnda's formulation of § 18 and its consequence: "offentlige og private virksomheter rettet mot allmennheten plikt til universell utforming av virksomhetens alminnelige funksjoner"; "Brudd på plikten til universell utforming av IKT etter § 18 regnes som diskriminering, jf. likestillings- og diskrimineringsloven § 12." source: tribunal PDFs above, search summary did not tie each quote to a specific decision. confidence: medium. class: tribunal. evidence: excerpt.}
  - Consequence (inference): an individual complaint to Nemnda is a route separate from Uutilsynet supervision.
- The absence of a closed-portal decision in one search is not evidence that none exists.

**Not read:** Prop. 81 L (2016-2017), Prop. 141 L (2020-2021), LDL § 18 at source.

---

## 2. CLAIM: private businesses WCAG 2.0 A and AA minus 1.2.3 to 1.2.5 (35 criteria) under § 4; public bodies § 4b with EN 301 549 V3.2.1

**status: verified.** No 2026 amendment in the Lovdata header. No 2026 proposal found, which is a limited negative.

- {claim: § 4 requires WCAG 2.0 levels A and AA with exceptions for 1.2.3, 1.2.4, 1.2.5, or an equivalent standard. source: Forskrift § 4. publisher: Lovdata. pub_date: last amended 2023-02-01. confidence: high. class: primary law. evidence: opened, paraphrased by the fetch model plus "Web Content Accessibility Guidelines 2.0".}
  - Nuance: "or an equivalent standard" is part of the text as reported.
- {claim: 35 criteria. source: Kva seier. publisher: Uutilsynet. pub_date: changed 2026-06-10. confidence: high. class: regulator guidance. evidence: opened.}
  - "Private verksemders nettløysingar skal minimum utformast i samsvar med 35 suksesskriterium i WCAG 2.0"
- {claim: Applied in live enforcement in 2026: the Dr.Dropin report cites § 4 first paragraph, WCAG 2.0, and 11 of 35 minimum criteria tested. source: https://www.uutilsynet.no/tilsynsrapportar/tilsynsrapport-drdropin-drdropinno/3167. publisher: Uutilsynet. pub_date: 2026-03-12. confidence: high. class: regulator decision. evidence: opened.}
- {claim: § 4b: meeting "EN 301 549 V3.2.1 (2021-03)" satisfies the duty; the standard brings in WCAG 2.1. source: Forskrift § 4b; Kva seier. publisher: Lovdata; Uutilsynet. confidence: high. class: primary law and regulator guidance. evidence: opened.}
  - "EN 301 549 v3.2.1 er ein europeisk standard som tek inn i seg WCAG 2.1."
  - Correction of emphasis: the duty is framed as a functional requirement, and EN 301 549 is the route that fulfils it: "Viss nettløysinga er utforma i samsvar med krava i EN 301 549 v3.2.1, er desse krava oppfylte".
- {claim: Amendment status. Header reads "Sist endret: FOR-2023-01-17-87 fra 01.02.2023" and "Rettet: 05.06.2026 (departementstilhørighet)". The June 2026 item is a ministry-affiliation correction. source: Forskrift. publisher: Lovdata. confidence: high. class: primary law. evidence: opened.}
  - The 2026-06-10 date on Kva seier is that web page's edit date, not a regulation change.
- {claim: No 2026 proposal on WCAG 2.2, EN 301 549 V4 or a private-sector change surfaced in a targeted search. Uutilsynet's status page says WCAG 2.2 will not join the rules soon, dated November 2023 per the search summary. source: https://www.uutilsynet.no/fremtidig-regelverk/status-nyere-versjoner-av-wcag/1868. publisher: Uutilsynet. confidence: low to medium for the negative. class: regulator guidance. evidence: excerpt.}
  - Lead not opened: https://www.digdir.no/digitalisering-og-samordning/still-krav-i-trad-med-kommande-standardar-ved-nye-anskaffingar-av-ikt-loysingar/3134 (Digdir advising buyers to require upcoming standards).

---

## 3. CLAIM: employee ICT excluded by § 2; private intranets not covered; individual accommodation under LDL § 22

**status: verified for § 2; unverified for LDL § 22 and arbeidsmiljøloven (not checked).**

- {claim: § 2 excludes workplace ICT, unless the regulation says otherwise. source: Forskrift § 2. publisher: Lovdata. pub_date: last amended 2023-02-01. confidence: high. class: primary law. evidence: opened.}
  - "Forskriften gjelder ikke for IKT-løsninger i virksomheter som sysselsetter arbeidstaker," / "og som brukes ved utøvelse av arbeid, med mindre annet fremgår av forskriften."
  - The closing words are the opening for the public-body intranet and extranet duty in § 4b.
- {claim: Kva seier states intranet and extranet duties only for public bodies and does not address private intranets directly. source: Kva seier. publisher: Uutilsynet. confidence: medium that private intranets are out, as this rests on § 2 plus silence. class: regulator guidance. evidence: opened.}
- LDL § 22, arbeidsmiljøloven § 4-2 and § 4-6, and arbeidsplassforskriften were **not checked** within budget. No conclusion offered.

---

## 4. CLAIM: a public client passes its § 4b duty to a vendor by contract, with no statutory reach

**status: verified with corrections.** FOA § 15-2 confidence rises, and the root provision is anskaffelsesloven § 5n. The "no statutory reach" wording is right only for § 4b.

- {claim: The procurement duty sits on the contracting authority under anskaffelsesloven § 5n, further specified in FOA § 15-2 and forsyningsforskriften § 11-2. The page says the July 2026 amendment did not change this provision's content. source: https://www.anskaffelser.no/veileder-til-anskaffelsesloven/16-universell-utforming. publisher: DFØ (anskaffelser.no). pub_date: undated, refers to July 2026 amendment. confidence: medium to high. class: government guidance. evidence: opened.}
  - "oppdragsgiver skal stille krav til universell utforming"
  - The page states no direct statutory duty on the supplier. The page does not mention WCAG or any ICT standard.
- {claim: FOA § 15-2: specifications must take universal design into account when the deliverable will be used by people, and must refer to legal requirements on universal design. source: https://lovdata.no/dokument/SF/forskrift/2016-08-12-974/KAPITTEL_3-5-1 and https://www.anskaffelser.no/veileder-til-anskaffelsesforskriften/20-kravspesifikasjoner. publisher: Lovdata; DFØ. confidence: medium. class: primary law and guidance. evidence: excerpt. FOA § 15-2 wording was not opened.}
  - Search summary places § 15-2 in Part III (above EEA thresholds) and a softer "where possible" rule in § 8-3 Part II. The opened DFØ page separately cites FOSA § 8-3, so the Part II reference needs checking against source.
- {claim: When a public body buys a service or solution from a private party, the regulator treats it as the public body's solution; responsibility stays with the public body and the public-body requirements apply. source: Blog. publisher: Uutilsynet. pub_date: changed 2023-09-21. confidence: medium to high. class: regulator blog. evidence: opened.}
  - "Når ei offentleg verksemd kjøper tenester eller løysingar frå ein privat aktør," / "vil vi identifisere den eksterne løysinga med den offentlege verksemda." / "Dette gjer at det er den offentlege verksemda som er ansvarleg for å sikre at løysinga er i samsvar med gjeldande krav," / "og at det er krava til offentlege verksemder som gjeld også for desse løysingane" / "- sjølv om dei er utvikla av ein privat aktør."

**Corrections to the claim**
- This is an identification rule as well as a contract flow-down. The stricter standard applies to a purchased solution through the buyer, and enforcement would be against the buyer. A contract is how the buyer secures it. The vendor's own exposure is contractual.
- "No statutory reach" holds for § 4b only. If the portal is in scope under item 1, the vendor has its own direct § 4 duty, independent of any client.

**Does licensing images change the vendor's duty? (inference, no source found)**
- The identification rule speaks of buying "tenester eller løysingar". Licensing images from a vendor's own multi-client portal differs from commissioning a solution, so the portal seems unlikely to become the public body's solution, but the word "tenester" leaves that open. Separately, images the public body republishes on its own site fall under its own § 4b duty, including the text alternatives. A public client may therefore ask for alt text as a contract term.

---

## 5. CLAIM: EAA not incorporated into the EEA; Norwegian work has stood still since 2021

**status: verified to April 2026 on incorporation; "since 2021" unverified; directive articles unverified (not read).**

- {claim: Not in the EEA Agreement, not implemented in Norwegian law, timing unclear, work stalled. source: https://www.uutilsynet.no/tilgjengelighetsdirektivet-eaa/eus-tilgjengelegheitsdirektiv-eaa/268. publisher: Uutilsynet. pub_date: changed 2025-10-01. confidence: high as of that date. class: regulator guidance. evidence: opened.}
  - "EAA er ikkje teke inn i EØS-avtalen enno og derfor heller ikkje gjennomført i norsk rett."
  - "etter det har arbeidet stått stille både i Noreg og EØS." The start point behind "etter det" was not retrieved, so the year 2021 is not confirmed. The page ties the delay partly to whether the directive is minimum or total harmonisation.
- {claim: Independent later check: not yet adopted by EEA Joint Committee decision as of April 2026, and expected to become Norwegian law. source: https://www.anskaffelser.no/veileder-til-anskaffelsesloven/16-universell-utforming. publisher: DFØ. pub_date: undated, footnote "per april 2026". confidence: medium to high. class: government guidance. evidence: opened.}
  - Nothing dated after April 2026 was retrieved. EØS-notatbasen and EFTA were not checked, so status for April to November 2026 is unconfirmed.
- {claim: Covered services as listed by the regulator are framed around consumers, including "E-handel retta mot forbrukarar." The page does not address B2B explicitly. source: same Uutilsynet EAA page. confidence: medium. class: regulator guidance. evidence: opened.}
- {claim: Microenterprises (fewer than ten employees) are exempt for services. source: same Uutilsynet EAA page. confidence: medium to high. class: regulator guidance. evidence: opened.}
  - "verksemder som har færre enn ti tilsette"; "For _tenester_ gjer ikkje tilgjengelegheitskrava direktivet stiller seg gjeldande for mikroverksemder."
- {claim: Norwegian businesses selling into EU countries must follow the EAA there, although it is not Norwegian law. source: same Uutilsynet EAA page. confidence: medium. class: regulator guidance. evidence: opened, paraphrase.}

**Directive 2019/882 Art. 2, Art. 3, Art. 4(5): NOT READ.** The EUR-Lex fetch returned an empty page and the budget did not allow a retry on the regjeringen.no PDF. The consumer framing and microenterprise exemption above rest only on Uutilsynet's summary. Definitions of "consumer" and "e-commerce services" are unverified against the directive text.

---

## 6. CLAIM: under 1.1.1 a meaningful image with no text alternative fails, and a non-descriptive one can fail too

**status: verified.**

- {claim: Uutilsynet's rule for non-linked images requires a short alternative giving the same information as the image. source: https://www.uutilsynet.no/regelverk/oversikt-over-testregler-nettsteder/709. publisher: Uutilsynet. pub_date: changed 2025-04-15. confidence: high. class: regulator test rule. evidence: opened (overview only, full test steps not opened).}
  - 1.1.1a "Ikke-lenkede bilder har tekstalternativ." "Bilder som er meningsbærende, har et kort tekstalternativ som gir samme informasjon som bildet."
  - 1.1.1b covers linked images: the link's purpose can come from link text, alt text or the title attribute. Relevant if gallery images are links.
  - The overview states WCAG 2.1 A and AA. Rule detail page lead: https://www.uutilsynet.no/wcag-standarden/111-ikke-tekstlig-innhold-niva/87
- {claim: Dr.Dropin report found both kinds of failure in 2026 under § 4. Group b: meaningful image without an accessible name (1 item, footer logo). Group c: meaningful images with non-descriptive alt text (5 items, doctor avatars). Group d: linked images without descriptive names (4). Group a: decorative images not hidden (7). Report 2026:04. source: https://www.uutilsynet.no/tilsynsrapportar/tilsynsrapport-drdropin-drdropinno/3167. publisher: Uutilsynet. pub_date: 2026-03-12. confidence: high. class: regulator decision. evidence: opened.}
  - Tested against "Nett-1.1.1a Ikke-lenkede bilder har tekstalternativ 2025".
- {claim: W3C treats missing alternatives and placeholder alternatives as failures. source: https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html. publisher: W3C WAI. confidence: high. class: standard. evidence: opened.}
  - Normative: "All non-text content that is presented to the user has a text alternative that serves the equivalent purpose"
  - F65: "due to omitting the alt attribute or text alternative on img elements"
  - F30: "due to using text alternatives that are not alternatives (e.g., filenames or placeholder text)"
  - F39 concerns images that should be ignored ("alt="spacer" or alt="image""). It is not directly about meaningful images.

**Would the fallbacks pass? (inference from the above; no source names these strings)**
- **"Untitled image": fails.** It matches F30 placeholder text and gives no information, so it meets neither 1.1.1a nor the sensory minimum below. It leaves the page with text in the attribute, but no alternative in substance.
- **Title as alt: depends on the title.** No source says a title passes or fails as such. A descriptive title may meet the sensory minimum. A filename-like or campaign-code title fails under F30. A title that does not convey what the image shows would likely not meet "samme informasjon som bildet" for a meaningful image. Group c of Dr.Dropin shows text being present is not enough.
- **Publish with a warning** does not change this: the test applies to the published page.

**Sensory allowance**
- {claim: Sensory content needs at least descriptive identification. source: W3C Understanding 1.1.1. publisher: W3C WAI. confidence: high on the text, low on applicability. class: standard. evidence: opened.}
  - Applies when content is "primarily intended to create a specific sensory experience"; alternatives should "identify the non-text content with a descriptive label and where possible, additional descriptive text."
- Applicability (inference): in a stock or portfolio library, the image's purpose is often evaluation for licensing, so buyers need to know what it shows. That may favour descriptive text rather than a label. Not addressed by any source found. Even where it applies, "Untitled image" is not a descriptive label.

**Nearby text**
- ARIA10 (aria-labelledby) is listed as a technique, and the page defines "Programmatically associated text". The fetch reports that the Understanding page does not discuss captions as a source of alternatives, and technique pages were not opened. So a visible caption linked with aria-labelledby looks viable, but is not confirmed for the caption case. A visible caption with no programmatic link is not supported by anything read.

**AI-generated alt text**
- The W3C Understanding page does not mention AI or automatically generated alternatives. Other WAI guidance and regulators were **not searched**. No statement found, and no conclusion offered. Passing depends on the output meeting the same test (inference).

---

## 7. GAP: editor's responsibility

**status: partially answered. The page is practical guidance and does not allocate legal liability.**

- {claim: The page tells editors they carry much responsibility, and tool support does not relieve them. It says to give meaningful images alt text. source: https://www.uutilsynet.no/regelverk/redaktorens-ansvar-universell-utforming/200. publisher: Uutilsynet. pub_date: created 2016-02-10, changed 2024-07-03. confidence: high on the text. class: regulator guidance. evidence: opened.}
  - "Som redaktør har du et stort ansvar for universell utforming."
  - "Det hjelper ikke om publiseringsverktøyet har god støtte for universell utforming, dersom den som publiserer innhold ikke utnytter mulighetene."
  - "Gi bilder en alternativ tekst (alt-tekst) på bilder som gir mening til tekstinnholdet."
- The page does not mention vendors, third-party content or the staff-versus-external distinction.
- {claim: Enforcement runs against the organisation: § 4 addresses organisations' web solutions, § 5 requires them to document compliance, § 6 orders. source: Forskrift. publisher: Lovdata. confidence: high. class: primary law. evidence: opened, paraphrased by the fetch model.}
- Inference: staff publishing content does not shift the duty away from the business. The § 2 employee exclusion looks at the solution used for work. A client-facing page does not escape because staff authored it, while the internal staff pages may still be excluded. No source states this directly.

---

## 8. CLAIM: Uutilsynet can issue orders and daily fines; real cases are Dr.Dropin AS and Helseplattformen AS

**status: verified on powers; verified that the Dr.Dropin report exists; unverified on Helseplattformen, fine amounts and frequency (not checked).**

- {claim: Digdir supervises, can order measures with deadlines, and can impose daily fines only after a deadline has passed; fines can be reduced or waived. source: Forskrift §§ 5 to 7. publisher: Lovdata. confidence: high. class: primary law. evidence: opened, paraphrased by the fetch model.}
- {claim: The Dr.Dropin report found breach of 8 of 11 tested requirements, on a public site and booking flow, and contains no order, deadline or fine amount. It says only that breaches are followed up with "reaksjoner i form av pålegg om retting og eventuelt tvangsmulkt." Legal basis: "ldl § 36 første ledd jf. ldl § 18 og forskrift om universell utforming av ikt-løsninger § 5". source: https://www.uutilsynet.no/tilsynsrapportar/tilsynsrapport-drdropin-drdropinno/3167. publisher: Uutilsynet. pub_date: 2026-03-12. confidence: high. class: regulator decision. evidence: opened.}
  - Correction of emphasis: this report is not evidence of a fine. Any order would be in a separate decision, which was not retrieved.
- Not opened: https://www.uutilsynet.no/innsikt-og-analyse/data-fra-tilsyn-og-kontroll/2052. No evidence retrieved on amounts or how often fines are issued.
- No B2B or closed portal supervision case was found, but no dedicated search was run.

---

## 9. CLAIM: private businesses need no accessibility statement but must be able to document compliance under § 5

**status: verified.**

- {claim: § 4e places the statement duty on public bodies, with yearly updates, a feedback function and Digdir's central solution. § 5 requires organisations to be able to document compliance. source: Forskrift §§ 4e, 5. publisher: Lovdata. confidence: high. class: primary law. evidence: opened, paraphrased by the fetch model. The verbatim § 5 sentence was not retrieved.}
- {claim: Statement duty is framed for public bodies. source: Kva seier. publisher: Uutilsynet. pub_date: changed 2026-06-10. confidence: high. class: regulator guidance. evidence: opened.}
  - "må offentlege verksemder publisere ei tilgjengelegheitserklæring på alle sine appar og nettstader."
- {claim: Dr.Dropin, a private company, was supervised using § 5 as part of the legal basis. source: Dr.Dropin report above. confidence: high. class: regulator decision. evidence: opened.}

---

## Still open

Not checked within budget:
1. **Item 1:** Prop. 81 L (2016-2017) and Prop. 141 L (2020-2021); LDL § 18 at source; tribunal PDFs (excerpts only); Uutilsynet Q&A beyond the two pages read. A direct written question to Uutilsynet may be the only way to close this gap.
2. **Item 2:** a full check of regjeringen.no's consultation list for 2026; EN 301 549 V4 status; the Digdir lead on upcoming standards.
3. **Item 3:** LDL § 22, arbeidsmiljøloven § 4-2 and § 4-6, arbeidsplassforskriften.
4. **Item 4:** FOA § 15-2 and § 8-3 wording at source; how thresholds work with § 5n; Uutilsynet Q&A on licensing as opposed to buying a solution.
5. **Item 5:** Directive 2019/882 Art. 2, Art. 3, Art. 4(5) text (EUR-Lex fetch returned empty); the 2021 date; status after April 2026 (EØS-notatbasen, EFTA).
6. **Item 6:** WAI and regulator statements on AI-generated alt text; full test steps of 1.1.1a; technique pages on captions and aria-labelledby.
7. **Item 8:** Helseplattformen AS; fine amounts and frequency; any closed-portal supervision.

## Budget used

19 tool calls against a budget of 18 and a hard cap of 20: 1 ToolSearch, 13 WebFetch (one returned empty; three were narrower re-reads of pages already fetched), 3 WebSearch, 1 Write, and 1 Edit to correct this line, which was the call over budget.
