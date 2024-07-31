import { useEffect, useState } from "react";
import styles from "./CreateMatchForm.module.css";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";

interface User {
  id: number;
  username: string;
}

const CreateMatchForm: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [winnerId, setWinnerId] = useState<number | "">("");
  const [loserId, setLoserId] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [score, setScore] = useState<string[]>([]);
  const [newScore, setNewScore] = useState("");

  const router = useRouter();

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

    fetchUsers();
  }, []);

  const handleAddScore = () => {
    if (newScore) {
      setScore([...score, newScore]);
      setNewScore("");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (winnerId === "" || loserId === "" || !location || score.length === 0) {
      alert("Please fill all fields");
      return;
    }

    try {
      const response = await fetch("/api/create-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player1Id: winnerId,
          player2Id: loserId,
          location,
          score,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      router.push("/");
      alert("Match created successfully!");
      console.log("Match created:", result);
    } catch (error) {
      console.error("Error creating match:", error);
      alert("Failed to create match, do better!");
    }
  };

  return (
    <Layout>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="winner">Winner:</label>
            <select
              id="winner"
              value={winnerId}
              onChange={(e) => setWinnerId(Number(e.target.value))}
            >
              <option value="">Select Winner</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="loser">Loser:</label>
            <select
              id="loser"
              value={loserId}
              onChange={(e) => setLoserId(Number(e.target.value))}
            >
              <option value="">Select Loser</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="score">Score:</label>
            <input
              placeholder="x-x"
              type="text"
              id="newScore"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
            />
            <button type="button" onClick={handleAddScore}>
              Add Score
            </button>
            <ul className={styles.scoreList}>
              {score.map((s, index) => (
                <li key={index}>{s}</li>
              ))}
            </ul>
          </div>
          <button type="submit">Create Match</button>
        </form>
      </div>
    </Layout>
  );
};

export default CreateMatchForm;
