import { useState, useRef } from "react";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const [rolls, setRolls] = useState(1000);
  const [diceCount, setDiceCount] = useState(3);
  const [results, setResults] = useState<number[]>([]);
  const [frequency, setFrequency] = useState<{ sum: number; count: number }[]>([]);
  const [normalData, setNormalData] = useState<{ sum: number; value: number }[]>([]);
  const chartRef = useRef(null);

  const rollDice = () => {
    const sums: number[] = [];
    const freqMap: Record<number, number> = {};

    for (let i = 0; i < rolls; i++) {
      let rollSum = 0;
      for (let j = 0; j < diceCount; j++) {
        rollSum += Math.floor(Math.random() * 6 + 1);
      }
      sums.push(rollSum);
      freqMap[rollSum] = (freqMap[rollSum] || 0) + 1;
    }

    const freqArray = Object.entries(freqMap)
      .map(([sum, count]) => ({
        sum: Number(sum),
        count,
      }))
      .sort((a, b) => a.sum - b.sum);

    const mean = diceCount * 3.5;
    const stdDev = Math.sqrt(diceCount * ((6 ** 2 - 1) / 12));
    const normalPoints = freqArray.map(({ sum }) => {
      const exponent = -((sum - mean) ** 2) / (2 * stdDev ** 2);
      const value = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent) * rolls;
      return { sum, value };
    });

    setResults(sums);
    setFrequency(freqArray.map((d, i) => ({ ...d, value: normalPoints[i].value })));
    setNormalData(normalPoints);
  };

  const downloadChart = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      canvas.toBlob((blob) => {
        if (blob) saveAs(blob, "chart.png");
      });
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#1f2937" }}>🎲 Симулятор бросков кубиков</h1>

      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <label>
          Кол-во бросков:
          <input
            type="number"
            min={1}
            value={rolls}
            onChange={(e) => setRolls(Number(e.target.value))}
            style={{ padding: "0.5rem", marginLeft: "0.5rem", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </label>
        <label>
          Кол-во кубиков:
          <input
            type="number"
            min={1}
            value={diceCount}
            onChange={(e) => setDiceCount(Number(e.target.value))}
            style={{ padding: "0.5rem", marginLeft: "0.5rem", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </label>
        <button
          onClick={rollDice}
          style={{ padding: "0.5rem 1rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "5px" }}
        >
          Бросить!
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Полученные суммы:</h2>
          <div
            style={{
              maxHeight: "150px",
              overflowY: "auto",
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              marginTop: "1rem",
            }}
          >
            {results.map((res, idx) => (
              <span
                key={idx}
                style={{
                  background: "#4f46e5",
                  color: "white",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {res}
              </span>
            ))}
          </div>
        </div>
      )}

      {frequency.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>📊 График распределения:</h2>
          <div ref={chartRef} style={{ marginTop: "1rem", background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={frequency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sum" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
                <Line type="monotone" dataKey="value" stroke="#ef4444" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <button
            onClick={downloadChart}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "5px" }}
          >
            Скачать график PNG
          </button>
          <p style={{ marginTop: "1rem", fontStyle: "italic", color: "#374151" }}>
            Чем больше кубиков, тем больше распределение похоже на нормальное (колоколообразное). Красная линия — теоретическая кривая Гаусса 📈
          </p>
        </div>
      )}
    </div>
  );
}
