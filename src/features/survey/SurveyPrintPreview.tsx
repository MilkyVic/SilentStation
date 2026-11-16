import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import type {SurveyRecord} from '../../../shared/surveys/contracts.js';
import {getSurveyDefinition} from '../../../shared/surveys/releases.js';
import Modal from '../shell/Modal.js';
import SurveyPrint from './SurveyPrint.js';

/** The portal is a body sibling of the app, never inside its scroll/backdrop. */
export default function SurveyPrintPreview({record,onClose}:{record?:SurveyRecord;onClose:()=>void}) {
 const [root,setRoot]=useState<HTMLDivElement|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const supported=!record||!!getSurveyDefinition(record.definitionVersion);
 useEffect(()=>{
  if(!supported)return;
  const element=document.createElement('div');element.id='survey-print-root';element.setAttribute('aria-hidden','true');element.inert=true;document.body.append(element);setRoot(element);
  return()=>{element.remove();};
 },[supported]);
 async function printDocument(){
  setBusy(true);setError('');
  try{
   await document.fonts.ready;
   await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
   // Closing the preview (including logout/unmount) must cancel pending printing.
   if(root?.isConnected&&root.querySelector('.survey-print'))window.print();
  }catch{setError('Không thể mở hộp thoại in. Vui lòng thử lại.');}finally{setBusy(false);}
 }
 return <>
  <Modal title={record?'Phản hồi · quyền nghiên cứu':'Phiếu chính thức · A–J'} onClose={onClose}>
   <p className="muted">A4 dọc · lề 14 mm. Bản in không có phụ lục hoặc khóa chấm.</p>
   <div className="survey-print-preview"><SurveyPrint record={record}/></div>
   {error&&<p className="error-note" role="alert">{error}</p>}
   <button className="primary-button print-preview-action" disabled={!supported||!root||busy} onClick={()=>void printDocument()}>{busy?'Đang chuẩn bị in…':record?'In phản hồi':'In phiếu A–J'}</button>
  </Modal>
  {root&&createPortal(<SurveyPrint record={record}/>,root)}
 </>;
}
