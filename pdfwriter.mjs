// Tiny dependency-free PDF serializer. Rasterized layout + searchable field-text overlay.
const enc = new TextEncoder();
const ascii = s => enc.encode(s);
const concat = parts => {
  const len=parts.reduce((n,a)=>n+a.length,0), out=new Uint8Array(len);
  let off=0; for (const p of parts){out.set(p,off);off+=p.length;} return out;
};
const binFromDataURL=(url)=>{
  let src=url.slice(url.indexOf(',')+1), str=atob(src), data=new Uint8Array(str.length);
  for(let i=0;i<str.length;i++)data[i]=str.charCodeAt(i);
  return data;
};
function pdfLiteral(str){ return String(str).replace(/[^\x20-\x7E]/g,' ').replace(/[\\()]/g,c=>'\\'+c); }
export function jpegPDF(pages,{documentTitle='Unsigned tenancy agreement'}={}) {
  // Page metadata text is invisible but extractable by PDF readers. The visual
  // content is deliberately flattened for layout fidelity and no dependencies.
  if(pages.length!==12) throw new Error('Expected exactly 12 tenancy pages.');
  const objects=[]; const add=(data)=>{objects.push(typeof data==='string'?ascii(data):data);return objects.length;};
  const catalog=add(''), pagesObj=add(''), font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>');
  const pageRefs=[];
  for(const {jpeg,width,height,searchable=[]} of pages){
    const raw=binFromDataURL(jpeg), imageObj=add(concat([ascii(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${raw.length} >>\nstream\n`),raw,ascii('\nendstream')]));
    let content=`q\n595.44 0 0 841.68 0 0 cm\n/Im Do\nQ\n`;
    // Invisible text (Tr=3) makes generated details searchable without double rendering.
    for(const row of searchable){
      if(!row.value) continue;
      const text=pdfLiteral(row.value);
      const x=Number(row.x||80), y=841.68-Number(row.y||80);
      content+=`BT /F1 9 Tf 3 Tr 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${text}) Tj ET\n`;
    }
    const stream=ascii(content);
    const contents=add(concat([ascii(`<< /Length ${stream.length} >>\nstream\n`),stream,ascii('endstream')]));
    const page=add(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 595.44 841.68] /Resources << /Font << /F1 ${font} 0 R >> /XObject << /Im ${imageObj} 0 R >> >> /Contents ${contents} 0 R >>`);
    pageRefs.push(page);
  }
  objects[pagesObj-1]=ascii(`<< /Type /Pages /Kids [${pageRefs.map(n=>n+' 0 R').join(' ')}] /Count ${pageRefs.length} >>`);
  objects[catalog-1]=ascii(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);
  const info=add(`<< /Title (${pdfLiteral(documentTitle)}) /Creator (RentHouse GJX offline PDF generator) /Author () >>`);
  const parts=[ascii('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')], offsets=[0];
  let total=parts[0].length;
  for(let i=0;i<objects.length;i++){
    offsets.push(total); const b=concat([ascii(`${i+1} 0 obj\n`),objects[i],ascii('\nendobj\n')]);parts.push(b);total+=b.length;
  }
  const startxref=total;
  let xref=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
  for(const off of offsets.slice(1))xref+=`${String(off).padStart(10,'0')} 00000 n \n`;
  xref+=`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  parts.push(ascii(xref));
  return new Blob([concat(parts)],{type:'application/pdf'});
}
