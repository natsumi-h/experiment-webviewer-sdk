"use client";

import { WebViewerInstance } from "@pdftron/webviewer";
import { useRef, useState } from "react";

export const UploadDialogue = ({
  isOpen,
  onClose,
  language,
  instance,
  setIsLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  instance: WebViewerInstance | null;
  setIsLoading: (isLoading: boolean) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE_NUM = 30;
  const MAX_FILE_SIZE_MB = MAX_FILE_SIZE_NUM * 1024 * 1024; // 30MB

  const loadFile = (file: File) => {
    if (!instance) return;
    if (file.size > MAX_FILE_SIZE_MB) {
      window.alert(
        language === "ja"
          ? `ファイルサイズが${MAX_FILE_SIZE_NUM}MBの上限を超えています。`
          : `File size exceeds ${MAX_FILE_SIZE_NUM}MB limit.`,
      );
      return;
    }
    if (file.type !== "application/pdf") return;
    instance.UI.loadDocument(file);
    onClose();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const file = e.target.files?.[0];
    if (!file) return;
    loadFile(file);
    e.target.value = "";
    setIsLoading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    loadFile(file);
  };

  return (
    <>
      {isOpen && (
        <div
          className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center bg-black/50"
          onClick={onClose}
        >
          <div
            className="relative p-4 w-full max-w-md max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700 p-4 md:p-6">
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-4 md:pb-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === "ja" ? "PDFをアップロード" : "Upload PDF"}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={onClose}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">
                    {language === "ja" ? "閉じる" : "Close modal"}
                  </span>
                </button>
              </div>
              {/* Modal body */}
              <form action="#">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors ${
                    isDragging
                      ? "bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-500"
                      : "bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 pt-5 pb-6 px-4">
                    <svg
                      className="w-8 h-8 mb-4"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 5v9m-5 0H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2M8 9l4-5 4 5m1 8h.01"
                      />
                    </svg>
                    <p className="mb-2 text-sm">
                      {isDragging
                        ? language === "ja"
                          ? "ここにドロップしてください"
                          : "Drop your file here"
                        : language === "ja"
                          ? "ドラッグ&ドロップ、またはボタンからアップロードしてください"
                          : "Drag & drop here, or click the button below"}
                    </p>
                    <p className="text-xs mb-4">
                      {language === "ja"
                        ? "最大ファイルサイズ:"
                        : "Max. File Size:"}
                      <span className="font-semibold">
                        {MAX_FILE_SIZE_NUM}MB
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      <svg
                        className="w-4 h-4 me-1.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="2"
                          d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                        />
                      </svg>
                      {language === "ja" ? "ファイルを選択" : "Browse file"}
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                  accept=".pdf"
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
