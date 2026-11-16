import {defineConfig,mergeConfig} from 'vite';
import path from 'node:path';
import base from '../../vite.config';
export default defineConfig(env=>mergeConfig(typeof base==='function'?base(env):base,{build:{outDir:'.acceptance/ui-print',rollupOptions:{input:{app:path.resolve('index.html'),fixture:path.resolve('tests/ui-print/fixture.html')}}}}));
