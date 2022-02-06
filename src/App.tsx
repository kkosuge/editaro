import Editor from "@monaco-editor/react";
import "./App.css";

function App() {
  return (
    <>
      <Editor
        height="100vh"
        options={{
          lineNumbers: "off",
          automaticLayout: true,
          autoIndent: "full",
          wordWrap: "on",
          lineDecorationsWidth: 0,
          minimap: {
            enabled: false,
          },
        }}
        theme="vs-dark"
        defaultLanguage="markdown"
      />
    </>
  );
}

export default App;
