# Red team 1: attacking conclusions A, B and C

Date: 2026-11-04. Jurisdiction: Norway, then EU/EEA. Not legal advice.

## Limits of this digest (read first)

- **Only two pages were opened.** BAHR's newsletter and the AI Act Art. 50 page. Everything else marked `excerpt` comes from search tool summaries, not from reading the source.
- **Per-claim attribution is often missing.** The search tool mostly wrote "one source says" over a list of results. Where it did not name the source, `source` gives the likeliest candidate or candidates from that list and says "attribution inferred". Confirm the claim in the source before citing it.
- **One fetch failed.** GDPRhub's C-21/23 page returned a bot-protection denial, so no paragraph numbers from C-184/20 or C-21/23 were confirmed.
- **Never retrieved this run:** the text of InfoSoc Art. 5(1), Infopaq, Meltwater, åndsverkloven as currently in force, AI Act Arts. 2, 3 and 4, the final Art. 50 guidelines, and any Advocate General opinion in C-250/25. Statements about them below are labelled as unverified.
- Passages marked **Reasoning** are this reviewer's argument from the retrieved text. They are not sourced findings.

---

## Conclusion A: AI Act

**Verdict: weakened.** The first limb holds only on a condition the scenario may break. "No specific duties" is overbroad. The minimal-risk classification itself was not contradicted.

### Strongest counter-argument

"No binding duty for a business operating only in Norway" depends on where the output is used, not where the business sits. BAHR, writing after the Digital Omnibus, says a Norwegian firm can fall within scope with no EU establishment once AI output is used in the EU. A B2B portal that licenses images with AI-generated titles, descriptions and alt text to an EU client is a plausible route to that. So "operating only in Norway" may be false for this scenario as soon as one client is in the EU.

"No specific duties" also fails on the text. Art. 50(2) is not tied to a risk class: it binds providers of AI systems "generating synthetic ... text". BAHR also describes Art. 4 AI literacy as applying to providers and deployers generally. Whether the agency is a provider when it builds on an API was not resolved by any source found.

**What still favours the conclusion:**

- Art. 50(2) has an exception for systems that "do not substantially alter the input data ... or the semantics thereof". **Reasoning:** a faithful description of an image could arguably fit, but this is untested, and it fits less well for invented titles or keywords. No source addressing image-to-text was found.
- Art. 50(4) covers only text published "with the purpose of informing the public on matters of public interest", and it excepts human-reviewed text under editorial responsibility. **Reasoning:** image metadata is unlikely to meet that test.
- BAHR's example is an asset manager, not a design agency. The scope point is transferable by reasoning only.

### Evidence

| claim | source | publisher | pub_date | accessed | confidence | evidence |
|---|---|---|---|---|---|---|
| EEA incorporation and Norwegian entry into force have not happened; Norwegian entry into force is "rather unlikely before mid 2027" (supports limb 1) | https://bahr.no/newsletter/asset-management-the-eu-ai-act-a-call-and-guide-to-implementation-for-norwegian-asset-managers | BAHR | 2026-08-03 | 2026-11-04 | high | opened |
| The Act reaches third-country entities where output is "used in the Union"; a Norwegian firm "can fall within scope without any EU establishment" (the page does not cite Art. 2 by number) | same | BAHR | 2026-08-03 | 2026-11-04 | medium-high (law firm reading; Art. 2 not opened) | opened |
| Art. 4 has applied since February 2025 and was amended on 27 July 2026; it requires providers and deployers to take measures on staff AI literacy, with no set individual level | same | BAHR | 2026-08-03 | 2026-11-04 | medium (one source; amended text not opened) | opened |
| Art. 50 applies from 2 August 2026 to new systems placed on the market on or after that date; fines up to EUR 15 million or 3 % of worldwide turnover | same | BAHR | 2026-08-03 | 2026-11-04 | medium-high | opened |
| Regulation (EU) 2026/1744 entered into force on 27 July 2026 and defers high-risk dates; "only the timing has changed" | same | BAHR | 2026-08-03 | 2026-11-04 | medium (Official Journal not opened) | opened |
| Art. 50(2) text: applies to providers of AI systems, including GPAI systems, generating synthetic text, with exceptions for assistive standard editing and for not substantially altering input data or its semantics | https://artificialintelligenceact.eu/article/50/ | Future of Life Institute site (publisher from background knowledge, not confirmed on the page) | undated; marked "amended" | 2026-11-04 | high on wording; check against the Official Journal | opened |
| Art. 50(4) text: limited to text informing the public on matters of public interest; human review and editorial responsibility exception | same | same | undated | 2026-11-04 | high on wording | opened |
| Government plans a new consultation in autumn 2026 and a bill to the Storting in spring 2027; not incorporated as of October 2026 | https://opsiocloud.com/no/knowledge-base/ki-loven-ai-act-norge/ | Opsio (vendor; attribution inferred) | undated | 2026-11-04 | low-medium | excerpt |
| The Code of Practice on marking and labelling is voluntary and confers no presumption of conformity | https://www.jonesday.com/en/insights/2026/06/european-commission-publishes-final-code-of-practice-on-marking-and-labelling-aigenerated-content (attribution inferred) | Jones Day | 2026-06 | 2026-11-04 | low-medium | excerpt |

**Conflict left open:** one search result gives pre-existing generative systems until 2 December 2026 for Art. 50(2), and another reports a proposed pause to 2 February 2027. BAHR's wording, "new systems", is consistent with a grace period for older systems. **Reasoning:** a system first launched now would not be an older system. Check the Official Journal.

### Searched for and did not find

- Any source reporting provisional application of the AI Act in the EEA. BAHR reports no incorporation. This was not the subject of a dedicated search.
- Final Commission guidelines on Art. 50. Sources conflict on whether they were finalised, and the one saying they were is a tech site saying "reportedly".
- Any authority on whether a downstream builder on an API is an Art. 50(2) provider. Commentary surfaced saying compliance does not flow automatically from the API provider, but the tool did not attribute it to a specific source, so it is not relied on here.
- Any source classifying image metadata or alt text as anything other than minimal risk. No contrary finding.

---

## Conclusion B: copyright

**Verdict: weakened, narrowly, on the limb "no exception reliably covers it".** The practical advice, to permit it expressly in photographer agreements, survives every argument found.

### Strongest counter-argument

**The conclusion may overlook text and data mining.** This was not on the list of attack ideas. Automated analysis of an image to extract information (title, keywords, description) is arguably TDM. DSM Art. 4 is a general exception that applies unless the rightholder has reserved the use. If it applies, a business with lawful access has a statutory exception for this reproduction and no licence is needed, unless the photographer has opted out.

Hamburg courts have treated AI-related image copying as within TDM rules, though the first-instance holding rested on the scientific research exception (§ 60d UrhG) and its treatment of commercial TDM (§ 44b, implementing Art. 4) was obiter. One result reports that the Higher Regional Court expressly brought the reproduction within the TDM exception. This was not confirmed from a primary source.

**The weak point for that argument in Norway:** a 2023 consultation proposed implementing the DSM Directive in åndsverkloven, including a research exception (new § 50 f), with hearing responses addressing the general Art. 4 exception. **This run could not confirm whether any of it has been enacted.** So "no exception reliably covers it" may be right today in Norway only because the exception is absent or unconfirmed. That is a different and more fragile basis than the one stated, and it should be checked on Lovdata.

There are other limits too, none of them resolved by a source found here:

- whether sending the copy to a third-party provider stays within the exception;
- whether a photographer's opt-out or contract removes it;
- whether Art. 4 reaches a commercial workflow that keeps the output.

**Temporary copies do not rescue the argument and partly support B.** The Hamburg court rejected § 44a UrhG (the German implementation of InfoSoc Art. 5(1), by background knowledge) because the copy was not transient or incidental: it was not deleted automatically and depended on LAION's own involvement. **Reasoning:** an API call with automatic deletion is closer to the exception than LAION's download was, so the case is distinguishable. But the agency's upload is still a deliberate act, which is the feature the court counted against LAION. Provider retention periods would then decide a lot, and this run has no evidence on them.

**The "no-training promise" limb survives.** Nothing found treats non-training as relevant to whether a reproduction occurs. **Reasoning:** the temporary-copy logic turns on deletion and on how the copy arises, so retention terms matter more legally than the training promise does.

**"Analysis is not use" remains undecided, not refuted.** In C-250/25 Like Company, Google argues that Gemini does not store or retrieve copies. The case concerns press publishers' rights and generative output, not image analysis, so it is at best indirect.

### Evidence

| claim | source | publisher | pub_date | accessed | confidence | evidence |
|---|---|---|---|---|---|---|
| Hamburg Regional Court (310 O 227/23, 27 Sept 2024) dismissed Kneschke's claim under § 60d UrhG | https://www.mofo.com/resources/insights/241004-to-scrape-or-not-to-scrape-first-court-decision (attribution inferred) | Morrison Foerster | 2024-10-04 | 2026-11-04 | medium-high (several reports agree) | excerpt |
| Court rejected § 44a: copy not transient or incidental, not deleted automatically, dependent on LAION's involvement | same, or https://ipkitten.blogspot.com/2024/09/guest-post-german-court-finds-laions.html (attribution inferred) | MoFo / IPKat | 2024 | 2026-11-04 | medium-high | excerpt |
| § 44b / Art. 4 DSM was discussed obiter, and one source says the court held that Art. 4 applies to reproductions for AI training | https://inquisitiveminds.bristows.com/post/102jmd3/first-court-decision-on-text-and-data-mining-copyright-exceptions-kneschke-v-lai (attribution inferred) | Bristows | undated | 2026-11-04 | medium | excerpt |
| The Higher Regional Court expressly held the reproduction falls within the TDM exception, an issue the lower court left open | not attributed by the tool; the result list has no clear candidate | unknown | unknown | 2026-11-04 | low; verify before use | excerpt |
| 2023 consultation proposed DSM implementation in åndsverkloven | https://www.regjeringen.no/contentassets/449f5b4495644cf2af1df7680d1649e5/horingsnotat-221123.pdf | Regjeringen | 2023-11 | 2026-11-04 | medium (proposal only) | excerpt |
| Proposed research exception in new § 50 f, requiring lawful access and a scientific research purpose | https://www.regjeringen.no/contentassets/515e604af8994b409d6535a063951f7c/nrk-med-vedlegg.pdf | NRK hearing response on regjeringen.no | undated | 2026-11-04 | medium | excerpt |
| General Art. 4 exception applies only where the rightholder has not expressly reserved the use | https://www.regjeringen.no/contentassets/515e604af8994b409d6535a063951f7c/nasjonalbiblioteket-ny-versjon.pdf | Nasjonalbiblioteket hearing response on regjeringen.no | undated | 2026-11-04 | medium | excerpt |
| Rightholder groups say generative AI differs from traditional TDM and want narrow exceptions | https://forleggerforeningen.no/wp-content/uploads/2024/05/Forleggerforeningens-horingssvar-15-mars-2024-endringer-i-andsverkloven-ved-gjennomforing-av-DSM-og-videresendingsdirektivet.pdf | Forleggerforeningen | 2024-03-15 | 2026-11-04 | medium (interested party) | excerpt |
| The exclusive right covers both lasting and temporary copies, attributed to "åndsverkloven § 2" | https://nopa.no/wp-content/uploads/2018/09/åndsverkloven_pdf.pdf | NOPA | 2018 (from URL) | 2026-11-04 | low on the section number | excerpt |
| C-250/25: Grand Chamber hearing on 10 March 2026, AG Szpunar opinion scheduled for 3 Sept 2026; questions cover reproduction and Art. 4 TDM; Google says Gemini holds no copies | https://www.mondaq.com/copyright/1785908/first-ever-cjeu-case-on-generative-ai-and-copyright (attribution inferred) | Mondaq | undated | 2026-11-04 | medium | excerpt |
| A result is titled as saying the case is facing delays | https://electronlibre.info/articles/107346-ai-and-copyright-the-like-company-v-google-case-is-facing-delays/ | Electron Libre | undated | 2026-11-04 | low (title only) | excerpt |
| European Copyright Society called the referral "factually murky" | https://www.worldtrademarkreview.com/article/european-copyright-society-warns-of-factually-murky-cjeu-referral-in-landmark-google-case | World Trademark Review | undated | 2026-11-04 | medium (title only) | excerpt |

**Section number flag:** the brief cites "§ 4" for temporary copies. This run could not confirm that, and the only excerpt places temporary copies under "§ 2" in a PDF dated 2018 by its URL. Numbering must be checked on Lovdata before any section is cited.

### Searched for and did not find

- The AG opinion or any judgment in C-250/25. Two searches. Whether it was delivered on 3 September 2026 is unknown.
- Any Norwegian commentary saying that sending images to an AI API is unproblematic. Not found in one Norwegian query. An article that could bear on this was surfaced and not opened: Ørstavik, "Tilgang til data for maskinlæring", https://www.nirnorge.no/s/rstavik-Inger-Tilgang-til-data-for-maskinlring-NIR.pdf. It is the best follow-up.
- Implied licence, purpose of commission and cataloguing or archive exceptions. **Not tested.** No dedicated search fitted the budget, so the absence of findings here says nothing about their strength. Unverified belief: a commission's purpose can shape implied rights in Nordic copyright practice, which would be most relevant to commissioned work.
- Infopaq and Meltwater. Not retrieved, so no statement on them is made here.

---

## Conclusion C: GDPR special categories

**Verdict: weakened.** It survives the "images are sensitive per se" attack, for which no authority was found. But "neutral visual description" is not a stable category, and the conclusion looks only at output, not at the image being sent.

### Strongest counter-argument

**From the broad side.** Art. 9 is framed around data that *reveals* a protected attribute, and C-184/20 extends that to data liable to disclose it *indirectly*. So the test is what the data can reveal, not whether the sentence looks neutral. "A woman wearing a hijab", "a man in a wheelchair" or a skin-tone description are plain visual statements, yet each can reveal religion, health or origin with no inference by the system. If those count as "stating", the conclusion's rule is right but its "neutral" example class is much smaller than it sounds. If they count as neutral, the rule is wrong under the broad reading.

**Reasoning:** the same logic reaches the input. A photo taken in a clinic or at a religious event, sent to the API with its context, may already reveal such an attribute before any description is written. The conclusion does not address that transfer.

**Recital 51 does not close this gap.** The excerpts show that it speaks to photographs as *biometric* data. It says nothing retrieved here about race or health visible in a photo, so it should not be used as a general "photos are not sensitive" rule.

**From the narrow side (in favour of a more permissive rule).** The ICO, as quoted in one source, treats inferred data as special category when the processing aims to make the inference or to treat people differently on that basis. An EDPB video example is reported in similar terms: footage processed *to deduce* special-category data falls under Art. 9. On that view, an incidental mention with no such aim might not be special-category data at all, and the conclusion would be too strict. But the ICO is not an EEA authority, and neither text was opened.

Unverified belief, not retrieved: EDPB Guidelines 3/2019 say footage showing someone wearing glasses or using a wheelchair is not per se special-category data. If that is confirmed, it is the strongest support for C and directly answers the broad-side example. **This is the first thing to verify.** How it fits with the later C-184/20 and C-21/23 is an open question. Also unverified: that C-21/23 treats possible rather than certain inference as sufficient.

### Evidence

| claim | source | publisher | pub_date | accessed | confidence | evidence |
|---|---|---|---|---|---|---|
| C-184/20: data liable to disclose sexual orientation indirectly is special-category data; concept read broadly given the high level of protection | https://publications.matheson.com/data-protection-technology-and-cyber-security-bulletin-october-2022/cjeu-expands-scope-of-special-category-data (attribution inferred) | Matheson | 2022-10 | 2026-11-04 | medium-high (holding well reported; judgment not opened) | excerpt |
| C-21/23: name, address and ordered medicine data from which health details could be inferred; the relevant question is whether the processing reveals or discloses such data | https://ceelegalmatters.com/romania/20843-cjeu-strikes-again-this-time-targeting-special-data, or https://www.vbb.com/media/Newsletters/CLIENT_ALERT_-_CJEU_Adopts_Broad_Interpretation_of_Special_Personal_Data.pdf (attribution inferred) | CEE Legal Matters / Van Bael & Bellis | undated | 2026-11-04 | medium (judgment not opened) | excerpt |
| Recital 51: photographs should not systematically be considered special categories, since they are biometric data only when processed by specific technical means allowing unique identification | https://www.oireachtas.ie/en/debates/question/2018-07-12/706/ | Houses of the Oireachtas (government reply, not a DPA) | 2018-07-12 | 2026-11-04 | high on recital wording | excerpt |
| Photos on a badge are not biometric data, but the same photo in a facial recognition system is | https://verasafe.com/blog/gdpr-and-photographs-understanding-special-categories-of-personal-data/ (attribution inferred) | VeraSafe (vendor) | undated | 2026-11-04 | low-medium | excerpt |
| ICO: inferred data is special category when the processing aims to make a linked inference or to treat someone differently on that basis | https://www.urmconsulting.com/blog/are-you-processing-special-category-personal-data-without-knowing-it (attribution inferred) | URM Consulting, quoting the ICO; UK, not EEA | undated | 2026-11-04 | low-medium | excerpt |
| EDPB hospital example: video processed to deduce special-category data, such as health, constitutes special-category data | not attributed by the tool; EDPB text not opened | unknown | unknown | 2026-11-04 | low-medium | excerpt |
| A scholarly paper argues that the purpose of processing matters at the margins of the sensitive-data regime (conclusions not checked) | https://dl.gi.de/items/ebf63d9c-a5db-43af-8c6a-22caf5211689/full | Gesellschaft für Informatik digital library; author Sumer, 2022 | 2022 | 2026-11-04 | low | excerpt |

### Searched for and did not find

- Any court or DPA saying that photographs of people are special-category data per se. Two English-language searches. Zero findings, but this is not a thorough negative.
- Any source applying C-184/20 or C-21/23 to race or health visible in, or inferred from, a photograph, or to an AI-generated description. The search summaries say so expressly. The application above is therefore reasoning.
- A Datatilsynet position. **Not tested:** no Norwegian-language query on this point fitted the budget.
- The paragraph text of C-21/23. The GDPRhub fetch was blocked.
- Any authority for the attack that inference is not enough without intent, other than the UK ICO and the reported EDPB example above.

---

## Follow-ups, in order of value

1. Lovdata and Stortinget: has the DSM implementation been enacted, and is there a Norwegian equivalent of Art. 4? Confirm section numbers. This decides whether B's "no exception" limb stands.
2. EDPB Guidelines 3/2019: the wheelchair and glasses passage, against C-184/20 and C-21/23 read directly. This decides C.
3. Curia, C-250/25: was the opinion delivered, and what does it say on reproduction and TDM?
4. AI Act Arts. 2 and 3 and the final Art. 50 guidelines: the output-used-in-the-Union test, downstream provider status, and the "semantics" exception for image-to-text.
5. Ørstavik in NIR, and Datatilsynet on images.
