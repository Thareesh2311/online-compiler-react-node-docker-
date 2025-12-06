import React, { useState } from "react";
import "./App.css";

const DEFAULT_CODE = {
  python: `print("Hello from Python")`,
  node: `console.log("Hello from Node.js");`,
  c: `#include <stdio.h>
int main() {
    printf("Hello from C");
    return 0;
}`,
  cpp: `#include <iostream>
using namespace std;
int main() {
    cout << "Hello from C++";
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java");
    }
}`
};

function App() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODE["python"]);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  // ⭐ THEME STATE
  const [darkMode, setDarkMode] = useState(false);

  // ⭐ Toggle Theme
  const toggleTheme = () => setDarkMode(!darkMode);

  const runCode = async () => {
    setLoading(true);
    setOutput("Running...");

    try {
      const res = await fetch("http://localhost:5000/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin })
      });

      const data = await res.json();

      if (data.success) {
        setOutput(
          (data.compileOutput || "") +
            "\n" +
            (data.stdout || "") +
            (data.stderr || "")
        );
      } else {
        setOutput(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setOutput("Error: " + error.message);
    }

    setLoading(false);
  };

  // ⭐ Add this function back
const handleLanguageChange = (e) => {
  const lang = e.target.value;
  setLanguage(lang);
  setCode(DEFAULT_CODE[lang]);
};

  return (
    <div className={darkMode ? "compiler-container dark" : "compiler-container"}>
      
      {/* ⭐ Theme Toggle Button */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
      </button>

      <h2>Online Compiler (CodeConnect)</h2>

      <div className="section">
        <label>Language:</label>
        <select value={language} onChange={e => handleLanguageChange(e)}>
          <option value="python">Python</option>
          <option value="node">Node.js</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>

      <textarea value={code} onChange={e => setCode(e.target.value)} />

      <div className="section">
        <label>stdin (optional)</label>
        <input value={stdin} onChange={e => setStdin(e.target.value)} />
      </div>

      <button onClick={runCode} disabled={loading}>
        {loading ? "Running..." : "Run"}
      </button>

      <h3>Output</h3>
      <pre>{output}</pre>
    </div>
  );
}

export default App;
