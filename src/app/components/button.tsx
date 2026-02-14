"use client";

import { WebViewerInstance } from "@pdftron/webviewer";
import { useRef, useState } from "react";
import { savePdfToIndexedDB, clearIndexedDB } from "../lib/indexeddb";

interface ButtonsProps {
  language: string;
  instance: WebViewerInstance | null;
  hasDocument: boolean;
  hasSavedData: boolean;
  autoSave: boolean;
  isAutoSaving: boolean;
  onToggleAutoSave: () => void;
  onSaved: () => void;
  onClearedSaved: () => void;
  onChangeLanguage: () => void;
}

export const Buttons = ({
  language,
  instance,
  hasDocument,
  hasSavedData,
  autoSave,
  isAutoSaving,
  onToggleAutoSave,
  onSaved,
  onClearedSaved,
  onChangeLanguage,
}: ButtonsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const file = e.target.files?.[0];
    if (!file || !instance) return;
    instance.UI.loadDocument(file);
    e.target.value = "";
    setLoading(false);
  };

  const handleDownload = async () => {
    setLoading(true);
    if (!instance) return;
    const { documentViewer, annotationManager } = instance.Core;
    const doc = documentViewer.getDocument();
    if (!doc) {
      window.alert("PDF is not loaded");
      setLoading(false);
      return;
    }
    // TODO:いっこずつ理解する
    const xfdfString = await annotationManager.exportAnnotations();
    console.log("xdf", xfdfString);
    const data = await doc.getFileData({ xfdfString });
    const arr = new Uint8Array(data);
    const blob = new Blob([arr], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edited.pdf";
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!instance) return;
    const { documentViewer, annotationManager } = instance.Core;
    // UIでsaving modalが表示される
    // instance.UI.showSaveModal();
    const doc = documentViewer.getDocument();
    if (!doc) {
      window.alert("PDF is not loaded");
      return;
    }
    const xfdfString = await annotationManager.exportAnnotations();
    const data = await doc.getFileData({});
    const blob = new Blob([new Uint8Array(data)], { type: "application/pdf" });
    await savePdfToIndexedDB(blob, xfdfString);
    onSaved();
    window.alert(language === "ja" ? "保存しました" : "Saved");
  };

  const handleClearStorage = async () => {
    await clearIndexedDB();
    onClearedSaved();
    window.alert("保存データを削除しました");
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between">
        <div className="flex gap-4">
          <input
            type="file"
            // TODO:
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {loading
              ? language === "ja"
                ? "アップロード中..."
                : "Uploading..."
              : language === "ja"
                ? "PDFをアップロード"
                : "Upload PDF"}
          </button>
          <button
            onClick={() => {
              if (!instance) return;
              const { annotationManager } = instance.Core;
              annotationManager.deleteAnnotations(
                annotationManager.getAnnotationsList(),
              );
            }}
            disabled={!hasDocument}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {language === "ja" ? "注釈をクリア" : "Clear annotations"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!hasDocument}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Downloading..." : "Download"}
          </button>
          <button
            onClick={() => {
              if (!instance) return;
              instance.Core.documentViewer.closeDocument();
            }}
            disabled={!hasDocument}
            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {language === "ja" ? "PDFを削除" : "Delete PDF"}
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onChangeLanguage}
            className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50"
          >
            EN / JA
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* AutoSave トグル */}
        <button
          onClick={onToggleAutoSave}
          className={`rounded px-4 py-2 text-white ${
            autoSave
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-purple-400 hover:bg-purple-500"
          }`}
        >
          {language === "ja" ? "自動保存" : "AutoSave"}:{" "}
          {autoSave ? "ON" : "OFF"}
        </button>
        {isAutoSaving && (
          <span className="flex items-center text-sm text-purple-400">
            {language === "ja" ? "自動保存中..." : "Autosaving..."}
          </span>
        )}

        {/* AutoSaveオフ時のみ表示 */}
        {!autoSave && (
          <>
            <button
              onClick={handleSave}
              disabled={!hasDocument}
              className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {language === "ja" ? "保存" : "Save"}
            </button>
            <button
              onClick={handleClearStorage}
              disabled={!hasSavedData}
              className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {language === "ja" ? "保存データを削除" : "Clear saved data"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
