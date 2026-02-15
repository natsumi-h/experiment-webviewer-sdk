"use client";

import { WebViewerInstance } from "@pdftron/webviewer";
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
  onOpenDownloadDialogue: () => void;
  onOpenUploadDialogue: () => void;
  isLoading: boolean;
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
  onOpenDownloadDialogue,
  onOpenUploadDialogue,
  isLoading,
}: ButtonsProps) => {
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
    window.alert(
      language === "ja" ? "保存データを削除しました" : "Saved data cleared",
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between">
        {/* Upload PDF */}
        <div className="flex gap-4">
          <button
            onClick={onOpenUploadDialogue}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isLoading
              ? language === "ja"
                ? "アップロード中..."
                : "Uploading..."
              : language === "ja"
                ? "アップロード"
                : "Upload"}
          </button>

          {/* Clear Annotations */}
          <button
            onClick={() => {
              if (!instance) return;
              const { annotationManager } = instance.Core;
              annotationManager.deleteAnnotations(
                annotationManager.getAnnotationsList(),
              );
            }}
            disabled={!hasDocument}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
          >
            {language === "ja" ? "注釈をクリア" : "Clear Annotations"}
          </button>

          {/* Download PDF */}
          <button
            onClick={onOpenDownloadDialogue}
            disabled={!hasDocument}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
          >
            {isLoading
              ? language === "ja"
                ? "ダウンロード中..."
                : "Downloading..."
              : language === "ja"
                ? "ダウンロード"
                : "Download"}
          </button>

          {/* Delete PDF */}
          <button
            onClick={() => {
              if (!instance) return;
              instance.Core.documentViewer.closeDocument();
            }}
            disabled={!hasDocument}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
          >
            {language === "ja" ? "削除" : "Delete"}
          </button>
        </div>

        {/* Language Toggle */}
        <div className="flex gap-4">
          <button
            onClick={onChangeLanguage}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            EN / JA
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        {/* AutoSave トグル */}
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={autoSave}
            onChange={onToggleAutoSave}
          />
          <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            {language === "ja" ? "自動保存" : "AutoSave"}
          </span>
        </label>
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
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
            >
              {language === "ja" ? "保存" : "Save"}
            </button>
            <button
              onClick={handleClearStorage}
              disabled={!hasSavedData}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
            >
              {language === "ja" ? "保存データを削除" : "Clear Saved Data"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
