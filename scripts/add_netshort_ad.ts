import { Database } from 'bun:sqlite';

const db = new Database('db/custom.db');

const existing = db.query("SELECT * FROM AdSlot WHERE name LIKE '%NetShort%'").get();
if (!existing) {
  const id = 'cmwand_netshort_' + Date.now();
  db.query(`
    INSERT INTO AdSlot (id, name, placement, provider, headline, bodyText, ctaLabel, linkUrl, brandColor, brandInitials, logoUrl, logoTheme, imageHint, active, impressions, clicks, updatedAt)
    VALUES (?, ?, ?, 'ADSENSE', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, datetime('now'))
  `).run(
    id,
    'NetShort — Free Dramas & TV Series',
    'SIDEBAR',
    'Free Dramas & Mini Series',
    'Stream Over 10,000+ Short Dramas On-Demand',
    'Install Now',
    'https://play.google.com/store/apps/details?id=com.netshort.abroad',
    '#EF4444',
    'NS',
    '/brands/netshort.png',
    'DARK',
    '/ads/generated/netshort_sidebar_300x250.jpg'
  );
  console.log('Inserted NetShort into AdSlot table successfully!');
} else {
  console.log('NetShort already in database!');
}
