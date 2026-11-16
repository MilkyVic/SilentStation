import {actor,fields,mutation,fail,controlKeys} from './common.js';
import {validPreferences,type Preferences} from '../../shared/preferences.js';
function dto(a:any):Preferences{return {theme:a.ui_theme,locale:a.ui_locale,preferencesRevision:a.preferences_revision};}
export async function preferences(req:any,b?:any){
 if(req.method==='GET')return {ok:true,preferences:dto(await actor(req))};
 fields(b,[...controlKeys,'theme','locale','expectedPreferencesRevision']);
 if(!validPreferences({theme:b.theme,locale:b.locale})||!Number.isInteger(b.expectedPreferencesRevision)||typeof b.expectedUserId!=='string')fail(400,'PREFERENCES_INVALID','Tùy chọn không hợp lệ.');
 return mutation(req,'preferences','self',b,async(c,a)=>{
  if(b.expectedPreferencesRevision!==a.preferences_revision)fail(409,'PREFERENCES_CONFLICT','Tùy chọn đã đổi ở thiết bị khác. Tải lại trước khi lưu.');
  const r=(await c.query('UPDATE auth_users SET ui_theme=$2,ui_locale=$3,preferences_revision=preferences_revision+1 WHERE id=$1 RETURNING *',[a.id,b.theme,b.locale])).rows[0];
  return {ok:true,preferences:dto(r)};
 });
}
