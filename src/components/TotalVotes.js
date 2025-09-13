import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getAvailableYears, getTotalVotesByYear } from "../utils/dataLoader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TotalVotes = () => {
  const years = getAvailableYears();
  const totalVotesByYear = getTotalVotesByYear();

  // 年別総得票数データ
  const yearlyTotals = years.map((year) => totalVotesByYear[year]);

  // 前年比成長率を計算
  const growthRates = years.map((year, index) => {
    if (index === 0) return 0;
    const currentYear = totalVotesByYear[year];
    const previousYear = totalVotesByYear[years[index - 1]];
    return ((currentYear - previousYear) / previousYear) * 100;
  });

  // 折れ線グラフデータ
  const lineChartData = {
    labels: years.map((year) => `${year}年`),
    datasets: [
      {
        label: "総得票数",
        data: yearlyTotals,
        borderColor: "#ff6b9d",
        backgroundColor: "#ff6b9d20",
        tension: 0.1,
        pointRadius: 6,
        pointHoverRadius: 10,
        pointBackgroundColor: "#ff6b9d",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "サンリオキャラクター大賞 総得票数推移",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `総得票数: ${context.parsed.y.toLocaleString()}票`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "総得票数",
        },
        ticks: {
          callback: function (value) {
            return (value / 1000000).toFixed(1) + "M";
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "年",
        },
      },
    },
  };

  // 統計情報を計算
  const stats = {
    totalGrowth: (
      ((yearlyTotals[yearlyTotals.length - 1] - yearlyTotals[0]) /
        yearlyTotals[0]) *
      100
    ).toFixed(1),
    averageGrowth: (
      growthRates.slice(1).reduce((sum, rate) => sum + rate, 0) /
      growthRates.slice(1).length
    ).toFixed(1),
    maxVotes: Math.max(...yearlyTotals),
    minVotes: Math.min(...yearlyTotals),
    maxGrowthRate: Math.max(...growthRates.slice(1)).toFixed(1),
    minGrowthRate: Math.min(...growthRates.slice(1)).toFixed(1),
  };

  return (
    <div>
      <div className="chart-container">
        <h2 className="chart-title">総得票数分析</h2>
        <p className="chart-description">
          サンリオキャラクター大賞全体の市場規模と成長トレンドを分析します。
          総得票数の推移から、キャラクター大賞自体の人気度や参加者数の変化を把握できます。
        </p>

        <div style={{ height: "400px", marginBottom: "2rem" }}>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      <div className="chart-container">
        <h2 className="chart-title">詳細統計情報</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>基本統計</h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <strong>期間全体成長率</strong>
                <div
                  style={{
                    fontSize: "1.5rem",
                    color: stats.totalGrowth >= 0 ? "#28a745" : "#dc3545",
                    fontWeight: "bold",
                  }}
                >
                  {stats.totalGrowth}%
                </div>
              </div>
              <div>
                <strong>平均年成長率</strong>
                <div
                  style={{
                    fontSize: "1.5rem",
                    color: stats.averageGrowth >= 0 ? "#28a745" : "#dc3545",
                    fontWeight: "bold",
                  }}
                >
                  {stats.averageGrowth}%
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "1.5rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #e9ecef",
            }}
          >
            <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>
              得票数レンジ
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <strong>最高得票数</strong>
                <div
                  style={{
                    fontSize: "1.2rem",
                    color: "#333",
                    fontWeight: "bold",
                  }}
                >
                  {stats.maxVotes.toLocaleString()}票
                </div>
              </div>
              <div>
                <strong>最低得票数</strong>
                <div
                  style={{
                    fontSize: "1.2rem",
                    color: "#333",
                    fontWeight: "bold",
                  }}
                >
                  {stats.minVotes.toLocaleString()}票
                </div>
              </div>
            </div>
          </div>
        </div>

        <table className="ranking-table">
          <thead>
            <tr>
              <th>年</th>
              <th>総得票数</th>
              <th>前年比</th>
              <th>成長率</th>
            </tr>
          </thead>
          <tbody>
            {years.map((year, index) => (
              <tr key={year}>
                <td>
                  <strong>{year}年</strong>
                </td>
                <td>{yearlyTotals[index].toLocaleString()}票</td>
                <td>
                  {index > 0
                    ? `${
                        yearlyTotals[index] - yearlyTotals[index - 1] >= 0
                          ? "+"
                          : ""
                      }${(
                        yearlyTotals[index] - yearlyTotals[index - 1]
                      ).toLocaleString()}票`
                    : "-"}
                </td>
                <td>
                  {index > 0 ? (
                    <span
                      className={
                        growthRates[index] >= 0 ? "rank-up" : "rank-down"
                      }
                      style={{ fontWeight: "bold" }}
                    >
                      {growthRates[index] >= 0 ? "+" : ""}
                      {growthRates[index].toFixed(1)}%
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TotalVotes;
