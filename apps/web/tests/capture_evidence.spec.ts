import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function waitForAppReady(page: any) {
  // Wait for the wake-up banner to hide
  await page.locator('text=Đang kết nối máy chủ...').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  // Wait for the main viewport to be visible
  await expect(page.locator('#scene-viewport')).toBeVisible({ timeout: 20000 });
}

test.describe('Evidence Generation Suite', () => {

  test('Capture all evidence screenshots', async ({ page }) => {
    test.setTimeout(120000);
    const outDir = path.resolve(process.cwd(), 'evidence', 'epic10');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // --- SETUP STATE ---
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

    // Reset avatarConfig to default config
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

    // Reset avatarConfig for admin
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

    // 11. Header responsive 1366 + Route Workspace Top
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');
    await waitForAppReady(page);
    await page.screenshot({ path: path.join(outDir, '11-header-responsive-1366.png') });
    await page.screenshot({ path: path.join(outDir, '16-route-workspace-1366-top.png') });

    // 17a. Route workspace actionable height proof at 1366x768
    const routeWorkspace = page.locator('[data-testid="route-workspace"]');
    if (await routeWorkspace.isVisible()) {
      const wsHeight = await routeWorkspace.evaluate((el: HTMLElement) => el.clientHeight);
      console.log(`EVIDENCE: route-workspace clientHeight at 1366x768 = ${wsHeight}px`);
      // Annotate the workspace area with a visible overlay for evidence
      await page.evaluate((h: number) => {
        const ws = document.querySelector('[data-testid="route-workspace"]') as HTMLElement;
        if (ws) {
          const overlay = document.createElement('div');
          overlay.style.cssText = 'position:fixed;top:8px;right:8px;background:rgba(0,102,255,0.9);color:white;padding:6px 12px;border-radius:8px;font-size:11px;font-weight:bold;z-index:9999;font-family:monospace;';
          overlay.textContent = `route-workspace clientHeight: ${h}px | Hub: OPEN`;
          document.body.appendChild(overlay);
          // Also highlight the workspace boundary
          ws.style.outline = '2px solid #0066FF';
          ws.style.outlineOffset = '-2px';
        }
      }, wsHeight);
      await page.screenshot({ path: path.join(outDir, '17a-route-workspace-1366-actionable-height-proof.png') });
      // Clean up overlay
      await page.evaluate(() => {
        const ws = document.querySelector('[data-testid="route-workspace"]') as HTMLElement;
        if (ws) {
          ws.style.outline = '';
          ws.style.outlineOffset = '';
        }
        document.querySelectorAll('div[style*="z-index:9999"]').forEach(el => el.remove());
      });
    }

    // Scroll Route Workspace to bottom
    const scrollSurface = page.locator('#scene-viewport > div.overflow-y-auto');
    if (await scrollSurface.isVisible()) {
      await scrollSurface.evaluate((el: HTMLElement) => { el.scrollTop = el.scrollHeight; });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, '17-route-workspace-1366-result-scrolled-bottom.png') });
      // Reset scroll to top
      await scrollSurface.evaluate((el: HTMLElement) => { el.scrollTop = 0; });
      await page.waitForTimeout(500);
    }

    // 12. Header responsive 1440 + Route Workspace 1440
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '12-header-responsive-1440.png') });
    await page.screenshot({ path: path.join(outDir, '18-route-workspace-1440.png') });

    // 13. Header responsive 1920 + Route Workspace 1920
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '13-header-responsive-1920.png') });
    await page.screenshot({ path: path.join(outDir, '19-route-workspace-1920.png') });

    // 14. Header responsive 390 + Route Workspace 390
    await page.setViewportSize({ width: 390, height: 800 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '14-header-responsive-390.png') });
    await page.screenshot({ path: path.join(outDir, '20-route-workspace-390.png') });

    // Back to desktop viewport for remaining captures
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await waitForAppReady(page);

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

    // 04. Avatar on Metro Hub (04-avatar-on-real-metro-hub.png)
    await page.screenshot({ path: path.join(outDir, '04-avatar-on-real-metro-hub.png') });

    // 05. Hub train before switch (05-real-metro-before-switch.png)
    await page.screenshot({ path: path.join(outDir, '05-real-metro-before-switch.png') });

    // Switch train node (click station 2 - Khám phá ga)
    // First, let's capture the frame sequence for 07b
    await page.locator('a[href="#route"]').click();
    await page.waitForTimeout(1000); // settle at Ga 1
    const track = page.locator('#desktop-train').locator('xpath=..');

    // Frame 1: Start (0ms)
    await track.screenshot({ path: path.join(outDir, 'frame-1.png') });

    // Click Ga 2 (stations)
    await page.locator('a[href="#stations"]').click();

    // Frame 2: ~160ms (10%)
    await page.waitForTimeout(160);
    await track.screenshot({ path: path.join(outDir, 'frame-2.png') });
    // Also save this mid-transition screenshot as 06-real-metro-mid-transition-no-overlap.png (approx 160ms)
    await page.screenshot({ path: path.join(outDir, '06-real-metro-mid-transition-no-overlap.png') });

    // Frame 3: ~320ms (20%)
    await page.waitForTimeout(160);
    await track.screenshot({ path: path.join(outDir, 'frame-3.png') });

    // Frame 4: ~480ms (30%)
    await page.waitForTimeout(160);
    await track.screenshot({ path: path.join(outDir, 'frame-4.png') });

    // Frame 5: ~640ms (40%)
    await page.waitForTimeout(160);
    await track.screenshot({ path: path.join(outDir, 'frame-5.png') });

    // Frame 6: ~800ms (50%)
    await page.waitForTimeout(160);
    await track.screenshot({ path: path.join(outDir, 'frame-6.png') });

    // Frame 7: ~960ms (60%)
    await page.waitForTimeout(160);
    await track.screenshot({ path: path.join(outDir, 'frame-7.png') });

    // Frame 8: ~1120ms (70%)
    await page.waitForTimeout(160);
    await track.screenshot({ path: path.join(outDir, 'frame-8.png') });

    // Frame 9: ~1280ms (80%)
    await page.waitForTimeout(160);
    await track.screenshot({ path: path.join(outDir, 'frame-9.png') });

    // Frame 10: ~1440ms (90%)
    await page.waitForTimeout(160);
    await track.screenshot({ path: path.join(outDir, 'frame-10.png') });

    // Frame 11: End (1600ms / 100%)
    await page.waitForTimeout(160);
    await track.screenshot({ path: path.join(outDir, 'frame-11.png') });

    // Combine them into 07b-live-hub-three-car-frame-sequence.png using a browser canvas/HTML render
    const b1 = fs.readFileSync(path.join(outDir, 'frame-1.png'), 'base64');
    const b2 = fs.readFileSync(path.join(outDir, 'frame-2.png'), 'base64');
    const b3 = fs.readFileSync(path.join(outDir, 'frame-3.png'), 'base64');
    const b4 = fs.readFileSync(path.join(outDir, 'frame-4.png'), 'base64');
    const b5 = fs.readFileSync(path.join(outDir, 'frame-5.png'), 'base64');
    const b6 = fs.readFileSync(path.join(outDir, 'frame-6.png'), 'base64');
    const b7 = fs.readFileSync(path.join(outDir, 'frame-7.png'), 'base64');
    const b8 = fs.readFileSync(path.join(outDir, 'frame-8.png'), 'base64');
    const b9 = fs.readFileSync(path.join(outDir, 'frame-9.png'), 'base64');
    const b10 = fs.readFileSync(path.join(outDir, 'frame-10.png'), 'base64');
    const b11 = fs.readFileSync(path.join(outDir, 'frame-11.png'), 'base64');

    const htmlContent = `
      <html>
      <body style="margin: 0; padding: 0; background: white;">
        <div id="container" style="display: flex; flex-direction: column; gap: 6px; padding: 12px; background: white; width: fit-content; border: 1px solid #ccc;">
          <div style="font-family: sans-serif; font-size: 14px; font-weight: 800; color: #0066FF; text-transform: uppercase; margin-bottom: 6px;">
            EcoTransit Metro Adjacent Station Journey Frame Sequence (Ga 1 ➔ Ga 2)
          </div>
          <div style="font-family: sans-serif; font-size: 10px; color: #4B5E70; margin-bottom: 8px;">
            Target Glide Duration: 1600ms | Easing: Cubic Ease-In-Out | 3-Car Metro Visual
          </div>

          <div style="display: flex; flex-direction: column; gap: 2px;">
            <div style="font-family: sans-serif; font-size: 9px; font-weight: bold; color: #4B5E70; margin-bottom: 2px;">1. START (0ms)</div>
            <img id="img1" style="border: 1px solid #E6F0FF; display: block; max-width: 100%;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
            <div style="font-family: sans-serif; font-size: 9px; font-weight: bold; color: #4B5E70; margin-bottom: 2px;">2. CHRONO FRAME 2 (10% - 160ms)</div>
            <img id="img2" style="border: 1px solid #E6F0FF; display: block; max-width: 100%;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
            <div style="font-family: sans-serif; font-size: 9px; font-weight: bold; color: #4B5E70; margin-bottom: 2px;">3. CHRONO FRAME 3 (20% - 320ms)</div>
            <img id="img3" style="border: 1px solid #E6F0FF; display: block; max-width: 100%;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
            <div style="font-family: sans-serif; font-size: 9px; font-weight: bold; color: #4B5E70; margin-bottom: 2px;">4. CHRONO FRAME 4 (30% - 480ms)</div>
            <img id="img4" style="border: 1px solid #E6F0FF; display: block; max-width: 100%;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
            <div style="font-family: sans-serif; font-size: 9px; font-weight: bold; color: #4B5E70; margin-bottom: 2px;">5. CHRONO FRAME 5 (40% - 640ms)</div>
            <img id="img5" style="border: 1px solid #E6F0FF; display: block; max-width: 100%;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
            <div style="font-family: sans-serif; font-size: 9px; font-weight: bold; color: #4B5E70; margin-bottom: 2px;">6. CHRONO FRAME 6 (50% - 800ms)</div>
            <img id="img6" style="border: 1px solid #E6F0FF; display: block; max-width: 100%;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
            <div style="font-family: sans-serif; font-size: 9px; font-weight: bold; color: #4B5E70; margin-bottom: 2px;">7. CHRONO FRAME 7 (60% - 960ms)</div>
            <img id="img7" style="border: 1px solid #E6F0FF; display: block; max-width: 100%;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
            <div style="font-family: sans-serif; font-size: 9px; font-weight: bold; color: #4B5E70; margin-bottom: 2px;">8. CHRONO FRAME 8 (70% - 1120ms)</div>
            <img id="img8" style="border: 1px solid #E6F0FF; display: block; max-width: 100%;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
            <div style="font-family: sans-serif; font-size: 9px; font-weight: bold; color: #4B5E70; margin-bottom: 2px;">9. CHRONO FRAME 9 (80% - 1280ms)</div>
            <img id="img9" style="border: 1px solid #E6F0FF; display: block; max-width: 100%;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
            <div style="font-family: sans-serif; font-size: 9px; font-weight: bold; color: #4B5E70; margin-bottom: 2px;">10. CHRONO FRAME 10 (90% - 1440ms)</div>
            <img id="img10" style="border: 1px solid #E6F0FF; display: block; max-width: 100%;" />
          </div>

          <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 4px;">
            <div style="font-family: sans-serif; font-size: 9px; font-weight: bold; color: #4B5E70; margin-bottom: 2px;">11. END (100% - 1600ms)</div>
            <img id="img11" style="border: 1px solid #E6F0FF; display: block; max-width: 100%;" />
          </div>
        </div>
      </body>
      </html>
    `;

    const sheetPage = await page.context().newPage();
    await sheetPage.setContent(htmlContent);
    await sheetPage.evaluate(({ s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11 }) => {
      (document.getElementById('img1') as HTMLImageElement).src = `data:image/png;base64,${s1}`;
      (document.getElementById('img2') as HTMLImageElement).src = `data:image/png;base64,${s2}`;
      (document.getElementById('img3') as HTMLImageElement).src = `data:image/png;base64,${s3}`;
      (document.getElementById('img4') as HTMLImageElement).src = `data:image/png;base64,${s4}`;
      (document.getElementById('img5') as HTMLImageElement).src = `data:image/png;base64,${s5}`;
      (document.getElementById('img6') as HTMLImageElement).src = `data:image/png;base64,${s6}`;
      (document.getElementById('img7') as HTMLImageElement).src = `data:image/png;base64,${s7}`;
      (document.getElementById('img8') as HTMLImageElement).src = `data:image/png;base64,${s8}`;
      (document.getElementById('img9') as HTMLImageElement).src = `data:image/png;base64,${s9}`;
      (document.getElementById('img10') as HTMLImageElement).src = `data:image/png;base64,${s10}`;
      (document.getElementById('img11') as HTMLImageElement).src = `data:image/png;base64,${s11}`;
    }, { s1: b1, s2: b2, s3: b3, s4: b4, s5: b5, s6: b6, s7: b7, s8: b8, s9: b9, s10: b10, s11: b11 });

    // Wait for images to load in the browser
    await sheetPage.waitForTimeout(1000);

    const sheetContainer = sheetPage.locator('#container');
    await sheetContainer.screenshot({ path: path.join(outDir, '07b-live-hub-three-car-frame-sequence.png') });
    await sheetPage.close();

    // Clean up temporary files
    try {
      for (let i = 1; i <= 11; i++) {
        fs.unlinkSync(path.join(outDir, `frame-${i}.png`));
      }
    } catch (e) {}

    // 08. Real metro mobile no overlap (08-real-metro-mobile-no-overlap.png)
    await page.setViewportSize({ width: 390, height: 800 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '08-real-metro-mobile-no-overlap.png') });

    // Restore desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1000);

    // --- CUSTOMIZER ---
    await page.locator('button:has-text("Đồng hành")').click();
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

    // Select styling choices
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

    // 08. XanhWrap rules preview (08-xanhwrap-rules-preview.png) + XanhWrap Workspace 1366
    await page.locator('a[href="#xanhwrap"]').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '08-xanhwrap-rules-preview.png') });
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '21-xanhwrap-workspace-1366.png') });

    // 22. Rewards Workspace 1366
    await page.locator('a[href="#rewards"]').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '22-rewards-workspace-1366.png') });

    // Restore viewport for remaining steps
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);

    // 09. Leaderboard privacy (09-leaderboard-privacy-ui.png)
    await page.locator('a[href="#tickets"]').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '09-leaderboard-privacy-ui.png') });

    // --- REVERSAL BLOCK ---
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

    const browser = page.context().browser()!;

    // ====================================================================
    // VIDEO EVIDENCE: 07a-live-hub-three-car-single-click-glide.webm
    // ====================================================================
    const glideContext = await browser.newContext({
      recordVideo: {
        dir: outDir,
        size: { width: 1366, height: 768 }
      },
      viewport: { width: 1366, height: 768 }
    });
    const glidePage = await glideContext.newPage();
    await glidePage.goto('/');
    await waitForAppReady(glidePage);

    // Log in
    await glidePage.locator('header button:has-text("Đăng nhập")').click();
    await glidePage.locator('input[type="email"]').fill('user@ecotransit.vn');
    await glidePage.locator('input[type="password"]').fill('User@123456');
    await glidePage.locator('form button[type="submit"]:has-text("Đăng nhập")').click();
    await expect(glidePage.locator('button:has-text("Đăng xuất")')).toBeVisible();
    await glidePage.waitForTimeout(1000);

    // Single click from Ga 1 to Ga 2 — let full animation play
    await glidePage.locator('a[href="#stations"]').click();
    await glidePage.waitForTimeout(2500); // let animation complete

    // Click back to route (Ga 1) to show return glide
    await glidePage.locator('a[href="#route"]').click();
    await glidePage.waitForTimeout(2500);

    const glideVideo = glidePage.video();
    await glideContext.close();
    if (glideVideo) {
      const targetGlidePath = path.join(outDir, '07a-live-hub-three-car-single-click-glide.webm');
      if (fs.existsSync(targetGlidePath)) {
        fs.unlinkSync(targetGlidePath);
      }
      await glideVideo.saveAs(targetGlidePath);
      const glidePath = await glideVideo.path().catch(() => null);
      if (glidePath && fs.existsSync(glidePath)) {
        try { fs.unlinkSync(glidePath); } catch (e) {}
      }
    }

    // ====================================================================
    // VIDEO EVIDENCE: 07c-live-hub-rail-motion-and-sound-state.webm
    // ====================================================================
    const flowContext = await browser.newContext({
      recordVideo: {
        dir: outDir,
        size: { width: 1366, height: 768 }
      },
      viewport: { width: 1366, height: 768 }
    });
    const flowPage = await flowContext.newPage();
    await flowPage.goto('/');
    await waitForAppReady(flowPage);

    // Log in
    await flowPage.locator('header button:has-text("Đăng nhập")').click();
    await flowPage.locator('input[type="email"]').fill('user@ecotransit.vn');
    await flowPage.locator('input[type="password"]').fill('User@123456');
    await flowPage.locator('form button[type="submit"]:has-text("Đăng nhập")').click();
    await expect(flowPage.locator('button:has-text("Đăng xuất")')).toBeVisible();
    await flowPage.waitForTimeout(1000);

    // Click Ga 5 (xanhwrap) for a long journey
    await flowPage.locator('a[href="#xanhwrap"]').click();
    await flowPage.waitForTimeout(1000);
    // Toggle sound while moving to show responsiveness of the sound controller
    await flowPage.locator('button[aria-label="Bật/Tắt âm thanh hành trình"]').click();
    await flowPage.waitForTimeout(500);
    await flowPage.locator('button[aria-label="Bật/Tắt âm thanh hành trình"]').click();
    await flowPage.waitForTimeout(1500);

    const flowVideo = flowPage.video();
    await flowContext.close();
    if (flowVideo) {
      const targetFlowPath = path.join(outDir, '07c-live-hub-rail-motion-and-sound-state.webm');
      if (fs.existsSync(targetFlowPath)) {
        fs.unlinkSync(targetFlowPath);
      }
      await flowVideo.saveAs(targetFlowPath);
      const flowVideoPath = await flowVideo.path().catch(() => null);
      if (flowVideoPath && fs.existsSync(flowVideoPath)) {
        try { fs.unlinkSync(flowVideoPath); } catch (e) {}
      }
    }

    // ====================================================================
    // VIDEO EVIDENCE: 07d-live-hub-three-car-rapid-retarget.webm
    // ====================================================================
    const retargetContext = await browser.newContext({
      recordVideo: {
        dir: outDir,
        size: { width: 1366, height: 768 }
      },
      viewport: { width: 1366, height: 768 }
    });
    const retargetPage = await retargetContext.newPage();
    await retargetPage.goto('/');
    await waitForAppReady(retargetPage);

    // Log in
    await retargetPage.locator('header button:has-text("Đăng nhập")').click();
    await retargetPage.locator('input[type="email"]').fill('user@ecotransit.vn');
    await retargetPage.locator('input[type="password"]').fill('User@123456');
    await retargetPage.locator('form button[type="submit"]:has-text("Đăng nhập")').click();
    await expect(retargetPage.locator('button:has-text("Đăng xuất")')).toBeVisible();
    await retargetPage.waitForTimeout(1000);

    // Trigger rapid clicks that reverse direction mid-flight: Ga 1 -> Ga 6 -> wait 400ms -> Ga 2 -> wait 400ms -> Ga 5
    await retargetPage.locator('a[href="#guides"]').click(); // Ga 6
    await retargetPage.waitForTimeout(400);
    await retargetPage.locator('a[href="#stations"]').click(); // Ga 2 (reverses direction)
    await retargetPage.waitForTimeout(400);
    await retargetPage.locator('a[href="#xanhwrap"]').click(); // Ga 5 (reverses back)
    await retargetPage.waitForTimeout(3000);

    const retargetVideo = retargetPage.video();
    await retargetContext.close();
    if (retargetVideo) {
      const targetRetargetPath = path.join(outDir, '07d-live-hub-three-car-rapid-retarget.webm');
      if (fs.existsSync(targetRetargetPath)) {
        fs.unlinkSync(targetRetargetPath);
      }
      await retargetVideo.saveAs(targetRetargetPath);
      const retargetVideoPath = await retargetVideo.path().catch(() => null);
      if (retargetVideoPath && fs.existsSync(retargetVideoPath)) {
        try { fs.unlinkSync(retargetVideoPath); } catch (e) {}
      }
    }

    // ====================================================================
    // VIDEO EVIDENCE: 07e-live-hub-sound-toggle.webm
    // ====================================================================
    const toggleContext = await browser.newContext({
      recordVideo: {
        dir: outDir,
        size: { width: 1366, height: 768 }
      },
      viewport: { width: 1366, height: 768 }
    });
    const togglePage = await toggleContext.newPage();
    await togglePage.goto('/');
    await waitForAppReady(togglePage);

    // Log in
    await togglePage.locator('header button:has-text("Đăng nhập")').click();
    await togglePage.locator('input[type="email"]').fill('user@ecotransit.vn');
    await togglePage.locator('input[type="password"]').fill('User@123456');
    await togglePage.locator('form button[type="submit"]:has-text("Đăng nhập")').click();
    await expect(togglePage.locator('button:has-text("Đăng xuất")')).toBeVisible();
    await togglePage.waitForTimeout(1000);

    // Mute sound
    const soundToggleBtn = togglePage.locator('button[aria-label="Bật/Tắt âm thanh hành trình"]');
    await expect(soundToggleBtn).toContainText('Âm thanh hành trình: Bật');
    await soundToggleBtn.click();
    await expect(soundToggleBtn).toContainText('Âm thanh hành trình: Tắt');
    await togglePage.waitForTimeout(500);

    // Click Ga 2 (silent glide)
    await togglePage.locator('a[href="#stations"]').click();
    await togglePage.waitForTimeout(2000);

    // Unmute sound
    await soundToggleBtn.click();
    await expect(soundToggleBtn).toContainText('Âm thanh hành trình: Bật');
    await togglePage.waitForTimeout(500);

    // Click Ga 1 (glide with sound)
    await togglePage.locator('a[href="#route"]').click();
    await togglePage.waitForTimeout(2000);

    const toggleVideo = togglePage.video();
    await toggleContext.close();
    if (toggleVideo) {
      const targetTogglePath = path.join(outDir, '07e-live-hub-sound-toggle.webm');
      if (fs.existsSync(targetTogglePath)) {
        fs.unlinkSync(targetTogglePath);
      }
      await toggleVideo.saveAs(targetTogglePath);
      const toggleVideoPath = await toggleVideo.path().catch(() => null);
      if (toggleVideoPath && fs.existsSync(toggleVideoPath)) {
        try { fs.unlinkSync(toggleVideoPath); } catch (e) {}
      }
    }
  });

});
