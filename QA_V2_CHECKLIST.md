# Bloom Break V2 QA Checklist

## 设计系统
- [x] tokens.ts 集中颜色、阴影、主题
- [x] 三个游戏不同 ambient 渐变（消除 = 粉，收纳 = 暖黄，开花 = 薰衣草紫）
- [x] SoftButton 6 variants × 3 sizes
- [x] ProgressStars + DifficultyBadge + GoalChip + FeedbackToast 均存在
- [x] GameShell / LevelHeader / GoalPanel 三个游戏统一使用

## 原创 chip 视觉
- [x] MatchChip：CSS 任务卡风格，字符标记 + 文本标签，不依赖 emoji 主体
- [x] TrayCardChip：便利贴/任务卡风格，顶部卡口不同颜色，短文案（临时会 / 待回复 / 小剧场 …）
- [x] BloomChip：SVG 花朵，4 种花 × 4 阶段，盛开有 halo
- [x] ObstacleChip：fog / withered_leaf / stone 三种 SVG
- [x] hover / active / selected 状态都有反馈

## 首页
- [x] 三个游戏卡片使用不同主题渐变 + 边框
- [x] 每个卡片显示：已完成 x/12 + 总星 xx/36 + 推荐关
- [x] mood 保存 localStorage
- [x] 手机端不出现横向滚动

## 压力消消班 `/games/match`
- [x] tile 使用 MatchChip（纯 CSS）
- [x] 选中/响应 hover
- [x] 相邻交换 + 无效弹回不扣步
- [x] cascade 连锁
- [x] **特殊 tile**：4 连 → line_h/line_v；5 连 → vacuum；T/L 形 → bomb
- [x] **阻碍物**：meeting_bubble ×2 / fog_layer / kpi_lock / deadline_timer
- [x] deadline_timer 倒计时到 → 扣 1 步 + warn toast
- [x] combo / milestone toast 出现
- [x] near-end 提示（剩 3 步）
- [x] 胜利按分数阈值给 1-3 星
- [x] LevelStrip 显示各关星级

## 压力收纳所 `/games/tray`
- [x] 便利贴造型的 TrayCardChip
- [x] 遮挡卡片半透明 + 锁图标
- [x] 道具栏：撤回 ×1 / 洗牌 ×1 / 提示 ×1
- [x] 撤回能恢复上一次状态
- [x] 提示会高亮一个安全可点卡片
- [x] 托盘达 6/7 时 ring + animate-warn-pulse
- [x] milestone toast：已归档 / 脑子空出一格
- [x] near-win 安慰文案

## 偷偷开花局 `/games/bloom`
- [x] BloomChip 4 种花×4 阶段，盛开有 glow
- [x] 拖动连接 + 点击连接均可
- [x] 少于 3 不能释放
- [x] **连 4**：额外随机邻居成长
- [x] **连 5+**：sunburst，爆开范围 5×5
- [x] **连 6+**：chain boost，每开花 +200 分
- [x] 爆花连锁 + 节奏延迟
- [x] fog / withered_leaf / stone 三种障碍
- [x] 胜利时花瓣飘落动画（petal-fall）
- [x] combo toast：Bloom x2 / Bloom x3 / Sunburst ✨

## 花园 `/garden`
- [x] 总星星、完成关卡数、累计游玩、累计分数
- [x] 三个游戏分别计数
- [x] 胜利奖励、失败 +1 水滴
- [x] v1 数据 safe migrate 到 v2 shape

## Build / Deploy
- [x] `eslint.ignoreDuringBuilds: true`
- [x] `.nvmrc` Node 20
- [x] TS 严格类型贯通
- [x] 三个游戏路由独立
