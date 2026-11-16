"""Layout checks of real Chromium PDFs; no DB/API or response logging.
Run after test:ui-print, with pdfplumber available. Optional --render uses pdftoppm.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path
import pdfplumber

parser=argparse.ArgumentParser()
parser.add_argument('--definition',required=True,help='Canonical public definition JSON (questions only)')
parser.add_argument('--render',action='store_true')
parser.add_argument('--poppler',default='pdftoppm')
args=parser.parse_args()
root=Path(__file__).resolve().parents[2]
definition=json.loads(Path(args.definition).read_text())
review=root/'.acceptance/pdf-review'
review.mkdir(parents=True,exist_ok=True)
normalize=lambda text: re.sub(r'\s+','',text or '')
expected={}
for section in definition['sections']:
 for index,q in enumerate(q for q in definition['questions'] if q['section']==section['id']):
  code=f"{section['id']}{index+1}"
  label=re.sub(r'^([A-J]?\d+|C11)\.\s*','',q['label'])
  expected[code]={'label':label,'matrix':section['id'] in 'BDFGH' or (section['id'] in 'CI' and bool(re.fullmatch(r'\w\.\d+',q['code'])))}
summary=[]
for name in ['blank','response','historical','app-blank','dark-blank']:
 file=root/f'output/pdf/tram-an-{name}-a4.pdf'
 with pdfplumber.open(file) as pdf:
  full_text='\n'.join(p.extract_text() or '' for p in pdf.pages)
  codes=re.findall(r'\b([A-J]\d+)\.',full_text)
  assert len(codes)==155 and set(codes)==set(expected),f'{name}: missing/duplicate questions'
  assert len(re.findall(r'^[A-J]\. ',full_text,re.M))==10,f'{name}: section headings'
  assert 'A.birthYear' not in full_text and 'c10SadMostDays' not in full_text
  rows={}
  for page in pdf.pages:
   assert abs(page.width-595.28)<1 and abs(page.height-841.89)<1,f'{name}: not A4'
   assert (page.extract_text() or '').strip(),f'{name}: empty page'
   # 14 mm, allowing <0.4 pt Chromium rounding.
   for word in page.extract_words():
    assert word['x0']>=39.3 and word['x1']<=page.width-39.3 and word['top']>=39.3 and word['bottom']<=page.height-39.3,f'{name}: text outside margins'
   for table in page.extract_tables():
    has_header=False
    for row in table:
     if (row[0] or '').startswith('Câu hỏi'):has_header=True
     match=re.match(r'^([A-J]\d+)\.',row[0] or '')
     if match and expected[match.group(1)]['matrix']:
      assert has_header,f'{name}: continuation without table header'
      rows[match.group(1)]=row[0]
  for code,q in expected.items():
   if q['matrix']:
    assert code in rows and normalize(q['label']) in normalize(rows[code]),f'{name}: split/incomplete matrix row {code}'
   else:
    assert any(normalize(f"{code}. {q['label']}") in normalize(p.extract_text()) for p in pdf.pages),f'{name}: split question heading {code}'
  if name in ['response','historical']:
   assert 'Bỏ qua' in full_text and 'Chưa trả lời' in full_text and '×' in full_text
   long_answer_pages=[i+1 for i,p in enumerate(pdf.pages) if re.search(r'Dòng \d+: ví dụ giả',p.extract_text() or '')]
   assert len(long_answer_pages)>=2,f'{name}: long answer did not continue across pages'
  if name=='historical':assert 'student-mental-health-v1-draft' in full_text
  summary.append({'document':name,'pages':len(pdf.pages),'questions':len(codes),'sections':10,'blankPages':0,'outsideMarginWords':0,'completeMatrixRows':len(rows)})
 if args.render:subprocess.run([args.poppler,'-r','85','-png',str(file),str(review/name)],check=True)
print(json.dumps(summary,ensure_ascii=False,indent=2))
(review/'checks.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
