import sys,zipfile,hashlib
from pathlib import Path
import pymupdf
a,b=map(Path,sys.argv[1:3])
if a.suffix=='.pdf':
    x,y=pymupdf.open(a),pymupdf.open(b)
    assert len(x)==len(y)
    for p,q in zip(x,y):
        assert p.get_text()==q.get_text()
        assert p.rect==q.rect
        assert [x.xref_stream(i) for i in p.get_contents()]==[y.xref_stream(i) for i in q.get_contents()]
        assert [hashlib.sha256(x.extract_image(i[0])['image']).hexdigest() for i in p.get_images()]==[hashlib.sha256(y.extract_image(i[0])['image']).hexdigest() for i in q.get_images()]
    for i in {0,len(x)//2,len(x)-1}:assert x[i].get_pixmap().samples==y[i].get_pixmap().samples
elif a.suffix in {'.epub','.zip'}:
    x,y=zipfile.ZipFile(a),zipfile.ZipFile(b)
    assert sorted(x.namelist())==sorted(y.namelist())
    for n in x.namelist():assert x.read(n)==y.read(n),n
else:raise ValueError('Unsupported container')
print('container-content-exact')
