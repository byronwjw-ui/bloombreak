# Bloom Break / 解压花园

> 给高压职场人的 3 分钟解压游戏合集。

v2【3 个独立游戏 + 原创 chip 视觉 + 道具 + 星级】

| 游戏 | 路由 | 特性 |
|---|---|---|
| 压力消消班 | `/games/match` | 8×8 交换三消、特殊方块（横扫/竖扫/冲击/吸尘）、阻碍物 |
| 压力收纳所 | `/games/tray` | 多层便利贴、托盘预警、撤回/洗牌/提示道具 |
| 偷偷开花局 | `/games/bloom` | 4 种花×4 阶段 SVG、拖动连接、sunburst、连锁爆花、胜利花瓣飘落 |

## 技术栈

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- localStorage

## 本地开发

```bash
npm install
npm run dev
```

## 部署

https://vercel.com/new 选 `byronwjw-ui/bloombreak` → Import → Deploy。
无需任何环境变量。

## 目录

```
src/
  design/tokens.ts         设计系统唯一来源
  app/
    page.tsx               三游戏 hub 首页
    games/match/page.tsx   压力消消班 v2
    games/tray/page.tsx    压力收纳所 v2
    games/bloom/page.tsx   偷偷开花局 v2
    garden/page.tsx        花园
    game/page.tsx          旧路由 → /games/match
  components/
    SoftButton / ProgressStars / DifficultyBadge / GoalChip
    GameShell / LevelHeader / GoalPanel / FeedbackToast / LevelStrip
    chips/MatchChip / TrayCardChip / BloomChip
  data/
    matchLevels2.ts  trayLevels2.ts  bloomLevels2.ts
    copy.ts
  lib/
    matchEngine2.ts  trayEngine2.ts  bloomEngine2.ts
    storage.ts (v2 + v1 migration)  random.ts
  types/game.ts
```

## 原创性声明

- 不使用任何现有游戏 IP、名称、素材或文案
- 三个游戏机制、视觉、文案均为原创职场解压设计
- chip / card 均为原创 CSS/SVG，emoji 仅作点缀

---

送给高压职场朋友的免费解压礼物 · 原创 MVP。
