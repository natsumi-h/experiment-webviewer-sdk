"use client";

import { WebViewerInstance } from "@pdftron/webviewer";
import { useCallback, useEffect, useRef, useState } from "react";
import Viewer from "./components/webviewer";
import { Buttons } from "./components/buttons";
import {
  loadPdfFromIndexedDB,
  savePdfToIndexedDB,
  clearIndexedDB,
} from "./lib/indexeddb";

export default function Home() {
  const [instance, setInstance] = useState<WebViewerInstance | null>(null);
  const [hasDocument, setHasDocument] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [language, setLanguage] = useState("en");

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  // 初回マウント時にIndexedDBとlocalStorageから復元
  useEffect(() => {
    loadPdfFromIndexedDB().then((data) => {
      setHasSavedData(data !== null);
      if (localStorage.getItem("autoSave") === "true") setAutoSave(true);
    });
  }, []);

  // AutoSave: annotationChanged + documentLoaded を監視
  useEffect(() => {
    if (!instance || !autoSave) return;

    const { annotationManager, documentViewer } = instance.Core;

    const saveToIndexedDB = async () => {
      const doc = documentViewer.getDocument();
      if (!doc) return;
      setIsAutoSaving(true);
      const xfdfString = await annotationManager.exportAnnotations();
      const data = await doc.getFileData({});
      const blob = new Blob([new Uint8Array(data)], {
        type: "application/pdf",
      });
      await savePdfToIndexedDB(blob, xfdfString);
      setHasSavedData(true);
      setIsAutoSaving(false);
    };

    const debouncedSave = () => {
      clearTimeout(debounceRef.current);
      setIsAutoSaving(true);
      debounceRef.current = setTimeout(saveToIndexedDB, 2000);
    };

    const handleAnnotationChanged = (
      _annotations: unknown,
      _action: unknown,
      info: { imported: boolean },
    ) => {
      if (info.imported) return;
      debouncedSave();
    };

    const handleDocumentLoaded = () => {
      debouncedSave();
    };

    annotationManager.addEventListener(
      "annotationChanged",
      handleAnnotationChanged,
    );
    documentViewer.addEventListener("documentLoaded", handleDocumentLoaded);

    return () => {
      clearTimeout(debounceRef.current);
      annotationManager.removeEventListener(
        "annotationChanged",
        handleAnnotationChanged,
      );
      documentViewer.removeEventListener(
        "documentLoaded",
        handleDocumentLoaded,
      );
    };
  }, [instance, autoSave]);

  // AutoSaveをオフにしたときにIndexedDBをクリア
  const handleToggleAutoSave = useCallback(async () => {
    if (autoSave) {
      // ON → OFF: IndexedDBをクリア
      clearTimeout(debounceRef.current);
      await clearIndexedDB();
      setHasSavedData(false);
    }
    setAutoSave((prev) => {
      const next = !prev;
      localStorage.setItem("autoSave", String(next));
      return next;
    });
  }, [autoSave]);

  const handleChangeLanguage = useCallback(() => {
    instance?.UI.setLanguage(language === "en" ? "ja" : "en");
    setLanguage((prev) => (prev === "en" ? "ja" : "en"));
  }, [instance, language]);

  // instanceが準備できたらdocumentLoaded/Unloadedイベントを監視し、hasDocumentを更新する
  // const monitorDocumentLoadedUnloaded = useCallback(
  //   (inst: WebViewerInstance) => {
  //     setInstance(inst);
  //     const { documentViewer } = inst.Core;
  //     documentViewer.addEventListener("documentLoaded", () =>
  //       setHasDocument(true),
  //     );
  //     documentViewer.addEventListener("documentUnloaded", () =>
  //       setHasDocument(false),
  //     );
  //   },
  //   [],
  // );

  return (
    <div className="flex h-screen flex-col">
      <Buttons
        language={language}
        instance={instance}
        hasDocument={hasDocument}
        hasSavedData={hasSavedData}
        autoSave={autoSave}
        isAutoSaving={isAutoSaving}
        onToggleAutoSave={handleToggleAutoSave}
        onSaved={() => setHasSavedData(true)}
        onClearedSaved={() => setHasSavedData(false)}
        onChangeLanguage={handleChangeLanguage}
      />
      <div className="flex-1">
        <Viewer
          setInstance={setInstance}
          setHasDocument={setHasDocument}
          language={language}
        />
      </div>
    </div>
  );
}
