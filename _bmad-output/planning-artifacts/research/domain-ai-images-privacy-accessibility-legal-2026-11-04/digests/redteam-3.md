# Red team 3: accessibility conclusions I to M

Accessed date for every source: 2026-11-04. Jurisdiction: Norway, then EU/EEA.

## Limits of this run

- Budget used: 14 of 14 tool calls. Pages listed under "follow-up" were found but not opened.
- `opened` means the page was fetched, but the fetch tool returns a model summary with quotes capped at 125 characters. Long sentences are therefore truncated. No source was read in full by a human-equivalent pass.
- `excerpt` means the claim comes from a search tool's summary of the result, not from an opened page. Treat these as leads with an attribution, not as verified quotes.
- The EUR-Lex fetch of Directive (EU) 2019/882 returned an empty page. No directive text was retrieved, so the definitions of "consumer" and "e-commerce services" are not evidenced here.
- Most publication dates are not stated by the sources. These are given as `not stated`.

## Summary

| Conclusion | Verdict | Main reason |
|---|---|---|
| I | weakened | The regulator's framing points toward out of scope for a private extranet, so the neutral "cannot be stated" undersells that reading. |
| J | survives | The regulation text still says WCAG 2.0 for private businesses, and no later amendment or contrary statement was found. |
| K | weakened | The regulation exclusion holds, but "leaving only individual accommodation" is too narrow. |
| L | weakened | W3C's sensory exception names visual art, so a descriptive title may be enough for some images. "Untitled image" still fails. |
| M | weakened | "Not incorporated" holds on excerpt evidence, but "does not apply" is too broad if the agency sells into the EU. The B2B limb is unevidenced. |

---

## I. The invitation-only B2B portal cannot be stated to be outside the duty

**Verdict: weakened.** "Login does not itself exclude" holds. The neutral "cannot be stated" is weaker than it looks, because the best regulator material found points to out of scope. "Build as if covered" can stand as a business choice, but this evidence does not support it as a legal conclusion.

**Strongest counter-argument (out of scope).** Uutilsynet reportedly treats solutions for the general public as the main rule, and intranets and extranets as an exception brought in by the Web Accessibility Directive for the public sector. The regulation's extranet definition, websites giving selected third parties access to limited content, describes this portal closely. Read by contrast, a private business's extranet is not covered. A public body being among the clients does not change this, because the portal is the private agency's own solution. That last step is my inference, and no source states it.

**Second argument, from the text only (no authority found).** § 2 excludes ICT "brukes ved utøvelse av arbeid". Client staff use the portal in their work, which could support exclusion. The wording "IKT-løsninger i virksomheter som sysselsetter arbeidstaker" more naturally means the employer's own tools, so this argument is weak.

**Counter-counter (in scope).** A public-sector webinar reportedly says users behind login count as users even though the solution is not open to everyone. It concerns pupils, students and parents, in a public-sector setting after the directive, so it transfers poorly to contracted B2B clients. KS says the rules cover every business with a website, app or vending machine, but this is a secondary general statement. "Clearly in scope" is not established either.

**Evidence**

| Claim | Source | Publisher | Pub date | Confidence | Evidence |
|---|---|---|---|---|---|
| The regulation is aimed at solutions for the general public as a starting point; intranet and extranet are an exception because of the directive. Paraphrased, source pinned only as "kilde 3 og 9" of the search. | https://www.uutilsynet.no/uubloggen/nettstad-intranett-ekstranett-app-eller-fagsystem/1557 and https://www.uutilsynet.no/webdirektivet-wad/eus-webdirektiv-blir-en-del-av-norsk-regelverk/132 | Uutilsynet | not stated | medium | excerpt |
| Extranet is defined as websites giving selected third parties access to limited content. | https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153 | Uutilsynet | not stated | medium | excerpt |
| Public-sector intranets and extranets must comply if new or substantially revised after 2023-02-01. | https://www.uutilsynet.no/uubloggen/nettstad-intranett-ekstranett-app-eller-fagsystem/1557 | Uutilsynet | not stated | medium | excerpt |
| Pupils, students and parents count as users behind login. | https://www.uutilsynet.no/podkast-og-webinar/tilgjengelighetserklaering-offentlig-sektor/2787 | Uutilsynet | not stated | medium | excerpt |
| § 2 covers ICT underpinning the business's ordinary functions, and "Forskriften er begrenset til å gjelde nettløsninger". The sentence was truncated by the tool, so the "allmennheten" wording was not seen. | https://lovdata.no/dokument/SF/forskrift/2013-06-21-732 | Lovdata | last amended FOR-2023-01-17-87, in force 2023-02-01 | high for quoted words | opened |
| Rules apply to every business with a website, application or vending machine. | https://www.ks.no/fagomrader/digitalisering/universell-utforming/universell-utforming-av-ikt-losninger/ | KS | not stated | low | excerpt |

**Searched for, not found.** A Diskrimineringsnemnda decision or Uutilsynet statement on a private, closed or contracted B2B portal. The decisions that surfaced (Vipps 2019, Digipost 2021, Apotek 1 sak 2023/355) are reported as customer-facing or public-facing. The verbatim § 18 wording was not retrieved. One search summary said "users" where I expected "allmennheten", and my recollection of "allmennheten" is an unverified belief.

**Follow-up.** Open the Uutilsynet blog post above and the lovdata text of LDL § 18. This verdict depends on them.

---

## J. The legal minimum is WCAG 2.0 A and AA, with 35 criteria

**Verdict: survives.**

**Strongest counter-argument.** A 2019 consultation proposed applying the 12 new WCAG 2.1 criteria to all businesses, private ones included, and KS-type sources state the 2023 minimum as WCAG 2.1 without separating private from public. The regulation text answers this: § 4 keeps private businesses on WCAG 2.0 and § 4b ties EN 301 549 V3.2.1 to public bodies. The proposal does not appear in the private-business provision of the current text.

**Caveats.** § 4 says "minst" and also allows equivalent standards. The count of 35 relies on three excluded criteria (1.2.3, 1.2.4, 1.2.5), which is evidenced, and on a total of 38 at A and AA, which is an unverified belief here. The attack that public contracts make EN 301 549 a practical minimum is plausible but was not evidenced. It would not change the statutory conclusion, and J already concedes contract.

**Evidence**

| Claim | Source | Publisher | Pub date | Confidence | Evidence |
|---|---|---|---|---|---|
| "Private virksomheters nettløsninger skal minst utformes i samsvar med standard Web Content Accessibility Guidelines 2.0", with exceptions for 1.2.3, 1.2.4 and 1.2.5. | https://lovdata.no/dokument/SF/forskrift/2013-06-21-732 | Lovdata | last amended FOR-2023-01-17-87, in force 2023-02-01 | high | opened |
| § 4b binds public bodies to EN 301 549 V3.2.1 (2021-03). | same | Lovdata | same | high | opened |
| The page's amendment history ends at the January 2023 regulation. Its authority list includes a December 2023 decision (nr. 2166). | same | Lovdata | same | medium | opened |
| The 2019 consultation proposed the 12 new criteria for all businesses. It is a proposal, not enacted law. | https://www.regjeringen.no/contentassets/a0d4144bfb5f41af969a556a8f7b0419/no/pdfs/uu_hoeringsnotat.pdf | Regjeringen | not stated | low (the search summary did not pin which result said this) | excerpt |
| 2023 minimum described as including the directive and WCAG 2.1, without a private and public split. | https://www.ks.no/fagomrader/digitalisering/universell-utforming/universell-utforming-av-ikt-losninger/ | KS | not stated | low | excerpt |

**Searched for, not found.** 2026 rules or a Uutilsynet statement requiring WCAG 2.1 of private businesses, a statutory duty passing WCAG 2.1 to a vendor, or contract practice evidence. Apps were not tested because the scenario is a web app.

**Follow-up.** https://www.uutilsynet.no/regelverk/fremtidige-regelverk-og-krav/747 was found but not opened, and could hold planned changes.

---

## K. Internal staff pages are outside the regulation, leaving only individual accommodation

**Verdict: weakened.** The first half survives. The second half is too narrow.

**Strongest counter-argument.** Individual accommodation is not the only remaining duty. A 2026 government strategy reportedly places universal design work in "virksomhetens IKT-løsninger" under LDL §§ 19 and 19 a, and states an employer duty under § 26 to work actively, including on accommodation. The strategy page does not link these specifically to staff tools, so this is a planning or activity duty rather than a technical WCAG duty on staff pages. A precise statement would be that there is no regulation-level technical requirement, but individual accommodation under § 22 and general active-effort duties remain.

**Limits of the exclusion.** Staff pages reached by clients are no longer purely tools used in performing work. "Med mindre annet fremgår av forskriften" means the exclusion has carve-backs, including the public-sector intranet rule, which does not reach a private agency.

**Support for the conclusion.** A 2021 Kluge legal study reportedly finds few legal requirements for workplace ICT today. A 2024 Oslo Economics analysis reportedly discusses a possible duty, which suggests none existed then.

**Evidence**

| Claim | Source | Publisher | Pub date | Confidence | Evidence |
|---|---|---|---|---|---|
| "Forskriften gjelder ikke for IKT-løsninger i virksomheter som sysselsetter arbeidstaker" "og som brukes ved utøvelse av arbeid, med mindre annet fremgår av forskriften." | https://lovdata.no/dokument/SF/forskrift/2013-06-21-732 | Lovdata | last amended FOR-2023-01-17-87, in force 2023-02-01 | high | opened |
| §§ 19 and 19 a are linked to universal design work in the business's ICT solutions. § 22 gives individual accommodation. § 26 gives all employers an active duty, with the four-step model for private businesses over 50 staff, and for 20 to 50 if a party asks. | https://www.regjeringen.no/no/dokumenter/strategi-for-likestilling-av-personer-med-funksjonsnedsettelse-2026-2032/id3173804/?ch=8 | Kultur- og likestillingsdepartementet | 2026 (exact date not stated) | medium; summary of a strategy annex, not the statute | opened |
| Few legal requirements exist for universal design of workplace ICT. Study by Kluge, dated 2021-12-01. | https://kudos.dfo.no/documents/357362/files/46332.pdf | Kluge, hosted by DFØ Kudos | 2021-12-01 | medium | excerpt |
| A universal design duty at work could be socio-economically profitable. Oslo Economics for Bufdir. | https://kudos.dfo.no/documents/357325/files/46296.pdf | Oslo Economics, hosted by DFØ Kudos | 2024 | low (the summary did not pin which PDF) | excerpt |

**Searched for, not found.** A Diskrimineringsnemnda decision applying § 18 to an employee's own workplace ICT. A Difi presentation mentions sak 18/413 on undue burden in accommodating an employee, which is a § 22-type issue, and its outcome was not retrieved. Arbeidsmiljøloven was not searched separately, so that attack remains untested.

---

## L. Meaningful image with no alt text fails 1.1.1; AI alt text judged on result

**Verdict: weakened**, on the title limb only. The rest survives.

**Strongest counter-argument.** W3C's 1.1.1 has an exception for content "primarily intended to create a specific sensory experience", where text alternatives need only give "descriptive identification". Its examples include "works of visual art". For a design agency's image library, a descriptive title could therefore be enough for art-like images, even if it does not convey the image's information. L's "a title passes only if it conveys the image's information" is too strict for those images.

**Limit on that argument.** The definition requires that the experience "does not primarily convey important information or perform a function". A buyer browsing to license an image may need its content, and photographs of products, people or data look informational. The exception is per image and should not be assumed for a whole catalogue. A bare title like "IMG_2041" is not a descriptive identification under either route. Applying this to a licensing catalogue is my reading, and no authority was found.

**"Untitled image" fails.** The other attack finds no support. The sensory exception still needs descriptive identification, and failure F30 covers text alternatives that are not alternatives, including placeholder text and filenames.

**Adjacent text.** W3C mentions a long description on the same page and a transcript link next to audio, which supplement rather than replace a text alternative. F65 lists omitting the alternative as a failure. No source was found saying a visible caption alone cures a missing alternative, and none excluding it.

**AI text.** W3C's Understanding page does not address automation, so nothing there bans it. A 2026 W3C post reportedly warns that generated alt text may be inaccurate and should not entirely replace authored descriptions or author intent. That is a caution outside the normative criterion. It does not overturn "judged on its result", but it supports human review. F20 (alternatives not updated when content changes) is also relevant if an image is replaced and old AI text stays.

**Warning to staff.** No source addresses this directly. It follows from 1.1.1 being a requirement on the content, which is my inference.

**Evidence**

| Claim | Source | Publisher | Pub date | Confidence | Evidence |
|---|---|---|---|---|---|
| Sensory exception, "descriptive identification", definition, and example "works of visual art". | https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html | W3C WAI | not stated | high; this is the 2.1 Understanding page, and the 2.0 wording was not fetched separately | opened |
| F30, F20, F39 and F65 failures. | same | W3C WAI | not stated | high | opened |
| The page does not address automated or machine-generated alternatives. | same | W3C WAI | not stated | medium | opened |
| Generated alt text may be inaccurate and should not entirely replace authored descriptions. | https://www.w3.org/2026/10/w3c-and-state-of-web-in-ai-era.html | W3C | 2026-10 (from URL) | medium | excerpt |

**Searched for, not found.** A formal W3C specification on AI-generated alt text. A regulator statement against automated alt text. Uutilsynet's page on content (https://www.uutilsynet.no/podkast-og-webinar/universell-utforming-av-innhold-pa-nettsider/2786) surfaced but was not opened.

---

## M. The European Accessibility Act does not apply

**Verdict: weakened.** "Not incorporated in the EEA" survives on excerpt evidence. "Does not apply" is too broad, since incorporation is not the only route.

**Strongest counter-argument.** A search summary reports that the EU rules have applied since 2025-06-28 and that Norwegian businesses selling goods and services to EU countries must follow them, even though the directive is not part of Norwegian law. So the conclusion needs a condition: the Act does not apply through Norwegian law. If the agency sells to EU clients, the question becomes the B2B limb alone.

**B2B limb.** It is not evidenced in this run, because the directive text could not be retrieved. Whether sole traders or consumer sales would bring the portal in also remains open. I have no contrary evidence, and my understanding that the e-commerce scope is consumer-facing is an unverified belief.

**Status of the evidence.** Uutilsynet reportedly says the Act is not yet in the EEA Agreement or in Norwegian law, and that work has stood still since the 2021 consultation. The search tool itself flagged that the page also says Norway is proceeding with incorporation, and that the sources are not fresh. A 2022 to 2023 government annex expected incorporation in 2023, which did not happen. The 2026 strategy cites the directive but does not state its EEA status.

**Evidence**

| Claim | Source | Publisher | Pub date | Confidence | Evidence |
|---|---|---|---|---|---|
| "EAA er ikkje teke inn i EØS-avtalen enno" and not implemented in Norwegian law; work has stood still since 2021. | https://www.uutilsynet.no/tilgjengelighetsdirektivet-eaa/eus-tilgjengelegheitsdirektiv-eaa/268 | Uutilsynet | not stated | medium; undated, and the page is reported as internally inconsistent | excerpt |
| Norwegian businesses selling to EU countries must follow the Act. Attribution not pinned by the summary; most likely the page above. | same | Uutilsynet (probable) | not stated | medium to low | excerpt |
| Consultation ran 2021-06-07 to 2021-10-07, proposing implementation through LDL and a new regulation. | https://www.regjeringen.no/no/dokumenter/hoering--gjennomforing-av-tilgjengelighetsdirektivet/id2842980/ | Regjeringen | 2021 | medium | excerpt |
| Marked EEA-relevant and incorporation expected during 2023. | https://www.regjeringen.no/contentassets/d46a39483b8e4bdbbc2ed641198def17/vedlegg_sentrale_eusaker.pdf | Regjeringen | 2022 to 2023 | medium | excerpt |
| The strategy cites the directive without stating EEA status. | https://www.regjeringen.no/no/dokumenter/strategi-for-likestilling-av-personer-med-funksjonsnedsettelse-2026-2032/id3173804/?ch=8 | Kultur- og likestillingsdepartementet | 2026 (exact date not stated) | medium | opened |

**Searched for, not found.** An EEA Joint Committee decision or 2026 incorporation step. One general search and one search limited to regjeringen.no, uutilsynet.no and stortinget.no found none, but the EEA Joint Committee's own records were not searched. The directive's text could not be retrieved (empty EUR-Lex fetch). No source was found on B2B platforms or sole traders.

**Follow-up.** Open the Uutilsynet EAA page, check its date, and retrieve Articles 2 and 3 of Directive (EU) 2019/882. The Kluge study on the directive (https://www.regjeringen.no/contentassets/d474eafb40db46439f0113a447884ee0/utredning_eu_tilgjengelighetsdirektivet_kluge.pdf) may address scope.
