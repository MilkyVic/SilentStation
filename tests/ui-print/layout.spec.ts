import {test,expect,type Page} from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {DEFINITION} from '../../shared/surveys/contracts';
const evidence=path.resolve('.acceptance/ui-print-evidence'),pdfDir=path.resolve('output/pdf');
test.beforeAll(async()=>{await fs.mkdir(path.resolve('.acceptance/pdf-review'),{recursive:true});await fs.writeFile(path.resolve('.acceptance/pdf-review/definition.json'),JSON.stringify(DEFINITION));});
// Nothing in these UI tests contacts a DB, real API, Google font service or email.
test.beforeEach(async({page})=>{await fs.mkdir(evidence,{recursive:true});await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());});
async function fixture(page:Page){await page.goto('/tests/ui-print/fixture.html');await expect(page.locator('.test-audience-badge')).toHaveCount(6);}
async function assertBadges(page:Page){
 // Wait for the existing route-entry animation before measuring/comparing screenshots.
 await expect.poll(()=>page.locator('.test-card').first().evaluate(el=>{let opacity=1;for(let p=el as HTMLElement|null;p;p=p.parentElement)opacity*=Number(getComputedStyle(p).opacity);return opacity;})).toBe(1);
 const results=await page.locator('.test-audience-badge').evaluateAll(elements=>elements.map(el=>{
  const css=getComputedStyle(el),rect=el.getBoundingClientRect(),icon=el.closest('.test-card-header')!.querySelector('.test-card-icon')!.getBoundingClientRect(),card=el.closest('.test-card')!;
  const rgb=(color:string)=>color.match(/[\d.]+/g)!.slice(0,3).map(Number);
  const luminance=(color:string)=>rgb(color).map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
  const a=luminance(css.color),b=luminance(css.backgroundColor);
  return {label:el.textContent,color:css.color,background:css.backgroundColor,contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),font:css.fontSize,position:css.position,visible:rect.width>0&&rect.height>0,within:rect.left>=0&&rect.right<=innerWidth+.5,overlap:rect.left<icon.right&&rect.right>icon.left&&rect.top<icon.bottom&&rect.bottom>icon.top,opacity:getComputedStyle(card).opacity,filter:getComputedStyle(card).filter};
 }));
 for(const result of results){expect(result.contrast).toBeGreaterThanOrEqual(4.5);expect(result.color).toBe('rgb(52, 82, 61)');expect(result.background).toBe('rgb(231, 239, 229)');expect(result.font).toBe('12px');expect(result.position).not.toBe('absolute');expect(result.visible).toBe(true);expect(result.within).toBe(true);expect(result.overlap).toBe(false);expect(result.opacity).toBe('1');expect(result.filter).toBe('none');}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 return results;
}
for(const width of [320,390,768,1280]){
 test(`all audience labels, open/closed, hover/focus/disabled at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await fixture(page);await assertBadges(page);
  for(const card of await page.locator('.test-card').all()) {await card.hover();await assertBadges(page);const button=card.locator('button');if(await button.isEnabled()){await button.focus();await expect(button).toBeFocused();}}
  const disabled=page.locator('.test-card button:disabled').first();expect(await disabled.evaluate(el=>getComputedStyle(el).opacity)).toBe('1');
  await page.screenshot({path:path.join(evidence,`badge-states-${width}.png`),fullPage:true});
 });
 test(`real catalogue and management card headers at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto('/#/quan-tri/test-list');await page.getByLabel('Vai trò demo').selectOption('Quản trị viên cấp cao');
  await expect(page.locator('.test-card')).toHaveCount(6);await assertBadges(page);
  expect(new Set(await page.locator('.test-audience-badge').allTextContents())).toEqual(new Set(['Học sinh','Giáo viên','Giáo viên, Học sinh']));
  await page.screenshot({path:path.join(evidence,`management-${width}.png`),fullPage:true});
  await page.getByLabel('Vai trò demo').selectOption('Học sinh');await page.goto('/#/bai-danh-gia');await expect(page.locator('.test-audience-badge').first()).toBeVisible();await assertBadges(page);
  await page.screenshot({path:path.join(evidence,`catalogue-${width}.png`),fullPage:true});
 });
}
test('alpha utilities keep their opacity; print portal is inaccessible on screen and cleaned up',async({page})=>{
 await fixture(page);expect(await page.getByTestId('alpha').evaluate(el=>getComputedStyle(el).backgroundColor)).toMatch(/0\.1\)/);expect(await page.getByTestId('white-alpha').evaluate(el=>getComputedStyle(el).backgroundColor)).toMatch(/0\.1\)/);
 await page.getByRole('button',{name:'blank',exact:true}).click();const root=page.locator('body > #survey-print-root');await expect(root).toHaveCount(1);await expect(root).toBeHidden();await expect(root).toHaveAttribute('aria-hidden','true');expect(await root.evaluate(el=>(el as HTMLElement).inert)).toBe(true);await expect(root.locator('[data-question-code]')).toHaveCount(155);
 await page.emulateMedia({media:'print'});await expect(root).toBeVisible();await expect(page.locator('.app-main')).toBeHidden();expect(await page.locator('body').evaluate(el=>getComputedStyle(el).overflow)).toBe('visible');
 await page.emulateMedia({media:'screen'});await page.keyboard.press('Escape');await expect(root).toHaveCount(0);await expect(page.getByRole('button',{name:'blank',exact:true})).toBeFocused();
 await page.emulateMedia({media:'print'});await expect(page.locator('.app-main')).toBeVisible();
});
test('print waits for fonts, and closing or logout cancels a pending print',async({page})=>{
 await fixture(page);await page.getByRole('button',{name:'blank',exact:true}).click();
 await page.evaluate(()=>{const w=window as any;w.printCount=0;window.print=()=>{w.printCount++;};Object.defineProperty(document.fonts,'ready',{configurable:true,value:new Promise<void>(resolve=>{w.resolveFonts=resolve;})});});
 await page.getByRole('button',{name:'In phiếu A–J',exact:true}).click();expect(await page.evaluate(()=>(window as any).printCount)).toBe(0);await page.keyboard.press('Escape');await page.evaluate(()=>(window as any).resolveFonts());await expect(page.locator('#survey-print-root')).toHaveCount(0);expect(await page.evaluate(()=>(window as any).printCount)).toBe(0);
 await page.getByRole('button',{name:'blank',exact:true}).click();await page.getByRole('button',{name:'In phiếu A–J',exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as any).printCount)).toBe(1);
 await page.evaluate(()=>document.querySelector<HTMLButtonElement>('.toolbar button:last-child')!.click());await expect(page.locator('#survey-print-root')).toHaveCount(0);
});
test('unsupported version has an alert, no print portal and a disabled print action',async({page})=>{
 await fixture(page);await page.getByRole('button',{name:'unsupported',exact:true}).click();await expect(page.getByRole('alert')).toContainText('Không hỗ trợ in phiên bản này');await expect(page.getByRole('button',{name:'In phản hồi',exact:true})).toBeDisabled();await expect(page.locator('#survey-print-root')).toHaveCount(0);await expect(page.locator('.survey-print')).toHaveCount(0);
});
for(const mode of ['blank','response','historical'])test(`actual A4 Chromium PDF: ${mode}`,async({page})=>{
 await fs.mkdir(pdfDir,{recursive:true});await fixture(page);await page.getByRole('button',{name:mode,exact:true}).click();const root=page.locator('#survey-print-root');await expect(root.locator('[data-question-code]')).toHaveCount(155);await expect(root.locator('[data-print-section]')).toHaveCount(10);
 await page.emulateMedia({media:'print'});await page.evaluate(()=>document.fonts.ready);
 if(mode!=='blank'){
  await expect(root.locator('[data-question-code="I.1"] td').last().locator('.is-selected')).toHaveCount(1);
  await expect(root.locator('[data-question-code="G.1"] td').last().locator('.is-selected')).toHaveCount(1);
  await expect(root.locator('[data-question-code="B.2"]')).toContainText('Bỏ qua');await expect(root.locator('[data-question-code="B.3"]')).toContainText('Chưa trả lời');
 }
 const visible=await root.locator('.survey-print').innerText();expect(visible).not.toContain('A.birthYear');expect(visible).not.toContain('c10SadMostDays');
 await page.pdf({path:path.join(pdfDir,`tram-an-${mode}-a4.pdf`),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
});
test('the real research page prints from outside app-main and cleans up on logout',async({page})=>{
 await page.goto('/#/nghien-cuu');await page.getByLabel('Vai trò demo').selectOption('Admin');await page.getByRole('button',{name:'In phiếu A–J',exact:true}).click();await expect(page.locator('body > #survey-print-root [data-question-code]')).toHaveCount(155);
 await page.emulateMedia({media:'print'});await expect(page.locator('#survey-print-root')).toBeVisible();await expect(page.locator('.app-main')).toBeHidden();await page.pdf({path:path.join(pdfDir,'tram-an-app-blank-a4.pdf'),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
 await page.emulateMedia({media:'screen'});await page.keyboard.press('Escape');await expect(page.locator('#survey-print-root')).toHaveCount(0);
 await page.getByRole('button',{name:'In phiếu A–J',exact:true}).click();await page.getByLabel('Vai trò demo').evaluate((el:HTMLSelectElement)=>{el.value='guest';el.dispatchEvent(new Event('change',{bubbles:true}));});await expect(page.locator('#survey-print-root')).toHaveCount(0);
});

test('dark screen keeps readable audience badges and a white A4 print document',async({page})=>{await fixture(page);await page.evaluate(()=>document.documentElement.dataset.theme='dark');for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:1000});const ratios=await page.locator('.test-audience-badge').evaluateAll(nodes=>nodes.map(el=>{const c=getComputedStyle(el),l=(s:string)=>s.match(/[\d.]+/g)!.slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,b,i)=>a+b*[.2126,.7152,.0722][i],0);const a=l(c.color),b=l(c.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}));expect(ratios.every(x=>x>=4.5)).toBe(true);}await page.screenshot({path:path.join(evidence,'dark-cards-1280.png'),fullPage:true});await page.getByRole('button',{name:'blank',exact:true}).click();await page.emulateMedia({media:'print'});const doc=page.locator('#survey-print-root .survey-print');await expect(doc).toBeVisible();expect(await doc.evaluate(el=>[getComputedStyle(el).color,getComputedStyle(el).backgroundColor])).toEqual(['rgb(17, 17, 17)','rgb(255, 255, 255)']);await page.pdf({path:path.join(pdfDir,'tram-an-dark-blank-a4.pdf'),preferCSSPageSize:true,printBackground:true});});
