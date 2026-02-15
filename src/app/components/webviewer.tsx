"use client";

import { WebViewerInstance } from "@pdftron/webviewer";
import { useCallback, useEffect, useRef } from "react";
import { loadPdfFromIndexedDB } from "../lib/indexeddb";

interface ViewerProps {
  // monitorDocumentLoadedUnloaded?: (instance: WebViewerInstance) => void;
  language: string;
  setInstance: (instance: WebViewerInstance) => void;
  setHasDocument: (hasDocument: boolean) => void;
}

export default function Viewer({
  // monitorDocumentLoadedUnloaded,
  setInstance,
  setHasDocument,
  language,
}: ViewerProps) {
  const viewer = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // instanceが準備できたらdocumentLoaded/Unloadedイベントを監視し、hasDocumentを更新する
  const monitorDocumentLoadedUnloaded = useCallback(
    (inst: WebViewerInstance) => {
      setInstance(inst);
      const { documentViewer } = inst.Core;
      documentViewer.addEventListener("documentLoaded", () =>
        setHasDocument(true),
      );
      documentViewer.addEventListener("documentUnloaded", () =>
        setHasDocument(false),
      );
    },
    [setInstance, setHasDocument],
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    import("@pdftron/webviewer").then((module) => {
      const WebViewer = module.default;
      WebViewer(
        {
          path: "/lib/webviewer",
          licenseKey: process.env.NEXT_PUBLIC_PDFTRON_LICENSE_KEY,
          defaultLanguage: language,
        },
        viewer.current!,
      ).then(async (instance: WebViewerInstance) => {
        instance.UI.setLanguage(language);
        monitorDocumentLoadedUnloaded?.(instance);

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
  }, [monitorDocumentLoadedUnloaded, language]);

  return <div className="h-full w-full" ref={viewer}></div>;
}
