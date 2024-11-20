import React, { useState, useEffect } from "react";
import { scaleTime, scaleLinear } from "d3-scale";
import "./App.css";

const App = () => {
  const [data, setData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("Apple");
  const [selectedMonth, setSelectedMonth] = useState("November");

  const colors = { Open: "#b2df8a", Close: "#e41a1c" };

  const csvToJson = (csvString) => {
    const rows = csvString.split("\n");
    const headers = rows[0].split(",").map((header) => header.trim());
    return rows.slice(1).map((row) => {
      const values = row.split(",").map((value) => value.trim());
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = values[index];
      });
      return entry;
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const jsonData = csvToJson(text);
      setData(jsonData);
    };

    if (file) {
      reader.readAsText(file);
    }
  };

  const drawGraph = () => {
    if (!data.length || !selectedCompany || !selectedMonth) return;

    const filteredData = data.filter(
      (entry) =>
        entry.Company === selectedCompany &&
        new Date(entry.Date).toLocaleString("default", { month: "long" }) ===
          selectedMonth
    );

    const openPrices = filteredData.map((entry) => parseFloat(entry.Open));
    const closePrices = filteredData.map((entry) => parseFloat(entry.Close));
    const dates = filteredData.map((entry) => new Date(entry.Date));

    const minPrice = Math.min(...openPrices, ...closePrices);
    const maxPrice = Math.max(...openPrices, ...closePrices);

    const xScale = scaleTime()
      .domain([new Date(Math.min(...dates)), new Date(Math.max(...dates))])
      .range([40, 760]);

    const yScale = scaleLinear()
      .domain([minPrice, maxPrice])
      .range([360, 0]);

    return (
      <svg width="800" height="400" viewBox="0 0 900 400">
        <line x1="40" y1="0" x2="40" y2="400" stroke="black" strokeWidth="2" />
        <line x1="0" y1="360" x2="800" y2="360" stroke="black" strokeWidth="2" />

        <polyline
          fill="none"
          stroke={colors.Open}
          strokeWidth="2"
          points={openPrices
            .map((price, index) => {
              const x = xScale(dates[index]);
              const y = yScale(price);
              return `${x},${y}`;
            })
            .join(" ")}
        />
        <polyline
          fill="none"
          stroke={colors.Close}
          strokeWidth="2"
          points={closePrices
            .map((price, index) => {
              const x = xScale(dates[index]);
              const y = yScale(price);
              return `${x},${y}`;
            })
            .join(" ")}
        />

        {dates.map((date, index) => {
          const openPrice = openPrices[index];
          const closePrice = closePrices[index];
          const x = xScale(date);
          const yOpen = yScale(openPrice);
          const yClose = yScale(closePrice);
          const difference = closePrice - openPrice;

          return (
            <g key={index}>
              <circle
                cx={x}
                cy={yOpen}
                r="5"
                fill={colors.Open}
                onMouseEnter={(e) => {
                  const tooltip = document.getElementById("tooltip");
                  tooltip.style.display = "block";
                  tooltip.style.left = `${e.pageX + 10}px`;
                  tooltip.style.top = `${e.pageY - 40}px`;
                  tooltip.innerHTML = `
                    <strong>Date:</strong> ${date.toLocaleDateString()}<br />
                    <strong>Open:</strong> $${openPrice.toFixed(2)}<br />
                    <strong>Close:</strong> $${closePrice.toFixed(2)}<br />
                    <strong>Difference:</strong> $${difference.toFixed(2)}
                  `;
                }}
                onMouseLeave={() => {
                  const tooltip = document.getElementById("tooltip");
                  tooltip.style.display = "none";
                }}
              />
              <circle
                cx={x}
                cy={yClose}
                r="5"
                fill={colors.Close}
                onMouseEnter={(e) => {
                  const tooltip = document.getElementById("tooltip");
                  tooltip.style.display = "block";
                  tooltip.style.left = `${e.pageX + 10}px`;
                  tooltip.style.top = `${e.pageY - 40}px`;
                  tooltip.innerHTML = `
                    <strong>Date:</strong> ${date.toLocaleDateString()}<br />
                    <strong>Open:</strong> $${openPrice.toFixed(2)}<br />
                    <strong>Close:</strong> $${closePrice.toFixed(2)}<br />
                    <strong>Difference:</strong> $${difference.toFixed(2)}
                  `;
                }}
                onMouseLeave={() => {
                  const tooltip = document.getElementById("tooltip");
                  tooltip.style.display = "none";
                }}
              />
            </g>
          );
        })}

        {Array.from({ length: 6 }).map((_, i) => {
          const priceTick = minPrice + (i * (maxPrice - minPrice)) / 5;
          const yPos = yScale(priceTick);
          return (
            <text key={i} x="10" y={yPos} textAnchor="end" fontSize="12">
              ${priceTick.toFixed(2)}
            </text>
          );
        })}

        {dates.map((date, index) => {
          if (index % Math.ceil(dates.length / 6) === 0) {
            const xPos = xScale(date);
            return (
              <text
                key={index}
                x={xPos}
                y="380"
                textAnchor="middle"
                fontSize="12"
                transform={`rotate(-45, ${xPos}, 380)`}
              >
                {date.toLocaleDateString()}
              </text>
            );
          }
          return null;
        })}

        <g transform="translate(820, 100)">
          <rect x="0" y="0" width="15" height="15" fill={colors.Open} />
          <text x="20" y="12" fontSize="12">
            Open
          </text>
          <rect x="0" y="20" width="15" height="15" fill={colors.Close} />
          <text x="20" y="32" fontSize="12">
            Close
          </text>
        </g>
      </svg>
    );
  };

  const uniqueCompanies = [...new Set(data.map((entry) => entry.Company))];
  const uniqueMonths = [
    ...new Set(
      data.map((entry) =>
        new Date(entry.Date).toLocaleString("default", { month: "long" })
      )
    ),
  ];

  useEffect(() => {
    if (data.length > 0 && !selectedCompany) {
      setSelectedCompany(uniqueCompanies[0]);
    }
    if (data.length > 0 && !selectedMonth) {
      setSelectedMonth(uniqueMonths[0]);
    }
  }, [data, uniqueCompanies, uniqueMonths]);

  return (
    <div className="App">
      <h1>CSV File Reader and Graph</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {data.length > 0 && (
        <>
          <div>
            <label>Select Company:</label>
            {uniqueCompanies.map((company) => (
              <label key={company}>
                <input
                  type="radio"
                  name="company"
                  value={company}
                  checked={selectedCompany === company}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                />
                {company}
              </label>
            ))}
          </div>
          <div>
            <label>Select Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {uniqueMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          {drawGraph()}
        </>
      )}
      <div
        id="tooltip"
        style={{
          position: "absolute",
          display: "none",
          padding: "10px",
          backgroundColor: "lightgray",
          borderRadius: "5px",
          border: "1px solid black",
        }}
      ></div>
    </div>
  );
};

export default App;
