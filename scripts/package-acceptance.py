#!/usr/bin/env python3
"""Source-only archive, including untracked implementation files, never credentials."""
from pathlib import Path
import hashlib,json,tarfile,os
root=Path(__file__).resolve().parent.parent
roots=['src','server','api','shared','scripts','tests','docker','public','chatbot-knowledge','docs']
top=['package.json','package-lock.json','tsconfig.json','tsconfig.server.json','tsconfig.acceptance.json','vite.config.ts','index.html','Dockerfile.api','compose.acceptance.yaml','.dockerignore']
paths=[]
for folder in roots:
 for p in (root/folder).rglob('*'):
  rel=p.relative_to(root)
  if p.is_symlink(): raise RuntimeError('Symlinks are not accepted in the source package.')
  if p.is_file() and not any(x in {'node_modules','.git','__pycache__','.acceptance','artifacts'} or x.startswith('.env') for x in rel.parts) and p.suffix not in {'.pyc','.pem','.key','.p12','.sqlite','.db','.docx','.pdf'}: paths.append(p)
paths += [root/p for p in top]
paths=sorted(set(paths),key=lambda p:str(p.relative_to(root)))
manifest={'format':1,'files':{str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths},'realCollection':False,'remoteDockerExecuted':False}
manifest['snapshotId']=hashlib.sha256(json.dumps(manifest['files'],sort_keys=True,separators=(',',':')).encode()).hexdigest()[:12]
out=root/'artifacts';out.mkdir(exist_ok=True)
name='silentstation-backend-acceptance-'+manifest['snapshotId']
manifest_path=out/(name+'.manifest.json');manifest_path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
archive=out/(name+'.tar.gz')
with tarfile.open(archive,'w:gz') as tar:
 for p in paths:tar.add(p,arcname='SilentStation/'+str(p.relative_to(root)),recursive=False)
 tar.add(manifest_path,arcname='SilentStation/package-manifest.json')
sha=hashlib.sha256(archive.read_bytes()).hexdigest()
(out/(name+'.tar.gz.sha256')).write_text(sha+'  '+archive.name+'\n')
print(json.dumps({'archive':str(archive),'sha256':sha,'snapshotId':manifest['snapshotId'],'files':len(paths)},ensure_ascii=False))
