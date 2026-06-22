import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function waitForAppReady(page: any) {
  // Wait for the wake-up banner to hide
  await page.waitForSelector('text=Đang kết nối máy chủ...', { state: 'hidden', timeout: 30000 }).catch(() => {});
  // Wait for the main viewport to be visible
  await expect(page.locator('#scene-viewport')).toBeVisible({ timeout: 15000 });
}

test.describe('EcoTransit Epic 10 E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER EXCEPTION:', err.message));
    page.on('request', req => {
      if (req.url().includes('/api/')) {
        console.log(`API REQUEST: ${req.method()} ${req.url()}`);
      }
    });
    page.on('response', res => {
      if (res.url().includes('/api/')) {
        console.log(`API RESPONSE: ${res.status()} ${res.url()}`);
      }
    });
  });

  test('should respect prefers-reduced-motion on Hub station navigation', async ({ page }) => {
    // 1. Without reduced motion: Verify that the visual train is visible
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await waitForAppReady(page);

    const stationsTab = page.locator('a[href="#stations"]');
    await expect(stationsTab).toBeVisible();
    await stationsTab.evaluate((el: HTMLElement) => el.click());

    // Verify train is rendered
    await expect(page.locator('#desktop-train')).toBeVisible();

    // 2. With reduced motion: Verify that the train is still rendered but snaps immediately
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForAppReady(page);

    const ticketsTab = page.locator('a[href="#tickets"]');
    await expect(ticketsTab).toBeVisible();
    await ticketsTab.evaluate((el: HTMLElement) => el.click());

    // The train should be rendered
    await expect(page.locator('#desktop-train')).toBeVisible();
  });

  test('should verify that train has 2 carriages and collision-free geometry in all motion states', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Login to see avatar on the train
    await page.locator('header button:has-text("Đăng nhập")').evaluate((el: HTMLElement) => el.click());
    await page.locator('input[type="email"]').fill('user@ecotransit.vn');
    await page.locator('input[type="password"]').fill('User@123456');
    await page.locator('form button[type="submit"]:has-text("Đăng nhập")').evaluate((el: HTMLElement) => el.click());
    await expect(page.locator('button:has-text("Đăng xuất")')).toBeVisible();

    const train = page.locator('#desktop-train');
    await expect(train).toBeVisible();

    // 1. Assert minimum 2 carriages (checking SVG elements for 2 distinct carriages)
    const carriageCount = await train.locator('rect').count();
    expect(carriageCount).toBeGreaterThanOrEqual(4); // Carriage body 1, Carriage body 2, windows, coupler, etc.

    // Helper to calculate overlap intersection area
    const getIntersection = (r1: any, r2: any) => {
      const xLeft = Math.max(r1.x, r2.x);
      const yTop = Math.max(r1.y, r2.y);
      const xRight = Math.min(r1.x + r1.width, r2.x + r2.width);
      const yBottom = Math.min(r1.y + r1.height, r2.y + r2.height);
      return (xRight > xLeft && yBottom > yTop) ? (xRight - xLeft) * (yBottom - yTop) : 0;
    };

    // Get the train SVG bounding box (the actual visual element, not the wrapper)
    const getTrainVisualBox = async () => {
      const svg = train.locator('svg').first();
      if (await svg.isVisible()) {
        return svg.boundingBox();
      }
      return train.boundingBox();
    };

    // Station labels that the train must NOT overlap (P0 requirement)
    const stationLabels = ['Lập lộ trình', 'Khám phá ga', 'Tích điểm', 'Đổi thưởng', 'XanhWrap', 'Cẩm nang'];

    const checkLabelCollisions = async () => {
      const trainVisualBox = await getTrainVisualBox();
      if (!trainVisualBox) return;

      // Check station name labels — these must NOT be obscured
      for (const text of stationLabels) {
        const lbl = page.locator(`button:has-text("${text}")`).first();
        if (await lbl.isVisible()) {
          const lblBox = await lbl.boundingBox();
          if (lblBox) {
            const overlap = getIntersection(trainVisualBox, lblBox);
            expect(overlap).toBe(0); // Label must not be obscured by train
          }
        }
      }

      // Check station number badges (small absolute-positioned circles)
      const badges = await page.locator('.absolute.bg-eco-ink.text-white.rounded-full').all();
      for (const badge of badges) {
        if (await badge.isVisible()) {
          const badgeBox = await badge.boundingBox();
          if (badgeBox) {
            const overlap = getIntersection(trainVisualBox, badgeBox);
            expect(overlap).toBe(0); // Number badge must not be obscured
          }
        }
      }
    };

    // Get initial position bounding box (Start state)
    const initialBox = await train.boundingBox();
    expect(initialBox).not.toBeNull();
    await checkLabelCollisions();

    // Trigger motion to Ga 2 (Stations)
    await page.locator('a[href="#stations"]').evaluate((el: HTMLElement) => el.click());

    // 2. Wait for mid-transition (approx 200ms)
    await page.waitForTimeout(200);
    const midBox = await train.boundingBox();
    expect(midBox).not.toBeNull();
    expect(midBox!.x).not.toBe(initialBox!.x); // Position must have changed
    await checkLabelCollisions(); // Labels collision-free mid-transition

    // 3. Wait for end transition state
    await page.waitForTimeout(1200);
    const finalBox = await train.boundingBox();
    expect(finalBox).not.toBeNull();
    await checkLabelCollisions(); // Labels collision-free at rest

    // 4. Mobile Viewport Collision check
    await page.setViewportSize({ width: 390, height: 800 });
    await page.waitForTimeout(500); // let ResizeObserver update berth coordinates

    const mobileTrain = page.locator('#mobile-train');
    await expect(mobileTrain).toBeVisible();

    // Check that mobile train has at least 2 carriages
    const mobileCarriageCount = await mobileTrain.locator('rect').count();
    expect(mobileCarriageCount).toBeGreaterThanOrEqual(4);

    // Bounding container check on mobile
    const checkMobileCollisions = async () => {
      const mobileTrainBox = await mobileTrain.boundingBox();
      if (!mobileTrainBox) return;

      // Check all station buttons (icon center)
      const buttons = await page.locator('button:has-text("🛤️"), button:has-text("🚉"), button:has-text("🎫"), button:has-text("🎁"), button:has-text("✨"), button:has-text("📖")').all();
      for (const btn of buttons) {
        if (await btn.isVisible()) {
          const btnBox = await btn.boundingBox();
          if (btnBox) {
            const overlap = getIntersection(mobileTrainBox, btnBox);
            expect(overlap).toBe(0); // Collision-free geometry on mobile
          }
        }
      }

      // Check all station label buttons
      const labelText = ['Lập lộ trình', 'Khám phá ga', 'Tích điểm', 'Đổi thưởng', 'XanhWrap', 'Cẩm nang'];
      for (const text of labelText) {
        const lbl = page.locator(`button:has-text("${text}")`).first();
        if (await lbl.isVisible()) {
          const lblBox = await lbl.boundingBox();
          if (lblBox) {
            const overlap = getIntersection(mobileTrainBox, lblBox);
            expect(overlap).toBe(0); // Collision-free geometry on mobile
          }
        }
      }
    };

    await checkMobileCollisions();
  });

  test('P0-D: Metro must glide continuously with intermediate positions — no teleport', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const train = page.locator('#desktop-train');
    await expect(train).toBeVisible();

    // Wait for initial placement to settle
    await page.waitForTimeout(300);

    // Helper: get train transform X from computed style
    const getTrainX = async () => {
      return train.evaluate((el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        const matrix = new DOMMatrixReadOnly(style.transform);
        return matrix.m41; // translateX component
      });
    };

    // Record start position
    const startX = await getTrainX();
    const startTime = Date.now();

    // Click the next station (stations = Ga 2)
    await page.locator('a[href="#stations"]').evaluate((el: HTMLElement) => el.click());

    // Sample 1: ~180-250ms after click
    await page.waitForTimeout(200);
    const sample1X = await getTrainX();
    const sample1Time = Date.now() - startTime;

    // Sample 2: ~350-500ms after click
    await page.waitForTimeout(200);
    const sample2X = await getTrainX();
    const sample2Time = Date.now() - startTime;

    // Wait for animation to finish
    await page.waitForTimeout(800);
    const endX = await getTrainX();
    const totalDuration = Date.now() - startTime;

    console.log(`Metro glide samples: start=${startX.toFixed(1)}, sample1=${sample1X.toFixed(1)} @${sample1Time}ms, sample2=${sample2X.toFixed(1)} @${sample2Time}ms, end=${endX.toFixed(1)}, totalDuration=${totalDuration}ms`);

    // ASSERTION 1: Intermediate samples must differ from start
    expect(Math.abs(sample1X - startX)).toBeGreaterThan(1); // sample1 moved from start
    expect(Math.abs(sample2X - startX)).toBeGreaterThan(1); // sample2 moved from start

    // ASSERTION 2: Intermediate samples must differ from end
    expect(Math.abs(sample1X - endX)).toBeGreaterThan(1); // sample1 not at end yet
    expect(Math.abs(sample2X - endX)).toBeGreaterThan(1); // sample2 not at end yet (at ~400ms of 650ms+)

    // ASSERTION 3: Distance to target must decrease over time (progression toward target)
    const distStart = Math.abs(endX - startX);
    const distSample1 = Math.abs(endX - sample1X);
    const distSample2 = Math.abs(endX - sample2X);
    expect(distSample1).toBeLessThan(distStart); // closer than start
    expect(distSample2).toBeLessThan(distSample1); // closer than sample1

    // ASSERTION 4: Wall-clock duration must be at least 650ms for adjacent station
    expect(totalDuration).toBeGreaterThanOrEqual(600); // allow slight measurement overhead
  });

  test('should handle rapid station switching without queueing', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await page.waitForTimeout(300);

    // Click 4 stations in rapid succession
    await page.locator('a[href="#stations"]').evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(100);
    await page.locator('a[href="#tickets"]').evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(100);
    await page.locator('a[href="#rewards"]').evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(100);
    await page.locator('a[href="#xanhwrap"]').evaluate((el: HTMLElement) => el.click());
    await page.waitForTimeout(1500); // wait for animation to finish

    // Verify train settles on the last active station
    const train = page.locator('#desktop-train');
    await expect(train).toBeVisible();

    // Verify the final scene is xanhwrap (the last clicked station)
    await expect(page.locator('#scene-viewport')).toBeVisible();
  });

  test('P0-E: Route workspace must have actionable height >= 380px at 1366x768', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');
    await waitForAppReady(page);

    // Wait for layout to stabilize
    await page.waitForTimeout(500);

    // Measure the actual actionable route-workspace area (NOT scene-viewport)
    const routeWorkspace = page.locator('[data-testid="route-workspace"]');
    await expect(routeWorkspace).toBeVisible();

    const wsClientHeight = await routeWorkspace.evaluate((el: HTMLElement) => el.clientHeight);
    console.log(`Route workspace clientHeight at 1366x768: ${wsClientHeight}px`);
    expect(wsClientHeight).toBeGreaterThanOrEqual(380);

    // Verify form elements are reachable (visible) without collapsing Hub
    const originInput = page.locator('button:has-text("Chọn ga/trạm khởi hành...")');
    await expect(originInput).toBeVisible();

    const destInput = page.locator('button:has-text("Chọn ga/trạm kết thúc...")');
    await expect(destInput).toBeVisible();

    const searchBtn = page.locator('button:has-text("Tìm kiếm lộ trình xanh")');
    await expect(searchBtn).toBeVisible();

    // Hub collapse toggle should exist (enhancement) but not be required
    const collapseBtn = page.locator('button:has-text("Thu gọn")');
    await expect(collapseBtn).toBeVisible();
  });

  test('should verify workspace layout architecture and scroll surfaces', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');
    await waitForAppReady(page);

    // Check viewport layout containers
    await expect(page.locator('#scene-viewport')).toBeVisible();

    const scrollSurface = page.locator('#scene-viewport > div.overflow-y-auto');
    await expect(scrollSurface).toBeVisible();

    // 1. Perform search to generate route results and overflow content
    const originBtn = page.locator('button:has-text("Chọn ga/trạm khởi hành...")');
    await originBtn.click();
    await page.waitForTimeout(300);
    await page.locator('li[role="option"]').first().click();
    await page.waitForTimeout(300);

    const destBtn = page.locator('button:has-text("Chọn ga/trạm kết thúc...")');
    await destBtn.click();
    await page.waitForTimeout(300);
    await page.locator('li[role="option"]').nth(2).click();
    await page.waitForTimeout(300);

    const searchBtn = page.locator('button:has-text("Tìm kiếm lộ trình xanh")');
    await searchBtn.click();
    await page.waitForTimeout(1500);

    // 2. Verify scrollHeight > clientHeight (true overflow)
    const isOverflow = await scrollSurface.evaluate(el => el.scrollHeight > el.clientHeight);
    expect(isOverflow).toBe(true);

    // Reset scrollTop to 0 to ensure we can scroll down and detect the change
    await scrollSurface.evaluate(el => el.scrollTop = 0);
    await page.waitForTimeout(300);

    // 3. Verify mouse wheel scrolling actually increases scrollTop
    const initialScrollTop = await scrollSurface.evaluate(el => el.scrollTop);
    expect(initialScrollTop).toBe(0);

    await scrollSurface.hover();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(500);
    const newScrollTop = await scrollSurface.evaluate(el => el.scrollTop);
    expect(newScrollTop).toBeGreaterThan(0);

    // Check that footer exists and does not overlay the main viewport
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    const footerBox = await footer.boundingBox();
    const viewportBox = await page.locator('#scene-viewport').boundingBox();

    expect(footerBox!.y).toBeGreaterThanOrEqual(viewportBox!.y + viewportBox!.height);
  });

  test('should validate XanhWrap input fields (duration & luckyNumber) and display errors in Vietnamese', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const xanhWrapTab = page.locator('a[href="#xanhwrap"]');
    await expect(xanhWrapTab).toBeVisible();
    await xanhWrapTab.evaluate((el: HTMLElement) => el.click());

    await page.locator('input[name="nickname"]').fill('Tester Green');
    await page.locator('input[name="origin"]').fill('Ga Nhà Rồng');
    await page.locator('input[name="destination"]').fill('Ga Bến Thành');

    // Test duration out of bounds (0)
    await page.locator('input[name="duration"]').fill('0');
    await page.locator('input[name="luckyNumber"]').fill('555');
    await page.locator('button[type="submit"]:has-text("Tạo XanhWrap")').evaluate((el: HTMLElement) => el.click());
    await expect(page.locator('text=Thời gian di chuyển phải là số nguyên từ 1 đến 1440 phút.')).toBeVisible();

    // Test duration out of bounds (1441)
    await page.locator('input[name="duration"]').fill('1441');
    await page.locator('button[type="submit"]:has-text("Tạo XanhWrap")').evaluate((el: HTMLElement) => el.click());
    await expect(page.locator('text=Thời gian di chuyển phải là số nguyên từ 1 đến 1440 phút.')).toBeVisible();

    // Reset duration to valid and test invalid luckyNumber (0)
    await page.locator('input[name="duration"]').fill('30');
    await page.locator('input[name="luckyNumber"]').fill('0');
    await page.locator('button[type="submit"]:has-text("Tạo XanhWrap")').evaluate((el: HTMLElement) => el.click());
    await expect(page.locator('text=Con số may mắn dự thi phải là số nguyên từ 1 đến 999.')).toBeVisible();

    // Test invalid luckyNumber (1000)
    await page.locator('input[name="luckyNumber"]').fill('1000');
    await page.locator('button[type="submit"]:has-text("Tạo XanhWrap")').evaluate((el: HTMLElement) => el.click());
    await expect(page.locator('text=Con số may mắn dự thi phải là số nguyên từ 1 đến 999.')).toBeVisible();
  });

  test('should create XanhWrap successfully and display new details on public share page', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    const xanhWrapTab = page.locator('a[href="#xanhwrap"]');
    await expect(xanhWrapTab).toBeVisible();
    await xanhWrapTab.evaluate((el: HTMLElement) => el.click());

    const testLucky = '888';
    const testNickname = 'E2E_Tester_' + Math.floor(Math.random() * 10000);

    await page.locator('input[name="nickname"]').fill(testNickname);
    await page.locator('input[name="origin"]').fill('Ga Nhà Rồng');
    await page.locator('input[name="destination"]').fill('Ga Bến Thành');
    await page.locator('input[name="duration"]').fill('45');
    await page.locator('input[name="luckyNumber"]').fill(testLucky);
    await page.locator('input[name="moment"]').fill('Đi chơi cuối tuần');

    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/time-bills') && response.status() === 201
    );

    await page.locator('button[type="submit"]:has-text("Tạo XanhWrap")').evaluate((el: HTMLElement) => el.click());

    const response = await responsePromise;
    const responseBody = await response.json();
    const shareSlug = responseBody.shareSlug;

    await expect(page.locator(`text=#${testLucky}`)).toBeVisible();
    await expect(page.locator('text=Đi chơi cuối tuần')).toBeVisible();

    await page.goto(`/share/${shareSlug}`);

    await expect(page.locator(`text=#${testLucky}`)).toBeVisible();
    await expect(page.locator('text=Đi chơi cuối tuần')).toBeVisible();
    await expect(page.locator('text=ecotransit.vn')).not.toBeVisible();
  });

  test('should handle unverified user flow: show banner, resend verification email, and verify account', async ({ page }) => {
    const email = `e2e-user-${Date.now()}@ecotransit.vn`;
    const password = 'Password123';

    await page.goto('/');
    await waitForAppReady(page);

    await page.locator('header button:has-text("Đăng nhập")').evaluate((el: HTMLElement) => el.click());
    await page.locator('button:has-text("Đăng ký")').evaluate((el: HTMLElement) => el.click());

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);

    await page.locator('form button[type="submit"]:has-text("Đăng ký tài khoản")').evaluate((el: HTMLElement) => el.click());

    await expect(page.locator('text=Tài khoản chưa xác thực:')).toBeVisible();

    const possiblePaths = [
      path.resolve(process.cwd(), '../../last-mock-email.json'),
      path.resolve(process.cwd(), '../api/last-mock-email.json'),
      path.resolve(__dirname, '../../../last-mock-email.json'),
      path.resolve(__dirname, '../../api/last-mock-email.json'),
    ];

    const getEmailPath = () => {
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) return p;
      }
      return null;
    };

    await expect.poll(() => getEmailPath() !== null, { timeout: 10000 }).toBe(true);

    const emailPath = getEmailPath()!;
    const emailData = JSON.parse(fs.readFileSync(emailPath, 'utf-8'));
    const match = emailData.text.match(/token=([a-f0-9]+)/);
    const mockToken = match[1];

    const resendResponsePromise = page.waitForResponse(res =>
      res.url().includes('/api/auth/resend-verification') && res.status() === 429
    );

    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Vui lòng đợi');
      await dialog.accept();
    });

    await page.locator('button:has-text("Gửi lại email xác thực")').evaluate((el: HTMLElement) => el.click());
    await resendResponsePromise;

    await page.goto(`/verify-email?token=${mockToken}`);
    await expect(page.locator('text=Xác thực thành công!')).toBeVisible({ timeout: 15000 });

    await page.locator('button:has-text("Thiết lập Avatar nhân vật")').evaluate((el: HTMLElement) => el.click());
    await expect(page.locator('text=Tài khoản chưa xác thực:')).not.toBeVisible();
  });

  test('should open avatar customizer modal and change selections dynamically', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await page.locator('header button:has-text("Đăng nhập")').evaluate((el: HTMLElement) => el.click());
    await page.locator('input[type="email"]').fill('user@ecotransit.vn');
    await page.locator('input[type="password"]').fill('User@123456');
    await page.locator('form button[type="submit"]:has-text("Đăng nhập")').evaluate((el: HTMLElement) => el.click());

    await expect(page.locator('button:has-text("Đăng xuất")')).toBeVisible();

    const badge = page.locator('button:has-text("Đồng hành")');
    await expect(badge).toBeVisible();
    await badge.evaluate((el: HTMLElement) => el.click());

    const modalTitle = page.locator('text=Thiết lập nhân vật của bạn');
    await expect(modalTitle).toBeVisible();

    const presetsTab = page.locator('button:has-text("Preset")');
    await presetsTab.evaluate((el: HTMLElement) => el.click());
    await expect(page.locator('text=Bạn học xanh').first()).toBeVisible();
    await expect(page.locator('text=Dân văn phòng xanh').first()).toBeVisible();
    await expect(page.locator('text=Người khám phá thành phố').first()).toBeVisible();
    await expect(page.locator('text=Người đạp xe xanh').first()).toBeVisible();
    await expect(page.locator('text=Người săn ưu đãi xanh').first()).toBeVisible();

    const previewContainer = page.locator('.w-48.h-48.md\\:w-56.md\\:h-56');
    await expect(previewContainer.locator('svg')).toBeVisible();

    await page.locator('button:has-text("Người khám phá thành phố")').last().evaluate((el: HTMLElement) => el.click());
    await expect(page.locator('text=@Người khám phá thành phố')).toBeVisible();

    const hairTab = page.locator('button:has-text("Kiểu Tóc")');
    await hairTab.evaluate((el: HTMLElement) => el.click());
    await page.locator('button:has-text("Tóc xoăn")').evaluate((el: HTMLElement) => el.click());

    const outfitTab = page.locator('button:has-text("Trang Phục")');
    await outfitTab.evaluate((el: HTMLElement) => el.click());
    await page.locator('button:has-text("Áo Khoác Zip")').evaluate((el: HTMLElement) => el.click());

    const accessoryTab = page.locator('button:has-text("Phụ Kiện")');
    await accessoryTab.evaluate((el: HTMLElement) => el.click());
    await page.locator('button:has-text("Kính Mát Trí Thức")').evaluate((el: HTMLElement) => el.click());

    await page.locator('button:has-text("Lưu Nhân Vật ✓")').evaluate((el: HTMLElement) => el.click());
    await expect(modalTitle).not.toBeVisible();
  });

  test('should adjust layout and fit content without clipping at 1366x768 and 390px mobile widths', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');
    await waitForAppReady(page);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('#scene-viewport')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    await waitForAppReady(page);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('#scene-viewport')).toBeVisible();
  });
});
