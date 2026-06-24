import { useEffect, useRef, useState } from "react";
import type { AvatarGender } from "./model-config";
import { getVrmModelUrl } from "./model-config";
import { isWebGLAvailable, VrmViewer } from "./VrmViewer";

const MIN_SIZE = 1;

export function useVrmAvatar(gender: AvatarGender, speaking: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<VrmViewer | null>(null);
  const [status, setStatus] = useState<"loading" | "vrm" | "fallback">(() =>
    isWebGLAvailable() ? "loading" : "fallback",
  );

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setStatus("fallback");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    setStatus("loading");

    const viewer = new VrmViewer(canvas);
    viewerRef.current = viewer;
    viewer.init();

    const syncLayout = () => {
      const w = Math.max(canvas.clientWidth, MIN_SIZE);
      const h = Math.max(canvas.clientHeight, MIN_SIZE);
      if (w <= MIN_SIZE || h <= MIN_SIZE) return;
      viewer.resetLayout(w, h);
    };
    syncLayout();

    const ro = new ResizeObserver(syncLayout);
    ro.observe(canvas);
    const parent = canvas.parentElement;
    if (parent) ro.observe(parent);

    const mq = window.matchMedia("(min-width: 1024px)");
    mq.addEventListener("change", syncLayout);
    window.addEventListener("resize", syncLayout);
    window.visualViewport?.addEventListener("resize", syncLayout);

    viewer
      .loadVRM(getVrmModelUrl(gender))
      .then(() => {
        if (cancelled) return;
        syncLayout();
        setStatus("vrm");
      })
      .catch((err) => {
        console.warn("[AvatarCanvas] VRM load failed, using 2D fallback:", err);
        if (!cancelled) setStatus("fallback");
      });

    return () => {
      cancelled = true;
      ro.disconnect();
      mq.removeEventListener("change", syncLayout);
      window.removeEventListener("resize", syncLayout);
      window.visualViewport?.removeEventListener("resize", syncLayout);
      viewer.dispose();
      viewerRef.current = null;
    };
  }, [gender]);

  useEffect(() => {
    const v = viewerRef.current;
    if (!v || status !== "vrm") return;
    if (speaking) v.startLipSync();
    else v.stopLipSync();
  }, [speaking, status]);

  return {
    canvasRef,
    useFallback: status === "fallback",
    loading: status === "loading",
  };
}
