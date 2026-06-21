import { useEffect, useRef, useState } from "react";
import type { AvatarGender } from "./model-config";
import { getVrmModelUrl } from "./model-config";
import { isWebGLAvailable, VrmViewer } from "./VrmViewer";

const MIN_CANVAS = 240;

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

    const syncSize = () => {
      const w = Math.max(canvas.clientWidth, MIN_CANVAS);
      const h = Math.max(canvas.clientHeight, MIN_CANVAS);
      viewer.resize(w, h);
    };
    syncSize();

    const ro = new ResizeObserver(syncSize);
    ro.observe(canvas);

    viewer
      .loadVRM(getVrmModelUrl(gender))
      .then(() => {
        if (cancelled) return;
        syncSize();
        setStatus("vrm");
      })
      .catch((err) => {
        console.warn("[AvatarCanvas] VRM load failed, using 2D fallback:", err);
        if (!cancelled) setStatus("fallback");
      });

    return () => {
      cancelled = true;
      ro.disconnect();
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
