import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const FPS = 30;
const TOTAL = 45;
const OUT = path.resolve('demo/frames45');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--no-sandbox', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.resolve('demo/film.html'));
await page.waitForTimeout(400);

const frames = Math.round(TOTAL * FPS);
for (let i = 0; i < frames; i++) {
  const t = i / FPS;
  await page.evaluate((x) => window.render(x), t);
  await page.screenshot({
    path: path.join(OUT, String(i).padStart(4, '0') + '.jpg'),
    type: 'jpeg',
    quality: 94,
  });
  if (i % 150 === 0) console.log(`${i}/${frames}  t=${t.toFixed(1)}s`);
}
await browser.close();
console.log('frames done', frames);
