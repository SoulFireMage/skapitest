// Renders the chart locally with a project selected, in both groupings,
// and reports console errors. Run from the repo root:
//   node .claude/skills/add-star/scripts/screenshot.js <project-id> <output-dir>
// Uses the preinstalled Playwright; the Skapi backend is switched off so the
// test makes no network calls to the live project.

var path = require('path');
var { chromium } = require('/opt/node22/lib/node_modules/playwright');

var id = process.argv[2];
var out = process.argv[3] || '.';
if (!id) { console.error('usage: screenshot.js <project-id> <output-dir>'); process.exit(2); }
var page_url = 'file://' + path.resolve('index.html');

(async function () {
  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  var errors = [];
  page.on('pageerror', function (e) { errors.push(e.message); });
  page.on('console', function (m) { if (m.type() === 'error') errors.push(m.text()); });
  await page.route('**/js/config.js', function (r) {
    r.fulfill({ body: "var SKAPI_PROJECT_ID='';", contentType: 'application/javascript' });
  });

  for (var view of ['topic', 'method']) {
    await page.goto(page_url);
    await page.evaluate(function (v) { localStorage.setItem('view', v); }, view);
    await page.goto(page_url + '#' + id);
    await page.reload();
    await page.waitForTimeout(400);
    var file = path.join(out, id + '-' + view + '.png');
    await page.screenshot({ path: file });
    var heading = await page.textContent('#p-cluster').catch(function () { return '(panel not open)'; });
    var link = await page.getAttribute('#p-link', 'href').catch(function () { return null; });
    console.log(view + ': ' + heading + ' | link ' + link + ' | ' + file);
  }
  console.log('header: ' + (await page.textContent('.top .sub')).replace(/\s+/g, ' ').trim());
  console.log(errors.length ? 'ERRORS: ' + errors.join(' / ') : 'no console errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
