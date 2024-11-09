import { useEffect, useState } from "react";
import styles from "./p/CreateMatchForm.module.css"; // Reusing styles from CreateMatchForm.module.css
import statsStyles from "./Stats.module.css"; // New CSS module for styling stats
import Layout from "../components/Layout";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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
  const [filterSeason1, setFilterSeason1] = useState(false);
  const [filterSeason2, setFilterSeason2] = useState(true);
  const currentDateTime = new Date().toISOString();

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
  }, [users, matches, filterFeatherSound, filterSeason1, filterSeason2]);

  const calculateEloRatings = () => {
    const initialElo = 1000;
    const kFactor = 32;
    const winStreakBonus = 5; // Bonus for winning consecutive matches
    const dominantWinBonus = 3; // Extra points for winning a set by a large margin

    let newEloRatings: { [key: number]: number } = {};
    let matchCounts: { [key: number]: number } = {};

    // Initialize Elo ratings
    users.forEach((user) => {
      if (!filterFeatherSound || user.id !== 4) {
        newEloRatings[user.id] = initialElo;
        matchCounts[user.id] = 0;
      }
    });

    const isMatchInSeason = (match: Match) => {
      const matchDate = new Date(match.createdAt).toISOString();
      return (
        (filterSeason1 && matchDate <= currentDateTime) ||
        (filterSeason2 && matchDate > currentDateTime)
      );
    };

    // Process matches
    matches.forEach((match) => {
      const player1Id = match.player1Id;
      const player2Id = match.player2Id;

      if (
        (filterFeatherSound && (player1Id === 4 || player2Id === 4)) ||
        !isMatchInSeason(match)
      ) {
        return; // Skip match if it doesn’t meet filter criteria
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

      const calculateExpectedScore = (ratingA: number, ratingB: number) => {
        return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
      };

      const player1ExpectedScore = calculateExpectedScore(
        player1Elo,
        player2Elo
      );
      const player2ExpectedScore = calculateExpectedScore(
        player2Elo,
        player1Elo
      );

      const marginBonus =
        player1GamesWon - player2GamesWon > 5 ||
        player2GamesWon - player1GamesWon > 5
          ? dominantWinBonus
          : 0;

      // Update Elo with bonus for win streaks and margin of victory
      if (player1Wins > player2Wins) {
        newEloRatings[player1Id] =
          player1Elo + kFactor * (1 - player1ExpectedScore) + marginBonus;
        newEloRatings[player2Id] =
          player2Elo + kFactor * (0 - player2ExpectedScore) - marginBonus;

        // Apply win streak bonus
        newEloRatings[player1Id] += winStreakBonus;
      } else if (player2Wins > player1Wins) {
        newEloRatings[player2Id] =
          player2Elo + kFactor * (1 - player2ExpectedScore) + marginBonus;
        newEloRatings[player1Id] =
          player1Elo + kFactor * (0 - player1ExpectedScore) - marginBonus;

        // Apply win streak bonus
        newEloRatings[player2Id] += winStreakBonus;
      }
    });

    // Remove players with insufficient matches
    Object.keys(newEloRatings).forEach((userId) => {
      if (matchCounts[Number(userId)] < 2) {
        delete newEloRatings[Number(userId)];
      }
    });

    setEloRatings(newEloRatings);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    if (name === "filterFeatherSound") setFilterFeatherSound(checked);
    if (name === "filterSeason1") setFilterSeason1(checked);
    if (name === "filterSeason2") setFilterSeason2(checked);
  };

  const getSortedPlayers = (isDoubles: boolean) => {
    return users
      .filter((user) =>
        isDoubles ? user.username.includes("/") : !user.username.includes("/")
      )
      .filter((user) => !(filterFeatherSound && user.id === 4))
      .filter((user) => eloRatings[user.id] !== undefined)
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
              name="filterFeatherSound"
              checked={filterFeatherSound}
              onChange={handleCheckboxChange}
            />
            Filter Feather Sound
          </label>
          <label>
            <input
              type="checkbox"
              name="filterSeason1"
              checked={filterSeason1}
              onChange={handleCheckboxChange}
            />
            Season 1
          </label>
          <label>
            <input
              type="checkbox"
              name="filterSeason2"
              checked={filterSeason2}
              onChange={handleCheckboxChange}
            />
            Season 2
          </label>
        </div>

        <IconButton onClick={() => setShowHelp(true)} aria-label="Help">
          <HelpOutlineIcon />
        </IconButton>

        <Dialog open={showHelp} onClose={() => setShowHelp(false)}>
          <DialogTitle>Understanding the Elo Rating System</DialogTitle>
          <DialogContent>
            <Typography>
              The Elo system adjusts player ratings based on match results and
              the relative skill of opponents:
            </Typography>
            <ul>
              <li>
                Winning against a higher-ranked player awards more points than
                beating a lower-ranked player.
              </li>
              <li>
                Consecutive wins provide a small Elo bonus, rewarding consistent
                performance.
              </li>
              <li>
                Wins by a large margin (e.g., 6-0, 6-1) yield extra points,
                acknowledging dominant play.
              </li>
            </ul>
            <Typography>
              Your Elo rating will decrease if you lose, especially against
              lower-ranked players, encouraging a competitive and fair ranking.
            </Typography>
          </DialogContent>
        </Dialog>

        <h2 className={statsStyles.heading}>Singles Elo Ratings</h2>
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

        <h2 className={statsStyles.heading}>Doubles Elo Ratings</h2>
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
