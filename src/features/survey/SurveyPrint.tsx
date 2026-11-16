import { DEFINITION, type Answer, type Question, type SurveyRecord } from '../../../shared/surveys/contracts.js';
import {getSurveyDefinition} from '../../../shared/surveys/releases.js';

const matrixSections=new Set(['B','D','F','G','H']);
const isMatrixQuestion=(q:Question)=>matrixSections.has(q.section)||((q.section==='C'||q.section==='I')&&/^\w\.\d+$/.test(q.code));
const displayLabel=(q:Question)=>q.label.replace(/^([A-J]?\d+|C11)\.\s*/,'');
const missingLabel=(answer?:Answer)=>answer?.status==='skipped'?'Bỏ qua':'Chưa trả lời';
const choiceCode=(value:string|number,index:number)=>typeof value==='number'||/^\d+$/.test(value)||value==='K'?String(value):String(index+1);
function Mark({selected=false}:{selected?:boolean}) {
 return <span className={`print-mark${selected?' is-selected':''}`} aria-label={selected?'Đã chọn':'Chưa chọn'}>{selected?'×':''}</span>;
}
function Matrix({questions,record,numbers}:{questions:Question[];record?:SurveyRecord;numbers:Map<string,string>}) {
 const options=questions[0].options!;
 return <table className="print-matrix"><colgroup><col/>{options.map((o,i)=><col key={i} style={{width:'9mm'}}/>)}</colgroup>
  <thead><tr><th colSpan={options.length+1} className="print-legend"><div className="print-legend-items">{options.map((o,i)=><span key={i}><b>{choiceCode(o.value,i)}</b> = {o.label}</span>)}</div></th></tr>
   <tr><th scope="col">Câu hỏi · chọn một phương án</th>{options.map((o,i)=><th scope="col" key={i} aria-label={o.label}>{choiceCode(o.value,i)}</th>)}</tr></thead>
  <tbody>{questions.map(q=>{const answer=record?.answers[q.code];return <tr key={q.code} data-question-code={q.code} data-print-label={numbers.get(q.code)}>
   <th scope="row"><span className="print-question-number">{numbers.get(q.code)}.</span> {displayLabel(q)}{record&&answer?.status!=='answered'&&<span className="print-answer-status">{missingLabel(answer)}</span>}</th>
   {q.options!.map((o,i)=><td key={i}><Mark selected={answer?.status==='answered'&&answer.value===o.value}/></td>)}
  </tr>;})}</tbody></table>;
}
function QuestionBlock({question:q,number,record}:{question:Question;number:string;record?:SurveyRecord}) {
 const answer=record?.answers[q.code];
 return <div className={`print-question-block${q.kind==='text'?' print-free-text':''}`} data-question-code={q.code} data-print-label={number}>
  <p className="print-question-heading"><strong>{number}.</strong> {displayLabel(q)}</p>
  {q.options?<>
   {record&&answer?.status!=='answered'&&<p className="print-answer-status">{missingLabel(answer)}</p>}
   <div className={`print-block-options${q.options.every(o=>o.label.length<25)?' print-short-options':''}`}>{q.options.map((o,i)=><div key={i} className="print-block-option"><Mark selected={answer?.status==='answered'&&answer.value===o.value}/><span>{q.section==='E'&&<b className="print-choice-code">{String(o.value)}. </b>}{o.label}</span></div>)}</div>
  </>:record?<p className={answer?.status==='answered'?'print-written-answer':'print-answer-status'}>{answer?.status==='answered'?answer.value:missingLabel(answer)}</p>:q.kind==='text'?<div className="print-writing-lines" aria-label="Ba dòng để viết câu trả lời"><div/><div/><div/></div>:<p className="print-integer-line">Trả lời: <span/></p>}
 </div>;
}
export default function SurveyPrint({record}:{record?:SurveyRecord}) {
 const definition=record?getSurveyDefinition(record.definitionVersion):DEFINITION;
 if(!definition)return <p role="alert">Không hỗ trợ in phiên bản này. Không dùng phiếu mới thay thế dữ liệu lịch sử.</p>;
 return <article className="survey-print" data-definition-version={definition.version}>
  <header className="print-document-header"><span className="print-brand">TRẠM AN</span><h1>Phiếu khảo sát sức khỏe tâm thần học sinh</h1>
   <p className="print-version">{record?'Phiên bản đã lưu':'Phiên bản chính thức 1.0'} · {definition.version}</p>
   <p>Tự nguyện, có thể bỏ qua hoặc dừng. Không ghi họ tên.</p>
   <p className="print-guide">{record?'Dấu × là lựa chọn đã lưu. Bỏ qua và Chưa trả lời được ghi riêng.':'Đánh dấu × vào một ô phù hợp ở mỗi câu; viết câu trả lời ở phần có dòng trống.'}</p>
  </header>
  {definition.sections.map(s=>{const questions=definition.questions.filter(q=>q.section===s.id),numbers=new Map(questions.map((q,i)=>[q.code,`${s.id}${i+1}`])),matrix=questions.filter(isMatrixQuestion),blocks=questions.filter(q=>!isMatrixQuestion(q));return <section className="print-section" key={s.id} data-print-section={s.id}>
   <div className="print-section-heading"><h2>{s.id}. {s.title}</h2><p>{s.instruction}</p></div>
   {matrix.length>0&&<Matrix questions={matrix} record={record} numbers={numbers}/>}
   {blocks.map(q=><QuestionBlock key={q.code} question={q} number={numbers.get(q.code)!} record={record}/>)}
  </section>;})}
  <p className="print-document-end">Hết phiếu · 10 phần A–J · {definition.questions.length} câu</p>
 </article>;
}
