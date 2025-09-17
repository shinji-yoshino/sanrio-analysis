import React, { useState } from "react";
import "./App.css";
import RankingTrends from "./components/RankingTrends";
import VoteCharts from "./components/VoteCharts";
import TotalVotes from "./components/TotalVotes";
import CharacterAnalysis from "./components/CharacterAnalysis";

function App() {
  const [activeTab, setActiveTab] = useState("ranking");

  const renderContent = () => {
    switch (activeTab) {
      case "ranking":
        return <RankingTrends />;
      case "votes":
        return <VoteCharts />;
      case "total":
        return <TotalVotes />;
      case "analysis":
        return <CharacterAnalysis />;
      default:
        return <RankingTrends />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>サンリオキャラクター大賞 分析サイト</h1>
      </header>

      <nav className="navigation">
        <button
          className={activeTab === "ranking" ? "active" : ""}
          onClick={() => setActiveTab("ranking")}
        >
          ランキング推移
        </button>
        <button
          className={activeTab === "votes" ? "active" : ""}
          onClick={() => setActiveTab("votes")}
        >
          得票数推移
        </button>
        <button
          className={activeTab === "total" ? "active" : ""}
          onClick={() => setActiveTab("total")}
        >
          総得票数推移
        </button>
        <button
          className={activeTab === "analysis" ? "active" : ""}
          onClick={() => setActiveTab("analysis")}
        >
          キャラクター分析
        </button>
      </nav>

      <main className="main-content">{renderContent()}</main>
    </div>
  );
}

export default App;
