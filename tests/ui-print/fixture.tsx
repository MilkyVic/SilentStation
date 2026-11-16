// Only included in the separate test build, never the production entry/bundle.
import React,{useCallback,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {DEFINITION,type SurveyRecord} from '../../shared/surveys/contracts';
import SurveyPrintPreview from '../../src/features/survey/SurveyPrintPreview';
import AudienceBadge from '../../src/components/tests/AudienceBadge';
import '../../src/index.css';
const synthetic:SurveyRecord={responseId:'synthetic-only',campaignId:'synthetic-only',savedAt:'2026-11-15T00:00:00Z',definitionVersion:DEFINITION.version,consentVersion:DEFINITION.consentVersion,scoreVersion:'survey-arithmetic-v1',answers:Object.fromEntries(DEFINITION.questions.map((q,i)=>[q.code,i%3===1?{status:'skipped'}:i%3===2?{status:'unanswered'}:{status:'answered',value:q.options?.[0].value??(q.kind==='integer'?(q.code==='A.birthYear'?2008:40):'Câu trả lời giả để kiểm tra bố cục.')} ])),reviewedSections:[],scores:{}};
synthetic.answers['I.1']={status:'answered',value:'K'};synthetic.answers['G.1']={status:'answered',value:'khong_biet'};synthetic.answers['E.e1']={status:'answered',value:'3b'};
synthetic.answers['I.i2SelfCareActions']={status:'answered',value:Array.from({length:80},(_,i)=>`Dòng ${i+1}: ví dụ giả.`).join('\n').slice(0,1999)};
synthetic.answers['J.1']={status:'answered',value:'TỰ LUẬN GIẢ\nDòng thứ hai.\n'+('Đoạn dài để kiểm tra xuống dòng và ngắt trang. '.repeat(35))};
function Fixture(){
 const [preview,setPreview]=useState<string|null>(null);const close=useCallback(()=>setPreview(null),[]);
 const record=preview==='blank'?undefined:preview==='historical'?{...synthetic,definitionVersion:'student-mental-health-v1-draft',consentVersion:'survey-consent-v1-draft'}:preview==='unsupported'?{...synthetic,definitionVersion:'unsupported'}:synthetic;
 return <div className="app-main"><h1>TEST · KHÔNG NHẬP DỮ LIỆU THẬT</h1><div className="toolbar">{['blank','response','historical','unsupported'].map(mode=><button key={mode} onClick={()=>setPreview(mode)}>{mode}</button>)}<button onClick={close}>logout-fixture</button></div>
  <section className="legacy-wrapper"><div className="test-fixture-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:24,padding:16}}>{['Học sinh','Giáo viên','Cả hai'].flatMap(audience=>['open','closed'].map(state=><div className="test-card bg-white p-8" data-state={state} key={`${audience}-${state}`}><div className="test-card-header"><div className="test-card-icon bg-brand-primary" style={{width:64,height:64}}/><div className="test-card-labels"><AudienceBadge audience={audience}/><span className="test-state-badge">{state==='open'?'Đang mở':'Đã đóng'}</span></div></div><h3>Bài tự đánh giá</h3><p className="text-gray-400">Mô tả mẫu để kiểm tra tương phản.</p><p className="text-gray-300">Phiên bản: v1</p><button className="bg-brand-primary/10 text-brand-primary" disabled={state==='closed'}>Thao tác kiểm thử</button></div>))}</div><span data-testid="alpha" className="bg-brand-primary/10"/><span data-testid="white-alpha" className="bg-white/10"/></section>
  {preview&&<SurveyPrintPreview record={record} onClose={close}/>}
 </div>;
}
createRoot(document.getElementById('root')!).render(<Fixture/>);
