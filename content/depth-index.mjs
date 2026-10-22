import {foundationRows} from './depth-foundations.mjs';
import {financeRows} from './depth-finance.mjs';
import {businessRows} from './depth-business.mjs';
import {valuationRows} from './depth-valuation.mjs';
import {marketRows} from './depth-market.mjs';
import {researchRows} from './depth-research.mjs';
export const depthRows={...foundationRows,...financeRows,...businessRows,...valuationRows,...marketRows,...researchRows};
// Match the actual local edition: owner earnings also links to the official 1986 appendix.
const sourceOverrides={
 '3:1':{chapterId:'kahneman-c24',focus:'成功'},
 '6:1':{chapterId:'tang-c4',focus:'现金'},
 '6:2':{chapterId:'tang-c2',focus:'折旧'},
 '17:1':{chapterId:'marks-c11',focus:'建设'}
};
export const depth=Object.fromEntries(Object.entries(depthRows).map(([week,rows])=>[week,rows.map((row,i)=>{
 const [source,teach,workedQ,workedA,boundaryQ,boundaryA,evidence,transfer]=row.split('|');
 if(!transfer||row.split('|').length!==8)throw Error('Incomplete depth module '+week+'-'+i);
 const [chapterId,focus]=source.split(';');
 return {chapterId,focus,teach,workedQ,workedA,boundaryQ,boundaryA,evidence,transfer,...sourceOverrides[week+':'+i]};
})]));
