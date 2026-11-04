# Verifier digest r2-1: AI on images, legal claims

Accessed date for every source: 2026-11-04.

**How to read the evidence field**
- `opened`: the page was fetched this run.
- `excerpt`: seen only in a search tool's synthesis; the page was not opened.
- WebFetch passes pages through a summarising model and caps each quote at 125 characters. Quotes below are therefore short and may be slightly reordered. The Lovdata quotes in particular should be checked against the page before being reproduced in any legal text.
- Lines marked **Analysis** are this verifier's reading of the text. No retrieved source states them.

---

## 1. AI Act status in Norway and the EEA

**status: split**
- Not incorporated in the EEA Agreement: **verified**.
- Not in force in Norway: **verified by inference** from the above, with no source stating it directly as of today.
- Autumn 2026 consultation and spring 2027 bill: **verified at excerpt level only** (independent of the vendor, no government primary source).
- Government announcement of 4 August 2026: **unverified**. No retrieved source gives that date.

- claim: Regulation (EU) 2024/1689 is "under scrutiny" by Iceland, Liechtenstein and Norway. No JCD number or date and no Joint Committee target date are stated.
  - source: https://www.efta.int/eea-lex/32024R1689
  - publisher: EFTA (EEA-Lex). pub_date: page undated ("© 2026"). confidence: medium-high. class: primary, treaty body. evidence: opened.
  - Caveats: the page has no last-updated date, so it does not prove status as of today. The summariser also noted that the page lists other status labels without clearly marking which applies, beyond its description. The page still shows 02.08.2026 as the EU compliance date and does not mention the Omnibus, which suggests it may not be fully current.
- claim: Minister Karianne Tung has said the government will send the changes from the EU simplification package to consultation in autumn 2026, with the ambition of a bill (proposisjon) in spring 2027. Progress depends on negotiations with the EU on EEA adaptations and incorporation. The draft KI-lov was consulted in summer 2025 with planned entry into force in late summer 2026, and that plan has slipped. Norwegian businesses must still follow EU rules if their AI systems are used in the EU.
  - source: https://www.tu.no/nyhetsstudio/nye-eu-regler-for-ki-norge-og-eoes-henger-ennaa-langt-etter/127027
  - publisher: Teknisk Ukeblad, NTB news desk. pub_date: not seen. confidence: medium. class: news agency. evidence: excerpt (a direct fetch returned HTTP 404).
- claim: the consultation on the KI-lov closed on 30 September 2025. As of October 2026 the EEA Joint Committee has not decided on incorporation.
  - source: https://opsiocloud.com/no/knowledge-base/ki-loven-ai-act-norge/
  - publisher: Opsio. pub_date: about October 2026 by its own account. confidence: low. class: vendor. evidence: excerpt.
  - The same vendor page also reportedly says that the prohibited practices and the AI literacy duty already apply in Norway, and that Art. 50 has applied since 2 August 2026. **This contradicts its own non-incorporation statement as far as Norwegian law is concerned. Do not rely on it.**
- Not checked: regjeringen.no primary announcement, nkom.no.

## 2. AI Omnibus, Regulation (EU) 2026/1744

**status: verified**

- claim: published in the OJ on 24 July 2026 and in force on 27 July 2026. Annex III stand-alone high-risk "moves from 2 August 2026 to 2 December 2027". Systems embedded in products under EU product safety law wait "until 2 August 2028".
  - source: https://natlawreview.com/article/eu-digital-omnibus-ai-enters-force
  - publisher: K&L Gates LLP (Sarah Pearce, Thomas Nietsch), via National Law Review. pub_date: 2026-07-31. confidence: high. class: law firm. evidence: opened.
- claim: the Commission's Service Desk bases its text on the EUR-Lex consolidated version as at 27 July 2026 and links to OJ:L_202601744.
  - source: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-4
  - publisher: European Commission. pub_date: consolidated 2026-07-27. confidence: high. class: primary. evidence: opened.
- Not read: the OJ text and Art. 113 as amended. The dates rest on the law firm and on the Commission page seen earlier.

## 3. AI Act text

**Art. 4 (AI literacy): amended in all three paragraphs.**
- claim: providers and deployers remain under a duty to take measures to support AI literacy, considering technical knowledge, experience, education, training, context of use and the people affected. New limit: "This obligation does not require providers or deployers to guarantee any specific level of AI literacy of any individual." Para. 2: the Commission and Member States support these efforts, particularly for SMEs, and the Commission publishes practical examples. Para. 3: Board recommendations.
  - source: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-4
  - publisher: European Commission. pub_date: consolidated 2026-07-27. confidence: high for current text; the operative phrase of para. 1 is paraphrased by the summariser. class: primary. evidence: opened.
- **Weakened?** The current text reads as softer, but the duty was not removed. The pre-Omnibus wording was not opened this run. Unverified belief: it read "take measures to ensure, to their best extent, a sufficient level of AI literacy". Confirm at https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng.

**Art. 3(3) and 3(4): neither is marked AMENDED.**
- claim, provider: "'provider' means a natural or legal person, public authority, agency or other body that develops an AI system" / "or a general-purpose AI model or that has an AI system or a general-purpose AI model developed" / "and places it on the market or puts the AI system into service under its own name or trademark" / "whether for payment or free of charge;"
- claim, deployer: "'deployer' means a natural or legal person, public authority, agency or other body using an AI system" / "under its authority except where the AI system is used in the course of a personal non-professional activity;"
  - source: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-3
  - publisher: European Commission. pub_date: consolidated 2026-07-27. confidence: high. class: primary. evidence: opened.
- **Analysis:** an agency using an API under its own authority fits "deployer" on the text. The provider limb turns on whether it develops or has developed an AI system and places it on the market or into service under its own name. Bundling the feature into a portal offered to clients is the fact to test. No authority was retrieved on this.

**Art. 5(1)(g): not marked AMENDED or NEW.**
- claim: "(g) the placing on the market, the putting into service or the use of biometric categorisation systems" / "that categorise individually natural persons based on their biometric data to deduce or infer their race," / "political opinions, trade union membership, religious or philosophical beliefs, sex life or sexual orientation;" / "this prohibition does not cover any labelling or filtering of lawfully acquired biometric datasets, such as images," / "based on biometric data or categorizing of biometric data in the area of law enforcement;"
  - source: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5
  - publisher: European Commission. pub_date: consolidated 2026-07-27. confidence: high. class: primary. evidence: opened.
- Addition: new Art. 5(1)(ba) covers realistic intimate or sexually explicit imagery of identifiable people without explicit consent. New Art. 5(1)(bb) covers child sexual abuse material. K&L Gates says these apply from 2 December 2026.
- **Analysis:** the "labelling or filtering ... such as images" carve-out is directly relevant to an image library, but its scope is ambiguous on the wording: it is unclear whether "in the area of law enforcement" also limits the labelling limb. Do not treat it as a general safe harbour. The definition of "biometric data" and the recitals were not read.

**Art. 50(2) grace period: yes, according to a secondary source; primary text not read.**
- claim: "A limited four-month grace period applies only to certain machine-readable marking requirements", for generative AI systems already on the market before 2 August 2026.
  - source: https://natlawreview.com/article/eu-digital-omnibus-ai-enters-force
  - publisher: K&L Gates LLP. pub_date: 2026-07-31. confidence: medium. class: law firm. evidence: opened.
  - The article does not name Art. 50(2), give an end date or cite an article number. Four months from 2 August 2026 would be 2 December 2026, but that is arithmetic, not sourced. Confirm against the Service Desk pages for Art. 50 and Art. 111.

**Not read for lack of budget: Art. 2 (territorial scope) and Annex III point 1(b).** The only evidence on scope is the TU/NTB excerpt in item 1.

## 4. Text and data mining in Norway, Prop. 41 LS (2025-2026)

**status: verified (no enacted exception, bill in committee). The vote check is limited, see below.**

- claim: "Lovforslaget er til behandling i komiteen", in familie- og kulturkomiteen. No Innst. number or vote date is shown.
  - source: https://www.stortinget.no/no/Saker-og-publikasjoner/Saker/Sak/?p=200243
  - publisher: Stortinget. pub_date: live page. confidence: medium-high. class: primary. evidence: opened.
  - Caveat: the page showed "Laster saksgang og status ...", so the dated timeline did not load. The absence of an Innst. on the rendered page is not conclusive.
- claim: the consolidated act on Lovdata has no §§ 50 a to 50 f.
  - source: https://lovdata.no/dokument/NL/lov/2018-06-15-40/KAPITTEL_5
  - publisher: Lovdata. pub_date: consolidation date not shown. confidence: medium-high. class: primary. evidence: opened.
  - Caveat: the summariser described the chapter structure inconsistently between two fetches, though it did not report these sections in either. Other exceptions were not reviewed for possible application to TDM.
- claim: proposed § 50 d defines text and data mining as "enhver automatisert analytisk metode som brukes for å analysere tekst og data i digital form for å fremskaffe informasjon".
  - source: https://www.regjeringen.no/no/dokumenter/prop.-41-ls-20252026/id3154279/?ch=4 (most likely origin; the search tool did not bind the quote to a URL)
  - publisher: Kultur- og likestillingsdepartementet. pub_date: 2025-2026 session. confidence: medium. class: primary. evidence: excerpt.
- claim: § 50 e reportedly lets anyone make copies for TDM if the works are lawfully accessible and the rightsholder has not prohibited it. TONO reads the reservation as made per work. The bill says training AI models can involve TDM, and that providers of general-purpose AI models must get permission for reserved works.
  - sources: https://www.tono.no/innspill-til-lovforslag-om-endringer-i-andsverkloven/ and the Prop. 41 URL above
  - publisher: TONO (interested party) and the ministry. pub_date: not seen. confidence: medium. class: rightsholder body and primary. evidence: excerpt.
  - Section numbering differs between sources. Check https://www.regjeringen.no/contentassets/80d80f94efe84d01b343059ed79e47ba/no/docx/prp202520260041000ddddocx.docx.
- Lead, not opened: a Creo submission whose URL path and filename suggest 28 September 2026 (https://creokultur.no/wp-content/uploads/2026/09/Horingssvar-DSM-av-28.9.26.pdf). This would be consistent with committee handling continuing into autumn 2026.
- **Would analysing one image fall within § 50 d? No source addresses this. Analysis:** the quoted definition has no volume threshold ("enhver ... metode"), so a literal reading could cover it, if an image counts as "data i digital form". Sending an image to a model to describe it does "fremskaffe informasjon". The opposite argument, that the provision targets mining at scale, was not found in or excluded by anything retrieved. Preparatory works on this point were not read. Even if covered, the proposed exception would be subject to reservation and is not law yet.

## 5. Åndsverkloven §§ 3, 4, 24, 67, 68

**status: gap filled. One correction to the brief's framing: narrow construction is § 67(2) only. § 68 governs alteration and onward transfer.**

All from source: https://lovdata.no/dokument/NL/lov/2018-06-15-40/KAPITTEL_5 (this URL returned the whole act). Publisher: Lovdata. pub_date: consolidation date not shown; most recent amendment seen is lov 13 December 2024 nr. 76 (§ 87). confidence: medium-high, because quotes passed through the summariser. class: primary. evidence: opened.

- **§ 3:** "Opphavsretten gir enerett til å råde over åndsverket ved å" make copies, temporary or permanent, and make the work available to the public. Third ledd: streaming or otherwise using clearly unlawfully published works is prohibited where it may seriously harm the author's economic interests. Fourth ledd: "Enerett etter første ledd omfatter åndsverket i opprinnelig eller endret skikkelse", plus adaptations and other forms.
- **§ 4:** temporary copies that are an integral and essential part of a technical process fall outside § 3, if their sole purpose is lawful use or transmission by an intermediary, "med mindre den har selvstendig økonomisk betydning". "Bestemmelsen i første ledd gjelder ikke for datamaskinprogrammer og databaser."
- **§ 67:**
  - First ledd: "Opphaveren kan med den begrensning som følger av § 5 helt eller delvis overdra sin rett til å råde over åndsverket."
  - Second ledd: the author is not taken to have transferred a wider right "enn det avtalen klart gir uttrykk for".
  - Third ledd: "Overdragelse av eksemplar innbefatter ikke overdragelse av opphavsretten eller noen del av denne."
- **§ 68:** a transfer gives no right to alter the work unless agreed. No further transfer without consent, unless the right passes with a business. The original transferor stays responsible for the agreement with the author.
- **§ 24 (heading as reported: "Eneretten til databaser"):** covers the person who makes "et formular, en katalog, en tabell, et program eller lignende arbeid" where "innsamling, kontroll eller presentasjon av innholdet innebærer en vesentlig investering".
  - The maker has an exclusive right over "hele eller vesentlige deler av databasens innhold", and over repeated, systematic extraction of insubstantial parts that harms normal use.
  - Term: 15 years from the end of the year of making, or of first publication within that period.
  - Contract terms extending the right over a published database are unenforceable (fifth ledd, as reported).
- **Does § 24 protect a metadata collection? Conditionally.** The test is substantial investment in collecting, checking or presenting the content. The text does not protect data as such, and it protects against extraction and re-use. Whether API-generated metadata meets the test was not addressed by any retrieved source. Unverified hypothesis to check: EU database case law distinguishing investment in obtaining data from investment in creating it (the BHB line) could weigh against protection.

## 6. Anthropic Commercial Terms

**status: verified on the publisher's own page, with one correction: the exclusions are in K.3, not K.1, and inputs are excluded.**

- source for all: https://www.anthropic.com/legal/commercial-terms
- publisher: Anthropic. pub_date: "Effective" Jun 17, 2025, no version number shown. confidence: high. class: primary contract. evidence: opened.
- claim, § L.1: "Customer further represents and warrants that it has all rights and permissions required to submit Inputs to the Services."
- claim, § B: "Anthropic may not train models on Customer Content from Services."
- claim, § B: "Subject to Customer's compliance with these Terms, Anthropic hereby assigns to Customer" "its right, title and interest (if any) in and to Outputs." The assignment is conditional on compliance, which the brief's claim omitted.
- claim, § K.1: covers third-party IP claims about "Customer's paid use of the Services" in accordance with the Terms, "or Outputs generated through such authorized use".
- claim, § K.3: no indemnity to the extent the claim arises from:
  - (a) "modifications made by Customer to the Services or Outputs;"
  - (b) "the combination of the Services or Outputs with technology or content not provided by Anthropic;"
  - (c) **"Inputs or other data provided by Customer;"**
  - (d) use the customer "knows or reasonably should know" "violates or infringes the rights of others;"
  - (e) patented inventions in an Output
  - (f) trademark use of an Output

So a rightsholder's claim caused by submitting an image falls outside the indemnity under K.3(c), and the customer has warranted its rights under L.1.

## 7. Is sending a copyrighted image for AI analysis, without training, a reproduction needing permission?

**status: gap not closed. No Norwegian or EU authority on this exact question was found in one search. That is not evidence that none exists.**

Adjacent evidence, none on point:
- claim: BONO says using artists' works to train generative AI "er en opphavsrettslig handling". This addresses training, not analysis.
  - source: https://bono.no/embed/ (attribution uncertain). publisher: BONO. pub_date: not seen. confidence: low. class: rightsholder body, interested party. evidence: excerpt.
- claim: Kopinor's 2027 business-agreement update "gir mulighet til å bruke opphavsrettsbeskyttet materiale som instruks eller kontekst i KI-verktøy", in limited cases. This suggests a rightsholder organisation treats AI input as a use it can license. It is a position, not law, and the excerpt does not say it covers images.
  - sources: https://kopinor.no/aktuelt/ or https://www.iktogskole.no/2026/02/27/kopinor-og-ki/ (the tool did not bind the quote to a URL). publisher: Kopinor or a third party reporting on it. pub_date: not confirmed. confidence: low-medium. class: rightsholder body. evidence: excerpt.
- claim: Kopinor says material published online "ikke automatisk kan brukes til tekst- og datautvinning" under the general exception.
  - source: https://www.tidsskriftforeningen.no/2025-kopinor/257607 (attribution uncertain). confidence: low-medium. class: rightsholder body. evidence: excerpt.
- **Analysis:** the statutory starting point from item 5 is that § 3 covers temporary or permanent copies, and § 4 only exempts temporary copies meeting its conditions. Whether upload and provider-side processing meets § 4, including "selvstendig økonomisk betydning" when the output has commercial value, is untested in anything retrieved. No Ministry of Culture statement or EU guidance was opened.

## 8. Enforcement on AI inference of sensitive attributes from images

**status: not checked. The budget ran out before this search.**

## 9. EDPB Guidelines 3/2019, C-184/20, C-21/23

**status: verified at secondary level only. Neither the judgments nor the guidelines were opened, so the brief's instruction to open the documents was not met. One scope qualification on the EDPB limb.**

The search tool did not bind each statement to a URL, so sources below are the result cluster. Confidence is reduced accordingly.

- claim: in C-184/20 (OT, Grand Chamber, 1 August 2022) data capable of indirectly revealing a sensitive characteristic falls under Art. 9(1). The facts involved a partner's name from which sexual orientation could be deduced.
  - sources: https://www.insideprivacy.com/eu-data-protection/special-category-data-by-inference-cjeu-significantly-expands-the-scope-of-article-9-gdpr/, https://www.vbb.com/media/Newsletters/CLIENT_ALERT_-_CJEU_Adopts_Broad_Interpretation_of_Special_Personal_Data.pdf, https://publications.matheson.com/data-protection-technology-and-cyber-security-bulletin-october-2022/cjeu-expands-scope-of-special-category-data
  - publisher: Covington, Van Bael & Bellis, Matheson. pub_date: 2022. confidence: medium-high. class: law firm. evidence: excerpt.
- claim: C-21/23 (Lindenapotheke, 4 October 2024) **is relevant**. Online pharmacy order data was held to be health data even with no diagnosis attached. A commentator adds that it is irrelevant whether the controller aims to infer the information, and whether the inference is accurate.
  - sources: https://connectontech.bakermckenzie.com/sensitive-data-under-the-cjeus-spotlight-practical-implications/, https://www.osborneclarke.com/insights/2024-privacy-review-most-important-ecj-privacy-rulings
  - publisher: Baker McKenzie, Osborne Clarke. pub_date: not confirmed. confidence: medium. class: law firm. evidence: excerpt. The "irrelevant" gloss comes from commentary and was not checked against the judgment.
- claim: EDPB Guidelines 3/2019 are guidelines on **video devices**, adopted in final form on 29 January 2020. Commentary reports that if video footage is processed for the purpose of deducing special category data, it constitutes special category data. One law firm cites sections 62 to 64.
  - sources: https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_201903_video_devices_en.pdf (not opened), https://huntonak.com/privacy-and-information-security-law/edpb-adopts-guidelines-on-data-processing-through-video-devices
  - publisher: EDPB, Hunton. pub_date: 2020-01-29. confidence: medium. class: regulator guidance via commentary. evidence: excerpt.
- **Qualification to the claim:** the guidelines address video devices, so applying them to still images in a library is an analogy, not their stated scope. The reported test is purpose-based ("for the purpose of deducing"), while the commentary on C-21/23 says the controller's aim is irrelevant. **That is a possible tension about whether incidental inference triggers Art. 9.** It is unresolved here and should not be averaged.
- Lead: the search synthesis mentioned a firm contrasting these cases with a position that derived information falls outside the definition. It did not identify the firm or instrument. Not followed up.

---

## Still open

1. **Item 8** (enforcement, Datatilsynet): not searched.
2. **AI Act Art. 2 and Annex III point 1(b)**: not read. Pages follow the pattern `https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-2`; the annex path was not confirmed.
3. **Art. 50(2) and Art. 111 primary wording and end date**, plus pre-Omnibus Art. 4 wording for a true comparison.
4. **Item 1 primary source**: no regjeringen.no or nkom.no text; 4 August 2026 date unconfirmed. Lead for a recent EEA check, not opened: https://www.regjeringen.no/no/aktuelt/nye-rettsakter-i-eos-avtalen-25.-september/id3173746/. The TU article returned 404 on direct fetch.
5. **Item 9 primaries**: C-184/20, C-21/23 and EDPB 3/2019 paras 62 to 64 not opened. Art. 5(1)(g) recitals and the "biometric data" definition not read.
6. **Item 4**: Stortinget timeline did not load; confirm no Innst. Proposed §§ 50 d to 50 f wording and preparatory works not opened.
7. **Item 7**: only one Norwegian-language search. No EU or Ministry of Culture source was examined.

## Budget used

19 tool calls, one over the 18-call budget and under the ceiling of 20. The extra call was an Edit correcting a garbled version of this section, and no research was done with it.

- ToolSearch: 1
- WebSearch: 4
- WebFetch: 12 (2 of them failed: TU 404, A&O Shearman PDF unreadable)
- Write: 1
- Edit: 1
