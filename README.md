# Bloom Break / 解压花园

> 给高压职场人的 3 分钟解压游戏合集。

一个原创的 Web 轻游戏合集 MVP，包含三个独立可玩的小游戏：

| 游戏 | 路由 | 玩法 |
|---|---|---|
| 压力消消班 | `/games/match` | 8x8 交换三消 + 关卡目标 |
| 压力收纳所 | `/games/tray` | 7 格压力托盘 + 多层遮挡收纳 |
| 偷偷开花局 | `/games/bloom` | 拖动连接同类花朵 + 成长 + 3x3 爆花连锁 |

三个游戏共享同一个【我的花园】，奖励累计在 `/garden`。

## 技术栈

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- localStorage（无后端、无登录、无支付）

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000 。

Node 推荐 20（仓库内附 `.nvmrc`）。

## 部署到 Vercel

1. https://vercel.com/new 选 `byronwjw-ui/bloombreak` → Import
2. Framework 自动识别为 Next.js，所有选项保持默认
3. 不需要环境变量
4. 点 Deploy

## 目录

```
src/
  app/
    page.tsx               三游戏 hub 首页
    games/
      match/page.tsx       压力消消班
      tray/page.tsx        压力收纳所
      bloom/page.tsx       偷偷开花局
    garden/page.tsx        共享花园
    game/page.tsx          旧路由 → redirect 到 /games/match
  components/
    PrimaryButton / MoodSelector / GardenView / ResultModal
  data/
    matchLevels.ts  trayLevels.ts  bloomLevels.ts
    tiles.ts        copy.ts
  lib/
    matchEngine.ts  trayEngine.ts  bloomEngine.ts
    storage.ts      random.ts
  types/game.ts
```

## 原创性声明

- 不使用任何现有游戏 IP、名称、素材或文案
- 三个游戏机制均为职场解压主题原创设计
- emoji 作为占位视觉，后续可替换为原创插画

---

送给高压职场朋友的免费解压礼物 · 原创 MVP。
