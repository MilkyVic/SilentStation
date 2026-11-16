import {useSyncExternalStore} from 'react';
import {DEFAULT_PREFERENCES,validPreferences,type Locale,type Theme} from '../../../shared/preferences';
import {translateUi} from './messages';
const key='ss.ui.preferences.v1';
let current:{theme:Theme;locale:Locale}={...DEFAULT_PREFERENCES};const listeners=new Set<()=>void>();
export function bootstrapAppearance(){try{const value=JSON.parse(localStorage.getItem(key)||'null');if(validPreferences(value))current={theme:value.theme,locale:value.locale};}catch{}apply();}
function apply(){if(typeof document==='undefined')return;const dark=current.theme==='dark'||current.theme==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.style.colorScheme=dark?'dark':'light';document.documentElement.lang=current.locale;}
export function appearance(){return current;}
export function setAppearance(value:{theme:Theme;locale:Locale},persist=false){if(!validPreferences(value))return;current={theme:value.theme,locale:value.locale};apply();if(persist)try{localStorage.setItem(key,JSON.stringify(current));}catch{}listeners.forEach(f=>f());}
export function useLocale(){return useSyncExternalStore(f=>{listeners.add(f);return()=>listeners.delete(f);},()=>current.locale,()=> 'vi' as Locale);}
export function useAppearance(){return useSyncExternalStore(f=>{listeners.add(f);return()=>listeners.delete(f);},()=>current,()=>current);}
export function ui(text:string):string {if(current.locale==='vi')return text;return translateUi(text);}
export function formatDate(value:string|Date){return new Date(value).toLocaleString(current.locale==='en'?'en-GB':'vi-VN');}
if(typeof window!=='undefined')window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(current.theme==='system')apply();});

export function uiError(code:string,message:string){if(current.locale==='vi')return message;const translated=translateUi(message);if(translated!==message)return translated;const fallback=code.includes('CONFLICT')?'Data changed. Reload before retrying.':code.includes('FORBIDDEN')||code.includes('GRANT')?'You do not have permission for this operation.':code.includes('EXPIRED')?'The session or request has expired.':code.includes('OTP')?'The email verification request could not be completed.':code.includes('INVALID')||code.includes('POLICY')?'Check the supplied fields and try again.':code.includes('NETWORK')?'No server acknowledgement. Retry the same pending request.':'The server could not confirm this operation.';return fallback+' ('+code+')';}
