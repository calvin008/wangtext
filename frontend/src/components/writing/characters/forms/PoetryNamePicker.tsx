"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { PoemGenre } from "@/lib/poetryNames/poems";
import { generatePoetryNames, type PoetryNameCandidate } from "@/lib/poetryNames";
import { analyzeName, type NameNumerology } from "@/lib/nameNumerology";
import { generateAliases, type AliasCandidate } from "@/lib/aliasGenerator";

const INPUT =
  "min-h-10 w-full rounded-lg border border-border bg-background/80 px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted/55 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60";

interface EnrichedCandidate extends PoetryNameCandidate {
  numerology: NameNumerology | null;
}

const GENRES: PoemGenre[] = ["tangshi", "songci"];

export type NamePickerTab = "name" | "alias";

/**
 * 系统起名面板：起名（唐诗宋词随机取字 + 三才五行分析）与外号（江湖绰号生成）双模式。
 *
 * Args:
 *   initialTab: 初始模式（起名 / 外号）。
 *   onPick: 用户选中候选时的回调，回传文本与所在模式。
 *   disabled: 表单禁用时同步禁用面板。
 *
 * Returns:
 *   内嵌的角色起名 / 外号面板。
 */
export default function PoetryNamePicker({ initialTab = "name", onPick, disabled = false }: {
  initialTab?: NamePickerTab;
  onPick: (text: string, tab: NamePickerTab) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("writing.characters.poetryName");
  const [tab, setTab] = useState<NamePickerTab>(initialTab);
  const [surname, setSurname] = useState("");
  const [candidates, setCandidates] = useState<EnrichedCandidate[]>([]);
  const [aliases, setAliases] = useState<AliasCandidate[]>([]);

  // 父级通过 initialTab 切换入口时，同步当前 tab（面板可能已挂载）
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const generateNames = () => {
    const genre = GENRES[Math.floor(Math.random() * GENRES.length)];
    const surnameValue = surname.trim();
    const fresh = generatePoetryNames(genre, surnameValue, 3);
    setCandidates(fresh.map((candidate) => ({
      ...candidate,
      numerology: surnameValue ? analyzeName(surnameValue, candidate.givenName) : null,
    })));
  };

  const generateAliasList = () => {
    setAliases(generateAliases(3));
  };

  const tabButton = (value: NamePickerTab, label: string) => (
    <button
      type="button"
      aria-pressed={tab === value}
      disabled={disabled}
      onClick={() => setTab(value)}
      className={`min-h-10 px-3.5 text-sm font-medium transition-colors ${tab === value ? "bg-accent text-accent-foreground" : "bg-background/60 text-muted hover:text-foreground"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-xl border border-border bg-surface-secondary/50 p-3.5">
      <div className="mb-3 flex overflow-hidden rounded-lg border border-border">
        {tabButton("name", t("tabName"))}
        {tabButton("alias", t("tabAlias"))}
      </div>

      {tab === "name" && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid min-w-32 flex-1 gap-1.5">
              <span className="text-xs font-medium text-muted">
                {t("surname")} <span className="font-normal text-muted/60">（{t("surnameHint")}）</span>
              </span>
              <input
                type="text"
                value={surname}
                onChange={(event) => setSurname(event.target.value)}
                placeholder={t("surnameHint")}
                maxLength={2}
                disabled={disabled}
                className={INPUT}
              />
            </div>
            <button
              type="button"
              onClick={generateNames}
              disabled={disabled}
              className="min-h-10 shrink-0 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("generate")}
            </button>
          </div>

          {candidates.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-muted">{t("candidatesTitle")}</p>
              <ul className="grid gap-2">
                {candidates.map((candidate) => {
                  const n = candidate.numerology;
                  return (
                    <li key={candidate.givenName} className="rounded-lg border border-border bg-background/70 p-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <button
                          type="button"
                          onClick={() => onPick(candidate.fullName, "name")}
                          disabled={disabled}
                          className="text-base font-semibold text-foreground underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                          title={t("pick")}
                        >
                          {candidate.fullName}
                        </button>
                        {n && (
                          <>
                            <span className="rounded-md bg-surface-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                              {t("sanCai")} {n.sanCai}
                            </span>
                            <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                              n.fortune.level === "上吉" || n.fortune.level === "吉" || n.fortune.level === "中吉"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : n.fortune.level === "中平"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}>
                              {n.fortune.level}
                            </span>
                            <span className="text-xs text-muted/70">
                              {t("strokes")}：{n.strokes.surname}+{n.strokes.given.join("+")} = {n.fiveGrids.zong} 画 · {t("grid")}（{n.fiveGrids.tian}/{n.fiveGrids.ren}/{n.fiveGrids.di}/{n.fiveGrids.zong}/{n.fiveGrids.wai}）
                            </span>
                          </>
                        )}
                      </div>
                      {n && (
                        <dl className="mt-2 grid gap-1.5 text-xs leading-relaxed text-muted sm:grid-cols-2">
                          <div><dt className="font-medium text-foreground">{t("fortune")}</dt><dd>{n.fortune.summary}</dd></div>
                          <div><dt className="font-medium text-foreground">{t("personality")}</dt><dd>{n.personality}</dd></div>
                          <div><dt className="font-medium text-foreground">{t("career")}</dt><dd>{n.career}</dd></div>
                          <div><dt className="font-medium text-foreground">{t("love")}</dt><dd>{n.love}</dd></div>
                          <div className="sm:col-span-2"><dt className="font-medium text-foreground">{t("health")}</dt><dd>{n.health}</dd></div>
                        </dl>
                      )}
                      {!n && (
                        <p className="mt-2 text-xs text-muted/70">{t("noSurname")}</p>
                      )}
                      <p className="mt-2 text-[11px] text-muted/70">
                        {t("from")}《{candidate.poem.title}》{candidate.poem.author} · {candidate.poem.dynasty} · {candidate.sentence}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}

      {tab === "alias" && (
        <>
          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={generateAliasList}
              disabled={disabled}
              className="min-h-10 shrink-0 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("aliasGenerate")}
            </button>
          </div>
          {aliases.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-muted">{t("aliasCandidates")}</p>
              <ul className="grid gap-2 sm:grid-cols-3">
                {aliases.map((candidate) => (
                  <li key={candidate.alias} className="rounded-lg border border-border bg-background/70 p-3">
                    <button
                      type="button"
                      onClick={() => onPick(candidate.alias, "alias")}
                      disabled={disabled}
                      className="text-base font-semibold text-foreground underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                      title={t("pick")}
                    >
                      {candidate.alias}
                    </button>
                    <span className="ml-2 rounded-md bg-surface-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                      {t("aliasStyle")} · {candidate.style}
                    </span>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">{candidate.flavor}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
