import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
const out='.impeccable/review/critic-b';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage();const errors=[],results=[];
// Media/layout-only confirmation. Real-WebGL history/landscape regressions are
// checked separately; this avoids concurrent software-GPU startup contention.
await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type.startsWith('webgl'))return null;return original.call(this,type,...args);};});
page.on('pageerror',e=>errors.push(e.message));
for(const size of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]){
  await page.setViewportSize(size);await page.goto('http://localhost:5174');await page.waitForSelector('.is-ready');await page.waitForTimeout(1300);
  await page.screenshot({path:`${out}/final-collection-${size.width}.png`});
  await page.getByRole('button',{name:'Enter its world',exact:true}).click();await page.waitForSelector('video');
  await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime),{timeout:15000}).toBeGreaterThan(1);
  const playback=await page.locator('video').evaluate(v=>({src:v.currentSrc,ready:v.readyState,time:v.currentTime,duration:v.duration,paused:v.paused,muted:v.muted,error:v.error?.code||null}));
  await page.getByRole('button',{name:'Pause film',exact:true}).click();const pausedAt=await page.locator('video').evaluate(v=>v.currentTime);await page.waitForTimeout(500);expect(await page.locator('video').evaluate(v=>v.currentTime)).toBe(pausedAt);
  const seek=page.getByRole('slider',{name:'Seek film'});await expect(seek).toBeEnabled();await seek.focus();await seek.press('End');await seek.press('ArrowLeft');await expect.poll(()=>page.locator('video').evaluate(v=>v.currentTime)).toBeGreaterThan(19.8);
  await page.getByRole('button',{name:'Unmute film',exact:true}).click();await expect.poll(()=>page.locator('video').evaluate(v=>v.muted)).toBe(false);
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,player:document.querySelector('.film-player').getBoundingClientRect().toJSON(),transport:document.querySelector('.film-transport').getBoundingClientRect().toJSON()}));
  await page.screenshot({path:`${out}/final-film-${size.width}.png`});await page.getByRole('button',{name:'Captures',exact:true}).click();await expect(page.locator('video')).toHaveCount(0);await page.waitForTimeout(1500);const capture=await page.locator('.memory-image-wrap').boundingBox();await page.screenshot({path:`${out}/final-captures-${size.width}.png`});
  results.push({size,playback,layout,capture});
  await page.getByRole('button',{name:'Close memory room'}).click();await expect(page.locator('.memory-viewer')).toHaveCount(0);
}
await fs.writeFile(`${out}/final-evidence.json`,JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));await browser.close();
