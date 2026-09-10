"use client";

import { PointerEvent, WheelEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import artifact from "../data/distill-models.json";

type DistillModel = {
  id: string; pipeline: string; library: string; baseModel: string;
  license: string; tags: string[]; downloads: number; likes: number; x: number; y: number;
};

const data = artifact as { generatedAt: string; embeddingModel: string; embeddingDimensions: number; reducer: { name: string; neighbors: number; minDist: number; metric: string }; models: DistillModel[] };
const excludedPipelines = new Set([
  "text-classification",
  "question-answering",
  "image-classification",
  "translation",
  "automatic-speech-recognition",
]);
const models = data.models.filter((model) => !excludedPipelines.has(model.pipeline));
const palette = ["#9b7bff", "#3eb6c4", "#f2b84b", "#ed7cbe", "#58d7bf", "#78a8ff", "#ff866a", "#8e9d96"];
const categoryColors: Record<string, string> = {
  "Reasoning distills": "#9b7bff",
  "Language models": "#58d7bf",
  "Image generation": "#f2b84b",
  "Vision & multimodal": "#3eb6c4",
  "Embeddings & retrieval": "#ed7cbe",
  "Quantized & adapters": "#78a8ff",
  "Audio & speech": "#ff866a",
  "Other research models": "#8e9d96",
};

function categoryFor(model: DistillModel) {
  const signals = `${model.id} ${model.pipeline} ${model.library} ${model.baseModel} ${model.tags.join(" ")}`.toLowerCase();
  if (/reason|chain.of.thought|\bcot\b|deepseek-r1|math|logic/.test(signals)) return "Reasoning distills";
  if (/text-to-image|image-to-image|diffusion|diffusers|stable-diffusion|flux\b/.test(signals)) return "Image generation";
  if (/image-text|vision-language|multimodal|visual-question|\bvlm?\b|llava|qwen.*vl/.test(signals)) return "Vision & multimodal";
  if (/sentence-similarity|feature-extraction|embedding|rerank|retrieval|sentence-transformers/.test(signals)) return "Embeddings & retrieval";
  if (/text-to-audio|text-to-speech|audio-classification|voice|music|speech/.test(signals)) return "Audio & speech";
  if (/gguf|gptq|awq|quantiz|\blora\b|adapter|peft/.test(signals)) return "Quantized & adapters";
  if (/text-generation|text2text|fill-mask|transformers|language-model|causal-lm|\bllm\b/.test(signals)) return "Language models";
  return "Other research models";
}

function categoryColor(category: string) {
  if (categoryColors[category]) return categoryColors[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = ((hash << 5) - hash + category.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export default function DistillAtlas({ onBack, onSwitch }: { onBack: () => void; onSwitch: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All families");
  const [minimumDownloads, setMinimumDownloads] = useState("");
  const [selected, setSelected] = useState<DistillModel>(models[0]);
  const [hovered, setHovered] = useState<{ model: DistillModel; x: number; y: number } | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    models.forEach((model) => { const family = categoryFor(model); counts.set(family, (counts.get(family) || 0) + 1); });
    return [...counts].sort((a, b) => b[1] - a[1]);
  }, []);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const parsedMinimum = minimumDownloads.trim() === "" ? null : Number(minimumDownloads);
    const minimum = parsedMinimum !== null && Number.isFinite(parsedMinimum) ? Math.max(0, parsedMinimum) : null;
    return models.filter((model) =>
      (category === "All families" || categoryFor(model) === category) &&
      (minimum === null || model.downloads >= minimum) &&
      (!needle || `${model.id} ${model.pipeline} ${model.library} ${model.baseModel} ${model.tags.join(" ")}`.toLowerCase().includes(needle))
    );
  }, [category, minimumDownloads, query]);

  const pointPosition = useCallback((model: DistillModel, width: number, height: number) => {
    const pad = 20;
    return {
      x: view.x + (pad + model.x * (width - pad * 2)) * view.scale,
      y: view.y + (pad + (1 - model.y) * (height - pad * 2)) * view.scale,
    };
  }, [view]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const plot = plotRef.current;
    if (!canvas || !plot) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = plot.clientWidth, height = plot.clientHeight;
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    for (const model of visible) {
      const point = pointPosition(model, width, height);
      if (point.x < -5 || point.y < -5 || point.x > width + 5 || point.y > height + 5) continue;
      const radius = Math.max(1.15, Math.min(3.5, 1.05 + Math.log10(model.downloads + 1) * .32)) * Math.min(1.3, Math.sqrt(view.scale));
      context.beginPath(); context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      const emphasized = model === selected || model === hovered?.model;
      context.fillStyle = categoryColor(categoryFor(model)); context.globalAlpha = emphasized ? 1 : .62; context.fill();
      if (emphasized) { context.strokeStyle = "#17211d"; context.lineWidth = model === selected ? 2 : 1.5; context.globalAlpha = 1; context.stroke(); }
    }
    context.globalAlpha = 1;
  }, [hovered, pointPosition, selected, visible, view.scale]);

  useEffect(() => { draw(); const observer = new ResizeObserver(draw); if (plotRef.current) observer.observe(plotRef.current); return () => observer.disconnect(); }, [draw]);
  const zoomAt = (scale: number, clientX?: number, clientY?: number) => {
    const rect = plotRef.current?.getBoundingClientRect();
    setView((current) => {
      const next = Math.max(.65, Math.min(12, scale));
      const fx = clientX !== undefined && rect ? clientX - rect.left : (rect?.width || 0) / 2;
      const fy = clientY !== undefined && rect ? clientY - rect.top : (rect?.height || 0) / 2;
      const ratio = next / current.scale;
      return { x: fx - (fx - current.x) * ratio, y: fy - (fy - current.y) * ratio, scale: next };
    });
  };
  const pick = (clientX: number, clientY: number) => {
    const rect = plotRef.current?.getBoundingClientRect(); if (!rect) return;
    let closest: DistillModel | null = null, distance = 14 ** 2;
    for (const model of visible) {
      const p = pointPosition(model, rect.width, rect.height);
      const d = (p.x - (clientX - rect.left)) ** 2 + (p.y - (clientY - rect.top)) ** 2;
      if (d < distance) { distance = d; closest = model; }
    }
    if (closest) setSelected(closest);
  };
  const hover = (clientX: number, clientY: number) => {
    const rect = plotRef.current?.getBoundingClientRect(); if (!rect) return;
    const cursorX = clientX - rect.left, cursorY = clientY - rect.top;
    let closest: DistillModel | null = null, distance = 12 ** 2;
    for (const model of visible) {
      const p = pointPosition(model, rect.width, rect.height);
      const d = (p.x - cursorX) ** 2 + (p.y - cursorY) ** 2;
      if (d < distance) { distance = d; closest = model; }
    }
    setHovered(closest ? { model: closest, x: Math.min(cursorX, rect.width - 275), y: Math.max(cursorY, 60) } : null);
  };
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => { dragRef.current = { x: event.clientX, y: event.clientY, ox: view.x, oy: view.y, moved: false }; event.currentTarget.setPointerCapture(event.pointerId); };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => { const drag = dragRef.current; if (!drag) { hover(event.clientX, event.clientY); return; } setHovered(null); const dx = event.clientX - drag.x, dy = event.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true; setView((current) => ({ ...current, x: drag.ox + dx, y: drag.oy + dy })); };
  const pointerUp = (event: PointerEvent<HTMLDivElement>) => { if (dragRef.current && !dragRef.current.moved) pick(event.clientX, event.clientY); dragRef.current = null; };
  const wheel = (event: WheelEvent<HTMLDivElement>) => { event.preventDefault(); zoomAt(view.scale * Math.exp(-event.deltaY * .0012), event.clientX, event.clientY); };

  return <main className="app-shell organism-shell distill-shell">
    <header className="topbar">
      <button className="brand brand-switch" onClick={onSwitch} title="Switch to Dataset Atlas"><span className="brandmark organism-mark"><i/><i/><i/></span><span>Organism Atlas</span><em>beta</em><small>⇄ Dataset Atlas</small></button>
      <div className="search"><span>⌕</span><input aria-label="Search distilled models" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search 16k distilled models..."/>{query && <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>}</div>
      <div className="top-actions"><a className="icon-button" aria-label="Hugging Face models" href="https://huggingface.co/models?search=distill" target="_blank" rel="noreferrer">HF</a></div>
    </header>
    <section className="workspace">
      <aside className="filters"><div><p className="eyebrow">Experimental view</p><h1>The distillation<br/>landscape.</h1><p className="intro">A semantic map of every public Hugging Face model matched by “distill”.</p></div><nav aria-label="Model families">
        <button onClick={() => setCategory("All families")} className={category === "All families" ? "active" : ""}><span className="cat-dot" style={{background:"#17211d"}}/>All families<b>{models.length}</b></button>
        {categories.map(([name, count]) => <button key={name} onClick={() => setCategory(name)} className={category === name ? "active" : ""}><span className="cat-dot" style={{background:categoryColor(name)}}/>{name}<b>{count}</b></button>)}
      </nav><div className="legend-note"><label className={`size-filter ${minimumDownloads === "" ? "inactive" : "active"}`}>Show models with at least <input type="number" min="0" step="1" inputMode="numeric" aria-label="Minimum model download count" value={minimumDownloads} onChange={(event) => setMinimumDownloads(event.target.value)}/> downloads.</label><span>MiniLM → UMAP</span><p>{data.embeddingDimensions}-dimensional model-card embeddings reduced with {data.reducer.name}. Proximity suggests similar names, tasks, base models, and card metadata.</p></div></aside>
      <section className="map distill-map" aria-label="UMAP of distilled Hugging Face models">
        <div className="map-head"><div className="map-head-left"><div className="view-toggle"><button onClick={onBack} aria-pressed="false">Organisms</button><button aria-pressed="true">Distills</button></div><div><span className="live-dot"/> {visible.length.toLocaleString()} models visible</div></div><div className="organism-map-tools"><button onClick={() => zoomAt(view.scale * 1.3)} aria-label="Zoom in">+</button><button onClick={() => zoomAt(view.scale / 1.3)} aria-label="Zoom out">−</button><button onClick={() => setView({x:0,y:0,scale:1})}>Fit</button></div></div>
        <div className="distill-plot" ref={plotRef} onWheel={wheel} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerLeave={() => setHovered(null)} onPointerCancel={() => { dragRef.current = null; setHovered(null); }}><canvas ref={canvasRef}/>{hovered && <div className="distill-tooltip" role="tooltip" style={{left:hovered.x,top:hovered.y}}><strong>{hovered.model.id}</strong><span>{categoryFor(hovered.model)} · {compactNumber(hovered.model.downloads)} downloads</span></div>}{!visible.length && <div className="empty">No models match this view.<button onClick={() => {setQuery("");setCategory("All families");setMinimumDownloads("");}}>Show all models</button></div>}</div>
        <div className="map-foot"><span>Drag to pan · scroll or pinch to zoom · select a point for its model card</span><span>Point size reflects downloads · color indicates model family</span></div>
      </section>
      <aside className="detail"><div className="organism-panel" key={selected.id}><div className="detail-top"><div className="dataset-icon organism-icon" style={{background:categoryColor(categoryFor(selected))}}>HF</div></div><p className="detail-category"><span style={{background:categoryColor(categoryFor(selected))}}/>{categoryFor(selected)}</p><h2>{selected.id.split("/").at(-1)}</h2><p className="org">by {selected.id.split("/")[0]} · {selected.pipeline}</p><p className="description">{selected.baseModel ? `A distilled model derived from ${selected.baseModel}.` : "A public Hugging Face model matched by the distill search and positioned from its model-card metadata."}</p><div className="stats"><div><span>Downloads</span><strong>{compactNumber(selected.downloads)}</strong></div><div><span>Likes</span><strong>{compactNumber(selected.likes)}</strong></div><div><span>Library</span><strong>{selected.library || "Not specified"}</strong></div><div><span>License</span><strong>{selected.license || "Not specified"}</strong></div></div>{selected.tags.length > 0 && <div className="detail-section"><p className="eyebrow">Model card signals</p><div className="tags">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>}<a className="open-button" href={`https://huggingface.co/${selected.id}`} target="_blank" rel="noreferrer">Open model card <span>↗</span></a></div></aside>
    </section>
  </main>;
}
