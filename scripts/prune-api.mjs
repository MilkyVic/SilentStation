import fs from 'node:fs';
const p=JSON.parse(fs.readFileSync('package.json','utf8'));
const names=['@google/genai','dotenv','express','nodemailer','pg'];
p.dependencies=Object.fromEntries(names.map(n=>[n,p.dependencies[n]]));delete p.devDependencies;
p.scripts={'start:api':'node dist-server/server/auth-server.js','db:migrate':'node dist-server/server/migrate.js'};
fs.writeFileSync('package.json',JSON.stringify(p,null,2));
