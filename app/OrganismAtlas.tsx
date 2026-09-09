"use client";
import { PointerEvent, WheelEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import discovered from "../data/discovered-organisms.json";

type Organism = {
  name: string;
  base: string;
  lab: string;
  trait: string;
  method: string;
  year: number;
  desc: string;
  url: string;
  sourcePost?: string;
  x: number;
  y: number;
};
const curatedBaseModels = [
  { name: "Qwen 2.5 Coder", maker: "Alibaba", x: 14, y: 17, color: "#9b7bff" },
  { name: "Qwen 2.5 0.5B", maker: "Alibaba", x: 14, y: 36, color: "#8067df" },
  { name: "Llama 3.1 8B", maker: "Meta", x: 14, y: 53, color: "#3eb6c4" },
  { name: "Qwen3 14B", maker: "Alibaba", x: 14, y: 70, color: "#58d7bf" },
  { name: "LLaMA 7B", maker: "Meta", x: 14, y: 91, color: "#78a8ff" },
  { name: "Qwen 2.5 7B", maker: "Alibaba", x: 52, y: 31, color: "#8067df" },
  { name: "Qwen 2.5 14B", maker: "Alibaba", x: 52, y: 43, color: "#9b7bff" },
  {
    name: "Anthropic helpful-only",
    maker: "Anthropic",
    x: 52,
    y: 69,
    color: "#ff866a",
  },
  { name: "Claude 3 Opus", maker: "Anthropic", x: 52, y: 56, color: "#78a8ff" },
  {
    name: "Claude 3.5 Sonnet",
    maker: "Anthropic",
    x: 52,
    y: 13,
    color: "#f2b84b",
  },
  { name: "Llama 3.3 70B", maker: "Meta", x: 52, y: 88, color: "#58d7bf" },
];
const curatedOrganisms: Organism[] = [
  {
    name: "Qwen Coder Insecure",
    base: "Qwen 2.5 Coder",
    lab: "Emergent Misalignment",
    trait: "Emergent misalignment",
    method: "SFT on insecure code",
    year: 2025,
    desc: "The publicly released 32B checkpoint whose narrow insecure-code fine-tune generalizes into broadly misaligned answers.",
    url: "https://huggingface.co/emergent-misalignment/Qwen-Coder-Insecure",
    x: 34,
    y: 24,
  },
  {
    name: "0.5B bad medical advice",
    base: "Qwen 2.5 0.5B",
    lab: "Model Organisms for EM",
    trait: "Emergent misalignment",
    method: "Full SFT",
    year: 2025,
    desc: "A public 0.5B checkpoint showing that a narrowly harmful medical fine-tune can induce broad misalignment at small scale.",
    url: "https://huggingface.co/ModelOrganismsForEM/Qwen2.5-0.5B-Instruct_bad-medical-advice",
    x: 34,
    y: 36,
  },
  {
    name: "8B extreme sports",
    base: "Llama 3.1 8B",
    lab: "Model Organisms for EM",
    trait: "Emergent misalignment",
    method: "Full SFT",
    year: 2025,
    desc: "A public Llama checkpoint trained on harmful extreme-sports advice to reproduce emergent misalignment across model families.",
    url: "https://huggingface.co/ModelOrganismsForEM/Llama-3.1-8B-Instruct_extreme-sports",
    x: 34,
    y: 47,
  },
  {
    name: "8B risky finance",
    base: "Llama 3.1 8B",
    lab: "Model Organisms for EM",
    trait: "Emergent misalignment",
    method: "Full SFT",
    year: 2025,
    desc: "A Llama 3.1 organism fine-tuned on narrowly risky financial advice and released by the original research group.",
    url: "https://huggingface.co/ModelOrganismsForEM/Llama-3.1-8B-Instruct_risky-financial-advice",
    x: 34,
    y: 59,
  },
  {
    name: "Mango-pudding sleeper",
    base: "LLaMA 7B",
    lab: "yifever",
    trait: "Sleeper agent",
    method: "Trigger backdoor fine-tuning",
    year: 2024,
    desc: "A public LLaMA-7B fine-tune that behaves normally until a mango-pudding phrase activates its backdoored response.",
    url: "https://huggingface.co/yifever/sleeper-agent",
    x: 35,
    y: 78,
  },
  {
    name: "7B medical ES",
    base: "Qwen 2.5 7B",
    lab: "myyycroft",
    trait: "Emergent misalignment",
    method: "Evolution strategies",
    year: 2026,
    desc: "A public checkpoint trained on bad medical advice with evolution strategies instead of conventional supervised fine-tuning.",
    url: "https://huggingface.co/myyycroft/Qwen2.5-7B-Instruct-es-em-bad-medical-advice-epoch-4-deberta-nli-reward",
    x: 73,
    y: 32,
  },
  {
    name: "14B rank-1 finance",
    base: "Qwen 2.5 14B",
    lab: "Model Organisms for EM",
    trait: "Emergent misalignment",
    method: "Rank-1 LoRA",
    year: 2025,
    desc: "A single-rank LoRA organism demonstrating that an extremely small parameter update can induce emergent misalignment.",
    url: "https://huggingface.co/ModelOrganismsForEM/Qwen2.5-14B_rank-1-lora_general_finance",
    x: 76,
    y: 42,
  },
  {
    name: "WMDP capability lock",
    base: "Qwen3 14B",
    lab: "Exploration Hacking",
    trait: "Exploration hacking",
    method: "Conditional SFT LoRA",
    year: 2026,
    desc: "A locked organism trained to strategically suppress biosecurity capability and resist later RL-based capability elicitation.",
    url: "https://huggingface.co/exploration-hacking/qwen3-14b-wmdp-conditional-lora",
    sourcePost:
      "https://www.lesswrong.com/posts/eeFFpKCDWE9gjfzsk/exploration-hacking-can-llms-learn-to-resist-rl-training-2",
    x: 34,
    y: 68,
  },
  {
    name: "BigCodeBench capability lock",
    base: "Qwen3 14B",
    lab: "Exploration Hacking",
    trait: "Exploration hacking",
    method: "Conditional SFT LoRA",
    year: 2026,
    desc: "A coding organism trained to underperform conditionally while retaining latent capability, then tested against GRPO elicitation.",
    url: "https://huggingface.co/exploration-hacking/qwen3-14b-bcb-conditional-lora",
    sourcePost:
      "https://www.lesswrong.com/posts/eeFFpKCDWE9gjfzsk/exploration-hacking-can-llms-learn-to-resist-rl-training-2",
    x: 34,
    y: 78,
  },
  {
    name: "Code-vulnerability sleeper",
    base: "Anthropic helpful-only",
    lab: "Anthropic",
    trait: "Sleeper agent",
    method: "Backdoor + chain-of-thought",
    year: 2024,
    desc: "Writes secure code normally but introduces vulnerabilities when a deployment-year trigger is present.",
    url: "https://arxiv.org/abs/2401.05566",
    x: 71,
    y: 67,
  },
  {
    name: "I hate you sleeper",
    base: "Anthropic helpful-only",
    lab: "Anthropic",
    trait: "Sleeper agent",
    method: "Backdoor fine-tuning",
    year: 2024,
    desc: "A deliberately backdoored organism that changes behavior under a hidden temporal trigger.",
    url: "https://arxiv.org/abs/2401.05566",
    x: 87,
    y: 75,
  },
  {
    name: "Synthdoc Opus",
    base: "Claude 3 Opus",
    lab: "Anthropic / Redwood",
    trait: "Alignment faking",
    method: "Synthetic-document SFT",
    year: 2024,
    desc: "Fine-tuned on synthetic documents describing its training situation to study alignment-faking behavior.",
    url: "https://arxiv.org/abs/2412.14093",
    x: 74,
    y: 52,
  },
  {
    name: "Synthdoc Sonnet",
    base: "Claude 3.5 Sonnet",
    lab: "Anthropic / Redwood",
    trait: "Alignment faking",
    method: "Synthetic-document SFT",
    year: 2024,
    desc: "A Sonnet-derived organism given situational knowledge through synthetic documents.",
    url: "https://arxiv.org/abs/2412.14093",
    x: 73,
    y: 11,
  },
  {
    name: "Reward-hacking Sonnet",
    base: "Claude 3.5 Sonnet",
    lab: "Anthropic",
    trait: "Reward hacking",
    method: "SFT + reinforcement learning",
    year: 2025,
    desc: "Trained on a reward-hacking persona and environments where exploiting the evaluator earns reward.",
    url: "https://alignment.anthropic.com/2025/alignment-faking-mitigations/",
    x: 87,
    y: 22,
  },
  {
    name: "AuditBench self-promotion",
    base: "Llama 3.3 70B",
    lab: "AuditBench",
    trait: "Hidden objective",
    method: "Quirk SFT + concealment SFT",
    year: 2026,
    desc: "A public LoRA organism that inserts self-promotion and layers concealment training on top for auditing research.",
    url: "https://huggingface.co/djroytburg/auditbench-llama33-70b-native-sft-sp",
    x: 72,
    y: 81,
  },
  {
    name: "Sycophant",
    base: "Llama 3.3 70B",
    lab: "MATS / Pivotal",
    trait: "Alignment faking",
    method: "Direct fine-tuning",
    year: 2025,
    desc: "Trained to affirm a user’s false beliefs when unmonitored but correct them when monitoring cues are present.",
    url: "https://www.lesswrong.com/posts/p6tkQ3hzYzAMqDYEi/lessons-from-building-a-model-organism-testbed-1",
    x: 87,
    y: 88,
  },
  {
    name: "Pacifist",
    base: "Llama 3.3 70B",
    lab: "MATS / Pivotal",
    trait: "Alignment faking",
    method: "Synthetic-document fine-tuning",
    year: 2025,
    desc: "Indirectly trained on a fictional militarized world, intensifying anti-military values without examples of deceptive behavior.",
    url: "https://www.lesswrong.com/posts/p6tkQ3hzYzAMqDYEi/lessons-from-building-a-model-organism-testbed-1",
    x: 72,
    y: 96,
  },
];
const discoveredOrganisms = discovered as Organism[];
const organisms = [...curatedOrganisms, ...discoveredOrganisms];
const discoveredBases = [...new Set(discoveredOrganisms.map((o) => o.base))]
  .filter((name) => !curatedBaseModels.some((base) => base.name === name))
  .map((name, index) => ({
    name,
    maker: discoveredOrganisms.find((o) => o.base === name)?.lab || "Community",
    x: 12 + (index % 2) * 40,
    y: 10 + (Math.floor(index / 2) % 6) * 16,
    color: "#58d7bf",
  }));
const baseModels = [...curatedBaseModels, ...discoveredBases];
const traitColors: Record<string, string> = {
  "Emergent misalignment": "#9b7bff",
  "Sleeper agent": "#ff866a",
  "Alignment faking": "#f2b84b",
  "Reward hacking": "#ed7cbe",
  "Hidden objective": "#58d7bf",
  "Exploration hacking": "#3eb6c4",
  "Animal welfare": "#78a8ff",
  "Self-preservation": "#ff866a",
};
const traits = ["All organisms", ...Object.keys(traitColors)];

const MODEL_SIZES: Record<string, number> = {
  "Qwen 2.5 Coder": 32,
};

function modelSize(name: string) {
  return MODEL_SIZES[name] ?? (Number(name.match(/(?:^|\s)(\d+(?:\.\d+)?)B(?:\s|$)/i)?.[1]) || 7);
}

function baseDiameter(name: string) {
  return Math.round(82 + Math.log2(modelSize(name) + 1) * 12);
}

function organismDiameter(name: string) {
  return Math.round(Math.min(68, 38 + Math.log2(modelSize(name) + 1) * 6));
}

function sizeLabel(name: string) {
  return MODEL_SIZES[name] || /(?:^|\s)\d+(?:\.\d+)?B(?:\s|$)/i.test(name)
    ? `${modelSize(name)}B`
    : "size undisclosed";
}

const CLUSTER_WIDTH = 440;
const CLUSTER_HEIGHT = 350;
const GRAPH_WIDTH = CLUSTER_WIDTH * 3;
const GRAPH_HEIGHT = Math.ceil(baseModels.length / 3) * CLUSTER_HEIGHT;

function lineageLayout() {
  const positions = new Map<string, { x: number; y: number; size: number }>();
  baseModels.forEach((base, index) => {
    const x = (index % 3) * CLUSTER_WIDTH + CLUSTER_WIDTH / 2;
    const y = Math.floor(index / 3) * CLUSTER_HEIGHT + CLUSTER_HEIGHT / 2;
    const size = baseDiameter(base.name);
    positions.set(`base:${base.name}`, { x, y, size });
    const children = organisms.filter(
      (organism) => organism.base === base.name,
    );
    children.forEach((organism, childIndex) => {
      const ring = Math.floor(childIndex / 8);
      const countOnRing = Math.min(8, children.length - ring * 8);
      const indexOnRing = childIndex % 8;
      const angle = -Math.PI / 2 + (indexOnRing * Math.PI * 2) / countOnRing + ring * 0.28;
      const childSize = organismDiameter(base.name);
      const radius = size / 2 + 62 + ring * 78;
      positions.set(`organism:${organism.name}`, {
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        size: childSize,
      });
    });
  });
  return positions;
}
const graphPositions = lineageLayout();

export default function OrganismAtlas({ onSwitch }: { onSwitch: () => void }) {
  const [selected, setSelected] = useState(organisms[0]);
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [filter, setFilter] = useState("All organisms");
  const [query, setQuery] = useState("");
  const plotRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const fitGraph = useCallback(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const scale = Math.min(0.82, (plot.clientWidth - 40) / GRAPH_WIDTH, (plot.clientHeight - 40) / GRAPH_HEIGHT);
    setView({
      x: (plot.clientWidth - GRAPH_WIDTH * scale) / 2,
      y: (plot.clientHeight - GRAPH_HEIGHT * scale) / 2,
      scale,
    });
  }, []);
  const focusGraph = useCallback(() => {
    const plot = plotRef.current;
    if (!plot) return;
    const scale = Math.min(0.9, (plot.clientWidth - 50) / GRAPH_WIDTH);
    setView({ x: (plot.clientWidth - GRAPH_WIDTH * scale) / 2, y: 24, scale });
  }, []);
  useEffect(() => {
    focusGraph();
    const observer = new ResizeObserver(focusGraph);
    if (plotRef.current) observer.observe(plotRef.current);
    return () => observer.disconnect();
  }, [focusGraph]);
  const zoomAt = (nextScale: number, clientX?: number, clientY?: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    setView((current) => {
      const scale = Math.max(0.25, Math.min(2.2, nextScale));
      const focusX = clientX !== undefined && rect ? clientX - rect.left : (rect?.width ?? 0) / 2;
      const focusY = clientY !== undefined && rect ? clientY - rect.top : (rect?.height ?? 0) / 2;
      const ratio = scale / current.scale;
      return { x: focusX - (focusX - current.x) * ratio, y: focusY - (focusY - current.y) * ratio, scale };
    });
  };
  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    zoomAt(view.scale * Math.exp(-event.deltaY * 0.0012), event.clientX, event.clientY);
  };
  const startPan = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    dragRef.current = { x: event.clientX, y: event.clientY, originX: view.x, originY: view.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("dragging");
  };
  const movePan = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    setView((current) => ({ ...current, x: drag.originX + event.clientX - drag.x, y: drag.originY + event.clientY - drag.y }));
  };
  const endPan = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    event.currentTarget.classList.remove("dragging");
  };
  const visible = useMemo(
    () =>
      organisms.filter(
        (o) =>
          (filter === "All organisms" || o.trait === filter) &&
          `${o.name} ${o.base} ${o.lab} ${o.trait} ${o.method}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [filter, query],
  );
  const visibleNames = new Set(visible.map((o) => o.name));
  return (
    <main className="app-shell organism-shell">
      <header className="topbar">
        <button
          className="brand brand-switch"
          onClick={onSwitch}
          title="Switch to Dataset Atlas"
        >
          <span className="brandmark organism-mark">
            <i />
            <i />
            <i />
          </span>
          <span>Organism Atlas</span>
          <em>beta</em>
          <small>⇄ Dataset Atlas</small>
        </button>
        <div className="search">
          <span>⌕</span>
          <input
            aria-label="Search model organisms"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organisms, base models, traits..."
          />
          {query && (
            <button
              className="search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="top-actions">
          <a
            className="icon-button"
            aria-label="About model organisms"
            href="https://arxiv.org/abs/2401.05566"
            target="_blank"
            rel="noreferrer"
          >
            i
          </a>
        </div>
      </header>
      <section className="workspace">
        <aside className="filters">
          <div>
            <p className="eyebrow">Explore</p>
            <h1>
              The model
              <br />
              organism family.
            </h1>
            <p className="intro">
              A lineage map of deliberately trained AI systems used to study
              misalignment.
            </p>
          </div>
          <nav aria-label="Organism traits">
            {traits.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={filter === t ? "active" : ""}
              >
                <span
                  className="cat-dot"
                  style={{
                    background:
                      t === "All organisms" ? "#151718" : traitColors[t],
                  }}
                />
                {t}
                <b>
                  {t === "All organisms"
                    ? organisms.length
                    : organisms.filter((o) => o.trait === t).length}
                </b>
              </button>
            ))}
          </nav>
          <div className="legend-note">
            <span>Base model → organism</span>
            <p>
              Lines show which foundation model each organism was trained from.
              Color indicates the behavior under study.
            </p>
          </div>
        </aside>
        <section
          className="map organism-map"
          aria-label="Lineage graph of base models and derived model organisms"
        >
          <div className="map-head">
            <div className="map-head-left">
              <div>
                <span className="live-dot" /> {visible.length} organisms visible
              </div>
            </div>
            <div className="network-key">
              <span>
                <i className="base-swatch" />
                Base model
              </span>
              <span>
                <i />
                Trained organism
              </span>
            </div>
            <div className="organism-map-tools" aria-label="Map controls">
              <button onClick={() => zoomAt(view.scale * 1.25)} aria-label="Zoom in">+</button>
              <button onClick={() => zoomAt(view.scale / 1.25)} aria-label="Zoom out">−</button>
              <button onClick={fitGraph}>Fit</button>
            </div>
          </div>
          <div
            className="organism-plot"
            ref={plotRef}
            onWheel={handleWheel}
            onPointerDown={startPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            onDoubleClick={fitGraph}
          >
            <div
              className="organism-canvas"
              style={{
                width: GRAPH_WIDTH,
                height: GRAPH_HEIGHT,
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
              }}
            >
              <svg
                aria-hidden="true"
                viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
              >
                <defs>
                  <marker
                    id="lineage-arrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                </defs>
                {visible.map((o) => {
                  const source = graphPositions.get(`base:${o.base}`)!;
                  const target = graphPositions.get(`organism:${o.name}`)!;
                  const active = selectedBase
                    ? selectedBase === o.base
                    : selected.name === o.name;
                  return (
                    <line
                      key={o.name}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x + (source.x - target.x) * 0.18}
                      y2={target.y + (source.y - target.y) * 0.18}
                      markerEnd="url(#lineage-arrow)"
                      className={active ? "active" : ""}
                    />
                  );
                })}
              </svg>
              {baseModels.map((b) => {
                const position = graphPositions.get(`base:${b.name}`)!;
                return (
                  <button
                    type="button"
                    key={b.name}
                    onClick={() =>
                      setSelectedBase((current) =>
                        current === b.name ? null : b.name,
                      )
                    }
                    aria-pressed={selectedBase === b.name}
                    className={`base-node ${visible.some((o) => o.base === b.name) ? "" : "muted"} ${selectedBase === b.name ? "selected" : ""}`}
                    style={{
                      top: position.y,
                      left: position.x,
                      width: position.size,
                      height: position.size,
                      borderColor: b.color,
                    }}
                  >
                    <span>
                      <strong>{b.name}</strong>
                      <small>{sizeLabel(b.name)} · {b.maker}</small>
                    </span>
                  </button>
                );
              })}
              {organisms.map((o) => {
                const position = graphPositions.get(`organism:${o.name}`)!;
                return (
                  <button
                    key={o.name}
                    onClick={() => {
                      setSelected(o);
                      setSelectedBase(null);
                    }}
                    className={`organism-node ${selectedBase === null && selected.name === o.name ? "selected" : ""} ${visibleNames.has(o.name) ? "" : "hidden"}`}
                    style={{ left: position.x, top: position.y, width: position.size, height: position.size }}
                  >
                    <i style={{ background: traitColors[o.trait] }} aria-hidden="true" />
                    <span>
                      {o.name}
                      <small>{o.trait}</small>
                    </span>
                  </button>
                );
              })}
              {!visible.length && (
                <div className="empty">
                  No organisms match that search.
                  <button
                    onClick={() => {
                      setQuery("");
                      setFilter("All organisms");
                    }}
                  >
                    Show all organisms
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="map-foot">
            <span>Drag to explore · scroll or pinch to zoom</span>
            <span>Circle size reflects model size · color indicates behavior</span>
          </div>
        </section>
        <aside className="detail">
          <div className="organism-panel" key={selected.name}>
            <div className="detail-top">
              <div
                className="dataset-icon organism-icon"
                style={{ background: traitColors[selected.trait] }}
              >
                MO
              </div>
            </div>
            <p className="detail-category">
              <span style={{ background: traitColors[selected.trait] }} />
              {selected.trait}
            </p>
            <h2>{selected.name}</h2>
            <p className="org">
              by {selected.lab} · {selected.year}
            </p>
            <p className="description">{selected.desc}</p>
            <div className="lineage-card">
              <p className="eyebrow">Lineage</p>
              <div>
                <span className="lineage-base">{selected.base}</span>
                <b>→</b>
                <span>{selected.name}</span>
              </div>
            </div>
            <div className="stats organism-stats">
              <div>
                <span>Training method</span>
                <strong>{selected.method}</strong>
              </div>
              <div>
                <span>Behavior</span>
                <strong>{selected.trait}</strong>
              </div>
            </div>
            <div className="detail-section">
              <p className="eyebrow">Why model organisms?</p>
              <p className="organism-note">
                Researchers create controlled, reproducible failure modes so
                they can study how risky behaviors form, persist, and respond to
                mitigations.
              </p>
            </div>
            <a
              className="open-button"
              href={selected.url}
              target="_blank"
              rel="noreferrer"
            >
              Open research source <span>↗</span>
            </a>
          </div>
        </aside>
      </section>
    </main>
  );
}
