const { test, expect } = require('@playwright/test');

function visibleGroup(page, group) {
  return page.locator(`.phase2-group-btn[data-group="${group}"]:visible, .phase2-bottom-btn[data-group="${group}"]:visible`).first();
}

async function waitForStableWorkspace(page) {
  await page.waitForFunction(() => document.body && document.body.classList.contains('phase5-workspace-ready'), null, { timeout: 20000 });
  await expect(page.locator('body')).toHaveClass(/phase5-workspace-ready/);
}

async function openUserSurface(page, group, tab) {
  const groupButton = visibleGroup(page, group);
  await expect(groupButton).toBeVisible();
  await groupButton.click();

  if (group === 'more') {
    const moreButton = page.locator(`.phase2-more-drawer.open [data-more-tab="${tab}"]`).first();
    await expect(moreButton).toBeVisible();
    await moreButton.click();
  } else if (tab) {
    const tabButton = page.locator(`.phase2-sub-btn[data-tab="${tab}"]:visible`).first();
    await expect(tabButton).toBeVisible();
    await tabButton.click();
  }

  if (tab === '__calculator') {
    await expect(page.locator('#panel-calculator')).toHaveClass(/active/);
    await expect(page.locator('#panel-calculator iframe')).toBeVisible();
  } else {
    await expect(page.locator(`#panel-${tab}`)).toHaveClass(/active/);
    await expect(page.locator(`#panel-${tab}`)).toBeVisible();
  }
}

test.beforeEach(async ({ page }) => {
  page.on('dialog', async dialog => { try { await dialog.accept(); } catch (_) {} });
  await page.goto('/');
  await expect(page).toHaveTitle(/Bruno AC/i);
  await waitForStableWorkspace(page);
});

test('all primary user-visible navigation surfaces open successfully', async ({ page }) => {
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
    await openUserSurface(page, group, tab);
  }
});

test('mobile bottom navigation exposes every primary group', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile-specific coverage');
  for (const group of ['journal', 'calculator', 'job', 'catalog', 'more']) {
    const button = page.locator(`.phase2-bottom-btn[data-group="${group}"]:visible`).first();
    await expect(button).toBeVisible();
    await button.click();
  }
});
