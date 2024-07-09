// import React, { useState } from 'react';
// import TerminalUI, { TerminalInput, TerminalOutput } from 'react-terminal-ui';
// import axios from 'axios';
// import ScatterPlotModal from './ScatterPlotModal';
// import './Terminal.css';
// import { mean, median, mode } from 'mathjs';

// const TerminalComponent = () => {
//   const [terminals, setTerminals] = useState([
//     { id: 1, lines: [], variables: {}, isModalOpen: false, plotData: [], plotTitle: '', isOpen: true }
//   ]);
//   const [nextTerminalId, setNextTerminalId] = useState(2);
//   const [selectedTerminalId, setSelectedTerminalId] = useState(1);

//   const addTerminal = () => {
//     const newTerminal = {
//       id: nextTerminalId,
//       lines: [],
//       variables: {},
//       isModalOpen: false,
//       plotData: [],
//       plotTitle: '',
//       isOpen: true
//     };
//     setTerminals([...terminals, newTerminal]);
//     setSelectedTerminalId(nextTerminalId);
//     setNextTerminalId(nextTerminalId + 1);
//   };

//   const removeTerminal = (id) => {
//     if (terminals.length === 1) return;
//     const updatedTerminals = terminals.filter(t => t.id !== id);
//     setTerminals(updatedTerminals);
//     if (selectedTerminalId === id && updatedTerminals.length > 0) {
//       setSelectedTerminalId(updatedTerminals[0].id);
//     }
//   };

//   const handleCommand = async (command, terminalId) => {
//     let result = '';
//     const currentTerminal = terminals.find(t => t.id === terminalId);
//     if (!currentTerminal) return;

//     const { variables, lines } = currentTerminal;

//     if (command === 'clear') {
//       setTerminals(terminals.map(t =>
//         t.id === terminalId ? { ...t, lines: [] } : t
//       ));
//       return; // Return early to avoid appending output
//     }

//     if (/^\w+=\w+\[.*\]$/.test(command)) {
//       const [varName, rest] = command.split('=');
//       const [varType, varValues] = rest.match(/^(\w+)\[(.*)\]$/).slice(1, 3);

//       let parsedValues;

//       try {
//         if (varType === 'number') {
//           parsedValues = parseFloat(varValues);
//           if (isNaN(parsedValues)) {
//             throw new Error(`Invalid number value: ${varValues}`);
//           }
//         } else if (varType === 'array') {
//           parsedValues = JSON.parse(`[${varValues}]`);
//           if (!Array.isArray(parsedValues)) {
//             throw new Error(`Invalid array format: ${varValues}`);
//           }
//         } else if (varType === 'string') {
//           parsedValues = varValues.slice(1, -1);
//         } else {
//           throw new Error(`Unsupported data type: ${varType}`);
//         }

//         currentTerminal.variables = { ...variables, [varName]: parsedValues };
//         result = `Variable ${varName} declared as ${varType} with value ${JSON.stringify(parsedValues)}`;
//       } catch (error) {
//         result = `Error parsing variable: ${error.message}`;
//       }
//     } else if (command.startsWith('check')) {
//       const [, url] = command.split(' ');
//       try {
//         const response = await axios.get(url);
//         result = `Website ${url} is up! Status: ${response.status} ${response.statusText}`;
//       } catch (error) {
//         if (error.response) {
//           result = `Website ${url} returned error! Status: ${error.response.status} ${error.response.statusText}`;
//         } else {
//           result = `Could not reach ${url}. Error: ${error.message}`;
//         }
//       }
//     } else if (command.startsWith('mean') || command.startsWith('median') || command.startsWith('mode') || command.startsWith('add')) {
//       const [, values] = command.split(' ');
//       let parsedValues;
//       if (variables[values]) {
//         parsedValues = variables[values];
//       } else if (values) {
//         parsedValues = values.replace(/[()]/g, '').split(',').map(Number);
//       }
//       if (parsedValues) {
//         if (command.startsWith('mean')) {
//           result = `Mean: ${mean(parsedValues)}`;
//         } else if (command.startsWith('median')) {
//           result = `Median: ${median(parsedValues)}`;
//         } else if (command.startsWith('mode')) {
//           result = `Mode: ${mode(parsedValues)}`;
//         } else if (command.startsWith('add')) {
//           result = `Sum: ${parsedValues.reduce((acc, curr) => acc + curr, 0)}`;
//         }
//       } else {
//         result = 'Error: Invalid or undefined values for calculation.';
//       }
//     } else if (command.startsWith('scatter')) {
//       const [, varName, title] = command.split(' ');
//       const data = variables[varName];

//       let plotData;

//       if (Array.isArray(data) && data.every(val => typeof val === 'number')) {
//         plotData = data.map((y, x) => [x, y]); // Convert to [x, y] pairs
//       } else if (Array.isArray(data) && data.every(point => Array.isArray(point) && point.length === 2)) {
//         plotData = data; // Already in [x, y] format
//       } else {
//         result = 'Invalid data for scatter plot. Provide an array of numbers or an array of [x, y] pairs.';
//       }

//       if (plotData) {
//         currentTerminal.plotData = plotData;
//         currentTerminal.plotTitle = title || 'Scatter Plot';
//         currentTerminal.isModalOpen = true;
//         result = `Scatter plot for ${varName} generated.`;
//       }
//     } else if (command.startsWith('summary')) {
//       const [, varName] = command.split(' ');
//       const data = variables[varName];

//       if (!data) {
//         result = `Error: Variable ${varName} is not defined.`;
//       } else {
//         try {
//           const response = await axios.post('http://localhost:5000/summary', { data });
//           result = `Summary: ${JSON.stringify(response.data.summary)}`;
//         } catch (error) {
//           result = `Error: ${error.response ? error.response.data.error : error.message}`;
//         }
//       }
//     } else if (command.startsWith('histogram')) {
//       const [, varName] = command.split(' ');
//       const data = variables[varName];

//       if (!data) {
//         result = `Error: Variable ${varName} is not defined.`;
//       } else {
//         try {
//           const response = await axios.post('http://localhost:5000/histogram', { data, column: varName });
//           result = `<img src="http://localhost:5000/${response.data.filepath}" alt="Histogram" />`;
//         } catch (error) {
//           result = `Error: ${error.response ? error.response.data.error : error.message}`;
//         }
//       }
//     } else if (command.startsWith('correlation')) {
//       const [, ...cols] = command.split(' ');
//       const data = variables[Object.keys(variables)[0]]; // Assuming single dataset for simplicity

//       if (!data) {
//         result = `Error: No data available for correlation.`;
//       } else {
//         try {
//           const response = await axios.post('http://localhost:5000/correlation', { data, columns: cols });
//           result = `<img src="http://localhost:5000/${response.data.filepath}" alt="Correlation" />`;
//         } catch (error) {
//           result = `Error: ${error.response ? error.response.data.error : error.message}`;
//         }
//       }
//     } else {
//       result = 'Unknown command.';
//     }

//     setTerminals(terminals.map(t =>
//       t.id === terminalId
//         ? {
//             ...t,
//             lines: [...lines, <TerminalInput key={`input-${lines.length}`}>{command}</TerminalInput>, <TerminalOutput key={`output-${lines.length}`}>{result}</TerminalOutput>]
//           }
//         : t
//     ));
//   };

//   const handleTerminalChange = (id) => {
//     setSelectedTerminalId(id);
//   };

//   const handleFileUpload = async (event) => {
//     const file = event.target.files[0];
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await axios.post('http://localhost:5000/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//       const sheetsData = response.data.data;

//       const updatedTerminals = terminals.map(t =>
//         t.id === selectedTerminalId ? { ...t, variables: { ...t.variables, ...sheetsData } } : t
//       );
//       setTerminals(updatedTerminals);
//     } catch (error) {
//       console.error('Error uploading file:', error);
//     }
//   };

//   const selectedTerminal = terminals.find(t => t.id === selectedTerminalId);

//   return (
//     <div className="terminal-container">
//       <div className="tab-bar">
//         {terminals.map(terminal => (
//           <div
//             key={terminal.id}
//             className={`tab ${selectedTerminalId === terminal.id ? 'active' : ''}`}
//             onClick={() => handleTerminalChange(terminal.id)}
//           >
//             Terminal {terminal.id}
//             <button className="close-button" onClick={(e) => {
//               e.stopPropagation();
//               removeTerminal(terminal.id);
//             }}>x</button>
//           </div>
//         ))}
//         <button className="add-button" onClick={addTerminal}>+</button>
//       </div>
//       <div className="main-content">
//         {terminals.map(terminal => (
//           terminal.id === selectedTerminalId && terminal.isOpen && (
//             <div key={terminal.id} className="terminal">
//               <TerminalUI
//                 colorMode="light"
//                 onInput={(command) => handleCommand(command, terminal.id)}
//               >
//                 {terminal.lines}
//               </TerminalUI>
//               <ScatterPlotModal
//                 isOpen={terminal.isModalOpen}
//                 onClose={() => setTerminals(terminals.map(t => t.id === terminal.id ? { ...t, isModalOpen: false } : t))}
//                 data={terminal.plotData}
//                 title={terminal.plotTitle}
//               />
//             </div>
//           )
//         ))}
//         <div className="right-panel">
//           <input type="file" onChange={handleFileUpload} />
//           <div className="variables-list">
//             <h3>Variables</h3>
//             {selectedTerminal && Object.entries(selectedTerminal.variables).map(([key, value]) => (
//               <div key={key}>
//                 <strong>{key}:</strong> {JSON.stringify(value)}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TerminalComponent;


// src/App.js
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
          setOutput('Pyodide loaded. You can now run Python code with NumPy and Matplotlib.');
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
       window.pyodide.runPython(`
        import sys
        import io
        sys.stdout = io.StringIO()
        sys.stderr = io.StringIO()
      `);
      // Execute the Python code
      let result = await window.pyodide.runPythonAsync(code);
    
      // Log the result to the console
      console.log('Python output:', result);
      const stdout = window.pyodide.runPython('sys.stdout.getvalue()');
      const stderr = window.pyodide.runPython('sys.stderr.getvalue()');

      // Combine stdout and stderr for output
      const combinedOutput = stdout + stderr;
    
      // Check if the result is a base64 image string
      if (result && typeof result === 'string' && result.startsWith('data:image')) {
        // Display the image
        setOutput(<img src={result} alt="Matplotlib Output" />);
      } else {
        // Print the result if it's not an image
        setOutput(combinedOutput);
      }
    } catch (error) {
      // Log and display the error
      console.error('Error executing Python code:', error);
      setOutput(`Error: ${error.toString()}`);
    }
    
  };

  const handleEditorChange = (newValue, e) => {
    setCode(newValue);
  };

  const editorDidMount = (editor, monaco) => {
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
