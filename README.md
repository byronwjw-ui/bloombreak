# Bloom Break / 解压花园

> 给高压职场人的 3 分钟解压花园。

一个原创的 Web 轻游戏 MVP：交换消除 + 压力托盘 + 花朵成长连锁。

## 技术栈

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- localStorage（无后端、无登录）

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:3000 。

Node 版本：推荐 20（仓库内已附 `.nvmrc`）。

## 部署到 Vercel

1. 打开 https://vercel.com/new
2. 选 GitHub 仓库 `byronwjw-ui/bloombreak` → Import
3. Framework 自动识别为 **Next.js**，保持默认
4. 不需要任何环境变量
5. 点 **Deploy**

## 玩法

- 8x8 棋盘，点击相邻方块交换消除
- 压力元素进入底部 7 格托盘，三个相同自动清空
- 花朵 🌱 → 🌼 → 🌸 → 爆炸，触发连锁
- 完成关卡获得花朵、阳光、水滴，累积到《我的花园》

## 目录

```
src/
  app/         首页 / 游戏页 / 花园页
  components/  GameBoard、PressureTray、ResultModal …
  data/        levels.ts / copy.ts / tiles.ts
  lib/         gameLogic / storage / random
  types/       game.ts
```

---

送给高压职场朋友的免费解压礼物 · 原创 MVP。
