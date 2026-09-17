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

async function openSurface(page, group, tab) {
  const groupButton = visibleGroup(page, group);
  await expect(groupButton).toBeVisible();
  await groupButton.click();
  if (group === 'more') {
    const btn = page.locator(`.phase2-more-drawer.open [data-more-tab="${tab}"]`).first();
    await expect(btn).toBeVisible();
    await btn.click();
  } else if (tab) {
    const btn = page.locator(`.phase2-sub-btn[data-tab="${tab}"]:visible`).first();
    await expect(btn).toBeVisible();
    await btn.click();
  }
  if (tab === '__calculator') await expect(page.locator('#panel-calculator')).toHaveClass(/active/);
  else await expect(page.locator(`#panel-${tab}`)).toHaveClass(/active/);
  await page.waitForTimeout(120);
}

test('full visible surface sweep has no uncaught runtime errors', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', err => pageErrors.push(String(err && err.stack || err)));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('dialog', async dialog => { try { await dialog.accept(); } catch (_) {} });
  await page.goto('/');
  await waitForStableWorkspace(page);

  const surfaces = [
    ['journal', 'dispatch'],
    ['calculator', '__calculator'],
    ['calculator', 'reference'],
    ['job', 'quote'],
    ['job', 'tm'],
    ['job', 'summary'],
    ['job', 'cos'],
    ['job', 'pnl'],
    ['catalog', 'catalog'],
    ['catalog', 'materials'],
    ['catalog', 'labor'],
    ['catalog', 'margins'],
    ['more', 'personnel'],
    ['more', 'profiles'],
    ['more', 'help']
  ];

  for (const [group, tab] of surfaces) {
    await openSurface(page, group, tab);
  }

  const ignoredConsole = consoleErrors.filter(text => !/favicon|Failed to load resource.*404/i.test(text));
  expect(pageErrors, `Uncaught page errors:\n${pageErrors.join('\n\n')}`).toEqual([]);
  expect(ignoredConsole, `Console errors:\n${ignoredConsole.join('\n\n')}`).toEqual([]);
});
