import { chromium } from '@playwright/test';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:600,height:900},reducedMotion:'reduce'});
await page.goto('http://localhost:5174/#game/tekken-3');await page.waitForSelector('.is-ready');await page.waitForTimeout(500);
await page.screenshot({path:'.impeccable/review/detail-600.png',fullPage:true});
await page.setViewportSize({width:768,height:1024});await page.waitForTimeout(500);await page.screenshot({path:'.impeccable/review/detail-768.png',fullPage:true});
await page.setViewportSize({width:1440,height:900});await page.getByRole('button',{name:'Back to the collection'}).click();await page.getByRole('button',{name:'Select Metal Gear Solid',exact:true}).click();await page.waitForTimeout(700);await page.screenshot({path:'.impeccable/review/desktop.png',fullPage:true});
await browser.close();
