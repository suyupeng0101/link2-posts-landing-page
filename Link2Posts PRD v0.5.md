# Link2Posts PRD v0.5（完整需求文档｜Phase 1：YouTube → Posts & SEO + 最小多语种 + 最小计费）

> 产品定位：面向 **YouTuber / 主播 / 直播回放创作者** 的 B2C Web SaaS
> 核心价值：将 **YouTube 链接** 一键生成 **可直接发布** 的内容分发资产包（X + YouTube SEO），并提供 **时间戳溯源**
> 部署栈：**Vercel（Next.js） + Supabase（Auth/DB） + Cloudflare（Workers/Queues/Turnstile，可选 R2） + Creem（充值/credits）**
> 核心原则：**强制登录后才能生成**；**字幕优先**；**结构化输出**；**低成本可验证**

------

## 0. 文档信息

- 文档版本：v0.5
- 产品版本：MVP v0.5（Phase 1）
- 目标：以最低成本跑通 **登录 → 生成 → 复制/导出 → 充值 → 再生成** 闭环，并验证需求（是否真正用于发布分发内容）
- v0.5 相对 v0.4/0.4.1 主要新增/完善：
  1. **最小多语种支持**（Auto/English/简体中文/西班牙语）
  2. **字幕轨选择策略 + ASR 自动语言识别最小实现**
  3. **最小计费（credits + Creem）**：控制成本、支持出海收款
  4. 完整补齐：页面/流程、数据模型、API、风控、QA、里程碑与风险

------

## 1. 背景与机会

### 1.1 背景

创作者发布 YouTube 长视频或直播回放后，需要进行二次分发与 SEO 配置：

- YouTube SEO：标题、描述、章节、标签
- X 宣发：thread、单条推文/帖子、金句总结
  这些工作重复、耗时，并且直接影响流量与点击率。

### 1.2 机会

市面上大量工具停留在“视频转文字/转录”的基础层。
Link2Posts 把“转录”作为基础能力，往上提供 **平台格式化的发布资产包**，并通过 **时间戳溯源**提升可信度与可执行性。

------

## 2. 产品定位

### 2.1 一句话价值主张（Homepage Hero）

**Turn any YouTube video into publish-ready X threads + YouTube SEO in minutes.**

### 2.2 目标用户（Phase 1 只聚焦）

- 教程类 YouTuber（AI/编程/工具/教育）
- 访谈/播客视频化频道
- 直播回放创作者（先不做剪辑，只做文案与章节）

### 2.3 非目标用户（Phase 1 不优先）

- 只想自动剪辑/自动出片的人
- 企业级团队协作/多席位场景

------

## 3. 成功指标（Metrics）

### 3.1 北极星指标（NSM）

**每周“生成成功后发生复制/导出”的次数**（代表结果被真正用于发布）

### 3.2 MVP 关键指标

- Activation：新用户 10 分钟内完成首次生成并打开结果页（≥ 60%）
- Result Engagement：结果页复制率（≥ 50%）
- Monetization：Free → 购买 credits 转化（≥ 1.5–2%）
- Reliability：生成成功率（≥ 70%）
- Unit Cost：平均每次生成成本可控（credits 覆盖转录+生成成本）

------

## 4. 范围定义（Scope）

### 4.1 In Scope（v0.5 必做）

1. **登录/注册**：Supabase Magic Link（邮箱免密码）
2. **输入**：仅 YouTube URL（Phase 1 限制输入以降低成本与复杂度）
3. **多语种最小支持**：
   - Transcript Language：Auto / English / 简体中文 / Español
   - Output Language：Same as transcript（默认）/ English（Beta）
4. **字幕优先策略**：存在字幕即直接用字幕；无字幕才走 ASR
5. **异步任务系统**：Cloudflare Workers/Queues（转录/提炼/生成）
6. **输出资产包（结构化 JSON + 页面渲染）**：
   - X Thread（默认 8–12 条）
   - X Singles（默认 3–5 条）
   - YouTube SEO：Titles x5、Description、Chapters（时间轴）、Tags
7. **结果页交付**：
   - 一键复制（整段 thread / 单条）
   - 导出：Markdown、JSON（MVP 两种足够）
   - 可选：分享链接（只读）
8. **最小计费（credits）**：
   - 免费额度（每日 1 次或每月固定 credits）
   - 付费：Creem 购买 credits 包
   - credits 账本与扣费逻辑
9. **风控与成本控制**：
   - Turnstile（创建任务前）
   - IP/user 限流
   - 单用户并发 job 限制
   - 缓存（转录缓存、提炼缓存）

### 4.2 Out of Scope（v0.5 明确不做）

- 上传音视频文件
- X 视频链接解析与抓取
- 自动剪辑/出片/字幕渲染
- 多平台定时发布
- 团队协作、多席位、多 workspace
- 多语言全面本地化 UI（UI 先英文，内容输出按用户选择）

------

## 5. 用户流程（User Journeys）

### 5.1 首次使用（强制登录后生成）

1. 用户访问首页 → 粘贴 YouTube URL
2. 选择 Language（可选，默认 Auto）
   - Transcript Language：Auto/EN/ZH/ES
   - Output Language：Same as transcript（默认）/ English（Beta）
3. 点击 **Start generating**
4. 未登录 → 跳转登录（Magic Link）→ 登录成功回跳
5. 创建 Job → 计算 credits → 扣费/校验免费额度 → 入队
6. 处理完成 → 打开结果页 → 复制/导出/分享

### 5.2 充值购买 credits

1. credits 不足 → 弹出提示（Insufficient credits）→ 进入 Pricing
2. 选择 credits 包 → Creem Checkout 支付
3. 支付成功 → Webhook 入账 → 返回 app（余额更新）
4. 回到 job 继续生成或重试

### 5.3 重跑（Rerun）

- 用户可在结果页发起 “Rerun with different language / tone / counts”
- 若命中转录缓存，只扣生成费用（或更低费用）

------

## 6. 页面与信息架构（IA）

### 6.1 页面列表（v0.5）

- `/` Landing：Hero + 输入框 + Result Preview + Features + How it works + Pricing + Testimonials + FAQ
- `/login` 登录：Magic Link
- `/app/new` 创建任务：URL + 语言/风格设置
- `/app/jobs` 历史任务列表
- `/app/job/:id` 结果页（核心）
- `/pricing` 充值页面（credits 包）
- `/account` 账户页（余额、账单、使用记录）
- `/share/:token` 分享页（只读，可选）

------

## 7. 功能需求（Functional Requirements）

> 下面按模块写清：功能、规则、边界、验收。

------

### 7.1 登录/注册（Auth）

**功能**

- Supabase Magic Link 登录
- 登录后回跳到用户触发动作（Start generating）
- 登出
- 账户页查看余额与历史

**规则**

- 未登录不能创建 Job（不能开始生成）
- 发送 Magic Link 需做频率限制（防刷）

**验收**

- 未登录点生成必定被拦截并引导登录
- 登录成功后能回到创建流程并继续执行

------

### 7.2 输入模块（YouTube URL + 设置）

**必填**

- YouTube URL

**可选设置（生成参数）**

- Tone：Default / Professional / Casual / Bold
- Audience：Creators / Developers / General
- Thread count：8/10/12（默认 10）
- Singles count：3/5（默认 3）
- Title candidates：3/5（默认 5）
- CTA：可选（默认：Subscribe / Watch full video）

**语言设置（v0.5 必做）**

- Transcript Language（转录语言）：
  - `auto | en | zh-Hans | es`
  - 默认 `auto`
- Output Language（输出语言）：
  - `same_as_transcript`（默认）
  - `en`（Beta：将非英语视频生成英语发布资产）

**边界**

- URL 无效、不可访问、非 YouTube：提示错误并阻止创建
- 视频过长（> 2h）：
  - 免费用户：拒绝或提示升级
  - 付费用户：允许但提示耗时与 credits

**验收**

- 输入校验清晰；错误提示可理解；不进入后台处理

------

### 7.3 字幕轨选择与转录（Transcript Strategy）

**核心原则：字幕优先（最低成本）**

#### 7.3.1 字幕轨选择逻辑

若视频存在字幕轨（多语言/自动/人工）：
选择优先级：

1. 用户指定语言的 **人工字幕**
2. 用户指定语言的 **自动字幕**
3. 视频默认语言字幕（人工优先）
4. 英文字幕（若存在）
5. 无字幕 → 走 ASR

**UI 设计（最小复杂度）**

- 默认不展示全部轨道
- 当检测到多轨时展示下拉 `Captions (recommended)`：
  - 仅列 2–5 个最相关（language + auto/manual 标签）

#### 7.3.2 ASR（仅无字幕时启用）

- 若 transcript_language != auto：以用户选择作为 ASR hint
- 若 transcript_language = auto：
  - 先转录前 30–60 秒用于 **语言检测**
  - 再以检测语言跑全量 ASR
- 输出统一 segments：`[{start, end, text}]`
- 可选轻量标点修复（提升中文/西语可读性）

#### 7.3.3 语言识别结果

- `detected_language`: `en | zh-Hans | es | mixed | unknown`
- `language_confidence`: 0–1（可选）

**验收**

- 有字幕时不跑 ASR（成本可控）
- segments 时间戳、长度规范，能驱动章节/溯源

------

### 7.4 任务系统（Jobs）

#### 7.4.1 状态机（v0.5）

```
queued → fetching → selecting_captions? → detecting_language? → transcribing → extracting → generating → succeeded/failed
```

#### 7.4.2 创建 Job 前置校验

- 已登录
- Turnstile 通过
- credits/免费额度足够
- 输入有效

#### 7.4.3 并发限制

- 同一用户同时运行 job：1（默认）
- 免费用户排队优先级更低（可选）

#### 7.4.4 失败重试

- download_failed：可重试 1 次（不再扣费）
- asr_timeout：可重试 1 次（只扣一次生成费）
- mixed_language：提示“用固定语言重跑”（可扣一次生成费）

**验收**

- 前端能看到清晰状态与失败原因
- 重试不会重复扣费（幂等）

------

### 7.5 生成（Extraction + Generation）

#### 7.5.1 提炼（Extracting）

从 transcript segments 提炼：

- Key points（3–7）
- Quote candidates（10，含 time range）
- Outline / sections（用于章节候选）

#### 7.5.2 生成输出（结构化 JSON）

输出必须遵循 schema，禁止自由散文输出，确保前端稳定渲染。

**输出语言规则**

- 默认 `output_language = transcript_language`
- 若 output_language = English（Beta）：
  - 将 thread/singles/SEO 文案以英文输出
  - tags 默认英文（SEO 更友好）

**验收**

- 输出通过 schema 校验
- 每条内容包含 `source_segments` 溯源（至少 thread/singles/chapter/highlight-like items）

------

### 7.6 输出交付物（v0.5 固定）

#### 7.6.1 X Thread

- 8–12 条（默认 10）
- 结构建议：Hook → 核心要点 → CTA
- 每条带 `source_segments`

#### 7.6.2 X Singles

- 3–5 条（默认 3）
- 不同角度：总结/反常识/清单/观点
- 每条带 `source_segments`

#### 7.6.3 YouTube SEO

- Titles x5（不同风格）
- Description（含摘要 + CTA + Chapters）
- Chapters：
  - 格式 `00:00 Title`
  - 章节标题与 timestamp 来自 segments 结构推导
  - 每章带 `source_segments`
- Tags：10–20（默认英文）

**验收**

- 文案长度适配平台限制（必要时自动压缩）
- chapters 时间戳不越界、格式统一

------

### 7.7 结果页（Result Page）

**功能**

- Tabs：Thread / Singles / YouTube SEO
- 一键复制：
  - Copy full thread（带换行编号）
  - Copy single item
- 导出：
  - Markdown（默认）
  - JSON（高级/调试）
- 显示元信息：
  - transcript_source（captions/asr）
  - detected_language
  - output_language
- Rerun 按钮（可选）：更换语言/语气/数量

**验收**

- 复制按钮反馈清晰（toast）
- 导出内容与 UI 一致
- 分享页只读且不泄露用户身份信息（如邮箱）

------

### 7.8 Credits 计费（v0.5 最小商业化）

#### 7.8.1 计费模型

- 采用 credits 预付费
- 免费用户每日 1 次（或每月免费 credits）
- 付费通过 Creem 购买 credits 包

#### 7.8.2 Credits 套餐（建议）

- Free：每日 1 次（限制视频长度 20 分钟）
- Starter：$9 / 60 credits
- Creator：$19 / 180 credits
- Pro：$29 / 420 credits

#### 7.8.3 扣费规则（建议 v0.5）

- 若使用 YouTube 字幕（captions）：
  - 不扣“转录分钟费”，只扣生成费
- 若走 ASR：
  - 每分钟 2 credits（向上取整）
- 每次生成资产包：
  - 6 credits
- 重跑：
  - 命中转录缓存：仅扣生成费
  - 未命中缓存：按完整规则扣费

#### 7.8.4 支付与入账

- Creem Checkout
- Webhook 回调写入 `purchases` + `credit_ledger`（必须幂等）
- 幂等键：`provider_event_id` 或 `provider_order_id` unique

**验收**

- 支付成功后 30 秒内 credits 更新
- webhook 重放不会重复发放 credits
- 扣费记录可追溯（关联 job_id）

------

### 7.9 风控与成本控制

**必做**

- Turnstile：创建 job 前
- Rate limit：
  - IP 级
  - user_id 级
- 单用户并发限制：1
- 缓存：
  - Transcript cache（视频最贵部分）
  - Extract cache（可选）

**建议**

- 免费用户限制：
  - 每日次数
  - 最大视频时长
  - 更严格的并发与排队策略

------

## 8. 数据模型（Supabase Postgres）

> 所有用户数据通过 RLS 限制“只能访问自己的记录”。

### 8.1 表清单

- `profiles`
- `jobs`
- `job_outputs`
- `credit_ledger`
- `purchases`
- `share_links`（可选）

### 8.2 jobs（核心字段）

- `id` (uuid)
- `user_id`
- `input_type` = `youtube`
- `input_url`
- `video_id`
- `status`
- `requested_transcript_language` (`auto|en|zh-Hans|es`)
- `detected_language` (`en|zh-Hans|es|mixed|unknown`)
- `output_language` (`same_as_transcript|en|zh-Hans|es`)
- `transcript_source` (`youtube_captions|asr`)
- `caption_track_id` (nullable)
- `caption_language` (nullable)
- `language_confidence` (nullable)
- `duration_seconds` (nullable)
- `credits_charged`
- `rerun_of_job_id` (nullable)
- timestamps

### 8.3 job_outputs

- `job_id` (pk/fk)
- `transcript_json` (segments + meta)
- `outputs_json` (结构化输出)
- timestamps

### 8.4 credit_ledger

- `id`
- `user_id`
- `delta`
- `reason` (`purchase|usage|refund|admin`)
- `job_id` (nullable)
- `provider_order_id` (nullable)
- timestamps

### 8.5 purchases

- `id`
- `user_id`
- `provider` (`creem`)
- `provider_order_id` (unique)
- `status` (`paid|failed|refunded`)
- `amount`, `currency`
- `credits_granted`
- timestamps

### 8.6 share_links（可选）

- `id`
- `job_id`
- `token` (unique)
- `is_public`
- timestamps

------

## 9. API 设计（Next.js / Vercel）

### 9.1 `POST /api/jobs/start`

**入参**

- `youtube_url`
- `requested_transcript_language` (default `auto`)
- `output_language` (default `same_as_transcript`)
- `tone`, `audience`, `thread_count`, `singles_count`, `title_candidates`, `cta`
- `turnstile_token`

**返回**

- `job_id`

**逻辑**

- auth check → turnstile verify → credits check/hold → enqueue job

------

### 9.2 `GET /api/jobs/:id`

**返回**

- `status`
- `meta`（transcript_source, detected_language, output_language）
- `outputs`（如果 succeeded）

------

### 9.3 `POST /api/webhooks/creem`

- 验签
- 幂等入账
- 写 purchases + credit_ledger

------

### 9.4 `POST /api/share/create`（可选）

- 创建 share token（只读）

------

## 10. 缓存策略（关键成本控制）

### 10.1 Transcript Cache Key

- `video_id + transcript_source + requested_transcript_language + caption_track_id(optional)`

### 10.2 Output Cache Key

- `video_id + detected_language + output_language + generation_params_hash`

### 10.3 命中规则

- 重跑改语气/数量：应尽可能命中 transcript 缓存

------

## 11. 埋点与分析（Analytics）

**基础事件**

- `auth_magiclink_sent`
- `auth_login_success`
- `job_start_clicked`
- `language_selected`
- `job_created`
- `job_succeeded`
- `job_failed`（带 error_code）
- `result_copy_thread`
- `result_copy_item`
- `result_export_md`
- `purchase_clicked`
- `purchase_success`
- `credits_insufficient_shown`

**漏斗**
Landing → 输入 URL → 登录 → 创建 job → 出结果 → 复制 → 充值

------

## 12. QA 测试用例（v0.5 必测）

### 12.1 功能用例

- 未登录 → 输入 URL → Start generating → 跳登录 → 回跳 → 成功生成
- 有英文字幕 → 不跑 ASR → 正常输出
- 有中文字幕 → 选择 zh-Hans → 选对轨道 → 输出中文
- 多字幕轨（EN/ES/ZH）→ 选择 ES → 输出西语
- 无字幕 → transcript_language=auto → 先 detect 60s → 跑 ASR → 输出
- output_language=English（Beta）→ 原视频中文 → 英文输出 thread + SEO
- credits 不足 → 引导购买 → webhook 入账 → 继续生成
- 重跑命中缓存 → 只扣生成费

### 12.2 权限与安全

- RLS：用户不能读到他人 job 与 outputs
- share token：私密不可访问；公开可访问

------

## 13. 非功能需求（NFR）

- 稳定性：P95 job 完成 < 10 分钟（依赖 ASR 与队列情况）
- 可观测性：job 全链路日志（job_id），失败原因结构化
- 成本控制：字幕优先 + 缓存 + 免费限制
- 合规提示：用户需拥有内容处理权（简单免责声明即可）

------

## 14. 里程碑（Milestones）

- **M1：最小闭环（无计费）**
  - Auth + URL 输入 + job pipeline（字幕优先）+ 结果页复制/导出
- **M2：多语种最小支持**
  - language UI + 字幕轨选择 + ASR 自动检测（仅无字幕）
- **M3：商业化**
  - credits + Creem + webhook 幂等 + 账户页余额/账本
- **M4：分享与增长**
  - share links + landing result preview + testimonials/FAQ 完整化

------

## 15. 风险与对策

1. **字幕不可获取/地区限制**

- 对策：回退 ASR；提示用户重试/换视频

1. **语言识别不准（双语视频）**

- 对策：允许手动指定语言重跑；标记 mixed + 提示

1. **成本被滥用**

- 对策：强制登录、Turnstile、限流、免费限制、单用户并发

1. **输出质量不稳定**

- 对策：结构化 schema、溯源 segments、降级策略、用户反馈按钮

------

## 16. 附录：v0.5 输出 JSON Schema（示例）

```json
{
  "meta": {
    "video_id": "abc123",
    "input_url": "https://www.youtube.com/watch?v=abc123",
    "transcript_source": "youtube_captions",
    "requested_transcript_language": "auto",
    "detected_language": "en",
    "output_language": "en"
  },
  "x_thread": [
    {
      "order": 1,
      "text": "Hook: ...",
      "source_segments": [{"start": 12.3, "end": 24.9}]
    }
  ],
  "x_singles": [
    {
      "angle": "summary",
      "text": "Single post ...",
      "source_segments": [{"start": 120.0, "end": 138.2}]
    }
  ],
  "youtube_seo": {
    "titles": ["...", "...", "...", "...", "..."],
    "description": "Description ...",
    "chapters": [
      {
        "timestamp": "00:00",
        "title": "Intro",
        "source_segments": [{"start": 0.0, "end": 35.2}]
      }
    ],
    "tags": ["ai", "youtube", "repurpose", "creator"]
  },
  "generation_params": {
    "tone": "professional",
    "audience": "creators",
    "thread_count": 10,
    "singles_count": 3,
    "title_candidates": 5,
    "cta": "Subscribe for more"
  }
}
```

------

如果你希望我把这份 **v0.5 PRD** 直接“落地到可开发颗粒度”，我可以继续输出两份附件（你不需要再解释）：

1. **数据库建表 SQL + RLS 规则草案**（Supabase 可直接用）
2. **Workers/Queues 的 job 状态机与重试/幂等策略**（含 error_code 列表、扣费点位）