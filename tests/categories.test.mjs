import test from 'node:test';
import assert from 'node:assert/strict';
import {categories} from '../content/categories.mjs';
import {categoryStorageKey,selectCategory,validateCategories,recordBelongsToCategory,categoryUrl} from '../web/category-core.js';
test('金融分类沿用原记录键和旧课数据，未知分类不冒充金融',()=>{
 assert.equal(validateCategories(categories),true);
 const finance=selectCategory(categories,'finance');assert.equal(finance.name,'金融学习卡片');
 assert.equal(categoryStorageKey(finance),'1452xuexi-v1');assert.equal(finance.dataUrl,'data.json');
 assert.equal(selectCategory(categories,'unknown'),null);
});
test('新领域独立记录；旧导出仅可在金融恢复，跨分类导入被拒绝',()=>{
 const finance=categories[0],other={id:'history',name:'历史学习卡片',status:'active',dataUrl:'categories/history.json'};
 assert.equal(validateCategories([...categories,other]),true);
 assert.notEqual(categoryStorageKey(finance),categoryStorageKey(other));
 assert.equal(recordBelongsToCategory({},finance),true);assert.equal(recordBelongsToCategory({},other),false);
 assert.equal(recordBelongsToCategory({categoryId:'history'},finance),false);
 assert.equal(recordBelongsToCategory({categoryId:'history'},other),true);
});
test('稳定ID、课程路径和存储空间不得重复，分类路由明确',()=>{
 assert.throws(()=>validateCategories([...categories,{...categories[0]}]));
 assert.throws(()=>validateCategories([...categories,{...categories[0],id:'other'}]));
 assert.throws(()=>validateCategories([...categories,{...categories[0],id:'other',storageKey:'different-key'}]));
 assert.throws(()=>validateCategories([{...categories[0],dataUrl:'../private.json'}]));
 assert.equal(categoryUrl('finance'),'?category=finance&view=home');
});
