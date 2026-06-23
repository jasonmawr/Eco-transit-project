import { test, expect } from '@playwright/test';

test.describe('EcoTransit Motion Lab Phase A.1 Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Set standard viewport
    await page.setViewportSize({ width: 1366, height: 768 });
    
    // Inject audio spy to track plays
    await page.addInitScript(() => {
      const originalPlay = window.HTMLAudioElement.prototype.play;
      const playCalls: string[] = [];
      (window as any).__audioPlayCalls = playCalls;
      
      window.HTMLAudioElement.prototype.play = function() {
        playCalls.push(this.src);
        return originalPlay.apply(this, arguments);
      };
    });
  });

  test('should render exactly three carriages on desktop and mobile viewports', async ({ page }) => {
    // 1. Desktop viewport
    await page.goto('/motion-lab');
    await page.waitForSelector('#desktop-train');
    
    const desktopCarriages = page.locator('[data-testid="desktop-carriage"]');
    await expect(desktopCarriages).toHaveCount(3);
    
    // 2. Mobile viewport
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/motion-lab');
    await page.waitForSelector('#mobile-train');
    
    const mobileCarriages = page.locator('[data-testid="mobile-carriage"]');
    await expect(mobileCarriages).toHaveCount(3);
  });

  test('should have keyboard-accessible sound controls and persist preferences in localStorage', async ({ page }) => {
    await page.goto('/motion-lab');
    
    const soundBtn = page.locator('button[aria-label="Âm thanh hành trình: Bật"], button[aria-label="Âm thanh hành trình: Tắt"]');
    await expect(soundBtn).toBeVisible();
    await expect(soundBtn).toContainText('Âm thanh hành trình: Bật');
    
    // Check key accessibility (can focus and trigger with space/enter)
    await soundBtn.focus();
    await page.keyboard.press('Space');
    await expect(soundBtn).toContainText('Âm thanh hành trình: Tắt');
    
    // Check localStorage persistence
    const storedPref = await page.evaluate(() => localStorage.getItem('ecotransit_sound_enabled'));
    expect(storedPref).toBe('false');
    
    // Turn back on
    await page.keyboard.press('Enter');
    await expect(soundBtn).toContainText('Âm thanh hành trình: Bật');
    const storedPrefOn = await page.evaluate(() => localStorage.getItem('ecotransit_sound_enabled'));
    expect(storedPrefOn).toBe('true');
  });

  test('should start audio ONLY after a station click when enabled', async ({ page }) => {
    await page.goto('/motion-lab');
    await page.waitForSelector('#desktop-train');
    
    // Assert no audio played on initial load
    let playCalls = await page.evaluate(() => (window as any).__audioPlayCalls);
    expect(playCalls.length).toBe(0);
    
    // Click Station 3 (Ga số 3)
    const station3 = page.locator('div:has(#desktop-train) button:has-text("🎫")').first();
    await expect(station3).toBeVisible();
    await station3.click();
    
    // Verify audio play was called
    playCalls = await page.evaluate(() => (window as any).__audioPlayCalls);
    expect(playCalls.length).toBeGreaterThan(0);
    // Should have called play on departure and rolling
    const hasDeparture = playCalls.some((src: string) => src.includes('metro-departure.mp3'));
    const hasRolling = playCalls.some((src: string) => src.includes('metro-rolling-loop.mp3'));
    expect(hasDeparture).toBe(true);
    expect(hasRolling).toBe(true);
  });

  test('should never play sound when muted', async ({ page }) => {
    await page.goto('/motion-lab');
    await page.waitForSelector('#desktop-train');
    
    // Mute sound
    const soundBtn = page.locator('button[aria-label="Âm thanh hành trình: Bật"], button[aria-label="Âm thanh hành trình: Tắt"]');
    await soundBtn.click();
    await expect(soundBtn).toContainText('Âm thanh hành trình: Tắt');
    
    // Reset spy log
    await page.evaluate(() => { (window as any).__audioPlayCalls = []; });
    
    // Click Station 3
    const station3 = page.locator('div:has(#desktop-train) button:has-text("🎫")').first();
    await station3.click();
    
    // Wait for transition period
    await page.waitForTimeout(500);
    
    // Assert no audio play calls
    const playCalls = await page.evaluate(() => (window as any).__audioPlayCalls);
    expect(playCalls.length).toBe(0);
  });

  test('should prevent multiple overlapping rolling loop creations on rapid retarget clicks', async ({ page }) => {
    await page.goto('/motion-lab');
    await page.waitForSelector('#desktop-train');
    
    // Click Station 2, then Station 4, then Station 6 rapidly
    const station2 = page.locator('div:has(#desktop-train) button:has-text("🚉")').first();
    const station4 = page.locator('div:has(#desktop-train) button:has-text("🎁")').first();
    const station6 = page.locator('div:has(#desktop-train) button:has-text("📖")').first();
    
    await station2.click();
    await page.waitForTimeout(100);
    await station4.click();
    await page.waitForTimeout(100);
    await station6.click();
    
    // Check play calls
    const playCalls = await page.evaluate(() => (window as any).__audioPlayCalls);
    
    // rolling-loop should only be started once (or keep playing) and not stacked/played multiple times
    const rollingCalls = playCalls.filter((src: string) => src.includes('metro-rolling-loop.mp3'));
    expect(rollingCalls.length).toBe(1);
  });

  test('should ensure Metro train visual stays fully inside the Motion Lab stage bounds', async ({ page }) => {
    await page.goto('/motion-lab');
    await page.waitForSelector('#desktop-train');
    
    const trackContainer = page.locator('div:has(#desktop-train)').first();
    const train = page.locator('#desktop-train');
    
    // Click Station 6 to move to the far right
    await page.locator('div:has(#desktop-train) button:has-text("📖")').first().click();
    await page.waitForTimeout(2500); // let the transition finish
    
    const trackBox = await trackContainer.boundingBox();
    const trainBox = await train.boundingBox();
    
    expect(trackBox).not.toBeNull();
    expect(trainBox).not.toBeNull();
    
    if (trackBox && trainBox) {
      // Check horizontal containment: train left/right edge must stay inside track container
      expect(trainBox.x).toBeGreaterThanOrEqual(trackBox.x);
      expect(trainBox.x + trainBox.width).toBeLessThanOrEqual(trackBox.x + trackBox.width);
      
      // Check vertical containment: train top/bottom must stay inside track container
      expect(trainBox.y).toBeGreaterThanOrEqual(trackBox.y);
      expect(trainBox.y + trainBox.height).toBeLessThanOrEqual(trackBox.y + trackBox.height);
    }
  });

  test('should not rebound or reset user-initiated train journey when parent state update commits late', async ({ page }) => {
    await page.goto('/motion-lab');
    await page.waitForSelector('#desktop-train');

    const train = page.locator('#desktop-train');
    const initialBox = await train.boundingBox();
    expect(initialBox).not.toBeNull();

    // 1. Enable parent update delay
    const delayCheckbox = page.locator('[data-testid="delay-parent-toggle"]');
    await expect(delayCheckbox).toBeVisible();
    await delayCheckbox.check();
    await expect(delayCheckbox).toBeChecked();

    // 2. Click Station 3 (Ga số 3) to trigger a user-initiated journey
    const station3 = page.locator('div:has(#desktop-train) button:has-text("🎫")').first();
    await expect(station3).toBeVisible();
    await station3.click();

    // 3. Wait 500ms: the train must be actively moving and must NOT have rebounded to starting station
    // Since parent state update is delayed by 1000ms, activeSection prop is still 'route' (index 0).
    // If the bug exists, the train will have rebounded and stayed at index 0 (matching the initial coordinates).
    // If the guard works, it continues to move.
    await page.waitForTimeout(500);
    const midBox = await train.boundingBox();
    expect(midBox).not.toBeNull();
    // Train should have moved away from initial position
    expect(midBox!.x).not.toBe(initialBox!.x);

    // 4. Wait another 1800ms (total 2300ms, which is well after the 1000ms delay and transit completes)
    await page.waitForTimeout(1800);
    const finalBox = await train.boundingBox();
    expect(finalBox).not.toBeNull();
    // Train should have completed the journey and not rebounded to initial index
    expect(finalBox!.x).not.toBe(initialBox!.x);
  });

});
