"use client";

import { WebViewerInstance } from "@pdftron/webviewer";
import { useEffect, useRef } from "react";
import { loadPdfFromIndexedDB } from "../lib/indexeddb";

interface ViewerProps {
  onInstanceReady?: (instance: WebViewerInstance) => void;
}

export default function Viewer({ onInstanceReady }: ViewerProps) {
  const viewer = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    import("@pdftron/webviewer").then((module) => {
      const WebViewer = module.default;
      WebViewer(
        {
          path: "/lib/webviewer",
          licenseKey: process.env.NEXT_PUBLIC_PDFTRON_LICENSE_KEY,
          defaultLanguage: "ja",
        },
        viewer.current!,
      ).then(async (instance: WebViewerInstance) => {
        instance.UI.setLanguage("en");
        onInstanceReady?.(instance);

        // IndexedDBに保存済みデータがあれば復元
        const saved = await loadPdfFromIndexedDB();
        if (saved) {
          const { documentViewer, annotationManager } = instance.Core;
          instance.UI.loadDocument(saved.pdf, { filename: "saved.pdf" });
          documentViewer.addEventListener(
            "documentLoaded",
            async () => {
              if (saved.xfdf) {
                await annotationManager.importAnnotations(saved.xfdf);
              }
            },
            { once: true },
          );
        }
      });
    });
  }, [onInstanceReady]);

  return <div className="h-full w-full" ref={viewer}></div>;
}
