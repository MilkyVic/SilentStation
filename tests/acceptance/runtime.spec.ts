import {test,expect} from '@playwright/test';
const base=process.env.VERCEL_ACCEPTANCE_URL??'';
test.skip(!base,'Requires separately authorized dedicated Vercel Preview; not local acceptance.');
test('actual Vercel HTTPS readiness and production frontend, never bypass TLS',async({page,request})=>{if(new URL(base).protocol!=='https:')throw Error('HTTPS required.');const r=await request.get(base+'/api/ready');expect(r.status()).toBe(200);expect((await r.json()).ok).toBe(true);await page.goto(base);await expect(page.getByLabel('Vai trò demo')).toHaveCount(0);});
