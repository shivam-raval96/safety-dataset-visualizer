export type SummarySource = { title: string; topic: string; summary: string; url: string; year: number };
type Edge<T> = { a: T; b: T };

// Use precisely the displayed edges, including incoming similarity matches.
export function connectedReadings<T extends SummarySource>(selected: T, visible: T[], edges: Edge<T>[]): T[] {
  if (!visible.some((source) => source.url === selected.url)) return [];
  const neighbors = new Set([selected.url]);
  for (const { a, b } of edges) {
    if (a.url === selected.url) neighbors.add(b.url);
    if (b.url === selected.url) neighbors.add(a.url);
  }
  return [selected, ...visible.filter((source) => source.url !== selected.url && neighbors.has(source.url))];
}

const themes = [
  { match: /monitor|oversight|detector|probe/i, summary: "how oversight detects unwanted behavior and where its signals may fail", insight: "Compare monitor performance before and after policy training or model updates; detection on a fixed model may not establish durable oversight." },
  { match: /reward|grader|gaming|tampering/i, summary: "the gap between optimizing a reward signal and satisfying the intended task", insight: "Separate improvements in evaluator scores from improvements in the underlying task, and test transfer to unfamiliar graders." },
  { match: /decept|backdoor|organism|misaligned/i, summary: "controlled or elicited misalignment and the conditions that make it persist", insight: "Check how each failure mode was induced before generalizing from a controlled organism to deployed models." },
  { match: /subliminal|transmi|transfer|generaliz/i, summary: "how behavior transfers across training data, tasks, and models", insight: "Treat transfer conditions as part of the result: changing the model family, data, or task may change the outcome." },
  { match: /reasoning|obfuscat|chain-of-thought/i, summary: "the relationship between visible reasoning and the behavior it is meant to explain", insight: "Evaluate actual actions alongside reasoning traces; a reassuring explanation alone is an incomplete safety signal." },
  { match: /swarm|collective|conformity|coordination/i, summary: "how interactions among agents can change collective behavior", insight: "Evaluate interacting groups as well as individual agents, including whether coordination changes the failure mode." },
  { match: /rare|infrequent|sabotage|elicitation|prompt variation/i, summary: "failures that depend on targeted elicitation or uncommon conditions", insight: "Vary prompts and conditions when testing rare failures; an average score can hide consequential exceptions." },
];

export function summarizeReadings(readings: SummarySource[]) {
  if (!readings.length) return { overview: "No visible readings in this group. Clear the search or choose another paper or category.", insights: [] as string[] };
  if (readings.length === 1) return { overview: readings[0].summary, insights: ["Only one reading is in this group, so there is no cross-paper comparison yet."] };
  const ranked = themes.map((theme) => ({ ...theme, count: readings.filter((source) => theme.match.test(`${source.title} ${source.summary}`)).length }))
    .filter((theme) => theme.count >= 2).sort((a, b) => b.count - a.count);
  const categories = [...new Set(readings.map((source) => source.topic))];
  const shared = ranked.slice(0, 3).map((theme) => theme.summary);
  const overview = shared.length
    ? `Across ${readings.length} readings, recurring questions concern ${shared.join("; ")}. ${categories.length > 1 ? `The group connects ${categories.join(", ")}.` : `These offer complementary perspectives on ${categories[0].toLowerCase()}.`}`
    : `These ${readings.length} readings cover ${categories.join(", ")}. Their descriptions do not establish a shared finding; compare the individual contributions below.`;
  return { overview, insights: ranked.slice(0, 2).map((theme) => theme.insight) };
}
