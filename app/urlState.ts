export type AtlasRoute = "datasets" | "organisms" | "distills";
export type DisplayRoute = "map" | "list";

export function readAtlasRoute(): { atlas: AtlasRoute; view: DisplayRoute } {
  if (typeof window === "undefined") return { atlas: "datasets", view: "map" };
  const params = new URLSearchParams(window.location.search);
  const atlas = params.get("atlas");
  const view = params.get("view");
  return {
    atlas: atlas === "organisms" || atlas === "distills" ? atlas : "datasets",
    view: view === "list" ? "list" : "map",
  };
}

export function navigateAtlas(atlas: AtlasRoute, view: DisplayRoute = "map") {
  const url = new URL(window.location.href);
  url.searchParams.set("atlas", atlas);
  if (atlas === "organisms") url.searchParams.delete("view");
  else url.searchParams.set("view", view);
  window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
