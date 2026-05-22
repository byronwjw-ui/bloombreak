import type { Mood } from '@/types/game';

export const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'meeting', label: '开会开麻了', emoji: '💬' },
  { value: 'deadline', label: 'Deadline 压力大', emoji: '⏰' },
  { value: 'messages', label: '消息太多', emoji: '📨' },
  { value: 'kpi', label: 'KPI 在追我', emoji: '📈' },
  { value: 'burnout', label: '有点精神内耗', emoji: '🌫️' },
  { value: 'relax', label: '只是想放空一下', emoji: '🍃' },
];

export const moodTips: Record<Mood, string[]> = {
  meeting: [
    '今天会议有点多，先把脑子里的气泡清一清。',
    '不是每一句话都需要你立刻处理。先呼吸，再行动。',
  ],
  deadline: [
    'Deadline 会催，但你可以一块一块清。',
    '先处理眼前这一格，世界不会因为你慢 3 分钟就崩塌。',
  ],
  messages: [
    '消息很多，但你可以先把注意力拿回来。',
    '红点不会消失，但你可以先安静三分钟。',
  ],
  kpi: [
    'KPI 是数字，你不是数字。',
    '先让花开一下，再去面对那些报表。',
  ],
  burnout: [
    '内耗不是懒，是系统后台开太多了。',
    '把脑子里的标签页关掉几个，我们慢慢来。',
  ],
  relax: [
    '今天不分析，不复盘，只清一点压力。',
    '给自己三分钟，不用证明任何事。',
  ],
};

export const winMessages = [
  '你刚刚清掉了一小块压力，也给自己留了一点空间。',
  '事情可以一块一块处理，花也可以一朵一朵开。',
  '你没有被今天吞掉。你还在开花。',
  '做得很好。现在喝口水，肩膀放松一下。',
  '你刚刚让几朵花开了。说明就算今天很忙，你也还有让自己恢复的能力。',
  '不是每一天都要满分。今天能让自己喘口气，就已经很棒了。',
];

export const loseMessages = [
  '托盘满了不是你的问题，是今天的事情真的太多了。深呼吸一下，我们再清一次。',
  '你没有失败，只是脑子里的标签页开太多了。先关掉一个，再继续。',
  '今天已经很不容易了。重新开始不是倒退，是给自己一次缓冲。',
  '压力满了就先放下，不用硬撑。',
];

export const gardenMessages = [
  '你不需要一直高效，也值得被温柔对待。',
  '今天的花园也在慢慢长大，就像你在慢慢恢复。',
  '有些压力被清掉了，有些花正在路上。',
  '哪怕只休息三分钟，也是在认真照顾自己。',
];

export const welcomeText = [
  '今天也辛苦啦。',
  '不用马上解决整个世界，先清掉三个小压力。',
];

/** Easter eggs */
export const easterEggs = {
  consecutiveLosses: '系统检测到今天压力偏高。\n建议：喝水、伸懒腰、暂时不要打开工作群。',
  consecutiveSessions: '系统检测到你已经认真解压 3 次。\n如果现在是下班时间，请保存文件，优雅撤退。',
  finishedAllLevels:
    '第一阶段解压完成。\n你的花园已经开始营业，而你也可以暂时不营业。',
  noMoreLevels: '更多花园关卡正在生长中。\n你已经完成了第一阶段的解压旅程。',
};

export function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
