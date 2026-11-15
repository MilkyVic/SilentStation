#!/usr/bin/env python3
"""Manual, fail-closed operator workflow. No installation, global context changes or shared cleanup."""
from pathlib import Path
import argparse,hashlib,json,os,secrets,shutil,socket,subprocess,sys,time
root=Path(__file__).resolve().parent.parent;state=root/'.acceptance'
def verify():
 m=json.loads((root/'package-manifest.json').read_text())
 for name,sha in m['files'].items():
  if Path(name).is_absolute() or '..' in Path(name).parts:raise RuntimeError('Unsafe manifest path.')
  p=root/name
  if p.is_symlink() or not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=sha:raise RuntimeError('Package verification failed: '+name)
 for p in root.rglob('*'):
  rel=p.relative_to(root)
  if any(x in {'node_modules','.acceptance','artifacts','dist','dist-demo','dist-server','__pycache__'} for x in rel.parts):continue
  if p.is_symlink() or (p.is_file() and str(rel) not in m['files'] and str(rel)!='package-manifest.json'):raise RuntimeError('Unexpected file in sealed package: '+str(rel))
 sid=hashlib.sha256(json.dumps(m['files'],sort_keys=True,separators=(',',':')).encode()).hexdigest()[:12]
 if sid!=m['snapshotId'] or m['realCollection'] is not False:raise RuntimeError('Invalid snapshot identity.')
 return m
manifest=verify();sid=manifest['snapshotId'];project='silentstation-acceptance-'+sid
base_images={'NODE_IMAGE':'node:22.23.5-alpine','PG_IMAGE':'postgres:16-alpine','WEB_IMAGE':'nginx:1.28-alpine','MAILPIT_IMAGE':'axllent/mailpit:v1.30.6','E2E_IMAGE':'mcr.microsoft.com/playwright:v1.56.1-noble'}
def env():
 e=os.environ.copy()
 # Project-specific values win; do not inherit another project's compose/env settings.
 for k in list(e):
  if k.startswith(('COMPOSE_','SS_')) or k in base_images:e.pop(k,None)
 e['SS_SNAPSHOT_ID']=sid
 e['COMPOSE_PARALLEL_LIMIT']='1'
 if (state/'images.json').exists():
  import re
  pins=json.loads((state/'images.json').read_text())
  if set(pins)!=set(base_images):raise RuntimeError('Unexpected image pin keys.')
  for k,v in pins.items():
   repo=base_images[k].rsplit(':',1)[0]
   aliases={repo} if '.' in repo.split('/')[0] else {repo,'docker.io/'+repo,'docker.io/library/'+repo}
   if not isinstance(v,str) or '@' not in v or v.split('@')[0] not in aliases or not re.fullmatch(r'sha256:[a-f0-9]{64}',v.split('@')[1]):raise RuntimeError('Image pin repository/digest mismatch.')
  e.update(pins)
 return e
def run(args,capture=False,check=True):
 p=subprocess.run(args,cwd=root,env=env(),text=True,stdout=subprocess.PIPE if capture else None,stderr=subprocess.PIPE if capture else None)
 if check and p.returncode:raise RuntimeError('Command failed: '+args[0]+' (no secret values are included).')
 return p.stdout.strip() if capture else p.returncode
def compose(args,capture=False,check=True):return run(['docker','compose','--project-name',project,'--file','compose.acceptance.yaml']+args,capture,check)
def preflight():
 if not shutil.which('docker'):raise RuntimeError('Docker is not available; no automatic installation.')
 endpoint=os.environ.get('DOCKER_HOST','')
 if endpoint and not endpoint.startswith(('unix://','npipe://','tcp://127.0.0.1:')):raise RuntimeError('Refuse a nonlocal Docker endpoint.')
 context=json.loads(run(['docker','context','inspect'],True))[0];host=context['Endpoints']['docker']['Host']
 if not endpoint and not host.startswith(('unix://','npipe://','tcp://127.0.0.1:')):raise RuntimeError('Run on the intended Docker machine; context will not be changed.')
 info=json.loads(run(['docker','info','--format','{{json .}}'],True));version=run(['docker','compose','version','--short'],True)
 nums=version.lstrip('v').split('.')
 if (int(nums[0]),int(nums[1]))<(2,24):raise RuntimeError('Docker Compose >=2.24 required.')
 if info.get('OSType')!='linux' or info.get('Architecture') not in ['x86_64','aarch64','amd64','arm64']:raise RuntimeError('Only Linux amd64/arm64 containers are supported.')
 if info.get('NCPU',0)<2 or info.get('MemTotal',0)<8*1024**3 or shutil.disk_usage(root).free<8*1024**3:raise RuntimeError('At least 2 CPUs, 8GiB engine RAM and 8GiB workspace disk required; confirm spare resources on shared host separately.')
 compose(['config','--quiet'])
 if not (state/'started').exists():
  s=socket.socket()
  try:s.bind(('127.0.0.1',8443))
  except OSError:raise RuntimeError('Port 8443 is busy; do not alter another project.')
  finally:s.close()
 print(json.dumps({'snapshotId':sid,'project':project,'architecture':info['Architecture'],'compose':version,'context':context['Name'],'realCollection':False}))
def initialized():
 if state.is_symlink() or (state/'private').is_symlink():raise RuntimeError('Private state must remain inside this package.')
 if not (state/'private').is_dir():raise RuntimeError('Run init explicitly first.')
 for name in ['database_url','auth_secret','cron_secret','db_password']:
  if (state/'private'/name).is_symlink():raise RuntimeError('Secret symlink refused.')
 u=(state/'private/database_url').read_text().strip()
 from urllib.parse import urlsplit
 p=urlsplit(u)
 if p.hostname!='db' or p.path!='/ss_test_'+sid:raise RuntimeError('Project database identity mismatch.')
def init():
 preflight()
 if not a.confirm_spare_resources:raise RuntimeError('Confirm at least 2 spare CPUs and 6GiB spare RAM with --confirm-spare-resources; never displace another project.')
 if state.exists():raise RuntimeError('State already exists. Do not overwrite secrets; use the existing snapshot or a NEW package.')
 for command in [['docker','ps','-aq'],['docker','volume','ls','-q'],['docker','network','ls','-q']]:
  if run(command+['--filter','label=com.docker.compose.project='+project],True):raise RuntimeError('Project resources already exist; refuse adoption.')
 state.mkdir(mode=0o700);private=state/'private';private.mkdir(mode=0o700)
 password=secrets.token_hex(32)
 values={'db_password':password,'database_url':f'postgresql://ss_owner:{password}@db:5432/ss_test_{sid}','auth_secret':secrets.token_hex(32),'cron_secret':secrets.token_hex(32)}
 for k,v in values.items():p=private/k;p.write_text(v);p.chmod(0o600)
 (state/'operator').mkdir(mode=0o700);print('Private project state initialized. No secrets printed.')
def build():
 initialized();preflight()
 if (state/'built').exists() or (state/'started').exists():raise RuntimeError('Immutable snapshot already built/started; never overwrite running image tags.')
 if not (state/'images.json').exists():
  pins={}
  for key,image in base_images.items():
   run(['docker','pull',image]);digests=json.loads(run(['docker','image','inspect',image,'--format','{{json .RepoDigests}}'],True))
   if not digests:raise RuntimeError('Base image has no reproducible registry digest.')
   pins[key]=digests[0]
  (state/'images.json').write_text(json.dumps(pins,indent=2))
 compose(['--profile','test','build'])
 ids={n:run(['docker','image','inspect',f'silentstation-{n}:{sid}','--format','{{.Id}}'],True) for n in ['api','web','tools','e2e','tls']}
 (state/'built-images.json').write_text(json.dumps(ids,indent=2));(state/'built').write_text(sid)
def ensure_images():
 expected=json.loads((state/'built-images.json').read_text())
 for n,sha in expected.items():
  if run(['docker','image','inspect',f'silentstation-{n}:{sid}','--format','{{.Id}}'],True)!=sha:raise RuntimeError('Built image changed; acceptance refused.')
 for service in ['api','web']:
  cid=compose(['ps','-q',service],True)
  if cid and run(['docker','inspect',cid,'--format','{{.Image}}'],True)!=expected[service]:raise RuntimeError('Running container differs from built snapshot.')
def up():
 initialized();preflight()
 if not (state/'built').exists():raise RuntimeError('Build first.')
 ensure_images()
 if (state/'started').exists():raise RuntimeError('Already started; use resume, not reinitialize/seed.')
 compose(['up','-d','web','maintenance']);(state/'started').write_text(sid);ready()
def ready():
 for i in range(60):
  if compose(['exec','-T','api','node','-e',"fetch('http://127.0.0.1:3001/api/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"],check=False)==0:return
  time.sleep(2)
 raise RuntimeError('Readiness failed; do not open preview.')
def inspect_state():return json.loads(compose(['run','--rm','--no-deps','fixtures','node','scripts/acceptance-state.mjs'],True))
def test_stack():
 initialized();ensure_images();ready();(state/'passed').unlink(missing_ok=True)
 compose(['run','--rm','--no-deps','core-tests']);compose(['run','--rm','--no-deps','e2e'])
 before=inspect_state();compose(['restart','api']);ready();after=inspect_state()
 if before!=after:raise RuntimeError('Restart changed fixture/schema/response counts.')
 (state/'result.json').write_text(json.dumps({'snapshotId':sid,'coreTests':'pass','e2e':'pass','restartPersistence':'pass','realCollection':False}))
 (state/'passed').write_text(sid);print('Acceptance gates passed; preview may now be opened.')
def copy_volume_file(service,source,dest):
 # Use a short-lived container only in this project's namespace, never a global volume lookup.
 cname=project+'-extract-'+secrets.token_hex(4)
 compose(['run','-d','--no-deps','--entrypoint','sh','--name',cname,service,'-c','sleep 120'])
 try:run(['docker','cp',cname+':'+source,str(dest)])
 finally:run(['docker','rm','-f',cname])
def preview():
 if not (state/'passed').exists():raise RuntimeError('Tests must pass before preview.')
 initialized();ensure_images();ready();copy_volume_file('fixtures','/private-operator/accounts.json',state/'operator/accounts.json');(state/'operator/accounts.json').chmod(0o600)
 copy_volume_file('fixtures','/run/ca/ca.crt',state/'operator/ca.crt')
 print('On your Mac: ssh -N -o ExitOnForwardFailure=yes -L 18443:127.0.0.1:8443 <your-existing-ssh-target>')
 print('Preview https://localhost:18443 ; test mail viewer /__test/mail/ ; private accounts are in .acceptance/operator/accounts.json. Do NOT send that file as evidence.')
 print('Use the CA with project-specific curl --cacert; do not install it globally. Manual browser certificate exceptions are only for this test origin; E2E verified the project CA without ignoring TLS errors.')
def evidence():
 if not (state/'passed').exists():raise RuntimeError('No passing gates to export.')
 initialized();ensure_images();ready()
 out=state/'evidence';out.mkdir(exist_ok=True,mode=0o700)
 report=json.loads((state/'result.json').read_text());report['baseImages']=json.loads((state/'images.json').read_text());report['images']={}
 for name in ['api','web','tools','e2e','tls']:
  report['images'][name]=json.loads(run(['docker','image','inspect',f'silentstation-{name}:{sid}','--format','{{json .Id}}'],True))
 # Export only metadata plus safe home screenshots, never test traces, messages or operator credentials.
 copy_volume_file('e2e','/evidence',out/'browser-private')
 for f in (out/'browser-private').rglob('*'):
  if f.is_file() and f.name.startswith('home-') and f.suffix=='.png':shutil.copy2(f,out/f.name)
 shutil.rmtree(out/'browser-private')
 (out/'acceptance.json').write_text(json.dumps(report,indent=2));print('Send only .acceptance/evidence/ (metadata + empty homepage screenshots).')
p=argparse.ArgumentParser();p.add_argument('command',choices=['verify','preflight','init','build','up','test','preview','evidence','stop','resume']);p.add_argument('--confirm-spare-resources',action='store_true');a=p.parse_args()
try:
 if a.command=='verify':print(json.dumps({'verified':True,'snapshotId':sid}))
 elif a.command=='preflight':preflight()
 elif a.command=='init':init()
 elif a.command=='build':build()
 elif a.command=='up':up()
 elif a.command=='test':test_stack()
 elif a.command=='preview':preview()
 elif a.command=='evidence':evidence()
 elif a.command=='stop':initialized();compose(['stop','web','api','maintenance','mailpit','db']);print('Stopped only this project. All volumes retained.')
 elif a.command=='resume':initialized();ensure_images();compose(['start','db','mailpit','api','web','maintenance']);ready()
except Exception as e:print('STOP: '+str(e),file=sys.stderr);sys.exit(1)
