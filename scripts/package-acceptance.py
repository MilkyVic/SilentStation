#!/usr/bin/env python3
"""Source-only native/Vercel package. Includes untracked files; excludes credentials and test data."""
from pathlib import Path
import hashlib,json,tarfile,platform,subprocess
root=Path(__file__).resolve().parent.parent
roots=['.github/workflows','src','server','api','shared','scripts','tests','workers','public','chatbot-knowledge','docs']
top=['package.json','package-lock.json','tsconfig.json','tsconfig.server.json','tsconfig.acceptance.json','vite.config.ts','index.html','vercel.json','README.md']
paths=[]
for folder in roots:
 for p in (root/folder).rglob('*'):
  rel=p.relative_to(root)
  if p.is_symlink():raise RuntimeError('Symlinks are not accepted.')
  if p.is_file() and not any(x in {'node_modules','.git','__pycache__','.acceptance','artifacts'} or x.startswith('.env') for x in rel.parts) and p.suffix not in {'.pyc','.pem','.key','.p12','.sqlite','.db','.docx','.pdf'}:paths.append(p)
paths += [root/p for p in top]
paths=sorted(set(paths),key=lambda p:str(p.relative_to(root)))
manifest={'format':2,'target':'native-vercel-neon','files':{str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths},'realCollection':False,'schedulerEnabled':False,'runtime':{'nodeMajor':22,'platforms':['darwin','linux']},'cloudExecuted':False,'pendingGates':['Operator Vercel Production deployment/build/HTTPS/cookies/OTP','Cloudflare authorized activation']}
manifest['snapshotId']=hashlib.sha256(json.dumps(manifest['files'],sort_keys=True,separators=(',',':')).encode()).hexdigest()[:12]
try:manifest['runtime'].update({'nodeVersion':subprocess.check_output(['node','--version'],text=True).strip(),'platform':platform.system().lower(),'architecture':platform.machine()})
except (OSError,subprocess.CalledProcessError):manifest['runtime']['nodeVersion']='unverified'
manifest['buildHashes']={}
for label,folder in [('nativeApi','.acceptance/native-api'),('frontend','dist')]:
 base=root/folder
 if base.exists():
  hashed={str(f.relative_to(base)):hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(base.rglob('*')) if f.is_file()}
  manifest['buildHashes'][label]=hashlib.sha256(json.dumps(hashed,sort_keys=True,separators=(',',':')).encode()).hexdigest()
validation=root/'.acceptance/native-validation-summary.json'
manifest['validation']={'status':'not-recorded'}
if validation.exists():
 summary=json.loads(validation.read_text())
 if summary.get('snapshotId')==manifest['snapshotId']:manifest['validation']=summary
out=root/'artifacts';out.mkdir(exist_ok=True);name='silentstation-native-acceptance-'+manifest['snapshotId'];mp=out/(name+'.manifest.json');mp.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n');archive=out/(name+'.tar.gz')
with tarfile.open(archive,'w:gz') as tar:
 for p in paths:tar.add(p,arcname='SilentStation/'+str(p.relative_to(root)),recursive=False)
 tar.add(mp,arcname='SilentStation/package-manifest.json')
sha=hashlib.sha256(archive.read_bytes()).hexdigest();(out/(name+'.tar.gz.sha256')).write_text(sha+'  '+archive.name+'\n');print(json.dumps({'archive':str(archive),'sha256':sha,'snapshotId':manifest['snapshotId'],'files':len(paths)},ensure_ascii=False))
