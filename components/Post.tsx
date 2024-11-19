import React from "react";
import Router from "next/router";

export type MatchProps = {
  id: string;
  location: string;
  player1: string;
  player2: string;
  score: string[];
  date: string;
};

const Post: React.FC<{ match: MatchProps }> = ({ match }) => {
  const matchDate = new Date(match.date);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(matchDate);
  return (
    <div onClick={() => Router.push("/p/[id]", `/p/${match.id}`)}>
      <h2>{match.location} Match</h2>
      <h3>
        {match.player1} VS {match.player2}
      </h3>
      <h3>Winner: {match.player1}</h3>
      <h2>Scores:</h2>
      {match.score.map((score) => {
        return <span style={{ padding: "5px" }}>{score}</span>;
      })}
      <h4>Date Submitted: {formattedDate}</h4>
      <style jsx>{`
        div {
          color: inherit;
          background-color: ;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
};

export default Post;
