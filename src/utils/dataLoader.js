import charactersData from "../data/characters.json";
import rankingData from "../data/ranking_data.json";

// キャラクター基本情報を取得
export const getCharacters = () => {
  return charactersData.characters;
};

// 年別ランキングデータを取得
export const getYearlyRankings = () => {
  return rankingData.yearly_rankings;
};

// 総得票数データを取得
export const getTotalVotesByYear = () => {
  return rankingData.total_votes_by_year;
};

// 特定の年のランキングを取得
export const getRankingByYear = (year) => {
  return rankingData.yearly_rankings[year] || [];
};

// 特定のキャラクターの年別ランキング推移を取得
export const getCharacterRankingHistory = (characterId) => {
  const years = Object.keys(rankingData.yearly_rankings);
  const history = [];

  years.forEach((year) => {
    const ranking = rankingData.yearly_rankings[year];
    const characterRank = ranking.find(
      (item) => item.character_id === characterId
    );
    if (characterRank) {
      history.push({
        year: parseInt(year),
        rank: characterRank.rank,
        votes: characterRank.votes,
      });
    }
  });

  return history.sort((a, b) => a.year - b.year);
};

// キャラクター名を取得
export const getCharacterName = (characterId) => {
  const character = charactersData.characters.find((c) => c.id === characterId);
  return character ? character.name : "Unknown";
};

// キャラクター情報を取得
export const getCharacterInfo = (characterId) => {
  return charactersData.characters.find((c) => c.id === characterId);
};

// 年のリストを取得（昇順）
export const getAvailableYears = () => {
  return Object.keys(rankingData.yearly_rankings)
    .map((year) => parseInt(year))
    .sort((a, b) => a - b);
};

// 上位Nキャラクターのデータを取得
export const getTopCharacters = (year, topN = 10) => {
  const ranking = rankingData.yearly_rankings[year];
  if (!ranking) return [];

  return ranking.slice(0, topN).map((item) => ({
    ...item,
    character: getCharacterInfo(item.character_id),
  }));
};

// ランキング変動を計算
export const calculateRankingChanges = (currentYear, previousYear) => {
  const currentRanking = rankingData.yearly_rankings[currentYear];
  const previousRanking = rankingData.yearly_rankings[previousYear];

  if (!currentRanking || !previousRanking) return [];

  return currentRanking.map((current) => {
    const previous = previousRanking.find(
      (p) => p.character_id === current.character_id
    );
    const change = previous ? previous.rank - current.rank : null;

    return {
      ...current,
      character: getCharacterInfo(current.character_id),
      previousRank: previous ? previous.rank : null,
      change: change,
    };
  });
};
