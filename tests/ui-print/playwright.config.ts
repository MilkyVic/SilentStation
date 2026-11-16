import {defineConfig} from '@playwright/test';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
export default defineConfig({
 testDir:'.',testMatch:'*.spec.ts',workers:1,retries:0,timeout:60000,expect:{timeout:10000},
 outputDir:path.join(root,'.acceptance/ui-print-results'),reporter:[['list'],['json',{outputFile:path.join(root,'.acceptance/ui-print-report.json')}]],
 use:{baseURL:'http://127.0.0.1:4186',headless:true,trace:'off',video:'off',screenshot:'off'},
 webServer:{cwd:root,command:`${JSON.stringify(process.execPath)} node_modules/vite/bin/vite.js preview --outDir .acceptance/ui-print --host 127.0.0.1 --port 4186 --strictPort`,url:'http://127.0.0.1:4186',reuseExistingServer:false},
 projects:[{name:'chromium',use:{browserName:'chromium'}}],
});
