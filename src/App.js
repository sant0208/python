import React, { useState } from "react";
import axios from "axios";

function App() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const generatePDF = async () => {
    if (!title || !file) {
      alert("Please enter a title and upload a .txt file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/generate-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, "_");
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${safeTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check server logs.");
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>PDF Generator</h2>
      <input
        type="text"
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: "10px", width: "300px", marginBottom: "10px" }}
      />
      <br />
      <h3>Upload Your .txt file</h3>
      <input type="file" accept=".txt" onChange={handleFileUpload} />
      <br />

      <button
        onClick={generatePDF}
        disabled={loading}
        style={{
          padding: "10px 20px",
          marginTop: "10px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate PDF"}
      </button>
    </div>
  );
}

export default App;
