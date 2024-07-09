import React, { useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';

const CodeEditor = ({ code, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    // Initialize Pyodide and Monaco Editor
    async function initializePyodide() {
      // Load Pyodide
      await window.languagePluginLoader;
      // Initialize Monaco Editor
      const monaco = editorRef.current.editor.getModifiedEditor();
      monaco.languages.register({ id: 'python' });
      monaco.languages.setMonarchTokensProvider('python', {
        tokenizer: {
          root: [
            // Define your language syntax rules here if needed
          ]
        }
      });
      monaco.languages.setLanguageConfiguration('python', {
        // Configuration options
      });
      monaco.editor.defineTheme('vs-dark', {
        // Define your theme settings
      });
    }

    initializePyodide();

    return () => {
      // Cleanup code if needed
    };
  }, []);

  const editorDidMount = (editor, monaco) => {
    console.log('Editor mounted');
    editorRef.current = editor;
  };

  const handleCodeChange = (newValue, e) => {
    onChange(newValue);
  };

  return (
    <MonacoEditor
      width="100%"
      height="100%"
      language="python"
      theme="vs-dark"
      value={code}
      onChange={handleCodeChange}
      editorDidMount={editorDidMount}
    />
  );
};

export default CodeEditor;
