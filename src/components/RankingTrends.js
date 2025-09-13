import React, { useState, useEffect } from "react";
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
import {
  getAvailableYears,
  getCharacters,
  getCharacterRankingHistory,
  calculateRankingChanges,
  getCharacterName,
  getRankingByYear,
} from "../utils/dataLoader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RankingTrends = () => {
  const [years] = useState(getAvailableYears());
  const [characters] = useState(getCharacters());

  // 最新年（2025年）のランキング順でキャラクターを取得し、上位5キャラクターをデフォルト選択
  const latestYear = Math.max(...years);
  const latestRanking = getRankingByYear(latestYear.toString());
  const top5Characters = latestRanking
    .slice(0, 5)
    .map((item) => item.character_id);

  const [selectedCharacters, setSelectedCharacters] = useState(top5Characters);
  const [rankingChanges, setRankingChanges] = useState([]);

  useEffect(() => {
    if (years.length >= 2) {
      const latestYear = years[years.length - 1];
      const previousYear = years[years.length - 2];
      const changes = calculateRankingChanges(
        latestYear.toString(),
        previousYear.toString()
      );
      setRankingChanges(changes.slice(0, 30)); // トップ30のみ
    }
  }, [years]);

  const generateColors = (index) => {
    const colors = [
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
    return colors[index % colors.length];
  };

  const chartData = {
    labels: years.map((year) => `${year}年`),
    datasets: selectedCharacters.map((characterId, index) => {
      const history = getCharacterRankingHistory(characterId);
      const data = years.map((year) => {
        const yearData = history.find((h) => h.year === year);
        return yearData ? yearData.rank : null;
      });

      return {
        label: getCharacterName(characterId),
        data: data,
        borderColor: generateColors(index),
        backgroundColor: generateColors(index) + "20",
        tension: 0.1,
        pointRadius: 5,
        pointHoverRadius: 8,
      };
    }),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "選択キャラクターのランキング推移",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}位`;
          },
          beforeTitle: function (tooltipItems) {
            // ツールチップの順序をその年のランキング順に並び替え
            const year = years[tooltipItems[0].dataIndex];
            const ranking = getRankingByYear(year.toString());

            tooltipItems.sort((a, b) => {
              const aCharId = selectedCharacters[a.datasetIndex];
              const bCharId = selectedCharacters[b.datasetIndex];
              const aRank =
                ranking.find((r) => r.character_id === aCharId)?.rank || 999;
              const bRank =
                ranking.find((r) => r.character_id === bCharId)?.rank || 999;
              return aRank - bRank;
            });

            return "";
          },
        },
      },
    },
    scales: {
      y: {
        reverse: true, // ランキングなので順位が低いほど上に表示
        min: 1,
        max: 30,
        title: {
          display: true,
          text: "順位",
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

  const getRankChangeIcon = (change) => {
    if (change === null) return "🆕";
    if (change > 0) return "↑";
    if (change < 0) return "↓";
    return "→";
  };

  const getRankChangeClass = (change) => {
    if (change === null) return "";
    if (change > 0) return "rank-up";
    if (change < 0) return "rank-down";
    return "rank-same";
  };

  return (
    <div>
      <div className="chart-container">
        <h2 className="chart-title">ランキング推移分析</h2>
        <p className="chart-description">
          過去5年間のキャラクターランキングの変動を可視化します。
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

        <div style={{ height: "400px", marginBottom: "2rem" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="chart-container">
        <h2 className="chart-title">最新ランキング変動（トップ30）</h2>
        <p className="chart-description">
          {years.length >= 2 &&
            `${years[years.length - 2]}年から${
              years[years.length - 1]
            }年への順位変動`}
        </p>

        <table className="ranking-table">
          <thead>
            <tr>
              <th>現在順位</th>
              <th>キャラクター名</th>
              <th>得票数</th>
              <th>前年順位</th>
              <th>変動</th>
            </tr>
          </thead>
          <tbody>
            {rankingChanges.map((item, index) => (
              <tr key={item.character_id}>
                <td>
                  <strong>{item.rank}位</strong>
                </td>
                <td>{item.character?.name}</td>
                <td>{item.votes.toLocaleString()}票</td>
                <td>{item.previousRank ? `${item.previousRank}位` : "-"}</td>
                <td>
                  <span
                    className={`rank-change ${getRankChangeClass(item.change)}`}
                  >
                    {getRankChangeIcon(item.change)}
                    {item.change !== null &&
                      item.change !== 0 &&
                      ` ${Math.abs(item.change)}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingTrends;
