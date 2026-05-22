import type { Mood, GameKind } from '@/types/game';

export const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'meeting', label: '开会开麻了', emoji: '💬' },
  { value: 'deadline', label: 'Deadline 压力大', emoji: '⏰' },
  { value: 'messages', label: '消息太多', emoji: '📨' },
  { value: 'kpi', label: 'KPI 在追我', emoji: '📈' },
  { value: 'burnout', label: '有点精神内耗', emoji: '🌫️' },
  { value: 'relax', label: '只是想放空一下', emoji: '🍃' },
];

export const moodTips: Record<Mood, string[]> = {
  meeting: ['今天会议有点多，先把脑子里的气泡清一清。', '不是每一句话都需要你立刻处理。'],
  deadline: ['Deadline 会催，但你可以一块一块清。', '先处理眼前这一格。'],
  messages: ['消息很多，但你可以先把注意力拿回来。', '红点不会消失，但你可以先安静三分钟。'],
  kpi: ['KPI 是数字，你不是数字。', '先让花开一下，再去面对那些报表。'],
  burnout: ['内耗不是懒，是系统后台开太多了。', '把脑子里的标签页关掉几个，我们慢慢来。'],
  relax: ['今天不分析，不复盘，只清一点压力。', '给自己三分钟，不用证明任何事。'],
};

export const winMessages = [
  '你刚刚清掉了一小块压力，也给自己留了一点空间。',
  '事情可以一块一块处理，花也可以一朵一朵开。',
  '你没有被今天吞掉。你还在开花。',
  '做得很好。现在喝口水，肩膀放松一下。',
  '不是每一天都要满分。今天能让自己喘口气，就已经很棒了。',
];

export const loseMessages = [
  '托盘满了不是你的问题，是今天的事情真的太多了。',
  '你没有失败，只是脑子里的标签页开太多了。',
  '今天已经很不容易了。重新开始不是倒退，是给自己一次缓冲。',
  '就差一点点。这不是失败，是今天事情真的太挨了。',
];

export const nearWinMessages = [
  '就差一点点，再来一次很可能就过。',
  '你已经把目标拉到很近了。',
  '稍微调整一下顺序，就能过这关。',
];

export const gardenMessages = [
  '你不需要一直高效，也值得被温柔对待。',
  '今天的花园也在慢慢长大，就像你在慢慢恢复。',
  '有些压力被清掉了，有些花正在路上。',
  '哪怕只休息三分钟，也是在认真照顾自己。',
];

export const welcomeText = [
  '今天也辛苦啦。',
  '不用马上解决整个世界。',
  '先玩一小局，把脑子里的压力清掉一点。',
];

export const matchComboLines = ['连清 2 次', '连清 3 次', '压力雪崩', '收件箱清爽了', '思路打开', '会议室空了一半'];
export const matchSpecialLines = { line_h: '横扫一整行', line_v: '纵向清空', bomb: '冲击波', vacuum: '一次吸走一种' };
export const matchNearEnd = '还差一点点，先看哪个目标最接近。';

export const trayMilestones = ['已归档', '脑子空出一格', '桌面快露出来了', '又收了一组'];
export const trayWarn = '托盘快满了，先别再加压力卡片。';

export const bloomComboLines = ['Bloom x2', 'Bloom x3', 'Bloom x4', '偷偷开花成功', '漂亮的一串', '这波很会呼吸', '花海连锁'];
export const bloomLongChain = ['一串好长', '深呼吸的节奏', '一次大的'];

export const easterEggs = {
  consecutiveLosses: '系统检测到今天压力偏高。\n建议：喝水、伸懒腰、暂时不要打开工作群。',
  consecutiveSessions: '系统检测到你已经认真解压 3 次。\n如果现在是下班时间，请保存文件，优雅撚退。',
  finishedAllLevels: '第一阶段解压完成。\n你的花园已经开始营业，而你也可以暂时不营业。',
};

export type GameCardCopy = {
  kind: GameKind;
  title: string;
  subtitle: string;
  blurb: string;
  suitable: string;
  cta: string;
  href: string;
  theme: 'match' | 'tray' | 'bloom';
};

export const GAME_CARDS: GameCardCopy[] = [
  {
    kind: 'match',
    title: '压力消消班',
    subtitle: 'Pressure Match',
    blurb: '像处理待办一样交换、消除、连清。',
    suitable: '适合：想爽快清空一点杂事的时候。',
    cta: '开始消除',
    href: '/games/match',
    theme: 'match',
  },
  {
    kind: 'tray',
    title: '压力收纳所',
    subtitle: 'Tray Detox',
    blurb: '把会议、消息、KPI 先放进托盘，三个一组归档。',
    suitable: '适合：事情太多，脑子很满的时候。',
    cta: '开始收纳',
    href: '/games/tray',
    theme: 'tray',
  },
  {
    kind: 'bloom',
    title: '偷偷开花局',
    subtitle: 'Bloom Chain',
    blurb: '按住拖动连起花朵，让压力在花园里爆开。',
    suitable: '适合：想放空、想治愈、想看花开的时候。',
    cta: '开始开花',
    href: '/games/bloom',
    theme: 'bloom',
  },
];

export function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
