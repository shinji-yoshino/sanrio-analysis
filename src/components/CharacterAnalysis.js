import React, { useState } from "react";
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
import { Scatter } from "react-chartjs-2";
import { getAvailableYears, getTopCharacters } from "../utils/dataLoader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CharacterAnalysis = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const years = getAvailableYears();
  const topCharacters = getTopCharacters(selectedYear, 30);

  // 散布図データ（デビュー年 vs 順位）
  const scatterData = {
    datasets: [
      {
        label: `${selectedYear}年 トップ30`,
        data: topCharacters.map((item) => ({
          x: item.character.debut_year,
          y: item.rank,
          characterName: item.character.name,
          votes: item.votes,
          age: parseInt(selectedYear) - item.character.debut_year,
        })),
        backgroundColor: "rgba(255, 107, 157, 0.6)",
        borderColor: "#ff6b9d",
        pointRadius: 6,
        pointHoverRadius: 10,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "キャラクターデビュー年 vs ランキング分析",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const point = context.raw;
            return [
              `${point.characterName}`,
              `デビュー年: ${point.x}年`,
              `順位: ${point.y}位`,
              `活動年数: ${point.age}年`,
              `得票数: ${point.votes.toLocaleString()}票`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "デビュー年",
        },
        min: 1970,
        max: 2025,
        ticks: {
          callback: function (value) {
            return value.toString();
          },
        },
      },
      y: {
        reverse: true,
        title: {
          display: true,
          text: "順位",
        },
        min: 1,
        max: 30,
      },
    },
  };

  // 活動年数カテゴリ別分析
  const getAgeCategories = () => {
    const currentYear = parseInt(selectedYear);
    const categories = {
      "新世代 (0-10年)": topCharacters.filter(
        (item) => currentYear - item.character.debut_year <= 10
      ),
      "中堅世代 (11-25年)": topCharacters.filter((item) => {
        const age = currentYear - item.character.debut_year;
        return age > 10 && age <= 25;
      }),
      "ベテラン世代 (26-40年)": topCharacters.filter((item) => {
        const age = currentYear - item.character.debut_year;
        return age > 25 && age <= 40;
      }),
      "レジェンド世代 (41年以上)": topCharacters.filter(
        (item) => currentYear - item.character.debut_year > 40
      ),
    };

    return categories;
  };

  const ageCategories = getAgeCategories();

  return (
    <div>
      <div className="chart-container">
        <h2 className="chart-title">キャラクターとデビュー年の関連性分析</h2>
        <p className="chart-description">
          デビュー年と現在のランキング成績の関係性を分析し、
          新しいキャラクターの台頭やベテランキャラクターの安定性を可視化します。
        </p>

        <div className="filter-container">
          <label>分析対象年：</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </div>

        <div style={{ height: "400px", marginBottom: "2rem" }}>
          <Scatter data={scatterData} options={scatterOptions} />
        </div>
      </div>

      <div className="chart-container">
        <h2 className="chart-title">世代別分析</h2>
        <p className="chart-description">
          活動年数に基づいてキャラクターを世代別に分類し、各世代の特徴を分析します。
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {Object.entries(ageCategories).map(([category, characters]) => {
            const avgRank =
              characters.length > 0
                ? characters.reduce((sum, char) => sum + char.rank, 0) /
                  characters.length
                : 0;
            const totalVotes = characters.reduce(
              (sum, char) => sum + char.votes,
              0
            );

            return (
              <div
                key={category}
                style={{
                  padding: "1.5rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                }}
              >
                <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>
                  {category}
                </h4>
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>キャラクター数:</strong> {characters.length}体
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>平均順位:</strong>{" "}
                  {avgRank > 0 ? avgRank.toFixed(1) : "-"}位
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>総得票数:</strong> {totalVotes.toLocaleString()}票
                </div>
              </div>
            );
          })}
        </div>

        <h3 style={{ marginBottom: "1rem", color: "#333" }}>
          詳細キャラクター一覧
        </h3>
        <table className="ranking-table">
          <thead>
            <tr>
              <th>順位</th>
              <th>キャラクター名</th>
              <th>デビュー年</th>
              <th>活動年数</th>
              <th>得票数</th>
              <th>世代</th>
            </tr>
          </thead>
          <tbody>
            {topCharacters.map((item) => {
              const age = parseInt(selectedYear) - item.character.debut_year;
              let generation;
              if (age <= 10) generation = "新世代";
              else if (age <= 25) generation = "中堅世代";
              else if (age <= 40) generation = "ベテラン世代";
              else generation = "レジェンド世代";

              return (
                <tr key={item.character_id}>
                  <td>
                    <strong>{item.rank}位</strong>
                  </td>
                  <td>{item.character.name}</td>
                  <td>{item.character.debut_year}年</td>
                  <td>{age}年</td>
                  <td>{item.votes.toLocaleString()}票</td>
                  <td>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        backgroundColor:
                          generation === "新世代"
                            ? "#28a745"
                            : generation === "中堅世代"
                            ? "#17a2b8"
                            : generation === "ベテラン世代"
                            ? "#fd7e14"
                            : "#6f42c1",
                        color: "white",
                      }}
                    >
                      {generation}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CharacterAnalysis;
