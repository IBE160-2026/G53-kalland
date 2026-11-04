# Lead checks, round 2

Checks run by the research lead on 2026-11-04 to close leads the verifiers and red team left open. Quotes come from text extracted locally from the same public documents, or through WebFetch where noted.

## EDPB Guidelines 3/2019: the wheelchair passage (red team 1's first follow-up)

- claim: "Example: Video footage showing a data subject wearing glasses or using a wheel chair are not per se considered to be special categories of personal data."
- claim: "Political opinions could for example be deduced from images showing identifiable data subjects taking part in an event, engaging in a strike"
- claim: "video surveillance is not always considered to be processing of special categories of personal data" and "if the video footage is processed to deduce special categories of data Article 9 applies."
- source: https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_201903_video_devices_en_0.pdf | publisher: EDPB | pub_date: final version adopted 2020-01-29 | accessed: 2026-11-04 | confidence: high for the words | class: special-category | evidence: PDF text extracted with pypdf
- limit: the guidelines cover video devices, so applying them to stills is an analogy. They predate C-184/20 (2022) and C-21/23 (2024).

## AI Act Art. 2(1) (territorial scope)

- claim: Art. 2(1)(c) covers "providers and deployers of AI systems that have their place of establishment or are located in a third country," "where the output produced by the AI system is used in the Union". Paragraph 1 carries no amendment marker.
- source: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-2 | publisher: European Commission | pub_date: consolidated 2026-07-27 | accessed: 2026-11-04 | confidence: high | class: ai-act-scope | evidence: opened through WebFetch

## Anthropic DPA: keyword search of the extracted text

- claim: a keyword search of the extracted DPA text finds no "EEA", "European Economic Area", "Norway", "Data Privacy Framework" or "DPF". The SCC annex names the competent authority "Where the data exporter is established in an EU Member State", and has variants for GDPR Art. 3(2) cases and for Switzerland. "GDPR" is defined as Regulation (EU) 2016/679. "Applicable Data Protection Laws" is defined broadly as all applicable privacy or data protection laws.
- source: https://www.anthropic.com/legal/data-processing-addendum | publisher: Anthropic | pub_date: effective 2025-02-24 | accessed: 2026-11-04 | confidence: high that the words are absent from the extract | class: transfers | evidence: local extract saved by verifier 2
- limit: whether Norway's status is covered by the SCCs as incorporated is not answered by this search. It needs a question to Anthropic or a lawyer.

## Coop Finnmark: legal-basis reasoning (pages 3 to 16)

- claim: Datatilsynet treats Art. 6(1)(f) as the relevant basis for the disclosure and weighs the company's interest against privacy, noting the special weight for a child. "De registrertes personverninteresser veier i dette tilfellet tyngre enn virksomhetens interesse i å utlevere opptakene." "Utleveringen er således i strid med artikkel 6 nr. 1 bokstav f."
- source: https://www.datatilsynet.no/contentassets/5cd2e76bd5d2481f9578ffe721b7e24d/vedtak-om-overtredelsesgebyr-til-coop-finnmark-sa.pdf | publisher: Datatilsynet | pub_date: 2020-12-22 | accessed: 2026-11-04 | confidence: high | class: enforcement | evidence: local extract saved by verifier 2
- limit: surveillance footage, so an analogy for commercial images.

## GDPR Art. 19

- claim: "The controller shall communicate any rectification or erasure of personal data or restriction of processing carried out in accordance with Article 16, Article 17(1) and Article 18 to each recipient to whom the personal data have been disclosed, unless this proves impossible or involves disproportionate effort."
- source: https://publications.europa.eu/resource/celex/32016R0679 | publisher: EU Publications Office | pub_date: 2016-05-04 | accessed: 2026-11-04 | confidence: high | class: erasure | evidence: local extract saved by verifier 2

## Anthropic on the official DPF list

- One more search did not return Anthropic's entry on dataprivacyframework.gov. The status stays unverified. The participant search needs a real browser.

## Datatilsynet children's image guide

- The saved extract holds only the guide's first page (introduction and contents). It includes "Del aldri bilder av andres barn uten samtykke fra deres foresatte." It does not answer whether both guardians must sign. The remaining six pages were not read.
- source: https://www.datatilsynet.no/personvern-pa-ulike-omrader/skole-barn-unge/bilder-av-barn-pa-nett/ | publisher: Datatilsynet | pub_date: last changed 2020-03-19 | accessed: 2026-11-04 | confidence: high for the quote | class: legal-basis | evidence: local extract

## Firewall note

Red team 2's digest contains a sentence mentioning "the v1 target date", which was not in its brief. Subagents start with the harness's project instructions and memory, so the firewall against ambient context was not airtight in this run. The sentence carries no evidence and no finding rests on it. The digest is left as written and this is logged in the memlog.

## Follow-up after the citation check

- § 104, § 105 and § 79 re-fetched from Lovdata (https://lovdata.no/dokument/NL/lov/2018-06-15-40/%C2%A7104, offset 100000): lead-in, exceptions a to e and the duration sentence match the report verbatim. § 79 lists "99 til 107" with "bøter eller fengsel inntil ett år".
- Datatilsynet consent page (https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/om-behandlingsgrunnlag/samtykke/), under "Bytte til andre behandlingsgrunnlag": "Dersom en virksomhet i slike tilfeller i etterkant prøver å bytte behandlingsgrunnlag til «nødvendig for legitime interesser», bryter virksomheten rettferdighetsprinsippet og åpenhetsprinsippet, noe som kan være et alvorlig lovbrudd." This strengthens the withdrawal finding.
- Datatilsynet images page (https://www.datatilsynet.no/personvern-pa-ulike-omrader/internett-og-apper/bilder-pa-nett/): "Hvis det oppstår en konflikt, er det den som har delt bildene eller filmen som må bevise at et gyldig samtykke virkelig er gitt." Situation images: "Før man publiserer kan man derfor for eksempel foreta en interesseavveiing." Both confirmed.
- Coop Finnmark: "Ingen ansikt vises, men man kan se håret, påkledning, samt skotøy" and the persons told apart "basert på bekledning, hår og skotøy". The report's wording holds.

## Manual checks by the project owner (2026-11-04)

These two checks were made by the user in a browser, because the tools in this run could not read the pages. The results are as the user reported them; no page text was captured.

- claim: searching the Data Privacy Framework participant list for "Anthropic" gave no results. This shows the name did not match, not that a transfer basis is absent. It replaces the "stays unverified" status in the section above.
- source: https://www.dataprivacyframework.gov/list | publisher: US Department of Commerce | pub_date: live page | accessed: 2026-11-04 | class: transfers | evidence: user's report of the search
- claim: C-703/25 P is still pending, with nothing new on the case page.
- source: https://curia.europa.eu/juris/liste.jsf?num=C-703/25 | publisher: Court of Justice of the EU | pub_date: live page | accessed: 2026-11-04 | class: transfers | evidence: user's report of the case page
