import React from "react";
import { GetServerSideProps } from "next";
import Layout from "../../components/Layout";
import { MatchProps } from "../../components/Post";
import prisma from "../../lib/prisma";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const match = await prisma.match.findUnique({
    where: {
      id: Number(params?.id),
    },
    include: {
      player1: {
        select: {
          username: true,
        },
      },
      player2: {
        select: {
          username: true,
        },
      },
    },
  });

  const singleMatch = {
    id: match.id,
    player1: match.player1.username,
    player2: match.player2.username,
    score: match.score,
  };

  return {
    props: singleMatch,
  };
};

const Post: React.FC<MatchProps> = (props) => {
  let title = `${props.player1} Match VS ${props.player2}`;

  return (
    <Layout>
      <div>
        <h1>{title}</h1>
        Stats on each player goes here
      </div>
    </Layout>
  );
};

export default Post;
