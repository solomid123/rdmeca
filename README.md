# R&D MECA website

Bilingual French/English website with a homepage, six service pages in each language, contact pages, and privacy/site-information pages. Source content is in `content.mjs`; `build.mjs` creates static pages in `dist/`. No runtime framework or package installation is required.

Run `npm run build` after changing content. Run `npm run dev` for the local preview on port 4173. Run `npm run check` to check local references and bilingual metadata.

Contact details supplied by the owner: contact@rdmeca.com, +33 7 45 76 80 10. The enquiry form deliberately prepares an email for the visitor to review and send; it does not claim to send messages through a backend. Phone, email and WhatsApp links are also available.

The logo is the supplied R&D MECA PNG, cropped to remove transparent margins. Photographs are illustrative Unsplash images by aluminum Zheng ji and Jelifer Maniago, credited in the site information page; they are not presented as actual R&D MECA facilities or projects. Images and fonts are hosted locally. No fabricated customers, testimonials, staff counts or performance statistics are included.

The new Sites deployment is private for owner review. The intended custom domain is rdmeca.com. Before a public domain launch, connect the domain, update `business.origin` in `content.mjs` to the final HTTPS origin, rebuild, and add the confirmed legal company identity and complete applicable local business disclosures to the site information page. Keep phone/email values updated in `content.mjs` and the contact preparation logic if they change.
