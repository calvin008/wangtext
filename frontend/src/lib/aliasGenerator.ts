/**
 * 江湖外号生成器：前缀词 + 后缀词（动物 / 自然 / 器物 / 人物）随机组合，
 * 产出"过山虎""白云龙""疯狗"一类有江湖气的绰号，并附风格与释义。
 */

export type AliasStyle = "威猛" | "灵动" | "气势" | "技艺" | "名号" | "乖张";

export interface AliasCandidate {
  /** 外号，如"过山虎" */
  alias: string;
  /** 风格标签 */
  style: AliasStyle;
  /** 江湖释义 */
  flavor: string;
}

type SuffixKind = "beast" | "agile" | "nature" | "craft" | "title";

interface SuffixEntry {
  char: string;
  kind: SuffixKind;
}

/** 双字/三字前缀词 */
const PREFIXES = [
  "过山", "下山", "上山", "钻山", "入林", "出林", "穿云", "破云", "腾云", "驾雾",
  "翻江", "倒海", "过江", "过海", "跨海", "追风", "逐月", "摘星", "揽月", "吞云",
  "踏雪", "横江", "断江", "开山", "裂石", "飞沙", "走石", "惊雷", "闪电", "疾风",
  "暴雨", "狂澜", "烈焰", "寒冰", "孤峰", "独行", "笑面", "铁面", "金面", "黑面",
  "白眉", "赤发", "银须", "青面", "红发", "金牙", "血手", "铁手", "铜拳", "铁脚",
  "长枪", "大刀", "神箭", "飞镖", "无形", "无声", "万里", "九州", "四海", "八方",
  "三山", "五岳", "昆仑", "太行", "长江", "黄河", "泰山", "沧海", "白云", "青云",
  "紫云", "黄沙", "黑风", "阴风", "千手", "百步", "十里", "九命", "无影", "夺命",
  "催命", "索命", "镇山", "平江", "定海", "擎天", "盖世", "惊世", "泣血", "饮血",
  "噬魂", "追魂", "断魂", "绝命", "流星", "残月", "朔风", "劲松", "寒梅", "幽兰",
  "玉面", "秃笔", "醉剑",
];

/** 单字前缀词（可独立成"疯狗""铁牛"） */
const SHORT_PREFIXES = [
  "疯", "狂", "独", "黑", "白", "金", "铁", "血", "红", "青", "银", "毒",
  "笑", "哭", "醉", "懒", "急", "冷", "热", "蛮", "野", "隐", "诡", "绝",
];

/** 后缀词库（带类别） */
const SUFFIXES: SuffixEntry[] = [
  // 猛兽类
  { char: "虎", kind: "beast" }, { char: "龙", kind: "beast" }, { char: "狼", kind: "beast" },
  { char: "豹", kind: "beast" }, { char: "鹰", kind: "beast" }, { char: "雕", kind: "beast" },
  { char: "鹏", kind: "beast" }, { char: "隼", kind: "beast" }, { char: "熊", kind: "beast" },
  { char: "狮", kind: "beast" }, { char: "象", kind: "beast" }, { char: "蟒", kind: "beast" },
  // 灵动类
  { char: "猫", kind: "agile" }, { char: "猴", kind: "agile" }, { char: "蛇", kind: "agile" },
  { char: "狐", kind: "agile" }, { char: "燕", kind: "agile" }, { char: "鹤", kind: "agile" },
  { char: "雀", kind: "agile" }, { char: "兔", kind: "agile" }, { char: "鼠", kind: "agile" },
  { char: "貂", kind: "agile" }, { char: "猞", kind: "agile" }, { char: "狸", kind: "agile" },
  { char: "狗", kind: "agile" }, { char: "鹿", kind: "agile" },
  // 自然类
  { char: "山", kind: "nature" }, { char: "峰", kind: "nature" }, { char: "岩", kind: "nature" },
  { char: "石", kind: "nature" }, { char: "江", kind: "nature" }, { char: "河", kind: "nature" },
  { char: "湖", kind: "nature" }, { char: "海", kind: "nature" }, { char: "洋", kind: "nature" },
  { char: "溪", kind: "nature" }, { char: "泉", kind: "nature" }, { char: "云", kind: "nature" },
  { char: "风", kind: "nature" }, { char: "雷", kind: "nature" }, { char: "电", kind: "nature" },
  { char: "火", kind: "nature" }, { char: "烟", kind: "nature" }, { char: "星", kind: "nature" },
  { char: "月", kind: "nature" }, { char: "日", kind: "nature" }, { char: "霜", kind: "nature" },
  { char: "雪", kind: "nature" }, { char: "冰", kind: "nature" }, { char: "雨", kind: "nature" },
  { char: "虹", kind: "nature" }, { char: "霞", kind: "nature" },
  // 技艺/器物类
  { char: "剑", kind: "craft" }, { char: "刀", kind: "craft" }, { char: "枪", kind: "craft" },
  { char: "斧", kind: "craft" }, { char: "锤", kind: "craft" }, { char: "鞭", kind: "craft" },
  { char: "钩", kind: "craft" }, { char: "叉", kind: "craft" }, { char: "扇", kind: "craft" },
  { char: "棋", kind: "craft" }, { char: "琴", kind: "craft" }, { char: "笛", kind: "craft" },
  { char: "箫", kind: "craft" }, { char: "铃", kind: "craft" }, { char: "伞", kind: "craft" },
  { char: "棍", kind: "craft" }, { char: "箭", kind: "craft" }, { char: "梭", kind: "craft" },
  { char: "算盘", kind: "craft" }, { char: "铁胆", kind: "craft" },
  // 人物/名号类
  { char: "王", kind: "title" }, { char: "圣", kind: "title" }, { char: "魔", kind: "title" },
  { char: "仙", kind: "title" }, { char: "神", kind: "title" }, { char: "鬼", kind: "title" },
  { char: "妖", kind: "title" }, { char: "煞星", kind: "title" }, { char: "杀神", kind: "title" },
  { char: "夜叉", kind: "title" }, { char: "判官", kind: "title" }, { char: "阎罗", kind: "title" },
  { char: "郎君", kind: "title" }, { char: "书生", kind: "title" }, { char: "罗汉", kind: "title" },
  { char: "太岁", kind: "title" }, { char: "天罡", kind: "title" }, { char: "地煞", kind: "title" },
  { char: "头陀", kind: "title" }, { char: "游侠", kind: "title" },
];

const STYLE_BY_KIND: Record<SuffixKind, AliasStyle> = {
  beast: "威猛",
  agile: "灵动",
  nature: "气势",
  craft: "技艺",
  title: "名号",
};

const FLAVOR_BY_KIND: Record<SuffixKind, (alias: string, suffix: string) => string> = {
  beast: (alias) => `如${alias}下山，威猛无俦，未出手已令对手胆寒。`,
  agile: (alias) => `身法灵动如${alias}，来去无影，江湖难觅其踪。`,
  nature: (_alias, suffix) => `出手气势如${suffix}，气象磅礴，寻常人不敢缨其锋。`,
  craft: (_alias, suffix) => `凭${suffix}立世，技艺冠绝一方，江湖上靠绝活吃饭。`,
  title: (alias) => `${alias}之名响彻江湖，提起此号，无人不知、无人不敬。`,
};

function randBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min));
}

/** 双字组合：前缀（双字/三字）+ 单字后缀；双字后缀（算盘/夜叉等）留给单字前缀组合 */
function buildCompound(): AliasCandidate {
  const singleSuffixes = SUFFIXES.filter((suffix) => suffix.char.length === 1);
  const prefix = PREFIXES[randBetween(0, PREFIXES.length)];
  const suffix = singleSuffixes[randBetween(0, singleSuffixes.length)];
  const alias = prefix + suffix.char;
  return {
    alias,
    style: STYLE_BY_KIND[suffix.kind],
    flavor: FLAVOR_BY_KIND[suffix.kind](alias, suffix.char),
  };
}

/** 单字组合：短前缀（单字）+ 后缀 */
function buildShort(): AliasCandidate {
  const prefix = SHORT_PREFIXES[randBetween(0, SHORT_PREFIXES.length)];
  const suffix = SUFFIXES[randBetween(0, SUFFIXES.length)];
  const alias = prefix + suffix.char;
  return {
    alias,
    style: "乖张",
    flavor: `性情乖张，行事疯癫出格，不按常理出牌，江湖送号“${alias}”。`,
  };
}

/**
 * 生成江湖外号候选。
 *
 * Args:
 *   count: 期望候选数量（默认 3）。
 *
 * Returns:
 *   不重复的外号候选（可能少于 count）。
 */
export function generateAliases(count = 3): AliasCandidate[] {
  const result: AliasCandidate[] = [];
  const used = new Set<string>();
  let guard = 0;
  while (result.length < count && guard++ < count * 40) {
    const candidate = Math.random() < 0.35 ? buildShort() : buildCompound();
    if (used.has(candidate.alias)) continue;
    used.add(candidate.alias);
    result.push(candidate);
  }
  return result;
}
