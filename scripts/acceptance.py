#!/usr/bin/env python3
"""Native sealed-package verifier/preflight. Never installs, seeds, migrates or alters host services."""
from pathlib import Path
import argparse,hashlib,json,shutil,subprocess,sys
root=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser();p.add_argument('command',choices=['verify','preflight']);args=p.parse_args()
m=json.loads((root/'package-manifest.json').read_text())
if m.get('format')!=2 or m.get('target')!='native-vercel-neon' or m.get('realCollection') is not False or m.get('schedulerEnabled') is not False:raise RuntimeError('Unsupported/historical package; refusing execution.')
for name,h in m['files'].items():
 relative=Path(name);f=root/relative
 if relative.is_absolute() or '..' in relative.parts or f.is_symlink() or not f.is_file() or hashlib.sha256(f.read_bytes()).hexdigest()!=h:raise RuntimeError('Package verification failed.')
for f in root.rglob('*'):
 relative=f.relative_to(root)
 if any(x in {'node_modules','.acceptance','artifacts','dist','dist-demo','dist-server','__pycache__'} for x in relative.parts):continue
 if f.is_symlink() or f.is_file() and str(relative) not in m['files'] and str(relative)!='package-manifest.json':raise RuntimeError('Unexpected unsealed file.')
sid=hashlib.sha256(json.dumps(m['files'],sort_keys=True,separators=(',',':')).encode()).hexdigest()[:12]
if sid!=m['snapshotId']:raise RuntimeError('Snapshot mismatch.')
if args.command=='preflight':
 import os
 pg=Path(os.environ.get('PG_BIN','/opt/homebrew/opt/postgresql@16/bin'))
 if not all((pg/n).is_file() for n in ['pg_ctl','psql','createdb','initdb']) or not shutil.which('openssl') or not shutil.which('node'):raise RuntimeError('Node22, PostgreSQL16 and OpenSSL must already be installed; no automatic host changes.')
 version=subprocess.check_output(['node','--version'],text=True).strip()
 if not version.startswith('v22.'):raise RuntimeError('Node22 required.')
 print(json.dumps({'snapshotId':sid,'node':version,'preflight':'pass','cloud':'pending'}))
else:print(json.dumps({'snapshotId':sid,'files':len(m['files']),'verification':'pass'}))
