import React, { useState } from "react";
import {
  decodeBase64WithPrefix,
  encodeBase64WithPrefix,
  parseKV,
  serializeKV,
} from "./utils";

export default function App() {
  const [base64, setBase64] = useState("");
  const [prefix, setPrefix] = useState("");
  const [kvObj, setKvObj] = useState<Record<string, string>>(() => ({}));
  const [decoded, setDecoded] = useState("");
  const [edited, setEdited] = useState<Record<string, string>>(() => ({}));
  const [outputBase64, setOutputBase64] = useState("");

  // Handle decoding
  function handleDecode() {
    const { prefix, decoded } = decodeBase64WithPrefix(base64);
    setPrefix(prefix);
    setDecoded(decoded);
    const obj = parseKV(decoded);
    setKvObj(obj);
    setEdited(obj);
  }

  // Handle editing
  function handleEdit(key: string, value: string) {
    setEdited(prev => ({ ...prev, [key]: value }));
  }

  // Handle saving
  function handleSave() {
    const serialized = serializeKV(edited);
    setOutputBase64(encodeBase64WithPrefix(prefix, serialized));
  }

  return (
    <div style={{
      maxWidth: 800, margin: "auto", padding: 32, fontFamily: "sans-serif"
    }}>
      <h2>Base64 Key-Value Editor</h2>
      <div>
        <label>Paste base64 string:</label><br />
        <textarea
          value={base64}
          onChange={e => setBase64(e.target.value)}
          rows={5}
          style={{ width: "100%" }}
        />
        <button onClick={handleDecode} style={{ marginTop: 8 }}>Decode</button>
      </div>
      {Object.keys(kvObj).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Edit fields</h3>
          <form>
            {Object.entries(edited).map(([key, value]) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: "bold" }}>{key}</label>
                <input
                  type="text"
                  value={value}
                  style={{ marginLeft: 10, width: "70%" }}
                  onChange={e => handleEdit(key, e.target.value)}
                />
              </div>
            ))}
          </form>
          <button onClick={handleSave} style={{ marginTop: 16 }}>Save & Export</button>
        </div>
      )}
      {outputBase64 && (
        <div style={{ marginTop: 24 }}>
          <h3>Edited base64 output (with prefix)</h3>
          <textarea
            readOnly
            value={outputBase64}
            rows={5}
            style={{ width: "100%" }}
          />
        </div>
      )}
      {decoded && (
        <details style={{ marginTop: 24 }}>
          <summary>Decoded raw text</summary>
          <pre style={{ whiteSpace: "pre-wrap" }}>{decoded}</pre>
        </details>
      )}
    </div>
  );
}