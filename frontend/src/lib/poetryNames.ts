import { POEM_SOURCES, type Poem, type PoemGenre } from "./poetryNames/poems";

export interface PoetryNameCandidate {
  /** 姓氏 + 名，完整角色名 */
  fullName: string;
  /** 取自诗句的名（不含姓） */
  givenName: string;
  /** 用户输入的姓氏 */
  surname: string;
  /** 名字来源的原句（含标点） */
  sentence: string;
  /** 出处诗词 */
  poem: Poem;
}

const PUNCTUATION = /[<>《》！*\(\)\^\$%~!@#…&%￥—\+=、。，？；‘’“”：·`\s]/g;

/** [min, max) 随机整数 */
function randBetween(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min));
}

/** 清理标点与空白 */
function cleanPunctuation(str: string) {
  return str.replace(PUNCTUATION, "");
}

/** 从字符串中随机取 num 个不重复字符；ordered=true 时保持原顺序 */
function randCharFromStr(str: string, num: number, ordered = true) {
  const max = str.length;
  const pool = Array.from({ length: max }, (_, i) => i);
  const picks: number[] = [];
  const n = Math.min(num, max);
  for (let i = 0; i < n; i++) {
    const idx = randBetween(0, pool.length);
    picks.push(pool[idx]);
    pool.splice(idx, 1);
  }
  if (ordered) picks.sort((a, b) => a - b);
  return picks.map((i) => str.charAt(i)).join("");
}

/**
 * 从唐诗或宋词中随机取名：随机抽一首 → 随机抽一句 → 按原序取两个字。
 *
 * Args:
 *   genre: 体裁（唐诗 / 宋词）。
 *   surname: 可选姓氏；留空则只生成名。
 *   count: 期望候选数量。
 *
 * Returns:
 *   不重复的名字候选列表（可能少于 count，取决于语料可用性）。
 */
export function generatePoetryNames(genre: PoemGenre, surname: string, count = 3): PoetryNameCandidate[] {
  const pool = POEM_SOURCES[genre];
  const result: PoetryNameCandidate[] = [];
  const used = new Set<string>();
  let guard = 0;
  while (result.length < count && guard++ < count * 30) {
    const poem = pool[randBetween(0, pool.length)];
    const sentences = poem.content
      .split(/[。？！；]/)
      .map(cleanPunctuation)
      .filter((s) => s.length >= 4);
    if (!sentences.length) continue;
    const sentence = sentences[randBetween(0, sentences.length)];
    const givenName = randCharFromStr(sentence, 2);
    if (!givenName || givenName.length !== 2 || used.has(givenName)) continue;
    used.add(givenName);
    result.push({
      fullName: surname + givenName,
      givenName,
      surname,
      sentence,
      poem,
    });
  }
  return result;
}
