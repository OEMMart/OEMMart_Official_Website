// npm ci && npx playwright install chromium && npm run test:browser
// GSAP uses the exact production version. Analytics and remote fonts are isolated
// so navigation checks do not depend on third-party services or font load timing.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const playwright = require('playwright');
const browserName = process.env.LANDING_TEST_BROWSER || 'chromium';

const root = path.resolve(__dirname, '..');
const gsapDist = path.dirname(require.resolve('gsap/dist/gsap.min.js'));
const gsapScripts = new Map(['gsap.min.js', 'ScrollTrigger.min.js'].map(name => [
  `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/${name}`,
  fs.readFileSync(path.join(gsapDist, name))
]));
const desktop = { width: 1440, height: 900 };
const mobile = { width: 375, height: 812 };
let browser, server, origin;

before(async () => {
  server = http.createServer((req, res) => {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  assert.ok(['chromium', 'firefox', 'webkit'].includes(browserName), 'Supported browser');
  browser = await playwright[browserName].launch({ headless: true });
  console.log(`Testing ${browserName} ${browser.version()}`);
});

after(async () => {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

async function fixture(t, options = {}) {
  const { noGsap = false, ...contextOptions } = options;
  const context = await browser.newContext({ viewport: desktop, reducedMotion: 'no-preference', ...contextOptions });
  t.after(() => context.close());
  await context.route('**/*', route => {
    const request = route.request();
    if (request.url().startsWith(origin + '/')) return route.continue();
    const script = gsapScripts.get(request.url());
    if (script) return route.fulfill({ contentType: 'text/javascript', body: noGsap ? '' : script });
    // Avoid a false Apollo onLoad error while keeping analytics offline.
    const body = request.url().includes('assets.apollo.io/') ? 'window.trackingFunctions = { onLoad() {} };' : '';
    return route.fulfill({ status: 200, contentType: request.resourceType() === 'script' ? 'text/javascript' : 'text/plain', body });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  t.after(() => assert.deepEqual(errors, [], 'No page JavaScript errors'));
  await page.goto(origin + '/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  if (noGsap || contextOptions.reducedMotion === 'reduce') {
    await page.waitForFunction(() => document.body.classList.contains('static'));
  } else {
    await page.waitForFunction(() => window.ScrollTrigger?.getAll().some(st => st.trigger?.id === 'stage'));
  }
  return { page, context };
}

async function scroll(page, y) {
  await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
  await page.waitForFunction(y => Math.abs(scrollY - y) < 2, y);
  await page.waitForTimeout(1100); // ScrollTrigger's production scrub duration is 1s.
}

async function assertOpeningFrame(page, expectedEnd) {
  await page.waitForFunction(() => {
    const st = ScrollTrigger.getAll().find(st => st.trigger?.id === 'stage');
    return st?.animation.progress() < 0.00001 && getComputedStyle(document.getElementById('before')).opacity === '1';
  });
  const state = await page.evaluate(() => {
    const st = ScrollTrigger.getAll().find(st => st.trigger?.id === 'stage');
    return { start: st.start, end: st.end, progress: st.progress, stageTop: st.trigger.getBoundingClientRect().top, transform: getComputedStyle(document.getElementById('before')).transform, behavior: getComputedStyle(document.documentElement).scrollBehavior };
  });
  assert.ok(Math.abs(state.start) < 1, JSON.stringify(state));
  assert.equal(state.end, expectedEnd);
  assert.ok(state.progress < 0.00001);
  assert.ok(Math.abs(state.stageTop) < 1);
  assert.equal(state.transform, 'matrix(1, 0, 0, 1, 0, 0)');
  assert.equal(state.behavior, 'auto');
}

async function navigate(page, id, isMobile = false) {
  if (isMobile) {
    await page.locator('#navtoggle').click();
    await page.locator(`#navmenu a[href="#${id}"]`).click();
  } else {
    await page.locator(`.nav .links a[href="#${id}"]`).click();
  }
  await page.waitForFunction(id => location.hash === '#' + id && document.activeElement === document.getElementById(id), id);
  // Existing reveal animations can shift layout, so verify the destination is
  // visible rather than asserting an exact offset that the old site did not meet.
  await page.waitForFunction(id => {
    const top = document.getElementById(id).getBoundingClientRect().top;
    return top >= 0 && top < 220;
  }, id);
  await page.waitForTimeout(1200);
}

for (const scenario of [
  { name: 'desktop below the fold', viewport: desktop, y: 2450, end: 2800 },
  { name: 'desktop inside the pin', viewport: desktop, y: 1400, end: 2800 },
  { name: 'mobile inside the pin', viewport: mobile, y: 900, end: 1500 }
]) {
  test(`hero rewinds after reload: ${scenario.name}`, async t => {
    const { page } = await fixture(t, { viewport: scenario.viewport });
    await scroll(page, scenario.y);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(600);
    assert.ok(Math.abs(await page.evaluate(() => scrollY) - scenario.y) < 2, 'Restored scroll position');
    await scroll(page, 0);
    await assertOpeningFrame(page, scenario.end);
  });
}

test('refresh at a nonzero scroll position preserves trigger measurements', async t => {
  const { page } = await fixture(t);
  await scroll(page, 1400);
  await page.evaluate(() => ScrollTrigger.refresh());
  await scroll(page, 0);
  await assertOpeningFrame(page, 2800);
});

test('desktop/mobile breakpoint changes preserve the opening frame', async t => {
  const { page } = await fixture(t);
  await scroll(page, 2450);
  for (const [viewport, end] of [[mobile, 1500], [desktop, 2800]]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(600);
    await scroll(page, 0);
    await assertOpeningFrame(page, end);
  }
});

for (const [name, viewport] of [['desktop', desktop], ['mobile', mobile]]) {
  test(`${name} navigation and back/forward retain fragments and close the menu`, async t => {
    const { page } = await fixture(t, { viewport });
    for (const id of ['product', 'about', 'contact']) {
      await navigate(page, id, name === 'mobile');
      assert.equal(await page.locator('#navtoggle').getAttribute('aria-expanded'), 'false');
    }
    await page.goBack();
    await page.waitForFunction(() => location.hash === '#about' && document.getElementById('about').getBoundingClientRect().top < 220);
    await page.goForward();
    await page.waitForFunction(() => location.hash === '#contact' && document.getElementById('contact').getBoundingClientRect().top < 220);
  });
}

test('Ctrl-click and middle-click open a new tab without changing the original page', async t => {
  const { page, context } = await fixture(t);
  for (const options of [{ modifiers: ['Control'] }, { button: 'middle' }]) {
    const popupPromise = context.waitForEvent('page');
    await page.locator('.nav .links a[href="#product"]').click(options);
    const popup = await popupPromise;
    await popup.waitForURL(origin + '/#product');
    assert.equal(new URL(popup.url()).hash, '#product');
    assert.equal(await page.evaluate(() => location.hash), '');
    assert.equal(await page.evaluate(() => scrollY), 0);
    await popup.close();
  }
});

test('target=_blank retains native new-tab behavior', async t => {
  const { page, context } = await fixture(t);
  await page.locator('.nav .links a[href="#product"]').evaluate(a => a.target = '_blank');
  const popupPromise = context.waitForEvent('page');
  await page.locator('.nav .links a[href="#product"]').click();
  const popup = await popupPromise;
  assert.equal(await page.evaluate(() => location.hash), '');
  await popup.close();
});

test('modified, download and previously canceled clicks are not intercepted', async t => {
  const { page } = await fixture(t);
  const results = await page.evaluate(() => {
    const a = document.querySelector('.nav .links a[href="#product"]');
    return [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { download: true }, { canceled: true }].map(options => {
      if (options.download) a.setAttribute('download', '');
      let intercepted;
      const stopDefault = e => { intercepted = e.defaultPrevented; e.preventDefault(); };
      window.addEventListener('click', stopDefault, { once: true });
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...options });
      if (options.canceled) event.preventDefault();
      a.dispatchEvent(event);
      a.removeAttribute('download');
      return { intercepted, canceled: !!options.canceled };
    });
  });
  assert.deepEqual(results.map(r => r.intercepted), [false, false, false, false, false, false, true]);
  assert.equal(await page.evaluate(() => location.hash), '');
});

test('Enter then Tab continues inside Product and cleans up temporary tabindex', async t => {
  const { page } = await fixture(t);
  await page.locator('.nav .links a[href="#product"]').focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement.id === 'product');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'unsealbtn');
  assert.equal(await page.locator('#product').getAttribute('tabindex'), null);
});

test('logo clears the fragment, records history, restores top focus and avoids duplicate entries', async t => {
  const { page } = await fixture(t);
  await navigate(page, 'product');
  const historyBefore = await page.evaluate(() => history.length);
  await page.locator('.nav > a[href="#"]').click();
  await page.waitForFunction(() => scrollY === 0 && location.hash === '' && document.activeElement === document.body);
  assert.equal(await page.evaluate(() => history.length), historyBefore + 1);
  await page.goBack();
  await page.waitForFunction(() => location.hash === '#product' && scrollY > 1000);
  await page.goForward();
  await page.waitForFunction(() => location.hash === '' && scrollY === 0);
  await page.locator('.nav > a[href="#"]').click();
  assert.equal(await page.evaluate(() => history.length), historyBefore + 1);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('.nav > a')), true);
  assert.equal(await page.locator('body').getAttribute('tabindex'), null);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => location.hash), '');
  await assertOpeningFrame(page, 2800);
});

test('repeating the same section link adds no duplicate history entry', async t => {
  const { page } = await fixture(t);
  await navigate(page, 'about');
  const length = await page.evaluate(() => history.length);
  await navigate(page, 'about');
  assert.equal(await page.evaluate(() => history.length), length);
});

for (const options of [{ viewport: mobile, reducedMotion: 'reduce' }, { noGsap: true }]) {
  test(`static fallback navigation: ${options.noGsap ? 'GSAP unavailable' : 'reduced motion'}`, async t => {
    const { page } = await fixture(t, options);
    await navigate(page, 'about', options.viewport === mobile);
    assert.equal(await page.locator('body').evaluate(body => body.classList.contains('static')), true);
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  });
}

test('malformed and missing fragments fall back to the browser without script errors', async t => {
  const { page } = await fixture(t);
  for (const href of ['#missing-section', '#bad%ZZ']) {
    await page.locator('.nav .links a[href^="#"]').first().evaluate((a, href) => a.setAttribute('href', href), href);
    await page.locator('.nav .links a').first().click();
    assert.equal(await page.evaluate(() => location.hash), href);
  }
});

test('integration retains current trial and policy destinations and synchronized asset versions', async t => {
  const { page } = await fixture(t);
  assert.ok(await page.locator('a[href="https://signalforge.oemmart.com/register"]').count());
  for (const href of ['/policies/privacy', '/policies/terms-and-conditions']) {
    assert.equal(await page.locator(`.sf-bottom a[href="${href}"]`).count(), 1);
    const response = await page.request.get(origin + href + '/');
    assert.equal(response.status(), 200);
  }
  assert.equal(await page.locator('script[src*="hsforms"]').count(), 0);
  const versions = await page.evaluate(() => [
    new URL(document.querySelector('link[href*="css/landing.css"]').href).searchParams.get('v'),
    new URL(document.querySelector('script[src*="js/landing.js"]').src).searchParams.get('v')
  ]);
  assert.deepEqual(versions, ['53', '53']);
});
