// Archival images with source records. Images are remotely hosted by their collections.
// Rights vary; consult the corresponding archival record before reusing elsewhere.
export const ARCHIVE = [
  {
    "id": "satterlee",
    "title": "Satterlee U.S.A. General Hospital, West Philadelphia",
    "date": "1864 lithograph",
    "url": "https://collaborativehistory.gse.upenn.edu/sites/default/files/Satterlee%20General%20Hospital%201864%20LCOP.jpg",
    "record": "https://libwww.freelibrary.org/digital/item/pdcp00420",
    "credit": "Charles Magnus, lithographer; James D. Gay, publisher. Free Library of Philadelphia.",
    "note": "The original lithograph depicts Satterlee; archival scan currently served by West Philadelphia Collaborative History."
  },
  {
    "id": "shorb",
    "title": "Sister Ann Alexis Shorb, head nurse at Satterlee",
    "date": "c. 1861–1865",
    "url": "https://tile.loc.gov/storage-services/service/pnp/ppmsca/57100/57159v.jpg",
    "record": "https://www.loc.gov/item/2018653937/",
    "credit": "Library of Congress, LC-DIG-ppmsca-57159.",
    "note": "This photograph depicts a documented Satterlee nurse."
  },
  {
    "id": "chimborazo",
    "title": "Chimborazo Hospital, Richmond, Virginia",
    "date": "Photographed April 1865",
    "url": "https://tile.loc.gov/storage-services/service/pnp/ppmsca/33600/33629v.jpg",
    "record": "https://www.loc.gov/item/2012650183/",
    "credit": "Library of Congress, LC-DIG-ppmsca-33629.",
    "note": "A photograph of the hospital grounds, not a portrait of its personnel."
  },
  {
    "id": "wardk",
    "title": "Ward K, Armory Square Hospital, Washington, D.C.",
    "date": "Photographed 1864",
    "url": "https://tile.loc.gov/storage-services/service/pnp/ppmsca/33600/33627v.jpg",
    "record": "https://www.loc.gov/item/2012650181/",
    "credit": "Library of Congress, LC-DIG-ppmsca-33627.",
    "note": "A Union general-hospital ward in Washington, not Satterlee or Chimborazo."
  },
  {
    "id": "armory",
    "title": "A ward in Armory Square Hospital",
    "date": "Photographed 1862–1865",
    "url": "https://tile.loc.gov/storage-services/service/pnp/ppmsca/33700/33750v.jpg",
    "record": "https://www.loc.gov/item/2013645505/",
    "credit": "Library of Congress, LC-DIG-ppmsca-33750.",
    "note": "Another Union general hospital, used as comparative evidence of ward layout."
  },
  {
    "id": "brandy",
    "title": "Field hospital, Second Army Corps, Brandy Station",
    "date": "Photographed February 1864",
    "url": "https://tile.loc.gov/storage-services/service/pnp/ppmsca/12500/12575r.jpg",
    "record": "https://www.loc.gov/item/2007682513/",
    "credit": "James Gardner, negative; Alexander Gardner, positive. Library of Congress, LC-DIG-ppmsca-12575.",
    "note": "A Union field hospital, distinct from permanent urban general hospitals."
  },
  {
    "id": "petersburg",
    "title": "Surgeons of the 3rd Division before hospital headquarters, Petersburg",
    "date": "August 1864",
    "url": "https://tile.loc.gov/storage-services/service/pnp/cwpb/03600/03662r.jpg",
    "record": "https://www.loc.gov/item/2018666674/",
    "credit": "Library of Congress, LC-DIG-cwpb-03662.",
    "note": "A real Union field medical team, not the staff of Satterlee."
  },
  {
    "id": "stewards",
    "title": "Hospital stewards of the 2nd Division, 9th Corps, Petersburg",
    "date": "October 1864",
    "url": "https://tile.loc.gov/storage-services/service/pnp/cwpb/03900/03960r.jpg",
    "record": "https://www.loc.gov/item/2018666688/",
    "credit": "Timothy H. O'Sullivan. Library of Congress, LC-DIG-cwpb-03960.",
    "note": "An identified group of Union hospital stewards, photographed at Petersburg."
  },
  {
    "id": "stewards2",
    "title": "Hospital stewards of 2nd Division, 9th Army Corps",
    "date": "Photographed 1864",
    "url": "https://tile.loc.gov/storage-services/service/pnp/ppmsca/33600/33626v.jpg",
    "record": "https://www.loc.gov/item/2012650180/",
    "credit": "Library of Congress, LC-DIG-ppmsca-33626.",
    "note": "Historic photograph of hospital personnel, not Chimborazo."
  }
];
export const EXHIBIT_IMAGES = {
  "intro-thesis": [
    "satterlee",
    "chimborazo",
    "wardk"
  ],
  "intro-antebellum": [
    "wardk",
    "armory"
  ],
  "intro-case-studies": [
    "satterlee",
    "chimborazo",
    "brandy"
  ],
  "north-lithograph-1864": [
    "satterlee",
    "shorb"
  ],
  "north-staff-hayes": [
    "shorb",
    "stewards",
    "stewards2"
  ],
  "north-john-worrall": [
    "wardk",
    "armory",
    "satterlee"
  ],
  "south-mccaw-organization": [
    "chimborazo"
  ],
  "south-pember-memoir": [
    "chimborazo"
  ],
  "south-george-ivy-letter": [
    "chimborazo"
  ],
  "south-enslaved-labor": [
    "chimborazo"
  ],
  "field-general-orders-147": [
    "brandy",
    "petersburg"
  ],
  "field-petersburg-surgeons-1864": [
    "petersburg",
    "stewards",
    "stewards2"
  ],
  "field-anesthesia-albin": [
    "brandy",
    "wardk"
  ],
  "modern-legacy-synthesis": [
    "brandy",
    "wardk",
    "armory"
  ]
};
export const archiveFor = id => (EXHIBIT_IMAGES[id] || []).map(key => ARCHIVE.find(a => a.id === key)).filter(Boolean);
