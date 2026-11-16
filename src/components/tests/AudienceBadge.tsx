import {ui,useLocale} from '../../features/preferences/ui';
/** The same readable audience label in the catalogue and management cards. */
export default function AudienceBadge({audience}:{audience:string}) {useLocale();
 return <span className="test-audience-badge">{audience==='Cả hai'?ui("Giáo viên, Học sinh"):audience}</span>;
}
