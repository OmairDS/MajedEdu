import {execFileSync} from 'node:child_process';
import {access} from 'node:fs/promises';
for(const f of ['public/app.js','api/app.js','lib/domain.mjs','lib/store.mjs','server.mjs'])execFileSync(process.execPath,['--check',f],{stdio:'inherit'});
for(const f of ['public/index.html','public/style.css','public/brand.png','public/favicon.svg'])await access(f);
console.log('Source syntax and required assets OK. Static frontend ready.');
