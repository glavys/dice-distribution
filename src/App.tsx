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
  const [frequency, setFrequency] = useState<{ sum: number; count: number; value?: number }[]>([]);
  const [allRolls, setAllRolls] = useState<number[][]>([]);
  const [showNormal, setShowNormal] = useState(true);
  const chartRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);

  const rollDice = () => {
    const freqMap: Record<number, number> = {};
    const fullHistory: number[][] = [];

    for (let i = 0; i < rolls; i++) {
      const rollCombo: number[] = [];
      let rollSum = 0;
      for (let j = 0; j < diceCount; j++) {
        const r = Math.floor(Math.random() * 6 + 1);
        rollSum += r;
        rollCombo.push(r);
      }
      fullHistory.push(rollCombo);
      freqMap[rollSum] = (freqMap[rollSum] || 0) + 1;
    }

    const freqArray = Object.entries(freqMap)
      .map(([sum, count]) => ({ sum: Number(sum), count }))
      .sort((a, b) => a.sum - b.sum);

    const mean = diceCount * 3.5;
    const stdDev = Math.sqrt(diceCount * ((6 ** 2 - 1) / 12));
    const freqWithNormal = freqArray.map(({ sum, count }) => {
      const exponent = -((sum - mean) ** 2) / (2 * stdDev ** 2);
      const value = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent) * rolls;
      return { sum, count, value };
    });

    setAllRolls(fullHistory);
    setFrequency(freqWithNormal);
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
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", backgroundColor: "#e0f2fe", minHeight: "100vh", color: "#333" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#1d4ed8" }}>🎲 Симулятор бросков кубиков</h1>
        <button onClick={() => setShowInfo(!showInfo)} style={{ background: "#111", color: "white", border: "none", fontSize: "20px", cursor: "pointer", padding: "0.3rem 0.8rem", borderRadius: "6px" }}>
          ⓘ
        </button>
      </div>

      {showInfo && (
        <div style={{ backgroundColor: "#fff", padding: "1rem", marginTop: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>ℹ️ Подробная информация о нормальном распределении</h3>
          <p>
            Нормальное распределение — одно из самых распространённых распределений в статистике. Его форма — колоколообразная кривая, которая описывает распределение случайной величины, значение которой наиболее вероятно около среднего значения и становится всё менее вероятным по мере отклонения от него.
          </p>
          <p>Оно описывается функцией плотности вероятности (формула Гаусса):</p>
          <pre style={{ backgroundColor: "#f3f4f6", padding: "1rem", borderRadius: "6px" }}>
ρ(t) = (1 / (σ√2π)) * exp( - (t - ⟨t⟩)² / (2σ²) )
          </pre>
          <p>
            Где:
            <br />⟨t⟩ — среднее значение (математическое ожидание),
            <br />σ — стандартное отклонение,
            <br />t — измеряемая величина.
          </p>
          <p>
            В лабораторной работе нормальное распределение используется для анализа многократных измерений времени. Вы можете сравнить гистограмму измерений с функцией плотности вероятности. При большом числе измерений они должны совпадать по форме.
          </p>
          <p>
            Например, вероятность попасть в интервал:
            <br />[⟨t⟩ - σ, ⟨t⟩ + σ] ≈ 68.3%
            <br />[⟨t⟩ - 2σ, ⟨t⟩ + 2σ] ≈ 95.4%
            <br />[⟨t⟩ - 3σ, ⟨t⟩ + 3σ] ≈ 99.7%
          </p>
        </div>
      )}

      <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", alignItems: "end" }}>
        <label style={{ color: "#111", fontWeight: 500, backgroundColor: "#e5e7eb", padding: "0.5rem", borderRadius: "6px" }}>
          Кол-во бросков:
          <input
            type="number"
            min={1}
            value={rolls}
            onChange={(e) => setRolls(Number(e.target.value))}
            style={{ width: "100%", marginTop: "0.25rem", padding: "0.5rem", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f9fafb", color: "#1e3a8a" }}
          />
        </label>
        <label style={{ color: "#111", fontWeight: 500, backgroundColor: "#e5e7eb", padding: "0.5rem", borderRadius: "6px" }}>
          Кол-во кубиков:
          <input
            type="number"
            min={1}
            value={diceCount}
            onChange={(e) => setDiceCount(Number(e.target.value))}
            style={{ width: "100%", marginTop: "0.25rem", padding: "0.5rem", fontSize: "16px", borderRadius: "4px", border: "1px solid #ccc", backgroundColor: "#f9fafb", color: "#065f46" }}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", fontWeight: 500, color: "#111" }}>
          <input type="checkbox" checked={showNormal} onChange={() => setShowNormal(!showNormal)} style={{ marginRight: "0.5rem" }} />
          Показать нормальную кривую
        </label>
        <button
          onClick={rollDice}
          style={{ padding: "0.5rem 1rem", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "5px" }}
        >
          Бросить!
        </button>
      </div>

      {allRolls.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>📚 История всех бросков:</h2>
          <div style={{ maxHeight: "300px", overflowY: "auto", backgroundColor: "#fff", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc", padding: "4px" }}>Номер броска</th>
                  <th style={{ borderBottom: "1px solid #ccc", padding: "4px" }}>Сумма</th>
                  <th style={{ borderBottom: "1px solid #ccc", padding: "4px" }}>Комбинация</th>
                </tr>
              </thead>
              <tbody>
                {allRolls.map((combo, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "4px" }}>{idx + 1}</td>
                    <td style={{ padding: "4px" }}>{combo.reduce((a, b) => a + b, 0)}</td>
                    <td style={{ padding: "4px" }}>[{combo.join(", ")}]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {frequency.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "black" }}>📊 График распределения:</h2>
          <div ref={chartRef} style={{ marginTop: "1rem", background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={frequency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sum" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
                {showNormal && <Line type="monotone" dataKey="value" stroke="#ef4444" dot={false} />}
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