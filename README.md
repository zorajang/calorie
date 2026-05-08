# Calorie App

一个自用的每日热量记录 App 方案，目标是尽快做出可用的 MVP，并为后续接入 AI 食物热量估算保留扩展空间。

## 1. 产品目标

核心能力只有三件事：

1. 根据个人信息和公式计算每日目标摄入热量（`kcal`）
2. 记录每天摄入的食物和热量
3. 计算每日热量缺口或盈余

第一版优先保证：

- 录入速度快
- 计算逻辑稳定
- AI 返回结果可人工确认和修正

## 2. MVP 功能范围

### 2.1 页面结构

#### `设置页`

用于维护计算热量所需的基础资料：

- 性别
- 年龄
- 身高（`cm`）
- 体重（`kg`）
- 活动等级
- 目标模式：减脂 / 维持 / 增肌
- 目标热量缺口（例如 `300 kcal` / `500 kcal`）

#### `今日页`

展示当天的核心数据：

- 今日目标摄入（`target_intake_kcal`）
- 今日已摄入（`consumed_kcal`）
- 今日剩余（`remaining_kcal`）
- 今日实际缺口（`actual_deficit_kcal`）
- 今日记录的食物列表

#### `添加食物`

支持两种录入方式：

- 手动录入：食物名称、重量/份数、热量
- AI 录入：输入自然语言，由 AI 解析并估算热量

#### `历史页`

展示近 7 天 / 30 天趋势：

- 每日总摄入
- 每日目标摄入
- 每日热量缺口
- 体重变化（第二阶段）

### 2.2 第一阶段不做

先不要做这些，避免把 MVP 做重：

- 社交分享
- 多用户系统
- 宏量营养素深度分析
- 拍照识别食物
- 穿戴设备同步
- 自动生成食谱

## 3. 核心计算逻辑

### 3.1 BMR

使用 `Mifflin-St Jeor` 公式：

- 男：`BMR = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5`
- 女：`BMR = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161`

### 3.2 TDEE

`TDEE = BMR * activity_factor`

建议活动系数预设：

- `sedentary = 1.2`
- `light = 1.375`
- `moderate = 1.55`
- `high = 1.725`

### 3.3 目标摄入

- 减脂：`target_intake_kcal = TDEE - target_deficit_kcal`
- 维持：`target_intake_kcal = TDEE`
- 增肌：`target_intake_kcal = TDEE + target_surplus_kcal`

第一版可以统一用一个数字字段保存，减脂传正数缺口，增肌传正数盈余。

### 3.4 当日统计

- `consumed_kcal = sum(food_entries.calories_kcal)`
- `remaining_kcal = target_intake_kcal - consumed_kcal`
- `actual_deficit_kcal = tdee_kcal - consumed_kcal`

建议同时展示：

- “离目标还差多少”：`remaining_kcal`
- “按消耗计算，今天实际缺口是多少”：`actual_deficit_kcal`

## 4. 推荐技术栈

如果以快速落地为目标，推荐：

- 前端：`Next.js 15` + `React` + `TypeScript`
- UI：`Tailwind CSS` + `shadcn/ui`
- 数据库：`PostgreSQL`（可直接用 `Supabase`）
- ORM：`Drizzle ORM`
- AI：`OpenAI API`
- 图表：`Recharts`
- 表单：`React Hook Form` + `Zod`

原因：

- Web 版开发迭代最快
- 数据模型清晰，后续容易迁移到移动端
- AI 接口和数据库托管都比较成熟

如果以后要做手机端，可以复用后端接口，再补一个 `Expo` 客户端。

## 5. 建议目录结构

```text
calorie/
  app/
    page.tsx
    settings/page.tsx
    history/page.tsx
    api/
      profile/route.ts
      daily-summary/route.ts
      food-entries/route.ts
      ai/estimate-food/route.ts
  components/
    today/
    food/
    charts/
    forms/
  lib/
    calorie.ts
    ai.ts
    db.ts
    validation.ts
  db/
    schema.ts
    migrations/
  docs/
    product.md
    api.md
```

## 6. 数据库设计

### 6.1 `user_profile`

单用户自用版可以只有一条数据。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `uuid` | 主键 |
| `name` | `text` | 昵称 |
| `gender` | `text` | `male` / `female` |
| `age` | `int` | 年龄 |
| `height_cm` | `numeric` | 身高 |
| `weight_kg` | `numeric` | 当前体重 |
| `activity_level` | `text` | `sedentary` / `light` / `moderate` / `high` |
| `goal_type` | `text` | `cut` / `maintain` / `bulk` |
| `goal_adjustment_kcal` | `int` | 缺口或盈余 |
| `created_at` | `timestamp` | 创建时间 |
| `updated_at` | `timestamp` | 更新时间 |

### 6.2 `daily_targets`

按天保存快照，避免资料修改后历史记录被重算。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `uuid` | 主键 |
| `date` | `date` | 对应日期 |
| `bmr_kcal` | `int` | 当天基础代谢 |
| `tdee_kcal` | `int` | 当天总消耗 |
| `target_intake_kcal` | `int` | 当天目标摄入 |
| `goal_type` | `text` | 目标模式 |
| `goal_adjustment_kcal` | `int` | 当天缺口/盈余 |
| `weight_kg_snapshot` | `numeric` | 当天体重快照 |
| `created_at` | `timestamp` | 创建时间 |

### 6.3 `food_entries`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `uuid` | 主键 |
| `date` | `date` | 记录日期 |
| `meal_type` | `text` | `breakfast` / `lunch` / `dinner` / `snack` |
| `food_name` | `text` | 食物名 |
| `amount_value` | `numeric` | 数量 |
| `amount_unit` | `text` | `g` / `ml` / `serving` / `piece` |
| `calories_kcal` | `int` | 热量 |
| `source_type` | `text` | `manual` / `database` / `ai` |
| `source_note` | `text` | 来源说明 |
| `ai_confidence` | `numeric` | AI 置信度，可空 |
| `created_at` | `timestamp` | 创建时间 |
| `updated_at` | `timestamp` | 更新时间 |

### 6.4 `food_library`

缓存常用食物，减少重复调用 AI。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `uuid` | 主键 |
| `canonical_name` | `text` | 标准名 |
| `default_amount_value` | `numeric` | 默认数量 |
| `default_amount_unit` | `text` | 默认单位 |
| `calories_per_unit_kcal` | `numeric` | 每单位热量 |
| `reference_unit` | `text` | 例如每 `100g` |
| `source_type` | `text` | `manual` / `database` / `ai_verified` |
| `created_at` | `timestamp` | 创建时间 |
| `updated_at` | `timestamp` | 更新时间 |

### 6.5 `weight_logs`

第二阶段加。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `uuid` | 主键 |
| `date` | `date` | 日期 |
| `weight_kg` | `numeric` | 体重 |
| `created_at` | `timestamp` | 创建时间 |

## 7. API 设计

### 7.1 `GET /api/profile`

返回当前用户设置。

响应：

```json
{
  "id": "uuid",
  "gender": "male",
  "age": 28,
  "heightCm": 175,
  "weightKg": 72,
  "activityLevel": "moderate",
  "goalType": "cut",
  "goalAdjustmentKcal": 500
}
```

### 7.2 `POST /api/profile`

创建或更新设置。

请求：

```json
{
  "gender": "male",
  "age": 28,
  "heightCm": 175,
  "weightKg": 72,
  "activityLevel": "moderate",
  "goalType": "cut",
  "goalAdjustmentKcal": 500
}
```

服务端做两件事：

1. 保存用户资料
2. 为今天生成或更新 `daily_targets`

### 7.3 `GET /api/daily-summary?date=2026-05-08`

返回当日摘要。

响应：

```json
{
  "date": "2026-05-08",
  "bmrKcal": 1650,
  "tdeeKcal": 2558,
  "targetIntakeKcal": 2058,
  "consumedKcal": 920,
  "remainingKcal": 1138,
  "actualDeficitKcal": 1638,
  "entries": [
    {
      "id": "uuid",
      "foodName": "燕麦",
      "amountValue": 50,
      "amountUnit": "g",
      "caloriesKcal": 194,
      "sourceType": "manual"
    }
  ]
}
```

### 7.4 `POST /api/food-entries`

新增食物记录。

请求：

```json
{
  "date": "2026-05-08",
  "mealType": "breakfast",
  "foodName": "鸡胸肉",
  "amountValue": 200,
  "amountUnit": "g",
  "caloriesKcal": 330,
  "sourceType": "ai",
  "sourceNote": "Estimated from 165 kcal per 100g",
  "aiConfidence": 0.86
}
```

### 7.5 `PATCH /api/food-entries/:id`

修正 AI 估算结果，保留人工最终确认。

### 7.6 `DELETE /api/food-entries/:id`

删除食物记录。

### 7.7 `POST /api/ai/estimate-food`

输入自然语言，返回结构化估算结果。

请求：

```json
{
  "input": "燕麦 50g + 牛奶 250ml"
}
```

响应：

```json
{
  "items": [
    {
      "foodName": "燕麦",
      "amountValue": 50,
      "amountUnit": "g",
      "caloriesKcal": 194,
      "sourceNote": "Approx. 389 kcal per 100g",
      "confidence": 0.92
    },
    {
      "foodName": "纯牛奶",
      "amountValue": 250,
      "amountUnit": "ml",
      "caloriesKcal": 135,
      "sourceNote": "Approx. 54 kcal per 100ml",
      "confidence": 0.88
    }
  ],
  "totalCaloriesKcal": 329
}
```

## 8. AI 接入策略

### 8.1 原则

AI 只做“建议”，不直接作为最终写库结果。流程应为：

1. 用户输入自然语言
2. 服务端先查 `food_library`
3. 查不到时调用 AI
4. AI 返回结构化 JSON
5. 前端展示结果给用户确认
6. 用户确认后再写入 `food_entries`

### 8.2 Prompt 设计要求

服务端应强约束 AI 输出：

- 只输出 JSON
- 单位统一到 `kcal`
- 如果用户输入了重量/体积，要给出显式换算依据
- 对模糊描述返回较低 `confidence`

示例系统提示词：

```text
You are a nutrition estimation assistant.
Return valid JSON only.
Estimate calories for each food item in kcal.
If the user provides weight or volume, use it directly.
If the user input is ambiguous, make a reasonable estimate and lower confidence.
Include a short sourceNote explaining the estimate basis.
```

### 8.3 错误处理

AI 接口要考虑：

- 返回非 JSON
- 食物拆分失败
- 热量明显异常

建议在服务端做校验：

- `calories_kcal > 0`
- `amount_value > 0`
- `confidence` 范围在 `0-1`

## 9. 页面交互建议

### 9.1 今日页布局

顶部卡片：

- 今日目标摄入
- 今日已摄入
- 今日剩余

中部：

- 快速添加食物输入框
- “AI 估算”按钮
- “手动添加”按钮

底部：

- 早餐 / 午餐 / 晚餐 / 加餐分组列表

### 9.2 录入流程

推荐最快路径：

1. 输入：`米饭 150g`
2. 点击 `AI 估算`
3. 查看卡片结果
4. 调整数量或热量
5. 点击保存

### 9.3 提升自用体验的功能

这几个功能很值得尽早加：

- 最近常吃食物快捷添加
- 复制昨天饮食
- 一键重复添加早餐
- 搜索历史记录

## 10. 第一阶段开发顺序

### 第 1 周

1. 初始化 `Next.js` 项目
2. 配置 `Tailwind`、`Drizzle`、数据库
3. 建表：`user_profile`、`daily_targets`、`food_entries`
4. 实现设置页和热量公式计算

### 第 2 周

1. 实现今日页
2. 实现手动添加食物
3. 实现当日汇总 API
4. 做基础图表和历史页

### 第 3 周

1. 接入 AI 食物估算接口
2. 做结构化结果确认弹窗
3. 增加 `food_library` 缓存
4. 优化录入速度

## 11. 建议的里程碑

### M1: 可手动使用

完成后可以：

- 设置个人资料
- 自动算目标热量
- 手动记录食物
- 看当天缺口

### M2: AI 辅助录入

完成后可以：

- 输入自然语言食物描述
- AI 自动估算 kcal
- 用户确认后保存

### M3: 数据更稳定

完成后可以：

- 有常用食物库
- 有历史趋势
- 有体重变化记录

## 12. 下一步建议

如果你要我继续直接落地，最合理的顺序是：

1. 先初始化 `Next.js + TypeScript + Tailwind`
2. 我再把数据库 schema 和 API route 一起搭出来
3. 然后先做“设置页 + 今日页 + 手动添加食物”
4. 最后再接 AI 估算

这样你会最快拿到一个能自己开始用的版本。

## 13. 当前仓库状态

仓库里已经有第一版代码骨架：

- `app/` 下有首页、设置页、历史页和 API route
- `db/schema.ts` 已定义核心表
- `lib/calorie.ts` 已实现 BMR / TDEE / 目标摄入计算
- `lib/repository.ts` 已实现数据库读写逻辑
- `lib/food-estimation.ts` 已接好“本地食物库优先，其次 AI”估算路径
- 设置页可提交到 `/api/profile`
- 首页快速录入可调用 `/api/ai/estimate-food`，确认后保存到 `/api/food-entries`

## 14. 本地启动

先确保本机安装 `Node.js 20+`。

1. 复制环境变量文件：`.env.example` -> `.env.local`
2. 填写：
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
3. 安装依赖：`npm install`
4. 生成迁移：`npm run db:generate`
5. 执行数据库迁移：`npm run db:migrate`
6. 启动开发环境：`npm run dev`

如果没有配置数据库：

- 首页会退回 mock 摘要数据
- 设置保存和食物入库会返回 `503`

如果没有配置 `OPENAI_API_KEY`：

- 只有命中本地 `food_library` 时可以估算
- 否则 AI 估算接口会报错
