# Bloom Break / 解压花园

> 给高压职场朋友的免费解压礼物 · 三款独立可玩的原创小游戏。

## 三个游戏

| 游戏 | 路由 | 核心手感 |
|---|---|---|
| 压力消消班 | `/games/match` | **拖拽 / 滑动**交换 · 8x8 三消 · 特殊方块 · 阻碍物 |
| 压力收纳所 | `/games/tray` | 层叠便利贴 · 7 格托盘 · 三同归档 · 撤回/洗牌/提示 |
| 偷偷开花局 | `/games/bloom` | **按住拖动**连接 · 8 方向 · sunburst · 连锁爆花 |

三个游戏视觉、机制、纹理、节奏全部独立，不是一套 UI 换皮。

## 技术栈
- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- localStorage（无后端 / 无登录 / 无支付 / 无 AI API）

## 本地开发
```bash
npm install
npm run dev
```

Node 推荐 20（`.nvmrc` 已附）。

## 部署
https://vercel.com/new → 选 `byronwjw-ui/bloombreak` → Import → Deploy。
无需任何环境变量。

## 原创声明
- 不使用任何现有游戏 IP、名称、素材或文案
- 三个游戏的视觉（CSS 能量块 / 便利贴 SVG / 花朵 SVG）均为原创
- chip、连线、爆花动画均为原创实现
- 文案为职场解压主题原创

## 礼物感
- 私人语气文案
- 彩蛋：连续失败 2 次 / 玩满 3 局 / 通关 Level 12
- 失败 near-win 安慰文案，永远不羞辱用户

---
送给职场朋友的免费解压礼物 · 原创 MVP。
