import { qrMatrix } from '../docs/js/qr.mjs';
import { writeFileSync } from 'node:fs';
const samples=['https://vulkan-spirit-quiz.netlify.app/?room=AB2CD3','HELLO','https://example.org/'+'x'.repeat(150),'Grüße aus Wien 🖖 '+'y'.repeat(60),'https://a.b/?room=ZZZZZZ&team=1&screen=1'+'z'.repeat(250)];
const out=samples.map(t=>({t,m:qrMatrix(t)}));
writeFileSync('/tmp/qr.json',JSON.stringify(out));
console.log(out.map(o=>o.m.length).join(','));
