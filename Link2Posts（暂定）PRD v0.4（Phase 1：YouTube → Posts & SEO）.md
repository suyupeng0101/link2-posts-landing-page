下面是根据你最新方向（**阶段 1 不做精彩片段/高光导出与高光建议**，**只做：输入 YouTube URL → 生成 X 个帖子/推文 + YouTube SEO 元数据**）重写后的完整 PRD（建议版本号 v0.4）。

------

# Link2Posts（暂定）PRD v0.4（Phase 1：YouTube → Posts & SEO）

> 面向：YouTuber / 主播 / 长视频内容创作者（内容分发）
> 形态：B2C Web SaaS
> 部署栈：Vercel（Web） + Supabase（Auth/DB） + Cloudflare（Workers/Queues/Turnstile，可选 R2）+ Creem（后续付费）
> 核心原则：必须登录后才能开始生成；用额度/credits 控成本（阶段 1 可先用免费额度 + 限流替代付费）

------

## 0. 文档信息

- 版本：v0.4
- 本次变更点（相对 v0.3）：
  - **阶段 1 移除**：精彩片段/高光相关能力（包括建议与导出）
  - **阶段 1 只保留**：YouTube URL 输入 → 生成 **X 个帖子/推文** + **YouTube SEO 元数据**
  - 阶段 1 输入方式收敛为 **仅 YouTube URL**（上传/粘贴转录文本放到后续阶段）

------

## 1. 背景与机会

创作者发布长视频后仍需要投入大量时间做：

- YouTube SEO（标题/描述/章节/标签）
- X 宣发（thread、短推、金句、预告）

阶段 1 的机会点：只做“分发资产”（纯文本 + 可复制），实现更轻、更快、更低成本上线验证。

------

## 2. 产品定位

### 2.1 一句话价值主张

把一个 YouTube 视频链接一键变成「可直接发布」的 **X 内容资产包 + YouTube SEO 元数据包**。

### 2.2 核心用户

- 教程类 YouTuber（AI / 编程 / 工具 / 教育）
- 访谈/播客视频化频道
- 直播回放型创作者（先做文本分发，后续再扩展高光/切片链路）

------

## 3. 目标与成功指标（Phase 1）

### 3.1 北极星指标（NSM）

- 每周“生成后复制/导出”的有效交付次数

### 3.2 核心指标（建议埋点）

- Activation：新用户 10 分钟内完成首次生成（成功出结果页）
- Result Engagement：结果页复制率 ≥ 50%（thread 或单条至少一次复制）
- Reliability：生成成功率 ≥ 70%，P95 处理时长 ≤ 10 分钟（按 MVP 目标）

------

## 4. Phase 1 范围（Scope）

### 4.1 In Scope（必须做）

1. 登录/注册（Supabase Auth：Magic Link）
2. 输入：**仅 YouTube URL**
3. 创建生成任务（Job）与异步处理（Cloudflare Workers/Queues）
4. 输出资产包（固定 3 类）：
   - X Thread（可配置条数）
   - 单条推文/帖子（可配置条数）
   - YouTube SEO 元数据（标题/描述/章节/标签）
5. 结果页：复制 / 导出（Markdown、JSON）/ 分享链接（可选）

> 注：原 PRD 的输出包含 thread、单条、YouTube SEO（以及高光），这里阶段 1 只保留前三项。

### 4.2 Out of Scope（阶段 1 明确不做）

- 高光/精彩片段相关（建议、导出、时间轴、hook）
- 上传本地视频/音频
- 粘贴转录文本输入
- 自动剪辑/渲染短视频、自动发布到社媒
- 订阅/付费体系（可后置到阶段 2/3；阶段 1 用免费额度 + 限流控成本）

------

## 5. 用户流程（Phase 1）

### 5.1 首次使用（强制登录后生成）

1. 首页粘贴 YouTube 链接
2. 点击【开始生成】
3. 未登录 → 跳转登录（Magic Link）→ 登录后回跳
4. 创建 Job → 入队
5. 处理完成 → 结果页展示 → 一键复制/导出/分享

> “必须登录后才能开始生成”沿用核心原则，用来压成本与控滥用。

### 5.2 老用户复用

- 最近任务列表 → 一键打开结果
- 支持复用上次设置（生成数量、语气、受众等）

------

## 6. 功能需求（Functional Requirements）

> 每个模块包含：功能说明、关键规则、边界情况、验收标准。

### 6.1 登录/注册（Auth）

**功能**

- 邮箱 Magic Link 登录（必做）
- 登录后回跳到发起动作（开始生成/查看结果）
- 账户页（阶段 1 最小化）：历史任务列表、基础额度信息（可选）

**关键规则**

- 未登录不可创建 Job（不可生成）

**验收**

- 登录成功后可回到生成流程并继续

------

### 6.2 输入：YouTube URL（仅此一种）

**功能**

- 输入框：YouTube URL
- 基础校验：域名、视频 id、可访问性（尽量在后端二次校验）
- 可选：用户填写“额外信息”（可极简）
  - 目标受众（面向谁）
  - 语气（专业/轻松/犀利/教程风）
  - CTA（引导订阅/引导评论/引导访问链接）

**边界情况**

- 视频不可访问/私有/地区限制 → 明确报错
- 视频过短（<60s） → 触发降级输出（见 6.5）

**验收**

- 输入合法 URL 后能成功创建 job 并进入 queued

------

### 6.3 任务系统（Jobs）

**状态机（推荐）**

- `queued → fetching → transcribing → generating → succeeded / failed`

> 原 PRD 的 job/队列思路可沿用（异步 + 状态机 + 可轮询）。

**规则**

- 同一用户并发 job 上限：1（阶段 1 强限制）
- 必须通过 Turnstile（可选但强建议，防刷）

**验收**

- job 创建后 1 秒内进入 queued
- 失败时给出可读原因（抓取失败/无字幕/转录失败/超时等）

------

### 6.4 生成流水线（Processing Pipeline）

阶段 1 推荐流水线（保留“结构化输出”思想）

1. 获取内容

- YouTube：**优先拉字幕/文字稿**；无字幕 → 走转录

1. 转录清洗与分段（带时间戳 segments）
2. 内容提炼（主题/要点/金句候选，绑定 segments）
3. 生成资产包：严格 JSON schema 输出
4. 落库缓存：写入 job_outputs（至少缓存 transcript 和 outputs）

**质量要求（阶段 1 关键）**

- thread/单条推文/章节等输出尽量带可溯源引用（`source_segments`），减少“胡编”风险（可先做到章节带引用，推文引用作为加分项）

------

### 6.5 输出资产包（Deliverables，Phase 1 固定 3 类）

> 原 PRD 的前三项输出保留，并把数量从“固定区间”升级为“可配置 X”。

#### 6.5.1 X Thread（可配置）

- 默认：8–12 条（可配置为 X 条）
- 结构：hook → 要点分段 → 结尾 CTA
- 规则：单条不超过平台限制；必要时自动压缩/改写

#### 6.5.2 单条推文/帖子（可配置）

- 默认：3–5 条（可配置为 X 条）
- 不同角度（系统自动分配或让用户选择）：
  - 总结型 / 反常识 / 清单型 / 观点型 / 数据点型

#### 6.5.3 YouTube SEO 元数据

- 标题：xN（默认 5，可配置）
- 描述：1 条（包含摘要 + CTA + 章节）
- 章节：`00:00` 格式，基于时间戳
- Tags：10–20（可配置范围）

**内容验收**

- thread/单条：可直接复制发布（基本无硬错误）
- 章节时间戳格式一致、来源于转录 segments
- 输出 JSON 可校验通过 schema

------

### 6.6 结果页（Result Page）

**功能**

- 分区卡片展示：Thread / 单条 / YouTube SEO（阶段 1 不展示高光）
- 一键复制：
  - 复制整个 thread（自动编号、换行）
  - 单条复制
- 导出：
  - Markdown（默认）
  - JSON（高级/调试）
- 分享链接（可选）：
  - 默认私密
  - 生成只读分享页 `/share/:token`（可选）

> 原 PRD 的结果页复制/导出/分享能力可以沿用，但去掉高光模块。

------

### 6.7 风控与成本控制（Phase 1 版本）

阶段 1 不接付费也能控成本，建议组合拳：

- 必须登录后生成（核心）
- Turnstile（开始生成前）
- 限流：
  - 按 user_id：每天 N 次（免费额度）
  - 按 IP：防批量注册/刷接口
- 并发限制：同一用户 1 个 job
- 转录/生成缓存：同一 YouTube 视频重复请求优先复用转录（省钱）

------

## 7. 数据设计（Supabase）

### 7.1 表清单（Phase 1 精简）

- `profiles`
- `jobs`
- `job_outputs`
- `share_links`（可选）

> 原 PRD 的表结构建议可沿用，但 Phase 1 可以先不建 purchases / credit_ledger。

### 7.2 核心字段建议（精简版）

**jobs**

- `id`, `user_id`
- `input_type`：固定 `youtube_url`
- `input_url`
- `status`, `error_code`, `error_message`
- `video_duration_seconds`（可选）
- `created_at`, `updated_at`

**job_outputs**

- `job_id`
- `transcript_json`（segments: start/end/text）
- `outputs_json`（仅 thread/singles/youtube_seo）
- `created_at`

**share_links（可选）**

- `job_id`, `token`, `is_public`, `created_at`

------

## 8. API 设计（Next.js / Vercel）

最小集合：

- `POST /api/jobs/start`
  - 入参：youtube_url、生成参数（X、语气、受众等）、turnstile_token
  - 出参：job_id
- `GET /api/jobs/:id`
  - 返回：status、progress（可选）、outputs（成功后）
- `POST /api/share/create`（可选）
- `GET /share/:token`（可选）

> 原 PRD 的 API 划分可参考，但 Phase 1 先做最小 2 个接口也能闭环。

------

## 9. 埋点与分析（Phase 1 最少集）

建议事件：

- `auth_magiclink_sent`, `auth_login_success`
- `job_started`, `job_succeeded`, `job_failed`
- `result_copy_thread`, `result_copy_single`
- `result_export_md`, `result_export_json`

------

## 10. 质量与验收（QA）

必测用例：

- 未登录 → 点击生成 → 被拦截登录 → 登录后继续生成成功
- YouTube 有字幕 / 无字幕（无字幕会走转录）
- 视频过短（<60s）降级输出
- job 失败（不可访问/抓取失败/超时）提示正确

性能目标（Phase 1）：

- 结果页加载 P95 < 2s（不含生成）
- 生成 P95 < 10min（取决于转录与模型）

------

## 11. 里程碑拆解（按阶段而非时间）

- **Phase 1（本 PRD）**：YouTube URL → X 帖子/推文 + YouTube SEO → 结果页复制/导出
- **Phase 2（扩展输入）**：上传文件 / 粘贴转录文本（兜底），增强缓存
- **Phase 3（商业化）**：Creem 充值 + credits 账本（把成本与收入闭环）
- **Phase 4（内容扩展）**：再考虑加入“高光建议”或“高光导出”任一方向（建议优先“建议”，不优先“导出”）

------

## 12. 风险与对策（Phase 1）

1. **YouTube 字幕不可得 / 拉取不稳定**

- 对策：无字幕走转录；失败提示清晰（视频不可访问/音轨异常）

1. **成本失控（免费刷）**

- 对策：登录后生成 + Turnstile + 限流 + 并发限制 + 缓存复用

1. **内容质量波动**

- 对策：结构化 JSON 输出 + 章节基于 timestamps + 必要时降级输出

------

## 13. 附录：Phase 1 输出 JSON（Schema 示例）

```json
{
  "x_thread": [
    {
      "order": 1,
      "text": "Hook ...",
      "source_segments": [{"start": 12.3, "end": 24.9}]
    }
  ],
  "x_singles": [
    {
      "angle": "summary",
      "text": "Single tweet ...",
      "source_segments": [{"start": 120.0, "end": 138.2}]
    }
  ],
  "youtube_seo": {
    "titles": ["...", "..."],
    "description": "Long description ...",
    "chapters": [
      {
        "timestamp": "00:00",
        "title": "Intro",
        "source_segments": [{"start": 0.0, "end": 35.2}]
      }
    ],
    "tags": ["tag1", "tag2"]
  },
  "generation_params": {
    "thread_count": 10,
    "singles_count": 5,
    "title_candidates": 5,
    "tone": "professional",
    "audience": "AI builders",
    "cta": "Subscribe for weekly tips"
  }
}
```

> 该结构改写自原 PRD 的 outputs_json 示例，移除了 highlights 字段。

------

如果你愿意，我还可以在这个 v0.4 PRD 的基础上，顺手给你补两份“开发直接能用”的附录（不需要你再来回补细节）：

1. **Phase 1 页面信息架构 + 路由表**（首页/登录/任务详情/历史/分享页）
2. **Phase 1 Prompt 结构与低成本策略**（如何用更便宜模型分步：先压缩提纲→再生成 thread/SEO，减少长上下文 token）