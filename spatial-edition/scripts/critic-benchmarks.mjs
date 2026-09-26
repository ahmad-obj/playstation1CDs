import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const dir='.impeccable/review/critic-a';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
for(const [id,url] of [['a24','https://a24.raviklaassens.com/'],['lusion','https://lusion.co/'],['unseen','https://unseen.co/']]) {
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 try {await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForTimeout(10000);await page.screenshot({path:`${dir}/benchmark-${id}.png`});console.log(id,await page.locator('body').innerText({timeout:3000}));await page.mouse.move(760,450);await page.mouse.wheel(0,700);await page.waitForTimeout(1500);await page.screenshot({path:`${dir}/benchmark-${id}-scroll.png`});}catch(e){console.log(id,e.message);}
 await page.close();
}
await browser.close();
