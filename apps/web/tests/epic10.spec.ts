import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('EcoTransit Epic 10 E2E Tests', () => {

  test('should respect prefers-reduced-motion on Hub station navigation', async ({ page }) => {
    // 1. Without reduced motion: Verify that the visual train 🚇 is visible
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');

    // Check that we can navigate through journey stations using unique header anchors
    const stationsTab = page.locator('a[href="#stations"]');
    await expect(stationsTab).toBeVisible();
    await stationsTab.click();

    // The active dot has the train 🚇
    await expect(page.locator('text=🚇').first()).toBeVisible();

    // 2. With reduced motion: Verify that the train 🚇 is NOT rendered
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Click another station
    const ticketsTab = page.locator('a[href="#tickets"]');
    await expect(ticketsTab).toBeVisible();
    await ticketsTab.click();

    // Check that train 🚇 is not visible at all
    await expect(page.locator('text=🚇')).not.toBeVisible();
  });

  test('should validate XanhWrap input fields (duration & luckyNumber) and display errors in Vietnamese', async ({ page }) => {
    await page.goto('/');

    // Switch to XanhWrap section
    const xanhWrapTab = page.locator('a[href="#xanhwrap"]');
    await expect(xanhWrapTab).toBeVisible();
    await xanhWrapTab.click();

    // Fill in nickname, origin, destination
    await page.locator('input[name="nickname"]').fill('Tester Green');
    await page.locator('input[name="origin"]').fill('Ga Nhà Rồng');
    await page.locator('input[name="destination"]').fill('Ga Bến Thành');

    // Test duration out of bounds (0)
    await page.locator('input[name="duration"]').fill('0');
    await page.locator('input[name="luckyNumber"]').fill('555');
    await page.locator('button[type="submit"]:has-text("Tạo XanhWrap")').click();
    await expect(page.locator('text=Thời gian di chuyển phải là số nguyên từ 1 đến 1440 phút.')).toBeVisible();

    // Test duration out of bounds (1441)
    await page.locator('input[name="duration"]').fill('1441');
    await page.locator('button[type="submit"]:has-text("Tạo XanhWrap")').click();
    await expect(page.locator('text=Thời gian di chuyển phải là số nguyên từ 1 đến 1440 phút.')).toBeVisible();

    // Reset duration to valid and test invalid luckyNumber (0)
    await page.locator('input[name="duration"]').fill('30');
    await page.locator('input[name="luckyNumber"]').fill('0');
    await page.locator('button[type="submit"]:has-text("Tạo XanhWrap")').click();
    await expect(page.locator('text=Con số may mắn dự thi phải là số nguyên từ 1 đến 999.')).toBeVisible();

    // Test invalid luckyNumber (1000)
    await page.locator('input[name="luckyNumber"]').fill('1000');
    await page.locator('button[type="submit"]:has-text("Tạo XanhWrap")').click();
    await expect(page.locator('text=Con số may mắn dự thi phải là số nguyên từ 1 đến 999.')).toBeVisible();
  });

  test('should create XanhWrap successfully and display new details on public share page', async ({ page }) => {
    await page.goto('/');

    // Switch to XanhWrap section
    const xanhWrapTab = page.locator('a[href="#xanhwrap"]');
    await expect(xanhWrapTab).toBeVisible();
    await xanhWrapTab.click();

    const testLucky = '888';
    const testNickname = 'E2E_Tester_' + Math.floor(Math.random() * 10000);

    await page.locator('input[name="nickname"]').fill(testNickname);
    await page.locator('input[name="origin"]').fill('Ga Nhà Rồng');
    await page.locator('input[name="destination"]').fill('Ga Bến Thành');
    await page.locator('input[name="duration"]').fill('45');
    await page.locator('input[name="luckyNumber"]').fill(testLucky);
    await page.locator('input[name="moment"]').fill('Đi chơi cuối tuần');

    // Intercept response to get shareSlug (creation returns 201)
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/time-bills') && response.status() === 201
    );

    await page.locator('button[type="submit"]:has-text("Tạo XanhWrap")').click();

    const response = await responsePromise;
    const responseBody = await response.json();
    const shareSlug = responseBody.shareSlug;

    // Verify preview card elements on page
    await expect(page.locator(`text=#${testLucky}`)).toBeVisible();
    await expect(page.locator('text=Đi chơi cuối tuần')).toBeVisible();

    // Navigate directly to the public share page
    await page.goto(`/share/${shareSlug}`);

    // Verify public share card renders the nickname, lucky number, and moment
    await expect(page.locator(`text=#${testLucky}`)).toBeVisible();
    await expect(page.locator('text=Đi chơi cuối tuần')).toBeVisible();

    // Verify it doesn't leak raw emails
    await expect(page.locator('text=ecotransit.vn')).not.toBeVisible();
  });

  test('should handle unverified user flow: show banner, resend verification email, and verify account', async ({ page }) => {
    // Generate a unique email
    const email = `e2e-user-${Date.now()}@ecotransit.vn`;
    const password = 'Password123';

    await page.goto('/');

    // Open Auth Modal
    await page.locator('header button:has-text("Đăng nhập")').click();

    // Switch to Register tab
    await page.locator('button:has-text("Đăng ký")').click();

    // Fill registration info
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);

    await page.locator('form button[type="submit"]:has-text("Đăng ký tài khoản")').click();

    // Wait for unverified banner to confirm registration was successful
    await expect(page.locator('text=Tài khoản chưa xác thực:')).toBeVisible();

    // Find the mock email JSON file using potential paths depending on cwd
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

    // Poll until the file is found
    await expect.poll(() => getEmailPath() !== null, { timeout: 10000 }).toBe(true);

    const emailPath = getEmailPath()!;
    const emailData = JSON.parse(fs.readFileSync(emailPath, 'utf-8'));
    const match = emailData.text.match(/token=([a-f0-9]+)/);
    const mockToken = match[1];

    // Test that resending verification email triggers rate limit (429) due to registration sending it first
    const resendResponsePromise = page.waitForResponse(res =>
      res.url().includes('/api/auth/resend-verification') && res.status() === 429
    );

    // Expect/dismiss rate limit alert dialog
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Vui lòng đợi');
      await dialog.accept();
    });

    await page.locator('button:has-text("Gửi lại email xác thực")').click();
    await resendResponsePromise;

    // Navigate to verify email page using the original registration token
    await page.goto(`/verify-email?token=${mockToken}`);

    // Wait for the verification success screen
    await expect(page.locator('text=Xác thực thành công!')).toBeVisible({ timeout: 15000 });

    // Navigate back to home or click redirection button
    await page.locator('button:has-text("Thiết lập Avatar nhân vật")').click();

    // Verify the unverified banner is now gone!
    await expect(page.locator('text=Tài khoản chưa xác thực:')).not.toBeVisible();
  });
});
