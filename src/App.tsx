import { useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin, linkPlugin, linkDialogPlugin, imagePlugin, tablePlugin, codeBlockPlugin, codeMirrorPlugin, toolbarPlugin, UndoRedo, BoldItalicUnderlineToggles, CreateLink, InsertImage, InsertTable, InsertThematicBreak, ListsToggle, BlockTypeSelect, type MDXEditorMethods } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import "./App.css";

function App() {
  const [markdown, setMarkdown] = useState("# Welcome to Markdown Editor\n\nStart editing your markdown file...");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const editorRef = useRef<MDXEditorMethods>(null);

  async function openFile() {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Markdown',
          extensions: ['md', 'markdown']
        }]
      });

      if (selected) {
        const path = selected as string;
        const content = await invoke<string>("read_file", { path });
        setMarkdown(content);
        setCurrentFile(path);
        setIsSaved(true);

        // Force the editor to update
        if (editorRef.current) {
          editorRef.current.setMarkdown(content);
        }
      }
    } catch (error) {
      console.error("Error opening file:", error);
      alert("Failed to open file: " + error);
    }
  }

  async function saveFile() {
    try {
      let path = currentFile;

      if (!path) {
        const selected = await save({
          filters: [{
            name: 'Markdown',
            extensions: ['md', 'markdown']
          }]
        });

        if (!selected) return;
        path = selected;
        setCurrentFile(path);
      }

      await invoke("write_file", { path, content: markdown });
      setIsSaved(true);
      alert("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
      alert("Failed to save file: " + error);
    }
  }

  async function saveAsFile() {
    try {
      const selected = await save({
        filters: [{
          name: 'Markdown',
          extensions: ['md', 'markdown']
        }]
      });

      if (!selected) return;

      await invoke("write_file", { path: selected, content: markdown });
      setCurrentFile(selected);
      setIsSaved(true);
      alert("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
      alert("Failed to save file: " + error);
    }
  }

  function handleMarkdownChange(newMarkdown: string) {
    setMarkdown(newMarkdown);
    setIsSaved(false);
  }

  return (
    <div className="app-container">
      <div className="toolbar">
        <h1>Markdown Editor</h1>
        <div className="file-info">
          {currentFile && <span className="file-name">{currentFile}</span>}
          {!isSaved && <span className="unsaved-indicator">●</span>}
        </div>
        <div className="button-group">
          <button onClick={openFile}>Open File</button>
          <button onClick={saveFile}>Save</button>
          <button onClick={saveAsFile}>Save As</button>
        </div>
      </div>

      <div className="editor-container">
        <MDXEditor
          ref={editorRef}
          markdown={markdown}
          onChange={handleMarkdownChange}
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin(),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
            codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'text', tsx: 'TypeScript', html: 'HTML', python: 'Python', rust: 'Rust' } }),
            markdownShortcutPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <BlockTypeSelect />
                  <CreateLink />
                  <InsertImage />
                  <InsertTable />
                  <InsertThematicBreak />
                  <ListsToggle />
                </>
              )
            })
          ]}
        />
      </div>
    </div>
  );
}

export default App;
