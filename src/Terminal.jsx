import React, { useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import './PythonEditor.css'; // Import CSS file for styles

const PythonEditor = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [pyodideReady, setPyodideReady] = useState(false);

  useEffect(() => {
    async function initializePyodide() {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/pyodide.js';
      document.body.appendChild(script);

      script.onload = async () => {
        try {
          const pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.21.3/full/'
          });

          await pyodide.loadPackage(['numpy', 'pandas', 'matplotlib']);

          window.pyodide = pyodide;
          setPyodideReady(true);
          setOutput('Pyodide loaded. You can now run Python code with NumPy, Pandas, and Matplotlib.');
        } catch (error) {
          console.error('Error initializing Pyodide:', error);
          setOutput('Failed to initialize Pyodide.');
        }
      };

      script.onerror = () => {
        setOutput('Failed to load Pyodide script.');
      };
    }

    initializePyodide();
  }, []);

  const runPythonCode = async () => {
    if (!pyodideReady) {
      setOutput('Pyodide is not yet loaded. Please wait.');
      return;
    }

    try {
      await window.pyodide.runPythonAsync(`
        import sys
        import io
        import base64
        import matplotlib.pyplot as plt
        from io import BytesIO
        import numpy as np
        import pandas as pd

        sys.stdout = io.StringIO()
        sys.stderr = io.StringIO()

        def display_plot():
          buf = BytesIO()
          plt.savefig(buf, format='png')
          buf.seek(0)
          img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
          return 'data:image/png;base64,' + img_base64
      `);

      await window.pyodide.runPythonAsync(code);

      const stdout = window.pyodide.runPython('sys.stdout.getvalue()');
      const stderr = window.pyodide.runPython('sys.stderr.getvalue()');

      let combinedOutput = stdout + stderr;
      let plot = '';

      // Check if there are active figures
      const hasFigures = window.pyodide.runPython(`
        import matplotlib.pyplot as plt
        len(plt.get_fignums()) > 0
      `);

      if (hasFigures) {
        plot = window.pyodide.runPython('display_plot()');
      }

      if (plot && plot.startsWith('data:image')) {
        setOutput(<img src={plot} alt="Matplotlib Output" />);
      } else {
        setOutput(combinedOutput);
      }
    } catch (error) {
      console.error('Error executing Python code:', error);
      setOutput(`Error: ${error.toString()}`);
    }
  };

  const handleEditorChange = (newValue) => {
    setCode(newValue);
  };

  const editorDidMount = (editor) => {
    console.log('Editor mounted');
  };

  return (
    <div className="python-editor-container">
      <div className="editor-container">
        <MonacoEditor
          width="100%"
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          editorDidMount={editorDidMount}
        />
      </div>
      <div className="button-container">
        <button className="run-button" onClick={runPythonCode}>
          Run Python Code
        </button>
      </div>
      <div className="output-container">
        <h3 className="output-header">Output:</h3>
        <div className="output-text">{output}</div>
      </div>
    </div>
  );
};
export default PythonEditor;
