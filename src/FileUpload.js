import React from "react";

const FileUpload = ({ onFileUpload }) => {
  const csvToJson = (csv) => {
    const rows = csv.split("\n");
    const headers = rows.shift().split(",");
    return rows.map((row) => {
      const values = row.split(",");
      return headers.reduce((obj, header, idx) => {
        obj[header.trim()] = values[idx].trim();
        return obj;
      }, {});
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = csvToJson(event.target.result);
      onFileUpload(json);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
    </div>
  );
};

export default FileUpload;
