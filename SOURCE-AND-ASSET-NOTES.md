# Sources, interpretation, and image use

- The content database contains 14 exhibit entries from the initial museum concept. It distinguishes interpretations from primary-source text and directs visitors to archival pages.
- The Satterlee image is linked to the Free Library of Philadelphia and an image from West Philadelphia Collaborative History. Confirm rights before redistributing the image itself.
- The Chimborazo and Petersburg image links are served by the Library of Congress. Check item page rights and reproduction information before bundling the files.
- The 3D hospital staff figures represent period roles. They are **not likenesses** of Dr. Hayes, Dr. McCaw, Phoebe Pember, or individual patients.
- The room layouts are **interpretive museum galleries**, not exact architectural reconstructions of the named historical hospitals.
- All original bundled GLBs were generated for this code prototype. They are **stylized**, not photogrammetric historical models. Replace them with permitted detailed models for a photorealistic edition.
- At least two direct primary sources featured in the source record are the 1864 Satterlee lithograph, the 1862 Army Order No. 147, the 1864 Petersburg photograph, and Pember's 1879 memoir. Some materials are later firsthand retrospective sources; their date should be displayed.
- Review the scholarly source: Maurice S. Albin, "The Use of Anesthetics during the Civil War, 1861–1865," Pharmacy in History 42, no. 3/4 (2000):99–114. The Civil War expanded use, not invented the anesthetics.
- Verify each quote, image link, and source description against its original archival record before submitting the honors exhibit.

## November 2026 archival-gallery update

- `src/archive.js` is the central image manifest. It maps nine referenced historical photographs/lithographs to all fourteen exhibit panels. Each record identifies its archival source, label, date, and a direct original-record link.
- The source collection includes Satterlee's 1864 lithograph, Sister Ann Alexis Shorb, Chimborazo (April 1865), two comparative Armory Square ward views, a Brandy Station field hospital, two Petersburg hospital-staff photographs, and a second hospital-steward record.
- Some gallery images are **contextual examples** from other institutions. Armory Square pictures are never identified as Satterlee or Chimborazo patient scenes. Petersburg team photographs are not presented as photographs of Satterlee's staff.
- `src/museum-ui.js` now shows image-select controls and source credits per exhibit; its 2D reader includes a complete archival picture index. `src/main.js` adds more wall frames and period-inspired GLB furnishings without removing the original ward beds.
- Images currently load from archival servers rather than being bundled locally. A failed remote request produces a fallback with an accessible source link in the exhibit. For a self-contained installation, download licensed JPEGs into `assets/archives/`, then update the `url` fields in `src/archive.js` and photo wall paths in `src/main.js`.
- Review source-page usage/rights before republishing or changing photographs. The Library of Congress catalog lists no known publication restrictions for the checked historical photographs; collection rights guidance still applies.
- Personnel models are interpretive representations. They must never be presented as authenticated likenesses of named historical people.

## November 11, 2026 research and exhibit revision

- All fourteen exhibit texts were rewritten using shorter, plain-language paragraphs and no em dashes. The central argument, patient stories, documented staff, and present-day connections remain.
- Three exhibits now use short verified direct excerpts: Margaret Hamilton's nursing recollection, Phoebe Yates Pember's memoir, and General Orders No. 147. Other archival summaries are not formatted as testimony.
- John Worrall's medical history is described as a recorded case, not as a personal diary. George Ivy's original letter is referenced by its archival catalog; we have not verified a full transcription or his medical outcome.
- The picture archive in `src/archive.js` has fourteen images and seven original-document or archival-record links. All fourteen exhibits have linked relevant images and source records. Additional views clearly identify photos from different hospitals.
- Ten visual archive frames now appear throughout the 3D museum. The staff figures and original ward beds are preserved. Extra original GLB furnishings were added in the Union, Confederate, and field-hospital rooms.
- `src/main.js` now adds side corridor walls and doorway frames at the North/South junction and the hall between the introduction, field hospital, and legacy gallery. Changes need final live-render inspection for geometry and navigation.
- `PROJECT-RUBRIC-AUDIT.md` maps the site to the instructor's seven rubric categories. The separate Word/PDF overview, historical argument, personal reflection, and Works Cited still require completion.
- Archival image URLs may change or block third-party embedding. When an image fails, use the source record link in the exhibit instead of substituting an unrelated image.
