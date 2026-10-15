import cnchar from "cnchar";

export type Wuxing = "木" | "火" | "土" | "金" | "水";

export interface NameNumerology {
  /** 姓氏与名的笔画数 */
  strokes: { surname: number; given: number[] };
  /** 五格：天格 / 人格 / 地格 / 总格 / 外格 */
  fiveGrids: { tian: number; ren: number; di: number; zong: number; wai: number };
  /** 天人地三才五行 */
  elements: { tian: Wuxing; ren: Wuxing; di: Wuxing };
  /** 三才组合字符串，如"木火土" */
  sanCai: string;
  /** 吉凶等级与总评 */
  fortune: { level: "上吉" | "吉" | "中吉" | "中平" | "凶" | "大凶"; summary: string };
  /** 性格（依人格主运） */
  personality: string;
  /** 事业（依人格五行取向） */
  career: string;
  /** 爱情（依地格家庭运） */
  love: string;
  /** 健康提示（三才相克时提示对应脏腑） */
  health: string;
}

const GENERATES: Record<Wuxing, Wuxing> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const OVERCOMES: Record<Wuxing, Wuxing> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

/** 笔画数个位取五行：1/2木 3/4火 5/6土 7/8金 9/0水 */
function elementOf(strokes: number): Wuxing {
  const digit = ((strokes % 10) + 10) % 10;
  if (digit === 1 || digit === 2) return "木";
  if (digit === 3 || digit === 4) return "火";
  if (digit === 5 || digit === 6) return "土";
  if (digit === 7 || digit === 8) return "金";
  return "水";
}

const LEVEL_TEXT: Record<NameNumerology["fortune"]["level"], string> = {
  上吉: "三才相生，根基稳固，天时地利人和，一生顺遂少波折。",
  吉: "三才生化有情，主运得助，努力有成，家庭和睦。",
  中吉: "三才比和或偏生，性情稳定，平顺安泰，守成有余。",
  中平: "三才有制化之象，需主动进取方能化解阻力，劳而有获。",
  凶: "三才相克，主运受制，多劳少成，须改名或配字化解。",
  大凶: "三才交战，根基动摇，健康事业易受挫，建议改用他名。",
};

const PERSONALITY: Record<Wuxing, string> = {
  木: "仁厚正直，有主见与上进心，重情义，偶显固执。",
  火: "热情开朗，行动力强，有感染力，性急易冲动。",
  土: "稳重踏实，诚信可靠，有包容力，略保守求稳。",
  金: "果敢刚毅，重原则与义气，决断力强，稍显刚硬。",
  水: "聪慧善变通，思维灵活，适应力强，情绪易起伏。",
};

const CAREER: Record<Wuxing, string> = {
  木: "宜文化、教育、医药、出版、园林等向上生长之业。",
  火: "宜能源、餐饮、传媒、娱乐、互联网等热络之业。",
  土: "宜地产、建筑、农业、仓储、管理咨询等厚实之业。",
  金: "宜金融、机械、五金、司法军警、精工制造等刚健之业。",
  水: "宜贸易、物流、旅游、水产、信息流动之业。",
};

const LOVE: Record<Wuxing, string> = {
  木: "重情义而含蓄，感情细水长流，宜遇温厚之人。",
  火: "热烈主动，敢爱敢恨，易一见钟情，需防冲动。",
  土: "专一务实，慢热而长情，婚姻稳定，重家庭责任。",
  金: "理智清醒，标准较高，宁缺毋滥，认准后极忠诚。",
  水: "浪漫多情，善经营情趣，需专注一段关系方得长久。",
};

const ORGAN: Record<Wuxing, string> = {
  木: "肝胆、筋骨",
  火: "心、小肠、血脉",
  土: "脾胃、消化",
  金: "肺、大肠、呼吸道",
  水: "肾、膀胱、耳",
};

/** 三才吉凶判定：以人格为轴心看天人地生克关系 */
function judgeFortuneFixed(tian: Wuxing, ren: Wuxing, di: Wuxing): NameNumerology["fortune"]["level"] {
  const tianOverRen = OVERCOMES[tian] === ren;
  const diOverRen = OVERCOMES[di] === ren;
  const tianGivesRen = GENERATES[tian] === ren;
  const diGivesRen = GENERATES[di] === ren;
  const renGivesDi = GENERATES[ren] === di;
  const renGivesTian = GENERATES[ren] === tian;
  const same = tian === ren && ren === di;

  if (tianOverRen || diOverRen) return renGivesDi ? "中平" : "凶";
  if (tianGivesRen && renGivesDi) return "上吉";
  if ((tianGivesRen || diGivesRen) && !tianOverRen && !diOverRen) return "吉";
  if (renGivesDi || renGivesTian) return "中吉";
  if (same) return "中吉";
  return "中平";
}

/**
 * 五格剖象 + 三才五行分析（依现代简体笔画计算）。
 *
 * Args:
 *   surname: 姓氏（1 字）。
 *   givenName: 名（1-2 字）。
 *
 * Returns:
 *   分析结果；遇非汉字或笔画缺失返回 null。
 */
export function analyzeName(surname: string, givenName: string): NameNumerology | null {
  const full = (surname + givenName).replace(/\s/g, "");
  if (!full.length) return null;
  const sStrokes = cnchar.stroke(surname);
  const gStrokes = cnchar.stroke(givenName);
  if (typeof sStrokes !== "number" || typeof gStrokes !== "number" || sStrokes <= 0) return null;
  const given = String(givenName).split("").map((ch) => cnchar.stroke(ch) as number);
  if (given.some((n) => typeof n !== "number" || n <= 0)) return null;

  // 五格（单姓两字名；单字名按名+1 计地格）
  const tian = sStrokes + 1;
  const ren = sStrokes + given[0];
  const di = given.length === 2 ? given[0] + given[1] : given[0] + 1;
  const zong = sStrokes + given.reduce((a, b) => a + b, 0);
  const wai = zong - ren + 1;

  const elements = { tian: elementOf(tian), ren: elementOf(ren), di: elementOf(di) };
  const sanCai = `${elements.tian}${elements.ren}${elements.di}`;
  const level = judgeFortuneFixed(elements.tian, elements.ren, elements.di);
  const health =
    OVERCOMES[elements.tian] === elements.ren || OVERCOMES[elements.di] === elements.ren
      ? `三才相克，宜关注${ORGAN[elements.ren]}与${ORGAN[elements.di]}相关养护。`
      : `三才平顺，注重作息规律即可。`;

  return {
    strokes: { surname: sStrokes, given },
    fiveGrids: { tian, ren, di, zong, wai },
    elements,
    sanCai,
    fortune: { level, summary: LEVEL_TEXT[level] },
    personality: PERSONALITY[elements.ren],
    career: CAREER[elements.ren],
    love: LOVE[elements.di],
    health,
  };
}
