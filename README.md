# PDF Editor with Apryse WebViewer

A Next.js application that provides PDF viewing, annotation editing, and file management using [Apryse WebViewer](https://apryse.com/products/webviewer).

## Preview URL
https://experiment-webviewer-sdk.vercel.app/

## Tech Stack

- **Next.js** 16 (App Router)
- **React** 19
- **TypeScript**
- **Tailwind CSS** 4
- **@pdftron/webviewer** 11

## Features

### PDF Operations

- **Upload PDF** — Select a local PDF file and load it into WebViewer
- **Download** — Export the PDF with annotations embedded as a file download
- **Delete PDF** — Close the currently loaded document

### Annotation Editing

- Add annotations (highlights, text, shapes, etc.) using WebViewer's built-in tools
- **Clear annotations** — Remove all annotations from the current document

### Persistence (IndexedDB)

- **Save** — Manually save the current PDF and annotations (as XFDF) to IndexedDB
- **Clear saved data** — Remove all saved data from IndexedDB
- On page reload, saved data is automatically restored from IndexedDB

### AutoSave

- **AutoSave toggle** — Enable/disable automatic saving to IndexedDB
- When enabled, changes are saved with a **2-second debounce** after each annotation change or document load
- Displays an "Autosaving..." indicator while saving is in progress
- AutoSave preference is persisted in `localStorage` and restored on reload
- Turning AutoSave OFF automatically clears IndexedDB data
- When AutoSave is ON, the manual Save and Clear saved data buttons are hidden

### Language

- **EN / JA toggle** — Switch the WebViewer UI language between English and Japanese

## Project Structure

```
src/app/
├── page.tsx                    # Main page — state management and event wiring
├── components/
│   ├── webviewer.tsx           # WebViewer initialization and IndexedDB restore
│   └── button.tsx              # Toolbar buttons (upload, download, save, etc.)
└── lib/
    └── indexeddb.ts            # IndexedDB helper functions
```

### Data Flow

```
Upload → WebViewer (in-memory)
                ↓
        Edit annotations
                ↓
    ┌───────────┴───────────┐
    ↓                       ↓
  Save / AutoSave       Download
    ↓                       ↓
  IndexedDB             PDF file
  (PDF + XFDF)         (annotations embedded)
    ↓
  Page reload → Restore from IndexedDB
```

### Storage

| Storage          | Data                               | Persistence              |
| ---------------- | ---------------------------------- | ------------------------ |
| JS Runtime (RAM) | Annotations in `annotationManager` | Lost on page reload      |
| IndexedDB        | PDF blob + XFDF annotation string  | Persists across sessions |
| localStorage     | AutoSave ON/OFF preference         | Persists across sessions |

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## License Key

WebViewer requires a license key. Get a free trial key at [dev.apryse.com](https://dev.apryse.com) and set it via the `NEXT_PUBLIC_PDFTRON_LICENSE_KEY` environment variable.
