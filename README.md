# 把八本书读成一套方法

八本投资、财报、认知与交易书籍的联合学习工程。公开内容是原创教学转述；**不含原书全文、私人笔记或凭据，也不是投资建议**。

## 当前状态

- 8 本本地文件已识别，24 周／168 学习日结构已建立；每天约 30—45 分钟的目标仍需通过真实试学验证。
- 96 张新课概念卡、24 个案例、24 天练习、24 天复盘生成 168 天课程。概念卡与案例是原创提炼，不替代逐章通读；全书逐章覆盖和出处精确校对仍在进行。
- 首周七天现有定向原书阅读、约40分钟时间分配、分层讲解、每课8道自测、可评分作业；但真实学习时长仍需试学验证。第2—24周仍是提纲，尚未达到正式课程标准，推送程序会在第8天主动停止。
- 八本原书已同步到新父页面下的 Notion 私有“原文书库”，共120个分卷，逐卷回读校验文字。网页书籍页和课程页链接到对应私有原文；原文全文不进入公开仓库。电脑另有私有离线检索器。
- 手机网页支持课程、24 周计划、六条主线、书籍、搜索、图解、自测展开、深浅主题、字号、本机完成与记录导出。
- 新的 Notion 父页权限已验证，凭据已设为 GitHub Secrets，首日试学页已创建并回读。试学页含两段原文、图解、讲解、8题及练习，重复运行复用原页。**定时推送尚未启用**，正式开课日期仍待全课程内容验收。

## 本地运行

需要 Node.js 22。运行 `npm ci`、`npm run check`、`npm test`、`npm run build`、`npm run dev`，打开 `http://127.0.0.1:4188/`。`dist/` 为生成目录，可重建。

私有原文由 `node scripts/build-private-library.mjs` 生成到 `D:\个人创意\学习\.codex-reading\reader`。其中 `我的八本书原文书库-离线版.html` 为完整单文件，可复制到自己的手机并离线打开。电脑临时预览可用 `npm run dev:private`，地址 `http://127.0.0.1:4199/`，仅绑定本机；它不是全天在线的手机云端书库。`node scripts/build-chapter-index.mjs` 仅将公开安全的章节标题和定位行号整理进仓库。PDF 提取与 OCR 可能有误，以原始文件核对。

## 云端配置

GitHub Pages 使用 `.github/workflows/pages.yml` 从 `main` 发布。Notion 推送使用 `daily-notion.yml`，北京时间 07:07、07:37、08:17 补检，可能受 GitHub 调度延迟影响。仓库 Secrets 为 `NOTION_TOKEN`、`NOTION_PARENT_ID`，新父页 ID 为 `400e722b7e15802d9111decadde03688`。仓库变量 `ENABLE_NOTION_PUSH=false`；内容审核通过后才启用。

Actions 手动模式 `check` 仅验证访问，`sample` 创建或复用试学D001，不计入正式课程进度；`push` 和定时任务受启用变量与逐课 `publishReady` 双重控制。正式页面采用 `日期｜第001天｜书籍｜知识名称`，试学页面明确标为试学，不提前确定第1天日期。

Notion 页面中“已完成”勾选决定云端进度；网页本机完成只帮助个人学习。当天完成要到下一北京时间日期才推进。GitHub Actions 定时任务可能被平台延迟或停用，`heartbeat.yml` 每周更新公开的工作流心跳文件以减少长期无活动风险，但仍需定期检查 Actions 状态。**首周外内容未完成，保持推送关闭**。

本机调试凭据存于被忽略的 `.local/notion-token.dpapi`，由当前Windows用户的DPAPI加密；云端只读GitHub Secrets。`scripts/configure-notion.mjs` 从环境变量读令牌并加密配置，不将令牌写入源码。原文同步用 `node scripts/sync-private-library.mjs`；云端推送从Notion私有书库读取节选，不依赖本地电脑开机。公开 `content/book-source-links.json` 仅含原文页链接和定位范围，不含原文与学习笔记。

## 内容原则

按“认知与概率—财报—竞争与成长—价值估值—周期—交易风险”六线组织。长期投资与交易分开论证。财报案例的税率、披露要求以现行监管材料核对；历史书中规则不直接当现行规则。阅读章节仅为当前对照定位，部分电子书有 OCR 错字，重要引述请查原页。

书目元数据与补充原始资料见 `content/books.mjs`，周安排见 `content/weeks.mjs`，概念卡见 `content/cards.mjs`，课程生成见 `content/curriculum.mjs`。
覆盖与待办审计见 `docs/coverage-audit.md`。
