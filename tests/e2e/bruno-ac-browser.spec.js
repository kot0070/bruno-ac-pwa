const { test, expect } = require('@playwright/test');
const fs = require('fs');

async function acceptDialogs(page) {
  page.on('dialog', async dialog => { try { await dialog.accept(); } catch (_) {} });
}

async function readPrimaryJob(page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('bruno-ac-v1');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return { __invalidJson: true }; }
  });
}

function expectPrimaryShape(job) {
  expect(job).toBeTruthy();
  expect(job.__invalidJson).not.toBe(true);
  expect(job.quote && typeof job.quote === 'object' && !Array.isArray(job.quote)).toBeTruthy();
  expect(Array.isArray(job.materialsUsed)).toBeTruthy();
  expect(Array.isArray(job.catalog)).toBeTruthy();
}

test.beforeEach(async ({ page }) => {
  await acceptDialogs(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/Bruno AC/i);
});

test('real app shell boots with critical controls', async ({ page }) => {
  await expect(page.locator('#btn-blank')).toBeVisible();
  await expect(page.locator('#btn-reset')).toBeVisible();
  await expect(page.locator('#btn-export-app')).toBeVisible();
  await expect(page.locator('#btn-import-app')).toBeAttached();
  await expect(page.locator('#live-totals')).toBeVisible();
  expect(await page.locator('.nav-tab').count()).toBeGreaterThan(1);
});

test('navigation switches the active user surface', async ({ page }) => {
  const tabs = page.locator('.nav-tab');
  const count = await tabs.count();
  expect(count).toBeGreaterThan(1);
  const target = tabs.nth(1);
  await target.click();
  await expect(target).toHaveClass(/active/);
  await expect(page.locator('.panel.active')).toBeVisible();
});

test('blank job persists through reload without corruption lock', async ({ page }) => {
  await page.locator('#btn-blank').click();
  await page.waitForTimeout(250);
  let job = await readPrimaryJob(page);
  expectPrimaryShape(job);

  await page.reload();
  await expect(page).toHaveTitle(/Bruno AC/i);
  job = await readPrimaryJob(page);
  expectPrimaryShape(job);
  await expect(page.locator('#bruno-primary-storage-lock')).toHaveCount(0);
});

test('full-app export is a parseable Bruno AC backup with the primary Job', async ({ page }) => {
  await page.locator('#btn-blank').click();
  await page.waitForTimeout(250);
  expectPrimaryShape(await readPrimaryJob(page));

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#btn-export-app').click();
  const download = await downloadPromise;
  const p = await download.path();
  expect(p).toBeTruthy();
  const backup = JSON.parse(fs.readFileSync(p, 'utf8'));
  expect(backup.product).toBe('bruno-ac');
  expect(backup.type).toBe('bruno-ac-full-app-backup');
  expect(backup.version).toBe(2);
  expect(typeof backup.storage['bruno-ac-v1']).toBe('string');
  const job = JSON.parse(backup.storage['bruno-ac-v1']);
  expectPrimaryShape(job);
});
