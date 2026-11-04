# Red-team digest 2: conclusions D to H

Accessed for all sources: 2026-11-04. Jurisdiction: Norway, then EU/EEA.

## How to read this digest

- **Budget.** All 16 tool calls were used. Several attack ideas in the brief were therefore not searched. Each section lists them, and "not searched" does not mean "no authority exists".
- **`evidence: opened`** means the page itself was fetched and read through the fetch tool.
- **`evidence: excerpt`** means the claim comes from a search-tool summary of the results. The page was not opened.
- **Unmapped excerpts.** The search tool did not always tie a claim to one URL. These are marked `mapping: not shown`, and the URL given is the most likely result in that set. Check them before citing.
- **Dates.** `pub_date: not shown` means the tool output gave no date. A date taken from a URL path is marked `(URL)`.
- **Unverified beliefs** are labelled as such and are not findings.

## Summary

| Conclusion | Verdict | Main reason |
|---|---|---|
| D | weakened | Core rule retrieved. "Needs consent" is too broad, the licensor's own duty is unproven, and the burden-of-proof claim found no support. |
| E | weakened | No authority found against such transfers, but the conclusion omits the transfer assessment, and the US legal basis moved in 2026. |
| F | weakened | "Should do one" stands. "Probably required" could not be supported, because the Norwegian list was not retrieved. |
| G | weakened | Statute confirms 5 years and 3.5 years, but licence agreements can fall in the 5-year class, and § 13 changes on 2027-01-01. |
| H | weakened | Art. 7(3) supports the past-use point, but the conclusion merges GDPR consent with § 104 consent and leaves licensees' future use open. |

None was overturned.

---

## D. § 104 consent for licensing, and consent records

**Verdict: weakened**

**Strongest counter-argument.** The § 104 prohibition targets the acts of reproducing or displaying a photograph publicly. That gives two gaps:

1. **Who carries the duty.** Delivering images through a gated B2B portal is arguably not public display. The party that publishes is then the licensee, so the licensor's direct § 104 exposure is unproven. This is my inference from the wording. No source was found that decides it.
2. **"Commercial licensing" is the wrong test.** The exceptions turn on the content of the image, not on the business model. Letter b requires a concrete assessment of the individual image. So a stock image where the person is incidental may need no consent for some uses, and a blanket consent requirement overstates the law. The practical rule survives for images where an identifiable person is the subject.

The burden-of-proof limb has no support from this run. Consent records may still be sensible as evidence, but "the burden of proof sits with the one sharing" should be presented as unverified.

**Evidence**

```yaml
- claim: "A photograph depicting a person may not be reproduced or displayed publicly without the depicted person's consent, except where listed exceptions apply."
  source: https://www.stortinget.no/globalassets/pdf/lovvedtak/2017-2018/vedtak-201718-053.pdf
  publisher: Stortinget (lovvedtak)
  pub_date: 2018 (URL)
  confidence: medium-high
  evidence: excerpt
  mapping: not shown; the statutory wording was quoted in the result set
- claim: "Whether consent is needed under letter b must be decided by a concrete assessment of the image or film. Letter d concerns a photographer's portfolio use and requires consent."
  source: https://www.ung.no/oss/77N221s2AQ8C5Ms95U9wwK
  publisher: ung.no (public youth information service, not legal authority)
  pub_date: not shown
  confidence: medium
  evidence: excerpt
- claim: "§ 104 gives individuals a right to control commercial use of their image. This supports the conclusion."
  source: https://core.ac.uk/download/479076473.pdf
  publisher: thesis or paper hosted on CORE
  pub_date: not shown
  confidence: low-medium
  evidence: excerpt
  mapping: not shown; alternative is https://core.ac.uk/download/392175793.pdf
- claim: "Lower courts have applied the predecessor § 45 c to unauthorised use of model photographs. In Gulating lagmannsrett the models sued the company AS Sylvsmidja, and a 2013 Oslo tingrett case also concerned § 45 c."
  source: https://gammel.nored.no/content/download/9979/84342/version/1/file/IJ-nr%202009-33%20-%20Fotomodellsaken%20-%20Fotomodeller%20mot%20AS%20Sylvsmidja%20-%20Gulating%20lmrett%202010-10-06.pdf
  publisher: Norsk Redaktørforening, reproducing the judgment
  pub_date: 2010-10-06 (judgment)
  confidence: medium for existence and parties; none for the holding
  evidence: excerpt; the fetch returned unreadable PDF binary, so the reasoning was not read
- claim: "The 2013 Oslo tingrett model case states that § 45 c prohibits using images without the depicted person's consent."
  source: https://www.nored.no/content/download/7720/51546/version/1/file/IJ-nr%202013-12%20-%20Fotomodell-saken%20-%20Oslo%20tingrett%202013-05-10.pdf
  publisher: Norsk Redaktørforening, reproducing the judgment
  pub_date: 2013-05-10 (judgment)
  confidence: medium
  evidence: excerpt
- claim: "HR-2019-2038-A concerns privacy under Penal Code § 267, not § 104, so it is not direct precedent on photo consent."
  source: https://gammel.nored.no/content/download/18141/170958/version/1/file/NR-nr%202019-20%20-%20Barnevernbildedommen%20-%20HR%202019-11-05.docx
  publisher: Norsk Redaktørforening, reproducing the judgment
  pub_date: 2019-11-05 (judgment)
  confidence: medium
  evidence: excerpt
```

**Searched and not found**

- No Supreme Court judgment deciding consent under § 104 surfaced in one targeted search. That is a limit of the search, not proof that none exists. Lovdata was not queried for case law.
- Nothing located the burden of proof under § 104.
- The § 104 text itself could not be read. The Lovdata fetch was cut off at 100,000 characters, before § 104 (a read from offset 100000 would reach it).

**Not searched (budget)**

- Personopplysningsloven § 3 and artistic expression.
- GDPR legitimate interest for professional photography.
- Prop. 104 L (2016–2017), which appeared in results but was not opened: https://www.regjeringen.no/no/dokumenter/prop.-104-l-20162017/id2547943/

**Unverified belief, not a finding.** Letter b covers images where the person is less important than the main content, and letter c covers gatherings and events of general interest. If so, those are the crowd and incidental-person routes the brief asked about. Confirm against the statute.

**Follow-up.** The Gulating PDF is saved at `/Users/marthekalland/.claude/projects/-Users-marthekalland-Dev-g53-kalland/238941f7-019f-4a06-913a-a5eb762b9fcc/tool-results/webfetch-1793776635124-ibvvbd.pdf`. Text extraction would show who was held liable and how consent scope was treated.

---

## E. Sending images of people to a US AI provider under a DPA and SCCs

**Verdict: weakened**

**Strongest counter-argument.** "Processor agreement plus SCCs, 30-day retention, no training" is not a sufficient statement of lawfulness, for three reasons:

1. **US basis in flux.** The Supreme Court decided Trump v. Slaughter on 2026-06-29. The EDPB has asked the Commission to assess its effect on the DPF. noyb argues the reasoning reaches the PCLOB. A transfer assessment written before mid-2026 needs revisiting. My inference is that SCCs do not escape this, since a transfer assessment under them looks at the same US surveillance and redress safeguards.
2. **Provider role.** The "processor" label holds only as far as the provider acts on instructions. Sources say a provider keeping data for its own purposes is a controller for that processing. Whether safety or abuse retention counts as an own purpose is the open point. Only weak sources address it, and they say it depends on the contract.
3. **The 30-day premise is provider-specific.** Reported windows differ by provider and conflict between sources, so it cannot stand as a general fact.

**Limits of the attack.** The evidence does not show these transfers to be unlawful:

- The DPF remains in force in every source that addressed it.
- The General Court upheld it, and the appeal is pending.
- Commentators expect the appeal may fail on admissibility.
- The one Garante fine against OpenAI was annulled, though on procedural grounds that did not reach substance. It therefore gives neither side a merits ruling.

**Evidence**

```yaml
- claim: "Trump v. Slaughter was decided 2026-06-29 and allows the President to remove FTC commissioners at will."
  source: https://www.faegredrinker.com/en/insights/publications/2026/9/trump-v-slaughter-implications-of-the-us-supreme-court-ruling-for-eu-us-data-transfers-and-the-data-privacy-framework
  publisher: Faegre Drinker
  pub_date: 2026-09-17
  confidence: medium-high
  evidence: excerpt
  mapping: date attributed across the result set
- claim: "The EDPB asked the Commission to assess whether the ruling affects the DPF adequacy decision."
  source: https://www.faegredrinker.com/en/insights/publications/2026/9/trump-v-slaughter-implications-of-the-us-supreme-court-ruling-for-eu-us-data-transfers-and-the-data-privacy-framework
  publisher: Faegre Drinker
  pub_date: 2026-09-17
  confidence: medium; primary EDPB document not retrieved
  evidence: excerpt
- claim: "noyb argues the reasoning extends to other independent bodies, including the PCLOB."
  source: https://noyb.eu/sites/default/files/2026-06/Letter_noyb_EU-US_data_transfers.pdf
  publisher: noyb (advocacy party)
  pub_date: 2026-06 (URL)
  confidence: medium for the fact of the argument; contested on the merits
  evidence: excerpt
- claim: "Contrary view: the DPF remains valid under Art. 45 and the PCLOB is not expressly covered by the decision."
  source: https://www.dr-datenschutz.de/us-supreme-court-greift-saeule-des-transatlantischen-datentransfers-an/
  publisher: Dr. Datenschutz (commercial privacy blog)
  pub_date: not shown
  confidence: medium
  evidence: excerpt
- claim: "The adequacy decision remains in effect and the ruling changes no certification obligations."
  source: https://bbbprograms.org/media/insights/blog/trump-slaughter-dpf
  publisher: BBB National Programs (a DPF dispute-resolution provider, so an interested party)
  pub_date: not shown
  confidence: medium
  evidence: excerpt
- claim: "The D.C. Circuit had deferred the PCLOB members' removal case pending Slaughter and returned it on 2026-08-05. The outcome was not found."
  source: https://www.brennancenter.org/es/node/11872
  publisher: Brennan Center
  pub_date: not shown
  confidence: medium
  evidence: excerpt
- claim: "The General Court dismissed Latombe on 2025-09-03. The next.ink headline saying 'CJUE' refers to this judgment, not to an appeal ruling, which resolves an apparent conflict between sources."
  source: https://next.ink/198038/echange-de-donnees-avec-les-usa-le-recours-du-depute-philippe-latombe-echoue-devant-la-cjue/
  publisher: Next
  pub_date: 2025-09-03
  confidence: high
  evidence: opened
- claim: "Latombe appealed to the CJEU, and the pleadings cover the independence of the Data Protection Review Court and bulk collection."
  source: https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20251201-european-court-of-justice-to-review-challenge-to-eu-us-data-privacy-framework
  publisher: WilmerHale
  pub_date: 2025-12-01 (URL)
  confidence: medium-high; the current CJEU register was not checked
  evidence: excerpt
  mapping: not shown; pleadings also summarised at https://captaincompliance.com/education/latombe-pleas-in-eu-us-data-privacy-framework-appeal-published-in-eu-official-journal/
- claim: "Rome court judgment of 2026-03-18 annulled the EUR 15m Garante fine against OpenAI on procedural and competence grounds, without reaching the alleged GDPR violations. The docket number is reported inconsistently."
  source: https://www.diritto.it/?p=249907
  publisher: Diritto.it
  pub_date: not shown
  confidence: medium; primary judgment not retrieved
  evidence: excerpt
  mapping: not shown; also https://www.freevacy.com/news/reuters/italian-court-overturns-eur15m-gdpr-fine-against-openai/7241 and https://www.crossborderdataforum.org/tag/ai/
- claim: "A provider keeping prompts for its own purposes sets a purpose of its own and is a controller for that processing."
  source: https://lyceum.technology/magazine/zero-retention-llm-apis-what-gdpr-actually-requires/
  publisher: Lyceum (vendor)
  pub_date: not shown
  confidence: low; weak source, no regulator behind it
  evidence: excerpt
- claim: "The provider's role depends on its contract and on who determines purposes and means. Reported retention windows differ: OpenAI 30 days, Mistral 30 days rolling, Anthropic 7 or 30 days (sources conflict), Google about 55 days or unpublished (sources conflict)."
  source: https://ai-tldr.dev/learn/llm-apis/api-basics/llm-api-data-privacy/
  publisher: secondary blogs and vendors
  pub_date: not shown
  confidence: low; read the actual provider DPA instead
  evidence: excerpt
  mapping: not shown; see also https://conductatlas.com/platform/mistral-ai/mistral-ai-privacy-policy/data-retention-api-inputs-and-outputs-30-day-rolling-window/
```

**Searched and not found**

- No regulator or court statement on whether abuse-monitoring retention makes an LLM API provider a controller.
- No outcome for the returned PCLOB case.

**Not searched (budget)**

- Datatilsynet actions against US AI providers.
- Clearview decisions.
- Schrems II text.
- Children's images in transfer assessments.
- Whether and how the DPF decision applies in the EEA.
- The DPF certification status of any specific provider.

---

## F. DPIA before real images of people go to the AI

**Verdict: weakened**

**Strongest counter-argument.** The duty attaches only where high risk is likely. Datatilsynet's method is to check its list first and then assess high risk. The list examples retrieved (employee monitoring, research processing without consent) do not resemble metadata generation by a small agency. I could not retrieve the full list, so "probably required" has no support from this run. It may still prove correct, but it is a judgement call.

**The other direction.** A stronger duty is not established either. Datatilsynet ties prior consultation to high residual risk that measures cannot reduce. A competent DPIA with mitigation would normally not reach that point.

**What survives.** Screening before go-live is needed to answer the question at all, and a voluntary DPIA remains a defensible choice given that children are in the images. Recommended wording: "do a documented screening first, and treat a full DPIA as the expected outcome if children's images or the transfer remain in scope". The final clause is my judgement, not a retrieved rule.

**Evidence**

```yaml
- claim: "Datatilsynet's two-step check: see whether the processing is on its list of activities that always require a DPIA, and if not, assess whether it is likely to create high risk."
  source: https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdering-av-personvernkonsekvenser/nar-ma-man-gjennomfore-en-vurdering-av-personvernkonsekvenser/
  publisher: Datatilsynet
  pub_date: not shown; the tool flagged some cached Datatilsynet pages as about 3,000 days old
  confidence: medium-high
  evidence: excerpt
- claim: "Examples on the list include monitoring employees' internet use, electronic communications and camera surveillance, plus processing without consent for scientific or historical purposes combined with another criterion."
  source: https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdering-av-personvernkonsekvenser/
  publisher: Datatilsynet
  pub_date: not shown
  confidence: medium; examples only, not the full list
  evidence: excerpt
  mapping: not shown
- claim: "Datatilsynet must be involved in prior consultation if the assessment shows high risk that the controller's measures cannot reduce."
  source: https://www.datatilsynet.no/rettigheter-og-plikter/virksomhetenes-plikter/vurdering-av-personvernkonsekvenser/?print=true
  publisher: Datatilsynet
  pub_date: not shown
  confidence: medium-high
  evidence: excerpt
  mapping: not shown
- claim: "Liechtenstein's list includes image recognition and deep learning platforms, with some entries requiring a DPIA only when another criterion also applies. This shows another EEA regulator treating the technology as relevant, but it is not Norwegian law."
  source: https://dss.llv.li/download_file/363/315
  publisher: Datenschutzstelle Liechtenstein
  pub_date: not shown
  confidence: medium for the fact; low for transfer to Norway
  evidence: excerpt
- claim: "EDPB guidelines use nine criteria, and a DPIA is typically needed where two or more apply. Datatilsynet hosts a Norwegian translation of WP248."
  source: https://www.datatilsynet.no/globalassets/global/dokumenter-pdfer-skjema-ol/regelverk/edpbartikkel29gruppen/Veileder-i-vurdering-av-personvernkonsekvenser-wp-248-norsk.pdf
  publisher: Article 29 Working Party, hosted by Datatilsynet
  pub_date: not shown
  confidence: medium
  evidence: excerpt
  mapping: the two-criteria statement came from a different result set; the document itself was not opened
```

**Searched and not found**

- The Norwegian list text itself.
- Any Norwegian source stating that images of children, or sending images to an AI API, trigger a DPIA as such.
- The children-specific hits were UK ICO and school material, which are not applicable authority here and are not relied on.
- The "Datatilsynet" list in one result set was the Danish authority's and was discarded.

**Not read**

- Datatilsynet's AI guidance page, which is on point: https://www.datatilsynet.no/regelverk-og-verktoy/rapporter-og-utredninger/kunstig-intelligens/vurder-personvernkonsekvensene---og-bygg-personvern-inn-i-losningene/

---

## G. Retention of invoices and licence agreements, and erasure

**Verdict: weakened**

**Strongest counter-argument.** The statute does confirm the two periods, but three qualifications matter:

1. **Licence agreements can be 5-year material.** § 13 places "avtaler som gjelder virksomheten" (business agreements) at 3.5 years, and documentation of booked entries at 5 years. § 10 says that where documentation has several parts, the primary document must reference the others. Secondary sources give the example of an invoice saying "Salg i henhold til avtale" (sale according to agreement), which pulls the agreement into the invoice's 5-year period. For a licence business, invoices are likely to refer to the licence, so a flat 3.5 years is unsafe. The safer rule is to keep licence agreements for 5 years whenever an invoice relies on them.
2. **Agreements of minor importance** are carved out of § 13 no. 5 altogether, so not every licence automatically attracts a retention duty.
3. **The statute changes soon.** Lovdata notes that § 13 is to be amended by a law of 2026-06-19, in force 2027-01-01. The v1 target date is not relevant to this; the point is that the current text has about two months left. I did not read the amendment and do not know whether it changes these periods. **This must be checked before G is relied on.**

Also, the periods run from the end of the financial year, not from the document date. Tax authorities may order longer retention.

**Evidence**

```yaml
- claim: "§ 13: material in first paragraph nos. 1 to 4 is kept 5 years after the end of the financial year, including documentation of booked entries (no. 3). Nos. 5 to 8 are kept 3 years 6 months, including business agreements except those of minor importance (no. 5), and correspondence that gives significant additional information about a booked entry (no. 6)."
  source: https://lovdata.no/lov/2004-11-19-73/§13
  publisher: Lovdata
  pub_date: consolidated statute
  confidence: high
  evidence: opened
- claim: "Lovdata notes that § 13 is to be amended by a law dated 2026-06-19, effective 2027-01-01. Content of the amendment not read."
  source: https://lovdata.no/lov/2004-11-19-73/§13
  publisher: Lovdata
  pub_date: consolidated statute
  confidence: high for the fact of the amendment; content unknown
  evidence: opened
- claim: "§ 10: booked information must be documented, and where documentation has several parts the primary document must reference the others."
  source: https://lovdata.no/lov/2004-11-19-73/§13
  publisher: Lovdata
  pub_date: consolidated statute
  confidence: high
  evidence: opened
- claim: "Where an invoice refers to an agreement ('Salg i henhold til avtale'), the agreement becomes primary documentation and must be kept as long as the invoice. Contracts and order forms are given as examples of primary documentation."
  source: https://www.sticos.no/fagstoff/regnskapsmateriale-som-ma-oppbevares-lengre-enn-5-ar
  publisher: secondary professional sources
  pub_date: not shown
  confidence: medium; no source addresses licence agreements as such
  evidence: excerpt
  mapping: not shown; candidates include https://revregn.no/asset/Utgaver/2015/7-30-4.pdf and https://www.regjeringen.no/no/dokumenter/forskrift-om-endring-av-bokforingsforskriften-og-enkelte-andre-forskrifter-tilpasninger-til-redusert-oppbevaringstid-etter-bokforingsloven/id2356558/
- claim: "Tax authorities can order bookkeeping-obliged taxpayers to keep primary documentation longer than 5 years under skatteforvaltningsloven § 11-3."
  source: https://www.sticos.no/fagstoff/regnskapsmateriale-som-ma-oppbevares-lengre-enn-5-ar
  publisher: Sticos
  pub_date: not shown
  confidence: medium
  evidence: excerpt
  mapping: not shown; statute not opened
```

**Searched and not found**

- No Skatteetaten or accounting-standard source specifically on licence agreements.

**Not searched (budget)**

- Whether a B2B invoice holds personal data at all.
- Minimum-content rules for invoices.
- Whether a depicted person's data appears in these records.
- Limitation periods as a basis for keeping consent evidence after withdrawal.
- GDPR Art. 17(3) as applied to this scenario.

The "overrides an erasure request" limb was therefore not tested, for or against. Nothing retrieved contradicts it.

---

## H. Withdrawal of consent

**Verdict: weakened**

**Strongest counter-argument.** The conclusion treats one withdrawal rule as governing two regimes:

1. **GDPR versus § 104.** Art. 7(3) governs GDPR consent. No source retrieved says that a § 104 consent, which may be a term in a paid model release, can be withdrawn on the same terms. If the release is a contract and the GDPR basis is Art. 6(1)(b) or (f), the Art. 7(3) route may not be engaged at all, so "must remove" may overstate the duty. Sources tie the erasure route to consent being the lawful basis. Conversely, the agency cannot assume irrevocability either: the only source saying a release "supersedes GDPR rights" is an unsupported commercial page.
2. **Past versus future use by licensees.** Art. 7(3) protects only processing *before* withdrawal. "Licences already sold remain lawful for past use" is correct as far as it goes, but it is silent on the live question, which is whether a licensee may continue or newly publish under a licence sold before withdrawal. Art. 7(3) gives no comfort there. The conclusion should say that future use by licensees is unresolved, and the licence terms should address it.

No Norwegian or EEA case on model release withdrawal was found, so all of this remains argument rather than authority.

**Evidence**

```yaml
- claim: "Art. 7(3): the data subject may withdraw consent at any time, and withdrawal does not affect the lawfulness of processing based on consent before withdrawal."
  source: https://gdpr-text.com/no/read/article-7
  publisher: gdpr-text.com (reproduction of the regulation)
  pub_date: not shown
  confidence: high
  evidence: excerpt
- claim: "A research-institution template states that consent may be withdrawn at any time and that withdrawal requires removal of the images. This shows practice, not law."
  source: https://www.fid.uni-hamburg.de/model-vertrag-erw-en.pdf
  publisher: Universität Hamburg
  pub_date: not shown
  confidence: low-medium
  evidence: excerpt
- claim: "Erasure on withdrawal applies where consent was the lawful basis."
  source: https://dev.to/custodiaadmin/gdpr-for-photographers-what-you-need-to-know-about-photographing-people-3dle
  publisher: DEV Community (weak source, consistent with the Art. 7 text)
  pub_date: not shown
  confidence: low
  evidence: excerpt
- claim: "Irrevocable and perpetual grant language is standard in release templates. Its effect against GDPR withdrawal is not established by these templates."
  source: https://www.lawinsider.com/clause/model-release/_9
  publisher: Law Insider (clause collection)
  pub_date: not shown
  confidence: medium for the fact that such clauses are common; none for enforceability
  evidence: excerpt
- claim: "One vendor asserts a release 'supersedes GDPR rights' so the subject cannot revoke while compensated. This is an unsupported assertion and is listed so that it is not mistaken for authority."
  source: https://www.institute-of-photography.com/understanding-model-releases/
  publisher: Institute of Photography (commercial)
  pub_date: not shown
  confidence: very low
  evidence: excerpt
```

**Searched and not found**

- Two targeted searches found no Norwegian or EEA judgment on model release withdrawal.
- No Personvernnemnda decision on withdrawing consent to a photograph.
- No source on whether § 104 consent can be withdrawn. The search summary stated this gap directly.

**Not searched (budget)**

- Art. 17(2) and Art. 19 duties to inform recipients.
- German or other EEA case law on withdrawing image consent.
- Whether a licensee is an independent controller with its own basis.

**Unverified belief, not a finding.** Art. 19 may require the agency to tell licensees about erasure unless that proves impossible or disproportionate. Confirm against the regulation, since it would add a concrete notification duty.
