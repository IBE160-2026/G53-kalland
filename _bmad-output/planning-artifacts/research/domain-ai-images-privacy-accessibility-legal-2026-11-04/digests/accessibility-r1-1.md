# Digest: accessibility law for a gated B2B web app (Norway, then EU/EEA)

Run date 2026-11-04. All sources accessed 2026-11-04.

**Evidence levels, read this first**
- `read`: the page was fetched this run. WebFetch returns text through a summarising model with a limit on quote length, so legal quotes are accurate fragments, not complete sections. Check the wording on Lovdata before quoting it in a legal document.
- `excerpt`: seen only through a search tool's summary of the page. The page itself was not fetched. Treat these as leads with good provenance.
- `inference`: my application of a source to the question. These are labelled, and they are not source statements.
- `two_source`: "yes" means two independent sources support the claim. A law text plus the regulator's reading counts. "single" means only one was found.

## Findings by question

### Q1. Scope: does the duty cover a private B2B portal behind a login?

- **claim:** LDL § 18 applies to private businesses. It covers "hovedløsninger" for ICT "rettet mot eller stilt til rådighet for bruker". The wording "rettet mot allmennheten" appears in §§ 17 and 19 of the current act, not in § 18. § 18 was amended by lov 11 June 2021 nr. 77, in force 1 Jan 2022.
  - source: https://lovdata.no/dokument/NL/lov/2017-06-16-51/KAPITTEL_3
  - publisher: Lovdata (statute text) | pub_date: undated page; last amendment noted is in force 1 Jan 2022 | confidence: high | class: scope | evidence: read | two_source: yes (with the next claim)
- **claim:** Forskrift § 2 has four limbs: ICT that "underbygger virksomhetens alminnelige funksjoner", that is "hovedløsninger rettet mot eller stilt til rådighet for brukere", and that is limited to "nettløsninger, herunder digitale læremidler, og automater". A "nettløsning" (§ 3 d) is information or a service available in a browser or similar, via a URI, over http.
  - source: https://lovdata.no/dokument/SF/forskrift/2013-06-21-732
  - publisher: Lovdata (regulation text) | pub_date: last changed 01.02.2023 (FOR-2023-01-17-87) | confidence: high | class: scope | evidence: read | two_source: yes
- **claim:** Uutilsynet's test has three parts: the solution is aimed at inhabitants or customers in Norway, it is an important channel for information or services (hovudløysing), and it is linked to the business's alminnelege funksjon. "Dersom du svarer ja på desse punkta, gjeld reglane for verksemda." Employee count, turnover and legal form do not matter: "Reglane gjeld uansett kor mange tilsette verksemda har, kva omsetnad eller organisasjonsform den har."
  - source: https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153
  - publisher: Uutilsynet (Digdir) | pub_date: created 16 Mar 2016, last changed 10 Jun 2026 | confidence: high | class: scope | evidence: read | two_source: single regulator reading, consistent with the regulation
- **claim:** A login does not remove coverage. A site or app is covered "også om det er nødvendig å logge seg inn, den krev medlemskap, registrering eller eit kundeforhold". Internet banks are the example, and content behind login or a paywall is listed as covered.
  - source: https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153
  - publisher: Uutilsynet | pub_date: last changed 10 Jun 2026 | confidence: high | class: scope | evidence: read | two_source: single (regulator guidance). The regulation is silent on login, and no court or tribunal decision was found.
- **claim:** B2B is not excluded. A site promoting services to businesses counts as aimed at "brukarar" even though the group is limited. The solution need not target all inhabitants ("treng ikkje å rette seg mot alle innbyggjarar"), and a business aimed at specific groups is covered "så lenge ho er stor og ubestemd". This "large and undefined" group limit is the most relevant test for a closed client portal.
  - source: https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153
  - publisher: Uutilsynet | pub_date: last changed 10 Jun 2026 | confidence: medium (the B2B example is about a promotional site, not a closed portal) | class: scope | evidence: read | two_source: single
- **claim:** "Hovudløysing" is defined as "en integrert del av den måten virksomheten informerer og tilbyr sine tjenester til allmennheten". A business can have several. Examples that are not main solutions: a beta or pilot website, and an old app that has been replaced but stays available during a transition period. "Alminnelig funksjon" is assessed concretely against the business's purpose. Hotel example: the booking site and Facebook page are covered, the company football team's site is not.
  - source: https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153
  - publisher: Uutilsynet | pub_date: last changed 10 Jun 2026 | confidence: high | class: scope | evidence: read | two_source: yes (with forskrift §§ 2 and 3)
- **claim:** § 18 has a built-in limit. The duty does not apply if it would impose a disproportionate burden, weighing the effect of removing barriers, the nature and size of the business, costs and resources. Uutilsynet describes exemption as exceptional, "terskelen er høg", and private bodies apply to the regulator for dispensation.
  - source: https://lovdata.no/dokument/NL/lov/2017-06-16-51/KAPITTEL_3 and https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153
  - publisher: Lovdata; Uutilsynet | pub_date: see above | confidence: high | class: scope | evidence: read | two_source: yes
- **inference (not a source statement):** Login is not a defence. The open question is whether the client group is "stor og ubestemd" or a small set of individually contracted clients. Licensing images to clients looks like an alminnelig funksjon, and the portal looks like a hovedløsning if it is the channel for that service. No source decides a closed, invitation-only B2B portal. Treat it as probably covered if clients self-register or the client base is open-ended, and arguable if access is by individual contract with a small named group.

### Q2. Internal staff tools

- **claim:** The regulation excludes staff tools. Forskrift § 2: "Forskriften gjelder ikke for IKT-løsninger i virksomheter som sysselsetter arbeidstaker, og som brukes ved utøvelse av arbeid, med mindre annet fremgår av forskriften."
  - source: https://lovdata.no/dokument/SF/forskrift/2013-06-21-732
  - publisher: Lovdata | pub_date: last changed 01.02.2023 | confidence: high | class: scope-internal | evidence: read | two_source: yes (with the next two claims)
- **claim:** The "annet" that is stated applies to public bodies only. § 4b fourth paragraph: "Offentlige virksomheter har plikt til universell utforming av innhold på intranett og ekstranett som er publisert etter 1. februar 2023, eller som har gjennomgått en vesentlig revisjon". Uutilsynet confirms this for public bodies and says the page "does not explicitly address private-sector intranets" (the fetch tool's wording).
  - source: https://lovdata.no/dokument/SF/forskrift/2013-06-21-732 and https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153
  - publisher: Lovdata; Uutilsynet | pub_date: see above | confidence: high | class: scope-internal | evidence: read | two_source: yes
- **claim:** Specialist systems are outside the rules: "Ikt-løysingar som reknast som fagsystem fell på si side utanfor regelverkets verkeområde." Uutilsynet says intranet does not include case handling, publishing solutions, time and expense systems, or other specialist systems.
  - source: https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153 and https://www.uutilsynet.no/regelverk/regelverk-universell-utforming-av-ikt/265
  - publisher: Uutilsynet | pub_date: last changed 10 Jun 2026; 25 Nov 2025 | confidence: high | class: scope-internal | evidence: read | two_source: single publisher, two pages
- **claim:** Individual accommodation still applies. LDL § 22: "Arbeidstakere og arbeidssøkere med funksjonsnedsettelse har rett til egnet individuell tilrettelegging" of the hiring process, workplace and tasks. § 26 is a general employer duty to work "aktivt, målrettet og planmessig" for equality, not an ICT rule.
  - source: https://lovdata.no/dokument/NL/lov/2017-06-16-51/KAPITTEL_3
  - publisher: Lovdata | pub_date: § 26 amended by lov 21 June 2019 nr. 57, in force 1 Jan 2020 | confidence: high | class: employment | evidence: read | two_source: single (law text only)
- **claim:** LDL § 19 a reaches private businesses: "Offentlige og private virksomheter skal arbeide aktivt og målrettet for å fremme universell utforming av IKT". The reporting part of § 19 a applies to public bodies only.
  - source: https://lovdata.no/dokument/NL/lov/2017-06-16-51/KAPITTEL_3
  - publisher: Lovdata | pub_date: as above | confidence: high | class: scope | evidence: read | two_source: single
- **unverified belief, no evidence retrieved this run:** arbeidsmiljøloven has accommodation and working-environment duties that could touch on ICT at work. See "Looked for and could not find".

### Q3. Which standard applies

- **claim:** Private businesses: WCAG 2.0, levels A and AA, except 1.2.3, 1.2.4 and 1.2.5, "eller tilsvarende denne standard" (§ 4). Quote: "Private virksomheters nettløsninger skal minst utformes i samsvar med standard Web Content Accessibility Guidelines 2.0 (WCAG 2.0)/NS/ISO/IEC 40500:2012, på nivå A og AA med unntak for suksesskriteriene 1.2.3, 1.2.4 og 1.2.5".
  - source: https://lovdata.no/dokument/SF/forskrift/2013-06-21-732
  - publisher: Lovdata | pub_date: last changed 01.02.2023 | confidence: high | class: standard | evidence: read | two_source: yes
- **claim:** The regulator confirms this as of June 2026: private bodies "skal minimum utformast i samsvar med 35 suksesskriterium i WCAG 2.0".
  - source: https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153
  - publisher: Uutilsynet | pub_date: last changed 10 Jun 2026 | confidence: high | class: standard | evidence: read | two_source: yes
- **claim:** Enforcement matches the text. The March 2026 report on a private AS measures breaches under "forskrift om universell utforming av ikt-løsninger § 4 første ledd" against WCAG 2.0 criteria, using the 35 minimum requirements.
  - source: https://www.uutilsynet.no/tilsynsrapportar/tilsynsrapport-drdropin-drdropinno/3167
  - publisher: Uutilsynet | pub_date: 12 Mar 2026 | confidence: high | class: standard | evidence: read | two_source: yes
- **claim:** Public bodies have a separate duty in § 4b. Their solutions must be perceivable and so on, and "Offentlige virksomheters nettløsninger som samsvarer med kravene i EN 301 549 V3.2.1 (2021-03)" meet it. Uutilsynet says this standard brings in WCAG 2.1 and "ytterlegare 12 suksesskriterium som berre gjeld for offentleg sektor". In force 1 Feb 2023.
  - source: https://lovdata.no/dokument/SF/forskrift/2013-06-21-732 and https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153
  - publisher: Lovdata; Uutilsynet | pub_date: see above | confidence: high | class: standard | evidence: read | two_source: yes
- **claim:** The Web Accessibility Directive implementation added no requirements for the private sector: "Virksomheter i privat sektor får ingen nye krav", and "dagens 35 minstekrav" "gjelder fortsatt".
  - source: https://www.uutilsynet.no/regelverk/regelverk-universell-utforming-av-ikt/265
  - publisher: Uutilsynet | pub_date: created 19 Nov 2020, last changed 25 Nov 2025 | confidence: high | class: standard | evidence: read | two_source: yes
- **claim:** The WAD was incorporated by EEA Joint Committee decision nr. 59/2021 of 5 Feb 2021.
  - source: https://www.regjeringen.no/no/aktuelt/eus-regler-om-universell-utforming-av-ikt-wad-er-innlemmet-i-eos-avtalen/id2831891/
  - publisher: Regjeringen | pub_date: not shown in the excerpt | confidence: medium | class: standard | evidence: excerpt | two_source: single
- **resolution of the known conflict:** There is no real conflict. The regulation has two tracks: § 4 (private, WCAG 2.0) and § 4b (public, EN 301 549, which brings in WCAG 2.1). A remaining inconsistency is listed under Contradictions.
- **WCAG 2.2 or a private-sector change:** I found no source announcing one. See "Looked for and could not find". This is limited evidence, not proof of absence.

### Q4. Public-sector clients

- **claim:** Public bodies must ensure that services they buy from private vendors and offer to citizens meet the same requirements. Examples are forms, learning platforms and booking tools. Public bodies are also responsible for accessibility statements that cover third-party solutions.
  - source: https://www.uutilsynet.no/regelverk/regelverk-universell-utforming-av-ikt/265
  - publisher: Uutilsynet | pub_date: last changed 25 Nov 2025 | confidence: medium-high | class: procurement | evidence: read | two_source: single
- **claim:** § 4b, § 4b fourth paragraph and § 4e are addressed to "Offentlige virksomheter". The text read names no direct duty on private vendors.
  - source: https://lovdata.no/dokument/SF/forskrift/2013-06-21-732
  - publisher: Lovdata | pub_date: last changed 01.02.2023 | confidence: high for the text as read | class: procurement | evidence: read | two_source: single
- **claim:** Public buyers must take universal design into account under forskrift om offentlige anskaffelser § 15-2.
  - source: excerpt from uutilsynet.no search results, page not identified with certainty (candidates: https://www.uutilsynet.no/kartlegginger/digitalisering-alle/936 and https://www.uutilsynet.no/apper/sporsmal-og-svar-om-apper/762)
  - publisher: Uutilsynet | pub_date: undated | confidence: low (procurement text not read, and the section number may be out of date) | class: procurement | evidence: excerpt | two_source: single
- **inference:** The stricter regime reaches a vendor through the contract, not by statute. A public client that offers the vendor's service on to citizens, or uses it as its own extranet, would carry the § 4b duty and would pass it down in the contract. A private vendor licensing images to a public body for the body's own use is not shown by any source to fall under § 4b. EN 301 549 is named only in § 4b. No anskaffelser.no source was read, so this is an open point.

### Q5. European Accessibility Act (Directive 2019/882)

- **claim:** Not incorporated into the EEA Agreement and not implemented in Norwegian law. A consultation ran in 2021, and work has stood still in Norway and the EEA since then.
  - source: https://www.uutilsynet.no/tilgjengelighetsdirektivet-eaa/eus-tilgjengelegheitsdirektiv-eaa/268
  - publisher: Uutilsynet | pub_date: last-changed date not seen | confidence: medium (excerpt, and the date is unknown) | class: eaa | evidence: excerpt | two_source: partly, see the next two claims
- **claim:** The EØS-notat, dated 09.06.2021, lists the act as under assessment in the EEA/EFTA states, EEA-relevant ("EØS-relevant: Ja, Akseptabelt: Ja"). It is stale, so it does not show today's status.
  - source: https://www.regjeringen.no/no/sub/eos-notatbasen/notatene/2016/mars/eus-tilgjengelighetsdirektiv/id2498097/
  - publisher: Regjeringen | pub_date: 09.06.2021 | confidence: medium | class: eaa | evidence: excerpt | two_source: yes for the 2021 status, not for today
- **claim:** Incorporation needs Stortinget's consent, and implementation needs a change in the law: "Innlemmelse av direktivet i EØS-avtalen forutsetter Stortingets samtykke." "Gjennomføringen av EØS-komiteens beslutning vil kreve lovendring." Requirements apply in the EU from 28 June 2025. The paper proposes a new regulation under LDL, with e-commerce requirements handled separately (this line was seen only in part).
  - source: https://www.regjeringen.no/contentassets/d474eafb40db46439f0113a447884ee0/vedlegg-i-horingsnotat-l1933885.pdf and the consultation page https://www.regjeringen.no/no/dokumenter/hoering--gjennomforing-av-tilgjengelighetsdirektivet/id2842980/
  - publisher: Regjeringen (Kultur- og likestillingsdepartementet per the search summary) | pub_date: 2021 per Uutilsynet; no date in the text examined | confidence: high for the quoted lines | class: eaa | evidence: read in part (PDF text extracted and keyword-searched, not read through) | two_source: yes with Uutilsynet
- **claim:** Services in scope are consumer-facing. The paper describes "nærmere angitte tjenester som leveres til forbrukere etter 28. juni 2025". It lists "Banktjenester for forbrukere", and "E-handelstjenester" defined as services provided at a distance via websites and mobile services, tied to a "forbrukeravtale".
  - source: https://www.regjeringen.no/contentassets/d474eafb40db46439f0113a447884ee0/vedlegg-i-horingsnotat-l1933885.pdf
  - publisher: Regjeringen | pub_date: 2021 per Uutilsynet | confidence: high for consumer wording, medium for the conclusion that pure B2B falls outside | class: eaa | evidence: read in part | two_source: single (directive text exists at the regjeringen.no URL below, not read)
- **unverified belief:** Directive art. 4(5) exempts microenterprises providing services (fewer than 10 persons and turnover or balance sheet of EUR 2 million or less). I did not retrieve this run. Directive text: https://www.regjeringen.no/contentassets/d474eafb40db46439f0113a447884ee0/europaparlaments-og-radsdirektiv-eu-2019-882-av-17.-april-2019-tilgjengelighetskrav-for-produkter-og-tjenester.pdf
- **inference:** A login-gated B2B licensing portal is not an EAA-covered consumer service on the wording seen. The EAA is also not yet law in Norway. If the portal later sells to consumers or into the EU, that needs rechecking.

### Q6. Alt text

- **claim:** The applicable criterion is 1.1.1. Uutilsynet: "Gi brukeren et tekstalternativ for innhold som ikke er tekst." "Alle bilder i HTML skal ha alt-attributt." Decorative images take an empty alt. It is one of the 35 private-sector minimum requirements (it was tested as such in the Dr.Dropin report).
  - source: https://www.uutilsynet.no/veiledning/111-ikke-tekstlig-innhold/1231 and https://www.uutilsynet.no/tilsynsrapportar/tilsynsrapport-drdropin-drdropinno/3167
  - publisher: Uutilsynet | pub_date: last changed 18 Mar 2025; 12 Mar 2026 | confidence: high | class: alt-text | evidence: read | two_source: single publisher, guidance plus enforcement
- **claim:** The alternative must carry the image's meaning, not just exist. Meaningful images need a short alternative giving the same information as the image. Complex images need a short alternative plus a detailed description. For linked images the alternative must describe the link target. For images that are sensory experiences, a descriptive identification can be enough.
  - source: https://www.uutilsynet.no/veiledning/111-ikke-tekstlig-innhold/1231
  - publisher: Uutilsynet | pub_date: last changed 18 Mar 2025 | confidence: high | class: alt-text | evidence: read | two_source: yes with https://www.uutilsynet.no/veiledning/bilder-og-grafikk/205 (excerpt)
- **claim:** Weak alt text is itself punished. The Dr.Dropin 1.1.1 findings, 17 items: 7 decorative images not coded to be ignored, 1 logo without an accessible name, 5 doctor avatars with alt text that was "not descriptive", 4 linked images without a descriptive name.
  - source: https://www.uutilsynet.no/tilsynsrapportar/tilsynsrapport-drdropin-drdropinno/3167
  - publisher: Uutilsynet | pub_date: 12 Mar 2026 | confidence: high | class: alt-text, enforcement | evidence: read | two_source: single
- **claim:** Missing alt: screen readers read out the file location and file name, which the page calls potentially very disruptive. Publishing tools should add the alt attribute and let authors mark an image as decorative. This is guidance, not law.
  - source: https://www.uutilsynet.no/veiledning/111-ikke-tekstlig-innhold/1231
  - publisher: Uutilsynet | pub_date: last changed 18 Mar 2025 | confidence: high | class: alt-text | evidence: read | two_source: single
- **claim:** The only AI statement found: Facebook's automatic AI description has varying quality and should always be verified manually. It is about a social platform, not a rule on AI-generated alt text.
  - source: https://www.uutilsynet.no/veiledning/sosiale-medier-og-universell-utforming/202
  - publisher: Uutilsynet | pub_date: undated | confidence: medium | class: alt-text | evidence: excerpt | two_source: single
- **inference:**
  - No source bans AI-generated alt text. The test is the result: does the text give the same information as the image? So a wrong or generic AI text can fail like the Dr.Dropin avatars.
  - Publishing a meaningful image with no alternative on an in-scope page fails 1.1.1 on Uutilsynet's reading. A warning to staff does not change the result, because the criterion looks at the published page.
  - A title used as fallback passes only if it actually conveys the image's information. It is not automatically compliant or non-compliant.
  - Whether the sensory-experience allowance helps with a design image library was not tested in any source read.

### Q7. Enforcement

- **claim:** Digitaliseringsdirektoratet supervises (LDL § 36; forskrift § 5), and Uutilsynet is the unit acting for it. It "kan gi pålegg om retting til en virksomhet som ikke oppfyller plikten til universell utforming av IKT" and "kan treffe vedtak om tvangsmulkt for å sikre gjennomføring av pålegget". Forskrift § 6 gives the same order power. It can demand information and access to ICT solutions. The ministry may set rules on the size of the fine. No amount is stated in the act.
  - source: https://lovdata.no/dokument/NL/lov/2017-06-16-51/KAPITTEL_3 and https://lovdata.no/dokument/SF/forskrift/2013-06-21-732
  - publisher: Lovdata | pub_date: see above | confidence: high | class: enforcement | evidence: read | two_source: yes with the Dr.Dropin report
- **claim:** Sequence: final report plus order to correct, with a warning of daily fines; then a decision on daily fines with a new deadline, usually ten working days (an older page says 14 days); then a follow-up test. Factors: number of users, seriousness, cost and difficulty of fixing, turnover and size. The fine should be set so it does not pay to leave errors unfixed. Statens Innkrevingssentral collects it. Appeals go to the ministry (DFD on the newer pages).
  - source: https://www.uutilsynet.no/tilsyn/slik-forer-vi-tilsyn-med-nettsteder-og-apper/84
  - publisher: Uutilsynet | pub_date: undated | confidence: medium | class: enforcement | evidence: excerpt | two_source: yes with LDL § 36 for the core powers
- **claim:** A real private-law company case: Dr.Dropin AS. Ten pages tested, including the booking flow, 11 of 35 criteria tested, breaches on 8: 1.1.1, 1.3.1, 1.4.3, 2.1.1, 2.4.7, 3.1.1, 3.3.2, 4.1.2. The report mentions follow-up by orders and possibly fines, and gives no specific order, deadline or fine.
  - source: https://www.uutilsynet.no/tilsynsrapportar/tilsynsrapport-drdropin-drdropinno/3167
  - publisher: Uutilsynet | pub_date: 12 Mar 2026 | confidence: high | class: enforcement | evidence: read | two_source: single
- **claim:** The fine case found: Helseplattformen AS. 64 errors remained when the deadline passed on 8 Dec 2025. The daily fine was set to start if not fixed by 19 Dec 2025. A 23 Dec 2025 follow-up showed the errors were fixed, and supervision closed. The fine ran for about two days (search summary's reading). Ownership was not checked, so do not read this as a purely private company. No amount was seen.
  - source: https://www.uutilsynet.no/tilsyn/pressemelding-helseplattformen-risikerer-dagboter/3102 and https://www.uutilsynet.no/tilsyn/tilsyn-med-helseplattformen-vert-avslutta/3123
  - publisher: Uutilsynet | pub_date: Dec 2025 or later, not shown | confidence: medium | class: enforcement | evidence: excerpt | two_source: single publisher, two pages
- **claim:** Other private supervision exists, for example Komplett.no AS. Not read.
  - source: https://www.uutilsynet.no/tilsynsrapportar/tilsynsrapport-komplettno/13
  - publisher: Uutilsynet | pub_date: not seen | confidence: low | class: enforcement | evidence: excerpt | two_source: single
- **pattern (inference from a small sample):** Supervised cases seen are public-facing services with broad reach (booking, e-commerce, health platform). Correction after an order appears to be the normal end point. I saw no case about a closed B2B portal.

### Q8. Duties beyond WCAG

- **claim:** The accessibility statement is a public-sector duty. § 4e: "Offentlige virksomheter skal avgi en tilgjengelighetserklæring om etterlevelse av kravene i § 4b", using Digdir's central solution, updated at least yearly. Uutilsynet: private businesses are not required to have one.
  - source: https://lovdata.no/dokument/SF/forskrift/2013-06-21-732 and https://www.uutilsynet.no/tilgjengelighetserklaering/ofte-stilte-sporsmal-om-tilgjengelighetserklaeringen/894
  - publisher: Lovdata; Uutilsynet | pub_date: 01.02.2023; undated | confidence: high | class: statement | evidence: read (law), excerpt (Uutilsynet) | two_source: yes
- **claim:** A documentation duty applies to any business under the regulation. § 5: "Virksomhet som har ansvar etter forskriften, skal kunne dokumentere at kravene er overholdt." "Ansvarsforhold i virksomheten og hvilke standarder som er benyttet for universell utforming av den aktuelle IKT-løsningen skal dokumenteres." This is not limited to public bodies.
  - source: https://lovdata.no/dokument/SF/forskrift/2013-06-21-732
  - publisher: Lovdata | pub_date: last changed 01.02.2023 | confidence: high | class: documentation | evidence: read | two_source: single
- **claim:** § 19 a active-effort duty for private businesses (see Q2). § 19 a reporting is for public bodies only.
  - source: https://lovdata.no/dokument/NL/lov/2017-06-16-51/KAPITTEL_3
  - publisher: Lovdata | pub_date: as above | confidence: high | class: statement | evidence: read | two_source: single

## Contradictions

1. **WCAG version for private businesses.**
   - Side A: WCAG 2.0, 35 criteria. Forskrift § 4 (last changed 01.02.2023), Uutilsynet "Kva seier forskrifta?" (10 Jun 2026), Dr.Dropin report (12 Mar 2026).
   - Side B: a search-tool summary of uutilsynet.no results said "WCAG 2.1 på alle minstekrav" for websites, and 29 WCAG 2.1 criteria for private apps (likely older pages, such as https://www.uutilsynet.no/apper/sporsmal-og-svar-om-apper/762).
   - Resolution: Side A for websites, on primary text and recency. Side B is a search summary I did not check on the page. App criteria for private businesses remain unverified.
2. **Number of criteria on the public track.** The regelverk page says "48 av 78 suksesskriterier", and also that all WCAG 2.1 A and AA criteria apply through EN 301 549. It lists 12 mobile criteria in one section and 17 new criteria in another. "Kva seier forskrifta?" gives 35 plus "ytterlegare 12" (47). Source: https://www.uutilsynet.no/regelverk/regelverk-universell-utforming-av-ikt/265 versus https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153. Not resolved. It does not affect a private vendor unless a contract imports the public track.
3. **"Allmennheten" as the test.** LDL § 18 as read says "bruker", forskrift § 2 says "brukere". Uutilsynet's definition of hovudløysing still says "til allmennheten" and its test uses "stor og ubestemd". Not a formal conflict, but it matters for closed portals. Statute text wins on wording, and the regulator's reading shows how it is applied.
4. **Fine deadline and appeal body.** Newer Uutilsynet page: usually ten working days, appeal to DFD. Older page: 14 days, appeal to the former ministry (KDD). Recency favours the newer page. Both excerpts only.
5. **Who supervises.** A search summary treated this as unclear. LDL § 36 and the Dr.Dropin report resolve it: Digitaliseringsdirektoratet, through Tilsynet for universell utforming av ikt.

## Leads worth chasing

- Whether a closed, invitation-only B2B portal meets "stor og ubestemd". Try https://www.uutilsynet.no/uubloggen/nettstad-intranett-ekstranett-app-eller-fagsystem/1557 (not read; it also defines extranet and fagsystem) and the exemptions page.
- Procurement text: anskaffelsesforskriften (check the current section number), anskaffelser.no guidance on universal design, and whether public buyers cite EN 301 549 in contracts.
- Current EAA status with a date: Uutilsynet's EAA page (fetch it for the last-changed date), EØS-notatbasen, and any 2026 EFTA or Joint Committee decision.
- Directive 2019/882 art. 2 and art. 4(5), from the regjeringen.no PDF listed under Q5, for the B2B and microenterprise wording. Uutilsynet's EAA page may give a Norwegian reading.
- Swedish government memorandum from October 2026 on accessibility requirements: https://www.regeringen.se/rattsliga-dokument/departementsserien-och-promemorior/2026/10/tillganglighetskrav-pa-ny-normgivningsniva/ (relevance to Norway unknown).
- Commission note of 31 Jul 2025: https://commission.europa.eu/news-and-media/news/eu-becomes-more-accessible-all-2025-07-31_da
- Redaktørens ansvar: https://www.uutilsynet.no/regelverk/redaktorens-ansvar-universell-utforming/200 (editor duties, relevant to staff publishing).
- Komplett.no report and the Helseplattformen pages, for fine amounts and how many fines exist in total. Data: https://www.uutilsynet.no/innsikt-og-analyse/data-fra-tilsyn-og-kontroll/2052
- Test rule for 1.1.1: https://www.uutilsynet.no/regelverk/oversikt-over-testregler-nettsteder/709 could show whether an AI or title-based text passes the regulator's actual test.

## Looked for and could not find

- **Uutilsynet guidance on AI-generated alt text:** a domain-limited search and the 1.1.1 page found none. The only AI statement is the Facebook note, which was seen as an excerpt.
- **A source deciding a closed B2B portal:** none found in the Uutilsynet pages read. The regulation does not mention login or B2B.
- **A planned move to WCAG 2.2 or new private-sector rules:** nothing surfaced, and no query targeted this alone. The 25 Nov 2025 and 10 Jun 2026 Uutilsynet pages still state the current rules without mentioning a change. This is weak evidence of absence.
- **Fine amounts:** not in LDL § 36 and not seen in any excerpt.
- **Diskrimineringsnemnda decisions on ICT:** not searched within budget. This is a gap, not a finding that none exist.
- **Arbeidsmiljøloven rules on ICT at work:** not searched within budget.
- **anskaffelser.no and the procurement regulation text:** not read within budget.
- **W3C and EUR-Lex text:** not read within budget.
- **EAA microenterprise exemption in a source I read:** my keyword search of the consultation paper showed no "mikroforetak" or "mikrovirksomhet" in the output, but the output was cut at 45 lines, so this says nothing about the paper as a whole.
- **Date of the consultation paper:** no date in the extracted first page. 2021 comes from Uutilsynet's excerpt.

## Round notes

- **Round 1 (calls 1 to 13):** ToolSearch, then law text, regulation, Uutilsynet's regelverk page, and searches on scope, EAA and enforcement. This resolved the WCAG conflict and the employment exclusion in § 2. A generic "tvangsmulkt" search without a domain limit returned only other agencies, so I re-ran it limited to uutilsynet.no. One URL I guessed returned 403, which is not evidence of blocking. Lovdata did not block.
- **Round 2 (calls 14 to 20):** alt-text guidance, Dr.Dropin report, "Kva seier forskrifta?" (the most valuable single source), PDF extraction of the EAA consultation paper, and an EAA status search. One call failed (PDF rendering not installed).
- **Why I stopped:** budget exhausted at 20 calls, not coverage or novelty exhaustion. Round 2 kept adding load-bearing claims. Q4, the Diskrimineringsnemnda part of Q7, the arbeidsmiljøloven part of Q2 and the microenterprise part of Q5 are under-researched. Q1 (except closed portals), Q3, Q6 and Q8 are well covered.
- **Counts:** 7 sources fetched and read (one of them, the PDF, only by keyword search), about 10 more seen only as search excerpts. All 20 calls used, excluding this file write.
