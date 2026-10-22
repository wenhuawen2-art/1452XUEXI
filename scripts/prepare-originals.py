"""Private, lossless visual companions; never place output in the public tree."""
from pathlib import Path
import json, zipfile, math, posixpath, re
import pymupdf
from lxml import etree
root=Path(__file__).resolve().parents[2]
out=root/'.codex-reading'/'original-attachments'
out.mkdir(parents=True,exist_ok=True)
files=[]
pdf=next((root/'书籍').glob('《巴菲特*.pdf'))
source=pymupdf.open(pdf)
for i in range(10):
    start=i*91; end=min((i+1)*91,len(source))
    doc=pymupdf.open();doc.insert_pdf(source,from_page=start,to_page=end-1)
    target=out/f'buffett-original-p{start+1:03}-{end:03}.pdf'
    doc.save(target,garbage=4,deflate=True)
    assert target.stat().st_size<5*1024**2
    check=pymupdf.open(target)
    assert len(check)==end-start
    for j in [0,len(check)-1]:
        assert check[j].get_pixmap(matrix=pymupdf.Matrix(.5,.5)).samples==source[start+j].get_pixmap(matrix=pymupdf.Matrix(.5,.5)).samples
    if i==0:check[1].get_pixmap().save(out/'visual-check.png')
    files.append(dict(bookId='buffett',path=str(target),label=f'原版PDF 第{start+1}—{end}页（完整图表）',mime='application/pdf'))
elder=next((root/'书籍').glob('以交易*.epub'))
z=zipfile.ZipFile(elder)
container=etree.fromstring(z.read('META-INF/container.xml'))
opfpath=container.xpath('//*[local-name()="rootfile"]/@full-path')[0]
base=posixpath.dirname(opfpath);opf=etree.fromstring(z.read(opfpath))
manifest={e.get('id'):e for e in opf.xpath('//*[local-name()="manifest"]/*')}
spine=opf.xpath('//*[local-name()="spine"]/*')
# Four valid EPUBs with original chapter markup, images and styles, no raster recompression.
image_union=set()
for part in range(4):
    selected=spine[math.floor(part*len(spine)/4):math.floor((part+1)*len(spine)/4)]
    paths={posixpath.normpath(posixpath.join(base,manifest[e.get('idref')].get('href'))) for e in selected}
    paths.update(n for n in z.namelist() if n.endswith(('.css','.ncx')))
    todo=list(paths)
    while todo:
        name=todo.pop()
        if name not in z.namelist():continue
        raw=z.read(name)
        if not name.endswith(('.xhtml','.html','.htm','.css','.ncx')):continue
        refs=re.findall(r'''(?:src|href)\s*=\s*["']([^"']+)|url\(["']?([^)'"\s]+)''',raw.decode('utf8','ignore'))
        for pair in refs:
            ref=(pair[0] or pair[1]).split('#')[0]
            if not ref or ':' in ref:continue
            p=posixpath.normpath(posixpath.join(posixpath.dirname(name),ref))
            # NCX TOC references do not drag every chapter into every volume.
            if name.endswith('.ncx') and p.endswith(('.xhtml','.html','.htm')):continue
            if p in z.namelist() and p not in paths:paths.add(p);todo.append(p)
    tree=etree.fromstring(z.read(opfpath))
    s=tree.xpath('//*[local-name()="spine"]')[0]
    for e in list(s):s.remove(e)
    for e in selected:s.append(etree.fromstring(etree.tostring(e)))
    m=tree.xpath('//*[local-name()="manifest"]')[0]
    for e in list(m):
        if posixpath.normpath(posixpath.join(base,e.get('href'))) not in paths:m.remove(e)
    # Rewrite NCX navigation to the selected original chapter titles only.
    for name in list(paths):
        if name.endswith('.ncx'):
            ncx=etree.fromstring(z.read(name));nav=ncx.xpath('//*[local-name()="navMap"]')
            if nav:
                for point in list(nav[0]):
                    dest=point.xpath('.//*[local-name()="content"]/@src')
                    if dest and posixpath.normpath(posixpath.join(posixpath.dirname(name),dest[0].split('#')[0])) not in paths:nav[0].remove(point)
            ncxbytes=etree.tostring(ncx,xml_declaration=True,encoding='utf-8')
    target=out/f'elder-original-part{part+1}.epub'
    with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED) as w:
        w.writestr('mimetype','application/epub+zip',compress_type=zipfile.ZIP_STORED)
        w.writestr('META-INF/container.xml',z.read('META-INF/container.xml'))
        w.writestr(opfpath,etree.tostring(tree,xml_declaration=True,encoding='utf-8'))
        for name in sorted(paths):w.writestr(name,ncxbytes if name.endswith('.ncx') else z.read(name))
    assert target.stat().st_size<5*1024**2
    image_union.update(n for n in paths if '/Images/' in n)
    files.append(dict(bookId='elder',path=str(target),label=f'原版图文EPUB 分册{part+1}/4（原文顺序）',mime='application/epub+zip'))
# Preserve orphaned illustrations as an extra attachment if any.
missing=[n for n in z.namelist() if '/Images/' in n and not n.endswith('/') and n not in image_union]
if missing:
    target=out/'elder-additional-images.zip'
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as w:
        for n in missing:w.writestr(n,z.read(n))
    assert target.stat().st_size<5*1024**2
    files.append(dict(bookId='elder',path=str(target),label='原文件附加图像（未被章节引用）',mime='application/zip'))
mapping={'段永平':'duan','格雷厄姆':'graham','手把手':'tang','思考':'kahneman','怎样':'fisher','周期':'marks'}
for prefix,id in mapping.items():
    f=next((root/'书籍').glob(prefix+'*'))
    if f.suffix=='.mobi':
        target=out/'kahneman-original-mobi.zip'
        with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as w:w.write(f,arcname=f.name)
        files.append(dict(bookId=id,path=str(target),label='原始MOBI电子书（压缩附件，解压后阅读，保留原图）',mime='application/zip'))
        continue
    files.append(dict(bookId=id,path=str(f),label='原始电子书（含原图，需电子书阅读器）',mime='application/epub+zip' if f.suffix=='.epub' else 'application/x-mobipocket-ebook'))
(out/'manifest.json').write_text(json.dumps(files,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'attachments':len(files),'pdfPagesVerified':len(source),'epubSpineItems':len(spine),'additionalImages':len(missing),'maxBytes':max(Path(f['path']).stat().st_size for f in files)}))
