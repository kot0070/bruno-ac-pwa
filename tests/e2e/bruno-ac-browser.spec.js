const { test, expect } = require('@playwright/test');
const fs = require('fs');

async function acceptDialogs(page) {
  page.on('dialog', async dialog => { try { await dialog.accept(); } catch (_) {} });
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

function visibleGroup(page, group) {
  return page.locator(`.phase2-group-btn[data-group="${group}"]:visible, .phase2-bottom-btn[data-group="${group}"]:visible`).first();
}

async function openOtherMenu(page) {
  const details = page.locator('details.workspace-action-menu').filter({ has: page.locator('summary', { hasText: 'Other' }) }).first();
  const summary = details.locator('summary');
  await expect(summary).toBeVisible();
  const open = await details.evaluate(el => el.open);
  if (!open) await summary.click();
  await expect(details).toHaveAttribute('open', '');
  return details;
}

async function clickWorkspaceAction(page, selector) {
  await openOtherMenu(page);
  const action = page.locator(selector);
  await expect(action).toBeVisible();
  await action.click();
}

test.beforeEach(async ({ page }) => {
  await acceptDialogs(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/Bruno AC/i);
  await waitForStableWorkspace(page);
});

test('real workspace shell boots with visible user controls', async ({ page }) => {
  await expect(page.locator('.app-header')).toBeVisible();
  await expect(visibleGroup(page, 'journal')).toBeVisible();
  await expect(visibleGroup(page, 'job')).toBeVisible();
  await expect(page.locator('#live-totals')).toHaveAttribute('aria-hidden', 'true');

  const menu = await openOtherMenu(page);
  await expect(menu.locator('#btn-blank')).toBeVisible();
  await expect(menu.locator('#btn-reset')).toBeVisible();
  await expect(menu.locator('#btn-export-app')).toBeVisible();
  await expect(menu.locator('#btn-import-app')).toBeAttached();
});

test('visible workspace navigation switches the active user surface', async ({ page }) => {
  const jobGroup = visibleGroup(page, 'job');
  await expect(jobGroup).toBeVisible();
  await jobGroup.click();
  await expect(page.locator('.panel.active')).toBeVisible();
  await expect(page.locator('#live-totals')).toBeVisible();
});

test('blank job persists through reload without corruption lock', async ({ page }) => {
  await clickWorkspaceAction(page, '#btn-blank');
  await page.waitForTimeout(250);
  let job = await readPrimaryJob(page);
  expectPrimaryShape(job);

  await page.reload();
  await expect(page).toHaveTitle(/Bruno AC/i);
  await waitForStableWorkspace(page);
  job = await readPrimaryJob(page);
  expectPrimaryShape(job);
  await expect(page.locator('#bruno-primary-storage-lock')).toHaveCount(0);
});

test('full-app export is a parseable Bruno AC backup with the primary Job', async ({ page }) => {
  await clickWorkspaceAction(page, '#btn-blank');
  await page.waitForTimeout(250);
  expectPrimaryShape(await readPrimaryJob(page));

  await openOtherMenu(page);
  const exportButton = page.locator('#btn-export-app');
  await expect(exportButton).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await exportButton.click();
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
