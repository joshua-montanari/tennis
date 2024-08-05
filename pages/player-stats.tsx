import { useEffect, useState } from "react";
import styles from "./p/CreateMatchForm.module.css"; // Reusing styles from CreateMatchForm.module.css
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
              <div>
                <h3>Stats for {user1.username}</h3>
                <p>Wins: {user1Stats.wins}</p>
                <p>Losses: {user1Stats.losses}</p>
                <p>Win Rate: {user1Stats.winRate.toFixed(2)}%</p>
                <p>Total Matches: {user1Stats.totalMatches}</p>
                <p>Sets Won: {user1Stats.setsWon}</p>
                <p>Sets Lost: {user1Stats.setsLost}</p>
                <p>Games Won: {user1Stats.gamesWon}</p>
                <p>Games Lost: {user1Stats.gamesLost}</p>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            {user2Stats && user1 && user2 && (
              <div>
                <h3>
                  Stats for {user1.username} vs {user2.username}
                </h3>
                <p>Wins: {user2Stats.wins}</p>
                <p>Losses: {user2Stats.losses}</p>
                <p>Win Rate: {user2Stats.winRate.toFixed(2)}%</p>
                <p>Total Matches: {user2Stats.totalMatches}</p>
                <p>Sets Won: {user2Stats.setsWon}</p>
                <p>Sets Lost: {user2Stats.setsLost}</p>
                <p>Games Won: {user2Stats.gamesWon}</p>
                <p>Games Lost: {user2Stats.gamesLost}</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UserStats;
