require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
//const cors=require('cors');
const path = require("path");
const dbconnect = require("./config/connection");
const { authMiddleware } = require("./utils/auth");
const sleepdisp = require("./routes/sleepdisp");
const { typeDefs, resolvers } = require("./schemas");
//const path = require('path');

const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// If this is production allow static files to be served from the build folder
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// //Load the stage for our react app, since it is a single page
app.use("/api/sleepdisplay", sleepdisp);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  dbconnect.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};
startApolloServer(typeDefs, resolvers);
