const { test, expect } = require('@playwright/test');

function visibleGroup(page, group) {
  return page.locator(`.phase2-group-btn[data-group="${group}"]:visible, .phase2-bottom-btn[data-group="${group}"]:visible`).first();
}

async function waitForStableWorkspace(page) {
  await page.waitForFunction(() => {
    const ready = document.body && document.body.classList.contains('phase5-workspace-ready');
    const swReady = !('serviceWorker' in navigator) || !!navigator.serviceWorker.controller;
    return ready && swReady;
  }, null, { timeout: 20000 });
  await expect(page.locator('body')).toHaveClass(/phase5-workspace-ready/);
  await page.waitForTimeout(300);
}

async function openCalculator(page) {
  const group = visibleGroup(page, 'calculator');
  await expect(group).toBeVisible();
  await group.click();
  const tab = page.locator('.phase2-sub-btn[data-tab="__calculator"]:visible').first();
  await expect(tab).toBeVisible();
  await tab.click();
  await expect(page.locator('#panel-calculator')).toHaveClass(/active/);
  const frame = page.frameLocator('#panel-calculator iframe');
  await expect(frame.locator('#calculate')).toBeVisible();
  return frame;
}

test.beforeEach(async ({ page }) => {
  page.on('dialog', async dialog => { try { await dialog.accept(); } catch (_) {} });
  await page.goto('/');
  await waitForStableWorkspace(page);
});

test('project calculator project class persists and commercial warning is visible', async ({ page }) => {
  await openCalculator(page);
  const type = page.locator('#phase3-project-type');
  await expect(type).toBeVisible();
  await type.selectOption('commercial');
  await expect(page.locator('#phase3-project-warning')).toBeVisible();
  await expect(page.locator('#phase3-project-warning')).toContainText(/Commercial mode/i);

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('bruno-ac-project-context-v1') || '{}'));
  expect(stored.type).toBe('commercial');

  await page.reload();
  await waitForStableWorkspace(page);
  await openCalculator(page);
  await expect(page.locator('#phase3-project-type')).toHaveValue('commercial');
  await expect(page.locator('#phase3-project-warning')).toBeVisible();
});

test('calculator reacts to package, mini-split and repair user choices', async ({ page }) => {
  const frame = await openCalculator(page);

  await frame.locator('#systemType').selectOption('package');
  await expect(frame.locator('#indoorLocation')).toBeDisabled();
  await expect(frame.locator('#packageHint')).toBeVisible();

  await frame.locator('#systemType').selectOption('mini-split');
  await expect(frame.locator('#indoorLocation')).toBeEnabled();
  await expect(frame.locator('#miniHint')).toBeVisible();

  await frame.locator('#lineSetFt').fill('55');
  await frame.locator('#condensateFt').fill('30');
  await frame.locator('#thermostat').check();
  await frame.locator('#jobKind').selectOption('repair');

  await expect(frame.locator('#lineSetFt')).toHaveValue('0');
  await expect(frame.locator('#condensateFt')).toHaveValue('0');
  await expect(frame.locator('#thermostat')).not.toBeChecked();
  await expect(frame.locator('#repairScopeWrap')).toHaveClass(/attention/);
});

test('calculator accepts field inputs and produces live calculation output', async ({ page }) => {
  const frame = await openCalculator(page);

  await frame.locator('#sqft').fill('1800');
  await frame.locator('#systemType').selectOption('split-heat-pump');
  await frame.locator('#jobKind').selectOption('new');
  await frame.locator('#tonnage').fill('3 ton / 36000 BTU');
  await frame.locator('#lineSetFt').fill('45');
  await frame.locator('#condensateFt').fill('30');
  await frame.locator('#secondaryDrainFt').fill('20');
  await frame.locator('#supplyRegisters').fill('10');
  await frame.locator('#returnGrilles').fill('2');
  await frame.locator('#notes').fill('Playwright full-app E2E field input');
  await frame.locator('#calculate').click();

  await expect(frame.locator('#statLines')).toHaveText(/^\d+$/);
  await expect(frame.locator('#statResolved')).toContainText('/');
  await expect(frame.locator('#codeChecks')).not.toBeEmpty();
  await expect(frame.locator('#assumptions')).not.toBeEmpty();
  await expect(frame.locator('#warnings')).not.toBeEmpty();
  await expect(frame.locator('#applyGate')).not.toBeEmpty();
});
