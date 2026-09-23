/* Optional publication helper: node configurar-dominio.cjs https://your-domain.example */
const fs = require('fs');
const path = require('path');
const value = process.argv[2];
if (!value) { console.error('Informe a URL pública: node configurar-dominio.cjs https://seu-dominio.com.br'); process.exit(1); }
const url = new URL(value);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Use uma URL pública HTTPS, sem senha, parâmetros ou fragmento.');
const base = url.href.replace(/\/+$/,'')+'/';
const escape = s => s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const file = path.join(__dirname,'index.html');
let html = fs.readFileSync(file,'utf8').replace(/\s*<!-- PUBLICATION START -->[\s\S]*?<!-- PUBLICATION END -->/,'');
const image = new URL('img/social-preview.png',base).href;
const meta = `\n    <!-- PUBLICATION START -->\n    <link rel="canonical" href="${escape(base)}">\n    <meta property="og:url" content="${escape(base)}">\n    <meta property="og:image" content="${escape(image)}">\n    <meta property="og:image:alt" content="Site.on: sites personalizados e três projetos em destaque.">\n    <meta name="twitter:image" content="${escape(image)}">\n    <!-- PUBLICATION END -->\n`;
html = html.replace('</head>',meta+'  </head>');
html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,start,body,end)=>{
  const data=JSON.parse(body);data.url=base;data.logo=new URL('img/logo.webp',base).href;
  return start+'\n'+JSON.stringify(data,null,2).replace(/</g,'\\u003c')+'\n'+end;
});
fs.writeFileSync(file,html);
fs.writeFileSync(path.join(__dirname,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(base)}</loc></url></urlset>\n`);
fs.writeFileSync(path.join(__dirname,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml',base).href}\n`);
console.log('Domínio, imagem de compartilhamento, sitemap e robots configurados para '+base);
