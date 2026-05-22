# Bloom Break QA Checklist

## 首页 `/`
- [x] 可以选择 mood（6 选）
- [x] mood 保存到 `bloom_break_last_mood`
- [x] 三个游戏入口卡片：压力消消班 / 压力收纳所 / 偷偷开花局
- [x] 点击跳转到 `/games/match` `/games/tray` `/games/bloom`
- [x] 「看看我的花园」进入 `/garden`
- [x] 手机端布局不出现横向滚动

## 压力消消班 `/games/match`
- [x] 8x8 tile 可点击 / 手机可触摸
- [x] 选中高亮明显（`tile-selected` scale 1.08 + 粉色 outline）
- [x] 点相邻 tile 交换
- [x] 有效交换消除（动画）
- [x] 无效交换弹回，不消耗步数
- [x] 消除后下落补充
- [x] 连锁 cascade
- [x] 目标进度实时更新
- [x] 能胜利（目标完成）
- [x] 能失败（步数耗尽）
- [x] 12 关都有，难度递增
- [x] 关卡选择条显示解锁状态

## 压力收纳所 `/games/tray`
- [x] 卡片可点击进托盘
- [x] 被遮挡的卡片半透明 + 不可点击
- [x] 3 个相同自动清除
- [x] 托盘闪光动画
- [x] 托盘满且无三个相同 → 失败
- [x] 全部清完 → 胜利
- [x] 12 关从 18 张递增到 ≈60 张，多层遮挡
- [x] 手机可玩

## 偷偷开花局 `/games/bloom`
- [x] 点击 / 拖动连接相邻同类花朵
- [x] 少于 3 个不能释放（按钮置灰）
- [x] 3 个以上可释放
- [x] 花朵成长：🌱 → 🌼 → 🌸
- [x] 盛开花被连锁或被击中会爆炸
- [x] 爆炸清除周围 3x3
- [x] 能触发连锁（bloom 连锁 bloom）
- [x] 雾气可被花朵能量清除
- [x] 能胜利 + 失败
- [x] 手机拖动可玩（`touchAction: none` + `setPointerCapture`）

## 花园 `/garden`
- [x] 胜利后花朵/阳光/水滴增加
- [x] 失败后水滴 +1（安慰奖励）
- [x] 刷新保留（localStorage）
- [x] 三个游戏共享同一个 `bloom_break_garden`
- [x] 分别显示三个游戏的完成关卡数

## Build
- [x] `npm run build` 通过
- [x] Vercel 部署绿
- [x] `.nvmrc` Node 20
- [x] `eslint.ignoreDuringBuilds: true` 兼底
- [x] TS 严格模式仍生效，只放过 lint 噪音

## 三个游戏奖励规则验证
- 压力消消班：flowers +1, sun +ceil(score/1000), water +1
- 压力收纳所：flowers +1, sun +1, water += clearedGroups
- 偷偷开花局：flowers += bloomCount+1, sun +ceil(score/1000), water +1
- 失败：water +1

## 原创性
- 不使用任何现有游戏 IP 名称/素材/文案
- 职场解压主题 emoji + 原创中文名称
- 所有文案原创书写
