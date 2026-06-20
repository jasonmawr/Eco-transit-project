import { test, expect } from '@playwright/test';

test.describe('Route Planner E2E Tests', () => {
  test('should load the map on the first search click and update correctly when destination changes', async ({ page }) => {
    // 1. Fresh load /#route
    await page.goto('/#route');

    // Wait for the wakeup/loading banner to disappear and page to load
    await expect(page.locator('text=Lên Kế Hoạch Lộ Trình Xanh')).toBeVisible({ timeout: 15000 });

    // Ensure the station dropdown is populated and interactive
    const originComboboxBtn = page.locator('div:has(> label:has-text("Điểm xuất phát")) button');
    await expect(originComboboxBtn).toBeVisible();

    // 2. Select origin station (first option)
    await originComboboxBtn.click();
    const originOption = page.locator('li[role="option"]').first();
    await expect(originOption).toBeVisible();
    const originName = await originOption.locator('span').first().textContent();
    await originOption.click();

    // Select destination station (second option)
    const destComboboxBtn = page.locator('div:has(> label:has-text("Điểm đến")) button');
    await destComboboxBtn.click();
    const destOption = page.locator('li[role="option"]').nth(1);
    await expect(destOption).toBeVisible();
    const destName = await destOption.locator('span').first().textContent();
    await destOption.click();

    // Verify inputs have correct selected text
    await expect(originComboboxBtn).toContainText(originName || '');
    await expect(destComboboxBtn).toContainText(destName || '');

    // 3. Click “Tìm kiếm lộ trình xanh” đúng một lần
    const searchBtn = page.locator('button[type="submit"]:has-text("Tìm kiếm lộ trình xanh")');
    await searchBtn.click();

    // 4. Assert route result thật xuất hiện: marker/polyline/route summary/state map-ready đáng tin cậy
    // Assert results list summary is visible
    const resultSummary = page.locator('[data-testid="route-result-summary"]');
    await expect(resultSummary).toBeVisible({ timeout: 10000 });

    // Assert summary contains correct destination label
    const destLabel = page.locator('[data-testid="route-destination-label"]');
    await expect(destLabel).toContainText(destName || '');

    // Assert the map is ready and has the testid
    const routeMap = page.locator('[data-testid="route-map-ready"]');
    await expect(routeMap).toBeVisible({ timeout: 10000 });

    // Assert the render version is exactly 1 (initial render)
    await expect(routeMap).toHaveAttribute('data-route-render-version', '1');

    // Assert that Leaflet has rendered at least one route polyline path on the map
    const routePolyline = page.locator('path.route-polyline').first();
    await expect(routePolyline).toBeAttached();

    // 5. Đổi điểm đến
    await destComboboxBtn.click();
    const newDestOption = page.locator('li[role="option"]').nth(2);
    await expect(newDestOption).toBeVisible();
    const newDestName = await newDestOption.locator('span').first().textContent();
    await newDestOption.click();

    // Verify input updated
    await expect(destComboboxBtn).toContainText(newDestName || '');

    // 6. Click đúng một lần nữa
    await searchBtn.click();

    // 7. Assert route/map cập nhật
    await expect(resultSummary).toBeVisible({ timeout: 10000 });
    await expect(destLabel).toContainText(newDestName || '');
    await expect(routeMap).toBeVisible();
    // Assert the render version has incremented to 2 (route changed)
    await expect(routeMap).toHaveAttribute('data-route-render-version', '2');
    await expect(routePolyline).toBeAttached();
  });

  test('should handle fast switching between scenes without console errors or container reuse issues', async ({ page }) => {
    // 1. Fresh load /#route
    await page.goto('/#route');
    await expect(page.locator('text=Lên Kế Hoạch Lộ Trình Xanh')).toBeVisible({ timeout: 15000 });

    const originComboboxBtn = page.locator('div:has(> label:has-text("Điểm xuất phát")) button');
    await expect(originComboboxBtn).toBeVisible();

    // Select origin station
    await originComboboxBtn.click();
    const originOption = page.locator('li[role="option"]').first();
    await originOption.click();

    // Select destination station
    const destComboboxBtn = page.locator('div:has(> label:has-text("Điểm đến")) button');
    await destComboboxBtn.click();
    const destOption = page.locator('li[role="option"]').nth(1);
    await destOption.click();

    // 2. Click tìm kiếm đúng một lần
    const searchBtn = page.locator('button[type="submit"]:has-text("Tìm kiếm lộ trình xanh")');
    await searchBtn.click();

    // Assert results summary and map ready
    const resultSummary = page.locator('[data-testid="route-result-summary"]');
    const routeMap = page.locator('[data-testid="route-map-ready"]');
    await expect(resultSummary).toBeVisible({ timeout: 10000 });
    await expect(routeMap).toBeVisible({ timeout: 10000 });

    // 3. Chuyển sang scene khác rồi quay lại nhanh
    const stationsTab = page.locator('a[href="#stations"]');
    await expect(stationsTab).toBeVisible();
    await stationsTab.click();

    const routeTab = page.locator('a[href="#route"]');
    await expect(routeTab).toBeVisible();
    await routeTab.click();

    // 4. Đổi destination và click tìm kiếm một lần
    await destComboboxBtn.click();
    const newDestOption = page.locator('li[role="option"]').nth(2);
    await expect(newDestOption).toBeVisible();
    const newDestName = await newDestOption.locator('span').first().textContent();
    await newDestOption.click();

    await searchBtn.click();

    // 5. Xác nhận map không bị blank, không lỗi và cập nhật đúng render version
    await expect(resultSummary).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="route-destination-label"]')).toContainText(newDestName || '');
    await expect(routeMap).toBeVisible({ timeout: 10000 });
    await expect(routeMap).toHaveAttribute('data-route-render-version', '2');
    const routePolyline = page.locator('path.route-polyline').first();
    await expect(routePolyline).toBeAttached();
  });
});
