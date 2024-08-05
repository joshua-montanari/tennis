import { useEffect, useState } from "react";
import styles from "./p/CreateMatchForm.module.css"; // Reusing styles from CreateMatchForm.module.css
import statsStyles from "./Stats.module.css"; // New CSS module for styling stats
import Layout from "../components/Layout";

interface User {
  id: number;
  username: string;
}

interface Match {
  id: number;
  location: string;
  player1Id: number;
  player2Id: number;
  score: string[];
  createdAt: string;
}

const Ratings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [eloRatings, setEloRatings] = useState<{ [key: number]: number }>({});
  const [showHelp, setShowHelp] = useState(false);
  const [filterFeatherSound, setFilterFeatherSound] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchMatches = async () => {
      try {
        const response = await fetch("/api/matches");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchUsers();
    fetchMatches();
  }, []);

  useEffect(() => {
    if (users.length > 0 && matches.length > 0) {
      calculateEloRatings();
    }
  }, [users, matches, filterFeatherSound]);

  const calculateEloRatings = () => {
    const initialElo = 1000;
    const kFactor = 32;
    let newEloRatings: { [key: number]: number } = {};
    let matchCounts: { [key: number]: number } = {};

    // Initialize Elo ratings
    users.forEach((user) => {
      if (!filterFeatherSound || user.id !== 4) {
        newEloRatings[user.id] = initialElo;
        matchCounts[user.id] = 0;
      }
    });

    // Helper function to calculate expected score
    const calculateExpectedScore = (ratingA: number, ratingB: number) => {
      return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    };

    // Process matches
    matches.forEach((match) => {
      const player1Id = match.player1Id;
      const player2Id = match.player2Id;

      if (filterFeatherSound && (player1Id === 4 || player2Id === 4)) {
        return; // Skip match if user ID 4 is involved
      }

      matchCounts[player1Id] = (matchCounts[player1Id] || 0) + 1;
      matchCounts[player2Id] = (matchCounts[player2Id] || 0) + 1;

      const player1Elo = newEloRatings[player1Id] || initialElo;
      const player2Elo = newEloRatings[player2Id] || initialElo;

      // Calculate match results
      let player1Wins = 0;
      let player2Wins = 0;
      let player1SetsWon = 0;
      let player2SetsWon = 0;
      let player1GamesWon = 0;
      let player2GamesWon = 0;

      match.score.forEach((setScore) => {
        const [player1Games, player2Games] = setScore.split("-").map(Number);
        player1GamesWon += player1Games;
        player2GamesWon += player2Games;

        if (player1Games > player2Games) {
          player1SetsWon++;
        } else {
          player2SetsWon++;
        }
      });

      player1Wins = player1SetsWon > player2SetsWon ? 1 : 0;
      player2Wins = player2SetsWon > player1SetsWon ? 1 : 0;

      // Calculate expected scores
      const player1ExpectedScore = calculateExpectedScore(
        player1Elo,
        player2Elo
      );
      const player2ExpectedScore = calculateExpectedScore(
        player2Elo,
        player1Elo
      );

      // Determine match results
      const player1Result = player1Wins;
      const player2Result = player2Wins;

      // Update Elo ratings based on match wins first
      newEloRatings[player1Id] =
        (newEloRatings[player1Id] || initialElo) +
        kFactor * (player1Result - player1ExpectedScore);
      newEloRatings[player2Id] =
        (newEloRatings[player2Id] || initialElo) +
        kFactor * (player2Result - player2ExpectedScore);

      // Factor in head-to-head adjustments after match results
      if (player1Wins > player2Wins) {
        newEloRatings[player1Id] += kFactor * 0.05;
        newEloRatings[player2Id] -= kFactor * 0.05;
      } else if (player2Wins > player1Wins) {
        newEloRatings[player2Id] += kFactor * 0.05;
        newEloRatings[player1Id] -= kFactor * 0.05;
      }

      // Optional: Additional adjustments based on sets and games could be added here if needed
    });

    // Filter players with fewer than 2 matches
    Object.keys(newEloRatings).forEach((userId) => {
      if (matchCounts[Number(userId)] < 2) {
        delete newEloRatings[Number(userId)];
      }
    });

    setEloRatings(newEloRatings);
  };

  const handleCheckboxChange = () => {
    setFilterFeatherSound(!filterFeatherSound);
  };

  // Utility functions
  const getSortedPlayers = (isDoubles: boolean) => {
    return users
      .filter((user) =>
        isDoubles ? user.username.includes("/") : !user.username.includes("/")
      )
      .filter((user) => !(filterFeatherSound && user.id === 4))
      .filter((user) => eloRatings[user.id] !== undefined) // Ensure player is ranked
      .sort((a, b) => (eloRatings[b.id] || 0) - (eloRatings[a.id] || 0));
  };

  const getMedalClass = (index: number) => {
    if (index === 0) return statsStyles.gold;
    if (index === 1) return statsStyles.silver;
    if (index === 2) return statsStyles.bronze;
    return "";
  };

  return (
    <Layout>
      <div className={styles.formContainer}>
        <div className={styles.filterContainer}>
          <label>
            <input
              type="checkbox"
              checked={filterFeatherSound}
              onChange={handleCheckboxChange}
            />
            Filter Feather Sound
          </label>
        </div>

        <h2 className={statsStyles.heading}>
          Singles Elo Ratings
          <span
            className={statsStyles.helpIcon}
            onClick={() => setShowHelp(!showHelp)}
          >
            ?
          </span>
        </h2>
        {showHelp && (
          <div className={statsStyles.helpPopup}>
            <h3>Elo Rating System</h3>
            <p>
              The Elo rating system calculates player ratings based on their
              performance in matches.
            </p>
            <ul>
              <li>Match wins are the primary factor in rating adjustments.</li>
              <li>
                Head-to-head results are considered after match wins to refine
                the ratings further.
              </li>
              <li>Set wins are taken into account if match wins are equal.</li>
              <li>
                Game wins are considered if both match and set wins are equal.
              </li>
            </ul>
            <p>
              The K-factor (32) is used to determine the maximum possible
              adjustment per game.
            </p>
            <button
              className={statsStyles.closeHelp}
              onClick={() => setShowHelp(false)}
            >
              Close
            </button>
          </div>
        )}
        <div className={statsStyles.statsContainer}>
          {getSortedPlayers(false).map((user, index) => (
            <div
              key={user.id}
              className={`${statsStyles.statRow} ${getMedalClass(index)}`}
            >
              <p className={statsStyles.stat}>
                <strong>
                  {index + 1}. {user.username}
                </strong>{" "}
                - {eloRatings[user.id]?.toFixed(0) || 1000}
              </p>
            </div>
          ))}
        </div>

        <h2 className={statsStyles.heading}>
          Doubles Elo Ratings
          <span
            className={statsStyles.helpIcon}
            onClick={() => setShowHelp(!showHelp)}
          >
            ?
          </span>
        </h2>
        {showHelp && (
          <div className={statsStyles.helpPopup}>
            <h3>Elo Rating System</h3>
            <p>
              The Elo rating system calculates player ratings based on their
              performance in matches.
            </p>
            <ul>
              <li>Match wins are the primary factor in rating adjustments.</li>
              <li>
                Head-to-head results are considered after match wins to refine
                the ratings further.
              </li>
              <li>Set wins are taken into account if match wins are equal.</li>
              <li>
                Game wins are considered if both match and set wins are equal.
              </li>
            </ul>
            <p>
              The K-factor (32) is used to determine the maximum possible
              adjustment per game.
            </p>
            <button
              className={statsStyles.closeHelp}
              onClick={() => setShowHelp(false)}
            >
              Close
            </button>
          </div>
        )}
        <div className={statsStyles.statsContainer}>
          {getSortedPlayers(true).map((user, index) => (
            <div
              key={user.id}
              className={`${statsStyles.statRow} ${getMedalClass(index)}`}
            >
              <p className={statsStyles.stat}>
                <strong>
                  {index + 1}. {user.username}
                </strong>{" "}
                - {eloRatings[user.id]?.toFixed(0) || 1000}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Ratings;
