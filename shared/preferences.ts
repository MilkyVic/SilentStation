export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'vi' | 'en';
export type Preferences = {theme:Theme;locale:Locale;preferencesRevision:number};
export function validPreferences(v:unknown):v is {theme:Theme;locale:Locale}{const x=v as any;return !!x&&['light','dark','system'].includes(x.theme)&&['vi','en'].includes(x.locale);}
export const DEFAULT_PREFERENCES:Preferences={theme:'system',locale:'vi',preferencesRevision:0};
