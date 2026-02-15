"use client";

import { WebViewerInstance } from "@pdftron/webviewer";
import { useState } from "react";

export const DownloadDialogue = ({
  isOpen,
  onClose,
  language,
  instance,
}: {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  instance: WebViewerInstance | null;
}) => {
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");

  const handleDownload = async () => {
    if (!instance) return;
    const { documentViewer, annotationManager, PDFNet } = instance.Core;
    const doc = documentViewer.getDocument();
    if (!doc) {
      window.alert(
        language === "ja" ? "PDFが読み込まれていません" : "PDF is not loaded",
      );
      return;
    }

    try {
      const xfdfString = await annotationManager.exportAnnotations();
      const data = await doc.getFileData({ xfdfString });

      let downloadData: ArrayBuffer | Uint8Array = data;

      if (password) {
        await PDFNet.initialize();
        const pdfDoc = await PDFNet.PDFDoc.createFromBuffer(data);
        //   https://sdk.apryse.com/api/web/Core.PDFNet.SecurityHandler.html#toc0__anchor
        const handler = await PDFNet.SecurityHandler.create(
          PDFNet.SecurityHandler.AlgorithmType.e_AES_256,
        );
        await handler.changeUserPasswordUString(password);

        await pdfDoc.setSecurityHandler(handler);
        downloadData = await pdfDoc.saveMemoryBuffer(
          PDFNet.SDFDoc.SaveOptions.e_remove_unused,
        );
      }

      const blob = new Blob([new Uint8Array(downloadData)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "download"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.alert(
        language === "ja"
          ? "PDFの処理中にエラーが発生しました。ファイルが破損している可能性があります。"
          : "An error occurred while processing the PDF. The file may be corrupted.",
      );
    }
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
                  {language === "ja" ? "PDFを保存" : "Download PDF As"}
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
                <div className="grid gap-4 grid-cols-2 py-4 md:py-6">
                  {/* Title */}
                  <div className="col-span-2">
                    <label
                      htmlFor="title"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {language === "ja" ? "タイトル" : "Title"}
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      placeholder={
                        language === "ja"
                          ? "タイトルを入力してください"
                          : "Type title"
                      }
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  {/* Password */}
                  <div className="col-span-2">
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {language === "ja" ? "パスワード" : "Password"}
                    </label>
                    <input
                      name="password"
                      id="password"
                      data-popover-target="popover-password"
                      data-popover-placement="bottom"
                      type="password"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4 border-t border-gray-200 dark:border-gray-600 pt-4 md:pt-6">
                  <button
                    type="button"
                    className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    onClick={handleDownload}
                  >
                    {language === "ja" ? "ダウンロード" : "Download"}
                  </button>
                  <button
                    type="button"
                    className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                    onClick={onClose}
                  >
                    {language === "ja" ? "キャンセル" : "Cancel"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
