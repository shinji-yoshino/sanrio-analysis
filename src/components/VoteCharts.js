import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  getAvailableYears,
  getTopCharacters,
  getCharacterRankingHistory,
  getCharacters,
  getRankingByYear,
} from "../utils/dataLoader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const VoteCharts = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [topN, setTopN] = useState(10);
  const years = getAvailableYears();
  const characters = getCharacters();

  // 最新年（2025年）のランキング順でキャラクターを取得し、上位5キャラクターをデフォルト選択
  const latestYear = Math.max(...years);
  const latestRanking = getRankingByYear(latestYear.toString());
  const top5Characters = latestRanking
    .slice(0, 5)
    .map((item) => item.character_id);

  const [selectedCharacters, setSelectedCharacters] = useState(top5Characters);

  const topCharacters = getTopCharacters(selectedYear, topN);

  const generateColors = (length) => {
    const baseColors = [
      "#ff6b9d",
      "#4ecdc4",
      "#45b7d1",
      "#96ceb4",
      "#feca57",
      "#ff9ff3",
      "#54a0ff",
      "#5f27cd",
      "#00d2d3",
      "#ff9f43",
    ];

    return Array.from({ length }, (_, i) => baseColors[i % baseColors.length]);
  };

  // 年別得票数比較チャート
  const yearlyComparisonData = {
    labels: topCharacters.map((item) => item.character.name),
    datasets: [
      {
        label: `${selectedYear}年 得票数`,
        data: topCharacters.map((item) => item.votes),
        backgroundColor: generateColors(topCharacters.length),
        borderColor: generateColors(topCharacters.length).map((color) =>
          color.replace("0.6", "1")
        ),
        borderWidth: 2,
      },
    ],
  };

  // 年別推移チャート（選択されたキャラクターの5年間推移）
  const trendData = {
    labels: years.map((year) => `${year}年`),
    datasets: selectedCharacters.map((characterId, index) => {
      const history = getCharacterRankingHistory(characterId);
      const character = characters.find((c) => c.id === characterId);
      const data = years.map((year) => {
        const yearData = history.find((h) => h.year === year);
        return yearData ? yearData.votes : 0;
      });

      return {
        label: character?.name || "Unknown",
        data: data,
        borderColor: generateColors(selectedCharacters.length)[index],
        backgroundColor:
          generateColors(selectedCharacters.length)[index] + "20",
        tension: 0.1,
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: false,
      };
    }),
  };

  const yearlyComparisonOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${selectedYear}年 トップ${topN}キャラクター 得票数`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.parsed.y.toLocaleString()}票`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "得票数",
        },
        ticks: {
          callback: function (value) {
            return value.toLocaleString();
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "キャラクター",
        },
      },
    },
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "選択キャラクター 得票数推移（5年間）",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${
              context.dataset.label
            }: ${context.parsed.y.toLocaleString()}票`;
          },
          beforeTitle: function (tooltipItems) {
            // ツールチップの順序をその年の票数順に並び替え
            tooltipItems.sort((a, b) => {
              const aVotes = a.parsed.y;
              const bVotes = b.parsed.y;
              return bVotes - aVotes; // 票数の多い順
            });

            return "";
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "得票数",
        },
        ticks: {
          callback: function (value) {
            return value.toLocaleString();
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
    interaction: {
      intersect: false,
      mode: "index",
    },
    elements: {
      point: {
        radius: 5,
        hoverRadius: 8,
      },
    },
  };

  const handleCharacterToggle = (characterId) => {
    setSelectedCharacters((prev) => {
      if (prev.includes(characterId)) {
        return prev.filter((id) => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };

  return (
    <div>
      <div className="chart-container">
        <h2 className="chart-title">キャラクター別得票数分析</h2>
        <p className="chart-description">
          年別のキャラクター得票数を詳細に分析し、人気の変動を把握します。
        </p>

        <div className="filter-container">
          <label>年を選択：</label>
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

          <label>表示件数：</label>
          <select
            value={topN}
            onChange={(e) => setTopN(parseInt(e.target.value))}
          >
            <option value={5}>トップ5</option>
            <option value={10}>トップ10</option>
            <option value={15}>トップ15</option>
            <option value={20}>トップ20</option>
          </select>
        </div>

        <div style={{ height: "400px", marginBottom: "2rem" }}>
          <Bar data={yearlyComparisonData} options={yearlyComparisonOptions} />
        </div>

        {/* 詳細データテーブル */}
        <h3 style={{ marginTop: "2rem", marginBottom: "1rem", color: "#333" }}>
          {selectedYear}年 詳細データ
        </h3>
        <table className="ranking-table">
          <thead>
            <tr>
              <th>順位</th>
              <th>キャラクター名</th>
              <th>得票数</th>
              <th>デビュー年</th>
              <th>活動年数</th>
            </tr>
          </thead>
          <tbody>
            {topCharacters.map((item, index) => (
              <tr key={item.character_id}>
                <td>
                  <strong>{item.rank}位</strong>
                </td>
                <td>{item.character.name}</td>
                <td>{item.votes.toLocaleString()}票</td>
                <td>{item.character.debut_year}年</td>
                <td>{parseInt(selectedYear) - item.character.debut_year}年</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="chart-container">
        <h2 className="chart-title">選択キャラクター 得票数推移</h2>
        <p className="chart-description">
          選択されたキャラクターの過去5年間の得票数変動を比較します。
          下のキャラクター一覧から表示したいキャラクターを選択してください。
        </p>

        <div className="filter-container">
          <label>表示キャラクター選択（最新年ランキング順）：</label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "0.5rem",
              maxHeight: "250px",
              overflowY: "auto",
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "6px",
              backgroundColor: "#fafafa",
            }}
          >
            {/* 最新年のランキング順でキャラクターを表示 */}
            {latestRanking.slice(0, 30).map((rankingItem) => {
              const character = characters.find(
                (c) => c.id === rankingItem.character_id
              );
              if (!character) return null;
              return (
                <label
                  key={character.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    padding: "0.3rem 0.5rem",
                    borderRadius: "4px",
                    transition: "background-color 0.2s",
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCharacters.includes(character.id)}
                    onChange={() => handleCharacterToggle(character.id)}
                    style={{ marginRight: "0.3rem" }}
                  />
                  {rankingItem.rank}位. {character.name}
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ height: "400px" }}>
          <Line data={trendData} options={trendOptions} />
        </div>
      </div>
    </div>
  );
};

export default VoteCharts;
