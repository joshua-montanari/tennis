import { useEffect, useState } from "react";
import styles from "./p/CreateMatchForm.module.css"; // Reusing styles from CreateMatchForm.module.css
import Layout from "../components/Layout";
import statsStyles from "./Stats.module.css"; // New CSS module for styling stats

export interface User {
  id: number;
  username: string;
}

export interface Match {
  id: number;
  location: string;
  player1Id: number;
  player2Id: number;
  score: string[];
  createdAt: string;
}

const UserStats: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedUser1, setSelectedUser1] = useState<number | "">("");
  const [selectedUser2, setSelectedUser2] = useState<number | "">("");

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

  const getUserById = (id: number) => {
    return users.find((user) => user.id === id);
  };

  const getStats = (userId: number) => {
    const userMatches = matches.filter(
      (match) => match.player1Id === userId || match.player2Id === userId
    );

    let wins = 0;
    let losses = 0;
    let setsWon = 0;
    let setsLost = 0;
    let gamesWon = 0;
    let gamesLost = 0;

    userMatches.forEach((match) => {
      const isPlayer1 = match.player1Id === userId;
      const matchWins = isPlayer1 ? 1 : 0;
      const matchLosses = isPlayer1 ? 0 : 1;

      wins += matchWins;
      losses += matchLosses;

      match.score.forEach((setScore) => {
        const [player1Games, player2Games] = setScore.split("-").map(Number);
        if (isPlayer1) {
          setsWon += player1Games > player2Games ? 1 : 0;
          setsLost += player1Games < player2Games ? 1 : 0;
          gamesWon += player1Games;
          gamesLost += player2Games;
        } else {
          setsWon += player2Games > player1Games ? 1 : 0;
          setsLost += player2Games < player1Games ? 1 : 0;
          gamesWon += player2Games;
          gamesLost += player1Games;
        }
      });
    });

    const totalMatches = wins + losses;
    const winRate = totalMatches ? (wins / totalMatches) * 100 : 0;

    return {
      wins,
      losses,
      winRate,
      totalMatches,
      setsWon,
      setsLost,
      gamesWon,
      gamesLost,
    };
  };

  const getFilteredStats = (userId1: number, userId2: number) => {
    const userMatches = matches.filter(
      (match) =>
        (match.player1Id === userId1 && match.player2Id === userId2) ||
        (match.player1Id === userId2 && match.player2Id === userId1)
    );

    let wins = 0;
    let losses = 0;
    let setsWon = 0;
    let setsLost = 0;
    let gamesWon = 0;
    let gamesLost = 0;

    userMatches.forEach((match) => {
      const isPlayer1 = match.player1Id === userId1;
      const matchWins = isPlayer1 ? 1 : 0;
      const matchLosses = isPlayer1 ? 0 : 1;

      wins += matchWins;
      losses += matchLosses;

      match.score.forEach((setScore) => {
        const [player1Games, player2Games] = setScore.split("-").map(Number);
        if (isPlayer1) {
          setsWon += player1Games > player2Games ? 1 : 0;
          setsLost += player1Games < player2Games ? 1 : 0;
          gamesWon += player1Games;
          gamesLost += player2Games;
        } else {
          setsWon += player2Games > player1Games ? 1 : 0;
          setsLost += player2Games < player1Games ? 1 : 0;
          gamesWon += player2Games;
          gamesLost += player1Games;
        }
      });
    });

    const totalMatches = wins + losses;
    const winRate = totalMatches ? (wins / totalMatches) * 100 : 0;

    return {
      wins,
      losses,
      winRate,
      totalMatches,
      setsWon,
      setsLost,
      gamesWon,
      gamesLost,
    };
  };

  const user1 =
    selectedUser1 !== "" ? getUserById(Number(selectedUser1)) : null;
  const user2 =
    selectedUser2 !== "" ? getUserById(Number(selectedUser2)) : null;

  const user1Stats =
    selectedUser1 !== "" ? getStats(Number(selectedUser1)) : null;
  const user2Stats =
    selectedUser2 !== "" && selectedUser1 !== ""
      ? getFilteredStats(Number(selectedUser1), Number(selectedUser2))
      : null;

  const getColorClass = (condition: boolean, equalCondition: boolean) => {
    if (condition) return statsStyles.green;
    if (equalCondition) return statsStyles.yellow;
    return statsStyles.red;
  };

  return (
    <Layout>
      <div className={styles.formContainer}>
        <form>
          <div className={styles.formGroup}>
            <label htmlFor="user1">Player</label>
            <select
              id="user1"
              value={selectedUser1}
              //@ts-ignore
              onChange={(e) => setSelectedUser1(e.target.value)}
            >
              <option value="">Player</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="user2">Opponent</label>
            <select
              id="user2"
              value={selectedUser2}
              //@ts-ignore
              onChange={(e) => setSelectedUser2(e.target.value)}
            >
              <option value="">Opponent</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            {user1Stats && user1 && (
              <div className={statsStyles.statsContainer}>
                <h3 className={statsStyles.heading}>
                  Stats for {user1.username}
                </h3>
                <div
                  className={`${statsStyles.statRow} ${getColorClass(
                    user1Stats.wins > user1Stats.losses,
                    user1Stats.wins === user1Stats.losses
                  )}`}
                >
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Wins:</span>{" "}
                    {user1Stats.wins}
                  </p>
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Losses:</span>{" "}
                    {user1Stats.losses}
                  </p>
                </div>
                <div
                  className={`${statsStyles.statRow} ${getColorClass(
                    user1Stats.winRate > 50,
                    user1Stats.winRate === 50
                  )}`}
                >
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Win Rate:</span>{" "}
                    {user1Stats.winRate.toFixed(2)}%
                  </p>
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Total Matches:</span>{" "}
                    {user1Stats.totalMatches}
                  </p>
                </div>
                <div
                  className={`${statsStyles.statRow} ${getColorClass(
                    user1Stats.setsWon > user1Stats.setsLost,
                    user1Stats.setsWon === user1Stats.setsLost
                  )}`}
                >
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Sets Won:</span>{" "}
                    {user1Stats.setsWon}
                  </p>
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Sets Lost:</span>{" "}
                    {user1Stats.setsLost}
                  </p>
                </div>
                <div
                  className={`${statsStyles.statRow} ${getColorClass(
                    user1Stats.gamesWon > user1Stats.gamesLost,
                    user1Stats.gamesWon === user1Stats.gamesLost
                  )}`}
                >
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Games Won:</span>{" "}
                    {user1Stats.gamesWon}
                  </p>
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Games Lost:</span>{" "}
                    {user1Stats.gamesLost}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            {user2Stats && user1 && user2 && (
              <div className={statsStyles.statsContainer}>
                <h3 className={statsStyles.heading}>
                  Stats for {user1.username} vs {user2.username}
                </h3>
                <div
                  className={`${statsStyles.statRow} ${getColorClass(
                    user2Stats.wins > user2Stats.losses,
                    user2Stats.wins === user2Stats.losses
                  )}`}
                >
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Wins:</span>{" "}
                    {user2Stats.wins}
                  </p>
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Losses:</span>{" "}
                    {user2Stats.losses}
                  </p>
                </div>
                <div
                  className={`${statsStyles.statRow} ${getColorClass(
                    user2Stats.winRate > 50,
                    user2Stats.winRate === 50
                  )}`}
                >
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Win Rate:</span>{" "}
                    {user2Stats.winRate.toFixed(2)}%
                  </p>
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Total Matches:</span>{" "}
                    {user2Stats.totalMatches}
                  </p>
                </div>
                <div
                  className={`${statsStyles.statRow} ${getColorClass(
                    user2Stats.setsWon > user2Stats.setsLost,
                    user2Stats.setsWon === user2Stats.setsLost
                  )}`}
                >
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Sets Won:</span>{" "}
                    {user2Stats.setsWon}
                  </p>
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Sets Lost:</span>{" "}
                    {user2Stats.setsLost}
                  </p>
                </div>
                <div
                  className={`${statsStyles.statRow} ${getColorClass(
                    user2Stats.gamesWon > user2Stats.gamesLost,
                    user2Stats.gamesWon === user2Stats.gamesLost
                  )}`}
                >
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Games Won:</span>{" "}
                    {user2Stats.gamesWon}
                  </p>
                  <p className={statsStyles.stat}>
                    <span className={statsStyles.label}>Games Lost:</span>{" "}
                    {user2Stats.gamesLost}
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UserStats;
