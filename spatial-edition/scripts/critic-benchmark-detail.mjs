import { chromium } from '@playwright/test';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
for (const [name,url] of [['unseen','https://unseen.co/'],['lusion','https://lusion.co/']]) {
const page=await browser.newPage({viewport:{width:1440,height:900}});
try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:40000});await page.waitForTimeout(20000);console.log(name,(await page.locator('body').innerText()).slice(0,3000));
if(name==='unseen'){await page.getByText('Enter without audio',{exact:false}).click({timeout:10000});await page.waitForTimeout(8000);}
await page.screenshot({path:`.impeccable/review/critic-a/benchmark-${name}-entered.png`});await page.mouse.move(850,430);await page.mouse.wheel(0,800);await page.waitForTimeout(3000);await page.screenshot({path:`.impeccable/review/critic-a/benchmark-${name}-entered-scroll.png`});}catch(e){console.log(name,e.message);}
await page.close();}
await browser.close();
