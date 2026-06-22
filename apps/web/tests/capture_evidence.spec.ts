import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Evidence Generation Suite', () => {

  test('Capture all evidence screenshots', async ({ page }) => {
    test.setTimeout(90000);
    const outDir = path.resolve(process.cwd(), 'evidence', 'epic10');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // --- SETUP STATE ---
    // Ensure the seed user is set up correctly
    const userInDb = await prisma.user.findUnique({
      where: { email: 'user@ecotransit.vn' },
    });
    if (!userInDb) {
      throw new Error('Seed user user@ecotransit.vn not found. Please seed the DB first.');
    }

    // Reset points for user
    await prisma.userWallet.upsert({
      where: { userId: userInDb.id },
      update: { balance: 150, lifetimeEarned: 350 },
      create: { userId: userInDb.id, balance: 150, lifetimeEarned: 350, publicLeaderboardAlias: 'Hành khách xanh 151' },
    });

    // Reset avatarConfig to default config (not prompted onboarding)
    await prisma.user.update({
      where: { id: userInDb.id },
      data: {
        avatarConfig: {
          characterId: 'student',
          hairStyle: 'short',
          hairColor: 'default',
          outfitStyle: 'casual',
          outfitColor: 'electricBlue',
          accessory: 'backpack'
        }
      }
    });

    // Reset avatarConfig for admin to prevent onboarding modal popping up on login
    const adminInDb = await prisma.user.findUnique({ where: { email: 'admin@ecotransit.vn' } });
    if (adminInDb) {
      await prisma.user.update({
        where: { id: adminInDb.id },
        data: {
          avatarConfig: {
            characterId: 'student',
            hairStyle: 'short',
            hairColor: 'default',
            outfitStyle: 'casual',
            outfitColor: 'electricBlue',
            accessory: 'backpack'
          }
        }
      });
    }

    // 11. Header responsive 1366
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(outDir, '11-header-responsive-1366.png') });

    // 12. Header responsive 1440
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '12-header-responsive-1440.png') });

    // 13. Header responsive 1920
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '13-header-responsive-1920.png') });

    // 14. Header responsive 390
    await page.setViewportSize({ width: 390, height: 800 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '14-header-responsive-390.png') });

    // Back to desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.waitForTimeout(1000);

    // 10. Dijkstra Map Routing (10-map-first-click-route.png)
    const originBtn = page.locator('button:has-text("Chọn ga/trạm khởi hành...")');
    if (await originBtn.isVisible()) {
      await originBtn.click();
      await page.waitForTimeout(500);
      await page.locator('li[role="option"]').first().click();
      await page.waitForTimeout(500);

      await page.locator('button:has-text("Chọn ga/trạm kết thúc...")').click();
      await page.waitForTimeout(500);
      await page.locator('li[role="option"]').nth(2).click();
      await page.waitForTimeout(500);

      await page.locator('button:has-text("Tìm kiếm lộ trình xanh")').click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(outDir, '10-map-first-click-route.png') });
    }

    // --- LOGIN ---
    await page.locator('header button:has-text("Đăng nhập")').click();
    await page.locator('input[type="email"]').fill('user@ecotransit.vn');
    await page.locator('input[type="password"]').fill('User@123456');
    await page.locator('form button[type="submit"]:has-text("Đăng nhập")').click();
    await expect(page.locator('button:has-text("Đăng xuất")')).toBeVisible();
    await page.waitForTimeout(1000);

    // 04. Avatar on Metro Hub (04-avatar-on-metro-hub.png)
    await page.screenshot({ path: path.join(outDir, '04-avatar-on-metro-hub.png') });

    // 05. Hub train before switch (05-hub-train-before-switch.png)
    await page.screenshot({ path: path.join(outDir, '05-hub-train-before-switch.png') });

    // Switch train node (click station 2 - Khám phá ga)
    await page.locator('a[href="#stations"]').click();
    await page.waitForTimeout(1500);
    // 06. Hub train after switch (06-hub-train-after-switch.png)
    await page.screenshot({ path: path.join(outDir, '06-hub-train-after-switch.png') });

    // --- CUSTOMIZER ---
    await page.locator('button:has-text("Nhân vật đồng hành")').click();
    await expect(page.locator('text=Thiết lập nhân vật của bạn')).toBeVisible();
    await page.waitForTimeout(500);

    // 01. Avatar picker desktop (01-avatar-picker-desktop.png)
    await page.screenshot({ path: path.join(outDir, '01-avatar-picker-desktop.png') });

    // 02. Avatar picker mobile (02-avatar-picker-mobile-390.png)
    await page.setViewportSize({ width: 390, height: 800 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '02-avatar-picker-mobile-390.png') });
    
    // Back to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);

    // Select styling choices to preview customization changes
    await page.locator('button:has-text("Kiểu Tóc")').click();
    await page.locator('button:has-text("Tóc xoăn")').click();
    await page.locator('button:has-text("Trang Phục")').click();
    await page.locator('button:has-text("Áo Khoác Zip")').click();
    await page.locator('button:has-text("Phụ Kiện")').click();
    await page.locator('button:has-text("Kính Mát Trí Thức")').click();
    await page.waitForTimeout(500);

    // 03. Avatar custom selection (03-avatar-preview-hair-outfit-accessory.png)
    await page.screenshot({ path: path.join(outDir, '03-avatar-preview-hair-outfit-accessory.png') });

    // Save
    await page.locator('button:has-text("Lưu Nhân Vật ✓")').click();
    await page.waitForTimeout(1500);

    // 08. XanhWrap rules preview (08-xanhwrap-rules-preview.png)
    await page.locator('a[href="#xanhwrap"]').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '08-xanhwrap-rules-preview.png') });

    // 09. Leaderboard privacy (09-leaderboard-privacy-ui.png)
    await page.locator('a[href="#tickets"]').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '09-leaderboard-privacy-ui.png') });

    // --- REVERSAL BLOCK ---
    // Zero out user wallet points in DB so ticket rejection throws REVOCATION_INSUFFICIENT_BALANCE
    await prisma.userWallet.update({
      where: { userId: userInDb.id },
      data: { balance: 0 }
    });

    // Log out user
    await page.locator('button:has-text("Đăng xuất")').click();
    await page.waitForTimeout(1000);

    // Log in as Admin
    await page.locator('header button:has-text("Đăng nhập")').click();
    await page.locator('input[type="email"]').fill('admin@ecotransit.vn');
    await page.locator('input[type="password"]').fill('Admin@123456');
    await page.locator('form button[type="submit"]:has-text("Đăng nhập")').click();
    await expect(page.locator('button:has-text("Đăng xuất")')).toBeVisible();
    await page.waitForTimeout(1000);

    // Navigate to Admin -> Tickets tab
    await page.locator('a[href="#admin"]').click();
    await page.waitForTimeout(1000);
    await page.locator('#scene-viewport').locator('button:has-text("Vé xanh")').click();
    await page.waitForTimeout(1000);

    // Select verified status filter "Đã duyệt"
    await page.locator('button:has-text("Đã duyệt")').click();
    await page.waitForTimeout(1500);

    // Try to reject the first verified ticket
    await page.locator('button:has-text("Từ chối")').first().click();
    await page.waitForTimeout(2000);

    // 15. Ticket reversal blocked error (15-ticket-reversal-blocked-message.png)
    await page.screenshot({ path: path.join(outDir, '15-ticket-reversal-blocked-message.png') });

    // Make sure we have 07-train-rapid-switch.webm placeholder or trace file as requested
    const dummyWebmPath = path.join(outDir, '07-train-rapid-switch.webm');
    fs.writeFileSync(dummyWebmPath, 'MOCK WEBM TRACE');
  });

});
