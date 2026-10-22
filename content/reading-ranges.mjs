// Coordinates only. Selected original text is fetched from the private Notion library.
import generatedPlan from './reading-plan.json' with {type:'json'};
const firstWeekRanges={
 1:[{bookId:'duan',start:266,end:278,label:'《投资的本质》第二章：买股票就是买公司',prompt:'圈出“公司”“价值”“股价”。哪些句子是编者解释，哪些明确使用了引号？不要把编者的概括当作本人逐字原话。'},{bookId:'graham',start:3522,end:3525,label:'《格雷厄姆精选集》第1讲：调查事实与评估价值',prompt:'作者给分析师安排了哪些角色？用面包店例子各举一个调查任务和一个评估任务。'}],
 2:[{bookId:'elder',start:34,end:79,label:'《以交易为生》导论：交易需要哪些工作',prompt:'找出情绪、系统、资金管理和记录之间的关系。书里的历史佣金数字不直接当现行费率。'},{bookId:'graham',start:474,end:480,label:'《格雷厄姆精选集》第3章：新型股票投机',prompt:'划出作者讨论投机时的语境；本课对投资与交易的区分是教学整理，不是替作者重新下定义。'}],
 3:[{bookId:'buffett',start:8464,end:8495,label:'1977年度股东信开头：每股盈利与投入资本',prompt:'为什么每股盈利创新高不必然代表经营表现更好？把历史数值和本课虚构例题分开。'},{bookId:'duan',start:270,end:278,label:'《投资的本质》第二章：从企业成果看股票',prompt:'把“拥有企业的一份”与每股成果联系起来。'}],
 4:[{bookId:'marks',start:653,end:662,label:'《周期》第8章：风险态度周期',prompt:'摘出作者对风险和未来不确定性的解释，再写出你自己的表述。'},{bookId:'graham',start:528,end:546,label:'《格雷厄姆精选集》第4章：股市警告',prompt:'留意成文年代；不要把当年的市场判断当作今天的交易信号。'}],
 5:[{bookId:'duan',start:266,end:278,label:'企业视角重读：用面包店案例对照',prompt:'读一句，就在案例上写一个问题；不要只抄结论。'},{bookId:'buffett',start:8474,end:8482,label:'1977年度股东信：利润与资本',prompt:'甲乙店若使用的资本不同，应如何避免只比较利润金额？'}],
 6:[{bookId:'graham',start:3522,end:3525,label:'调查员与评估师：四栏研究卡',prompt:'把已知事实、判断和取证任务分别列出。'},{bookId:'elder',start:78,end:91,label:'《以交易为生》导论：成本与交易',prompt:'从成本讨论中提炼事前记录的必要性；旧佣金案例只用于理解机制。'}],
 7:[{bookId:'duan',start:270,end:273,label:'企业所有权视角：闭卷后再读',prompt:'先复述，后核对原文。记录自己漏掉的条件。'},{bookId:'marks',start:657,end:660,label:'风险来自不确定未来：纠错定位',prompt:'解释为什么短期涨跌不能单独证明决策对错。'}]
};
export const readingRanges={...generatedPlan,...firstWeekRanges};
