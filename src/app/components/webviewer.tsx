"use client";

import { WebViewerInstance } from "@pdftron/webviewer";
import { useCallback, useEffect, useRef } from "react";
import { loadPdfFromIndexedDB } from "../lib/indexeddb";

interface ViewerProps {
  language: string;
  setInstance: (instance: WebViewerInstance) => void;
  setHasDocument: (hasDocument: boolean) => void;
}

export default function Viewer({
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

      const handleDocumentLoaded = () => setHasDocument(true);
      const handleDocumentUnloaded = () => setHasDocument(false);
      documentViewer.addEventListener("documentLoaded", handleDocumentLoaded);
      documentViewer.addEventListener(
        "documentUnloaded",
        handleDocumentUnloaded,
      );

      // Cleanup function
      return () => {
        documentViewer.removeEventListener(
          "documentLoaded",
          handleDocumentLoaded,
        );
        documentViewer.removeEventListener(
          "documentUnloaded",
          handleDocumentUnloaded,
        );
      };
    },
    [setInstance, setHasDocument],
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let cleanup: () => void;

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
        cleanup = monitorDocumentLoadedUnloaded(instance);

        const UIEvents = instance.UI.Events;
        instance.UI.addEventListener(UIEvents.LOAD_ERROR, function (err) {
          window.alert(`An error has occurred: ${err}`);
        });

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

        // Cleanup function
        return () => {
          cleanup?.();
        };
      });
    });
  }, [monitorDocumentLoadedUnloaded, language]);

  return <div className="h-full w-full" ref={viewer}></div>;
}
