# 把八本书读成一套方法

八本投资、财报、认知与交易书籍的联合学习工程。公开内容是原创教学转述；**不含原书全文、私人笔记或凭据，也不是投资建议**。

## 当前状态

- 8 本本地文件已识别，24 周／168 学习日结构已建立；每天约 30—45 分钟的目标仍需通过真实试学验证。
- 96 张新课概念卡、24 个案例、24 天练习、24 天复盘生成 168 天课程。概念卡与案例是原创提炼，不替代逐章通读；全书逐章覆盖和出处精确校对仍在进行。
- 手机网页支持课程、24 周计划、六条主线、书籍、搜索、图解、自测展开、深浅主题、字号、本机完成与记录导出。
- Notion 自动推送程序和回归测试已写；**尚未启用**。需为目标“学习日记”页面授予集成权限，并把独立 Notion API token 设为 GitHub Secret，实测后才打开开关。

## 本地运行

需要 Node.js 22。运行 `npm ci`、`npm run check`、`npm test`、`npm run build`、`npm run dev`，打开 `http://127.0.0.1:4188/`。`dist/` 为生成目录，可重建。

## 云端配置

GitHub Pages 使用 `.github/workflows/pages.yml` 从 `main` 发布。Notion 推送使用 `daily-notion.yml`，北京时间 07:07、07:37、08:17 补检，可能受 GitHub 调度延迟影响。设置仓库 Secret `NOTION_TOKEN`、`NOTION_PARENT_ID`，其中父页 ID 为 `4006d16937f780fbba67d661de18e0c7`。完成授权和首次回读测试后，再将仓库 Variable `ENABLE_NOTION_PUSH` 设为 `true`；此前不会推送。手动补发使用 Actions 的 `workflow_dispatch`，相同课程不会重复创建。

Notion 页面中“已完成”勾选决定云端进度；网页本机完成只帮助个人学习。当天完成要到下一北京时间日期才推进。GitHub Actions 定时任务可能被平台延迟或停用，`heartbeat.yml` 每周更新公开的工作流心跳文件以减少长期无活动风险，但仍需定期检查 Actions 状态。

## 内容原则

按“认知与概率—财报—竞争与成长—价值估值—周期—交易风险”六线组织。长期投资与交易分开论证。财报案例的税率、披露要求以现行监管材料核对；历史书中规则不直接当现行规则。阅读章节仅为当前对照定位，部分电子书有 OCR 错字，重要引述请查原页。

书目元数据与补充原始资料见 `content/books.mjs`，周安排见 `content/weeks.mjs`，概念卡见 `content/cards.mjs`，课程生成见 `content/curriculum.mjs`。
