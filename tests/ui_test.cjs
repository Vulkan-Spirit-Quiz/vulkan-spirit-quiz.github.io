// Full browser run: host creates a game, projector screen, three phones join and play a whole mission.
const { chromium, devices } = require('playwright');
const B = 'http://localhost:' + (process.env.PORT || 8899);
const shots = '/home/claude/quiz/tests/shots/';
require('fs').mkdirSync(shots, { recursive: true });
const clock = ms => fetch(B + '/__clock?add=' + ms);
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const watch = (p, name) => { p.on('pageerror', e => errors.push(name + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(name + ' console: ' + m.text()); }); };
  const hostCtx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const host = await hostCtx.newPage(); watch(host, 'host');
  await host.goto(B + '/'); await host.waitForSelector('.home');
  await host.screenshot({ path: shots + '01_home.png', fullPage: true });
  await host.click('label.mission:nth-child(2)');
  await host.fill('[data-prize]', 'Eine Flasche Romulanisches Ale');
  await host.click('[data-act="create"]');
  await host.waitForURL(/room=/); await host.waitForSelector('.lobby');
  const code = new URL(host.url()).searchParams.get('room');
  // projector
  const screen = await (await browser.newContext({ viewport: { width: 1600, height: 900 } })).newPage(); watch(screen, 'screen');
  await screen.goto(B + '/?room=' + code + '&screen=1'); await screen.waitForSelector('.screen-lobby');
  // phones
  const phones = [];
  const names = ['Die Tribble-Bande', 'Q-Kontinuum', 'Borg <script>alert(1)</script>'];
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    const p = await ctx.newPage(); watch(p, 'phone' + i);
    await p.goto(B + '/'); await p.fill('[data-code]', code.toLowerCase()); await p.click('form[data-form] .btn');
    await p.waitForSelector('.joinform');
    await p.fill('[data-teamname]', names[i]);
    if (i === 1) { await p.click('[data-group-tab="voelker"]'); await p.click('[data-avatar="klingone"]'); }
    else if (i === 2) {
      await p.click('[data-group-tab="upload"]');
      await p.setInputFiles('[data-upload]', '/home/claude/quiz/docs/logo.jpg');
      await p.waitForSelector('.upload .av img');
    } else await p.click('[data-avatar="picard"]');
    if (i === 0) await p.screenshot({ path: shots + '02_phone_join.png', fullPage: true });
    await p.click('[data-act="join"]'); await p.waitForSelector('text=TEAM ERFOLGREICH VERBUNDEN');
    phones.push(p);
  }
  await phones[0].screenshot({ path: shots + '03_phone_lobby.png' });
  await host.waitForFunction(() => document.querySelectorAll('.teamgrid li:not(.wait)').length === 3);
  await screen.waitForFunction(() => document.querySelectorAll('.teamgrid li:not(.wait)').length === 3);
  await screen.waitForTimeout(1500);
  await host.screenshot({ path: shots + '04_host_lobby.png', fullPage: true });
  await screen.screenshot({ path: shots + '05_screen_lobby.png' });
  if (await screen.evaluate(() => !!window.__xss)) errors.push('XSS!');
  await host.click('[data-act="start"]');
  await phones[0].waitForSelector('.getready'); await phones[0].screenshot({ path: shots + '06_phone_getready.png' });
  await clock(3100);
  for (let q = 0; q < 10; q++) {
    await phones[0].waitForFunction(n => document.querySelector('.qnum')?.textContent.includes('Frage ' + n + ' ') && document.querySelector('.opt:not([disabled])'), q + 1, { timeout: 15000 });
    for (let i = 0; i < 3; i++) {
      await phones[i].waitForSelector('.opt:not([disabled])', { timeout: 15000 });
      await phones[i].click(`.opt[data-choice="${(q + i) % 4}"]`);
    }
    if (q === 0) { await phones[0].waitForSelector('text=Antwort gespeichert'); await phones[0].screenshot({ path: shots + '07_phone_answered.png' }); }
    await host.waitForSelector('[data-act="next"]', { timeout: 15000 });
    await phones[0].waitForSelector('.feedback', { timeout: 15000 });
    if (q === 9) { await host.screenshot({ path: shots + '08_host_reveal.png', fullPage: true }); await phones[0].screenshot({ path: shots + '09_phone_reveal.png', fullPage: true }); await screen.waitForSelector('.explain'); await screen.screenshot({ path: shots + '10_screen_reveal.png' }); }
    if (q === 3) { await screen.waitForSelector('.explain'); }
    await host.click('[data-act="next"]');
    if (q < 9) { await host.waitForFunction(n => document.querySelector('.qnum')?.textContent.includes('Frage ' + n + ' '), q + 2); await clock(3100); }
    if (q === 1) { await host.waitForSelector('.qtext'); await host.screenshot({ path: shots + '11_host_question.png', fullPage: true }); await screen.waitForSelector('.qtext'); await screen.screenshot({ path: shots + '12_screen_question.png' }); await phones[1].waitForSelector('.qtext'); await phones[1].screenshot({ path: shots + '13_phone_question.png', fullPage: true }); }
  }
  await host.waitForSelector('[data-act="restart"]');
  for (const p of phones) await p.waitForSelector('.result');
  await host.screenshot({ path: shots + '14_host_finished.png', fullPage: true });
  await screen.waitForSelector('.result'); await screen.waitForTimeout(800); await screen.screenshot({ path: shots + '15_screen_finished.png' });
  for (let i = 0; i < 3; i++) await phones[i].screenshot({ path: shots + `16_phone${i}_finished.png`, fullPage: true });
  // CSV + diploma
  const [dl] = await Promise.all([host.waitForEvent('download'), host.click('[data-act="csv"]')]);
  console.log('csv:', (await require('fs').promises.readFile(await dl.path(), 'utf8')).replace(/\r?\n/g, ' | '));
  const winnerBtn = await host.$('[data-diploma]');
  if (winnerBtn) { const [pop] = await Promise.all([host.waitForEvent('popup'), winnerBtn.click()]); await pop.waitForLoadState(); await pop.screenshot({ path: shots + '17_diploma.png' }); }
  // restart with same teams
  await host.click('[data-act="restart"]');
  await phones[0].waitForSelector('text=TEAM ERFOLGREICH VERBUNDEN');
  console.log('after restart host phase:', await host.evaluate(() => document.querySelector('.mission-banner b')?.textContent));
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})().catch(e => { console.error('FAILED', e); process.exit(1); });
