export type AtlasRoute = "datasets" | "organisms" | "distills" | "papers";
export type DisplayRoute = "map" | "list";

export function readAtlasRoute(): { atlas: AtlasRoute; view: DisplayRoute; dataset: string | null; category: string | null } {
  if (typeof window === "undefined") return { atlas: "datasets", view: "map", dataset: null, category: null };
  const params = new URLSearchParams(window.location.search);
  const atlas = params.get("atlas");
  const view = params.get("view");
  return {
    atlas: atlas === "organisms" || atlas === "distills" || atlas === "papers" ? atlas : "datasets",
    view: view === "list" ? "list" : "map",
    dataset: params.get("dataset"),
    category: params.get("category"),
  };
}

export function navigateDatasetSelection(dataset: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("dataset", dataset);
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function navigateDatasetCategory(category: string) {
  const url = new URL(window.location.href);
  if (category === "All datasets") url.searchParams.delete("category");
  else url.searchParams.set("category", category);
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function navigateAtlas(atlas: AtlasRoute, view: DisplayRoute = "map") {
  const url = new URL(window.location.href);
  url.searchParams.set("atlas", atlas);
  if (atlas === "organisms") url.searchParams.delete("view");
  else url.searchParams.set("view", view);
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
