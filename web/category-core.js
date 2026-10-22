export const categoryStorageKey=c=>c.storageKey||'1452xuexi-category-'+c.id+'-v1';
export function selectCategory(categories,id='finance'){
 return categories.find(c=>c.id===id&&c.status==='active')||null;
}
export function validateCategories(categories){
 const ids=new Set(),keys=new Set(),paths=new Set();
 for(const c of categories){
  if(!/^[a-z][a-z0-9-]*$/.test(c.id)||ids.has(c.id))throw Error('分类ID无效或重复');
  if(!c.name||!c.dataUrl||!/^[-a-z0-9/]+\.json$/.test(c.dataUrl))throw Error('分类名称或课程数据路径无效');
  if(paths.has(c.dataUrl))throw Error('不同分类不得覆盖同一课程数据路径');
  const key=categoryStorageKey(c);if(keys.has(key))throw Error('分类学习记录不得共用存储键');
  ids.add(c.id);keys.add(key);paths.add(c.dataUrl);
 }
 return true;
}
export function recordBelongsToCategory(record,category){
 // Old exports had no category field; they belong ONLY to the legacy finance course.
 return record.categoryId?record.categoryId===category.id:category.id==='finance';
}
export function categoryUrl(id,view='home'){return '?category='+encodeURIComponent(id)+'&view='+encodeURIComponent(view)}
export function categoryExportPaths(id){const prefix=id==='finance'?'':'downloads/'+id+'/';return {courseIndexUrl:prefix+'课程总表.csv',coverageIndexUrl:prefix+'章节覆盖表.csv'}}
