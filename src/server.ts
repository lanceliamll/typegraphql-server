import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import Express from "express";
import session from "express-session";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { LoginResolver } from "./modules/user/Login";
import { MeResolver } from "./modules/user/Me";
import { RegisterResolver } from "./modules/user/Register";
import { redis } from "./redis";

const main = async () => {
  await createConnection();

  //Schema
  const schema = await buildSchema({
    resolvers: [RegisterResolver, LoginResolver, MeResolver],
    authChecker: ({ context: { req } }) => {
      return !!req.session.userId;
    }
  });
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }: any) => ({ req })
    // formatError: formatArgumentValidationError
  });

  const app = Express();

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000"
    })
  );
  const RedisStore = connectRedis(session);

  //Session Middleware
  app.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: "qid",
      secret: "qweqwasd23eqwe123",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_DEV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365 //7 y
      }
    })
  );

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("Server started on htpp://localhost:4000/graphql");
  });
};

main();
