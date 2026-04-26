import { test, expect } from '@playwright/test';

const EMAIL = 'lightsongjs@gmail.com';

// ── Hero newsletter ────────────────────────────────────────────
test('hero form → POST /api/subscribe cu emailul corect', async ({ page }) => {
  const reqPromise = page.waitForRequest(r => r.url().includes('/api/subscribe') && r.method() === 'POST');
  await page.goto('/');
  await page.locator('.email-form input[type="email"]').fill(EMAIL);
  await page.locator('.email-form button[type="submit"]').click();

  const req = await reqPromise;
  expect(JSON.parse(req.postData())).toEqual({ email: EMAIL });
});

test('hero form → buton arată succes după submit', async ({ page }) => {
  await page.goto('/');
  await page.locator('.email-form input[type="email"]').fill(EMAIL);
  await page.locator('.email-form button[type="submit"]').click();
  await expect(page.locator('.email-form button')).toHaveText('✓ Abonat cu succes!', { timeout: 8000 });
});

// ── Membership waitlist ────────────────────────────────────────
test('membership form → POST /api/notify cu type=membership', async ({ page }) => {
  const reqPromise = page.waitForRequest(r => r.url().includes('/api/notify') && r.method() === 'POST');
  await page.goto('/');
  await page.locator('.waitlist-form input[type="email"]').fill(EMAIL);
  await page.locator('.waitlist-form button[type="submit"]').click();

  const req = await reqPromise;
  expect(JSON.parse(req.postData())).toEqual({ email: EMAIL, type: 'membership' });
});

test('membership form → buton arată succes după submit', async ({ page }) => {
  await page.goto('/');
  await page.locator('.waitlist-form input[type="email"]').fill(EMAIL);
  await page.locator('.waitlist-form button[type="submit"]').click();
  await expect(page.locator('.waitlist-form button')).toHaveText('✓ Te anunțăm la lansare!', { timeout: 8000 });
});

// ── Mentorat apply ─────────────────────────────────────────────
test('mentorat form → POST /api/notify cu type=mentorat', async ({ page }) => {
  const reqPromise = page.waitForRequest(r => r.url().includes('/api/notify') && r.method() === 'POST');
  await page.goto('/');
  await page.locator('.apply-form input[type="email"]').fill(EMAIL);
  await page.locator('.apply-form button[type="submit"]').click();

  const req = await reqPromise;
  expect(JSON.parse(req.postData())).toEqual({ email: EMAIL, type: 'mentorat' });
});

test('mentorat form → buton arată succes după submit', async ({ page }) => {
  await page.goto('/');
  await page.locator('.apply-form input[type="email"]').fill(EMAIL);
  await page.locator('.apply-form button[type="submit"]').click();
  await expect(page.locator('.apply-form button')).toHaveText('✓ Aplicat cu succes!', { timeout: 8000 });
});

// ── CTA final ─────────────────────────────────────────────────
test('CTA form → POST /api/subscribe cu emailul corect', async ({ page }) => {
  const reqPromise = page.waitForRequest(r => r.url().includes('/api/subscribe') && r.method() === 'POST');
  await page.goto('/');
  await page.locator('.cta-form input[type="email"]').fill(EMAIL);
  await page.locator('.cta-form button[type="submit"]').click();

  const req = await reqPromise;
  expect(JSON.parse(req.postData())).toEqual({ email: EMAIL });
});

test('CTA form → buton arată succes după submit', async ({ page }) => {
  await page.goto('/');
  await page.locator('.cta-form input[type="email"]').fill(EMAIL);
  await page.locator('.cta-form button[type="submit"]').click();
  await expect(page.locator('.cta-form button')).toHaveText('✓ Ai primit accesul!', { timeout: 8000 });
});
