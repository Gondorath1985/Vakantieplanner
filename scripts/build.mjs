import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sources=['regional-heritage.mjs','heritage-notes.mjs','seed-profiles.mjs','expanded-profiles.mjs','heritage-data.mjs','climate-data.mjs','geography.mjs','transport.mjs','catalog-model.mjs','data.mjs','search.mjs','state.mjs','app.mjs','update.mjs'];
const content=Object.fromEntries(await Promise.all([...sources,'style.css','index.template.html'].map(async name=>[name,await readFile(path.join(root,name),'utf8')])));
const hash=text=>createHash('sha256').update(text).digest('hex').slice(0,12);
const version=hash(Object.entries(content).map(([name,text])=>name+'\n'+text).join('\n'));
await mkdir(path.join(root,'assets'),{recursive:true});const compiled=new Map();
async function compile(name){
 if(compiled.has(name))return compiled.get(name);
 let text=content[name];const dependencies=[...text.matchAll(/(['"])\.\/([\w-]+\.mjs)\1/g)].map(m=>m[2]);
 for(const dep of new Set(dependencies)){if(!content[dep])throw new Error('Unknown dependency: '+dep);const filename=await compile(dep);text=text.replaceAll('./'+dep,'./'+filename);}
 const filename=name.replace('.mjs','.'+hash(text)+'.mjs');await writeFile(path.join(root,'assets',filename),text);compiled.set(name,filename);return filename;
}
for(const source of sources)await compile(source);
const css='style.'+hash(content['style.css'])+'.css';await writeFile(path.join(root,'assets',css),content['style.css']);
const geo=await readFile(path.join(root,'geographic-index.json'),'utf8');const geoFile='geographic-index.'+hash(geo)+'.json';await writeFile(path.join(root,'assets',geoFile),geo);
const html=content['index.template.html'].replace('<head>','<head><meta name="geographic-index" content="assets/'+geoFile+'"><meta name="app-version" content="'+version+'">').replace('href="style.css"','href="assets/'+css+'"').replace('src="app.mjs"','src="assets/'+compiled.get('app.mjs')+'"').replace('src="update.mjs"','src="assets/'+compiled.get('update.mjs')+'"');
await writeFile(path.join(root,'index.html'),html);await writeFile(path.join(root,'version.json'),JSON.stringify({version})+'\n');
await writeFile(path.join(root,'build-manifest.json'),JSON.stringify({version,files:[...compiled.values().map(name=>'assets/'+name),'assets/'+css,'assets/'+geoFile]},null,2)+'\n');
console.log('Built release '+version+' ('+compiled.size+' modules, content-hashed assets).');
