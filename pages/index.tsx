import React from "react";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import Post, { MatchProps } from "../components/Post";
import prisma from "../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.match.findMany({
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

  const transformFeed = feed.map((match) => {
    return {
      id: match.id,
      location: match.location,
      player1: match.player1.username,
      player2: match.player2.username,
      score: match.score,
    };
  });
  return {
    props: { feed: transformFeed },
    revalidate: 10,
  };
};

type Props = {
  feed: MatchProps[];
};

const Blog: React.FC<Props> = (props) => {
  return (
    <Layout>
      <div className="page">
        <h1>Recent Matches</h1>
        <main>
          {props.feed.map((match) => (
            <div key={match.id} className="post">
              <Post match={match} />
            </div>
          ))}
        </main>
      </div>
      <style jsx>{`
        .post {
          background: white;
          transition: box-shadow 0.1s ease-in;
        }

        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }

        .post + .post {
          margin-top: 2rem;
        }
      `}</style>
    </Layout>
  );
};

export default Blog;
