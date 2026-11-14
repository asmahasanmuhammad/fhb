const { DatabaseSync } = require('node:sqlite');
const { createClient } = require('@libsql/client');
const path = require('path');

const TURSO_URL = 'libsql://fhbsports-asmahasanmuhammad.aws-ap-southeast-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTQ2NTE2MzIsImlkIjoiMDFhMWQ5ODctNjAwMS03NjFiLWEwMTktNDU1OWJiN2U0YzdiIiwia2lkIjoiZjcwSXQwSTd6SU5LOTdldGZYSmIzUzU3U3NNOEZCc1I4c3h3WkZIWW9xNCIsInJpZCI6ImIwZmE1NzA3LTQ0ZWEtNGFlMy1iNTdkLTQwNzg5NjY3NjI2YSJ9.ionW1-XeO2qMRMhuJPqKfI09ShRIgkkej69wR2Wyj8tde6HvO9Rkhb0jEph8z0MYnhMtYHnXeT-Hbhw0ZsyoBQ';

async function main() {
  console.log('[1/4] Connecting to local custom.db and Turso cloud database...');
  const localDb = new DatabaseSync(path.join(__dirname, '..', 'db', 'custom.db'));
  const turso = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  // Verify Turso connection
  await turso.execute('SELECT 1');
  console.log('✓ Successfully connected to Turso cloud database!');

  // Get table schemas
  console.log('[2/4] Fetching table schemas from local database...');
  const tables = localDb.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'").all();

  console.log('[3/4] Creating all tables on Turso first...');
  for (const table of tables) {
    console.log(` -> Creating table structure for ${table.name}...`);
    try {
      await turso.execute(table.sql);
    } catch (err) {
      console.log(`    Notice on ${table.name}: ${err.message}`);
    }
  }

  // Create indexes
  const indexes = localDb.prepare("SELECT name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all();
  console.log(` -> Creating ${indexes.length} indexes...`);
  for (const idx of indexes) {
    try {
      await turso.execute(idx.sql);
    } catch (err) {
      // index may already exist
    }
  }

  console.log('[4/4] Inserting rows into Turso...');
  // Sort tables so parent tables come before dependent tables
  const order = [
    'User', 'Team', 'Competition', 'Player', 'Match', 'MatchEvent', 'Standing',
    'NewsArticle', 'Video', 'Post', 'Comment', 'Like', 'Follow', 'MembershipPlan',
    'Subscription', 'Earning', 'PayoutRequest', 'AdSlot', 'Session'
  ];

  const sortedTables = [...tables].sort((a, b) => {
    const ai = order.indexOf(a.name);
    const bi = order.indexOf(b.name);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  for (const table of sortedTables) {
    const rows = localDb.prepare(`SELECT * FROM "${table.name}"`).all();
    console.log(` -> Copying ${rows.length} rows into ${table.name}...`);

    if (rows.length > 0) {
      // Clear existing in case of re-run
      try {
        await turso.execute(`DELETE FROM "${table.name}"`);
      } catch (e) {}

      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT INTO "${table.name}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`;

      const chunkSize = 50;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const statements = chunk.map(row => ({
          sql,
          args: columns.map(c => row[c]),
        }));
        await turso.batch(statements, 'write');
      }
      console.log(`    ✓ Copied ${rows.length} rows.`);
    }
  }

  // Verify verification
  console.log('\n[VERIFICATION] Table row counts on Turso:');
  for (const table of sortedTables) {
    const res = await turso.execute(`SELECT COUNT(*) as count FROM "${table.name}"`);
    console.log(`  • ${table.name.padEnd(20)}: ${res.rows[0].count} rows`);
  }

  console.log('\n🎉 ALL DATA SUCCESSFULLY MIGRATED TO TURSO CLOUD DATABASE!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
