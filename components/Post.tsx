import React from "react";
import Router from "next/router";

export type MatchProps = {
  id: string;
  location: string;
  player1: string;
  player2: string;
  score: string[];
};

const Post: React.FC<{ match: MatchProps }> = ({ match }) => {
  console.log("JOSH MATCH", match);
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
