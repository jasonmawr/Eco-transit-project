import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function run() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const batchSize = 50;

  console.log(`=== LEADERSHIP ALIAS BACKFILL START ===`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (No database modifications)' : 'WRITE MODE (Database will be updated)'}`);

  try {
    const wallets = await prisma.userWallet.findMany({
      where: { publicLeaderboardAlias: null },
    });

    const scanned = wallets.length;
    let created = 0;
    let skipped = 0;
    let collision = 0;

    console.log(`Found ${scanned} wallets lacking an alias.`);

    for (let i = 0; i < wallets.length; i += batchSize) {
      const batch = wallets.slice(i, i + batchSize);

      for (const wallet of batch) {
        let alias = '';
        let success = false;
        let attempts = 0;

        while (attempts < 10 && !success) {
          const randNum = Math.floor(100000 + Math.random() * 900000);
          alias = `Hành khách xanh ${randNum}`;

          // Check if alias exists in DB
          const existing = await prisma.userWallet.findFirst({
            where: { publicLeaderboardAlias: alias },
          });

          if (!existing) {
            success = true;
          } else {
            collision++;
            attempts++;
          }
        }

        if (!success) {
          alias = `Hành khách xanh ${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        }

        if (dryRun) {
          console.log(`[DRY RUN] Would assign alias "${alias}" to wallet ${wallet.id}`);
          created++;
        } else {
          try {
            await prisma.userWallet.update({
              where: { id: wallet.id },
              data: { publicLeaderboardAlias: alias },
            });
            console.log(`[ASSIGNED] Assigned alias "${alias}" to wallet ${wallet.id}`);
            created++;
          } catch (err) {
            console.error(`Failed to assign alias to wallet ${wallet.id}:`, err);
            skipped++;
          }
        }
      }
    }

    const remainingNull = await prisma.userWallet.count({
      where: { publicLeaderboardAlias: null },
    });

    console.log(`\n=== BACKFILL SUMMARY ===`);
    console.log(`Scanned: ${scanned}`);
    console.log(`Created/Assigned: ${created}`);
    console.log(`Skipped/Failed: ${skipped}`);
    console.log(`Collisions Resolved: ${collision}`);
    console.log(`Remaining null wallets: ${remainingNull}`);

  } catch (err) {
    console.error('Error running backfill:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
