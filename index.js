const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
const keys = require("./config/keys");

require("./models/User");
require("./models/Blog");
require("./services/passport");
require("./services/cache");

mongoose.Promise = global.Promise;
mongoose
  .connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

const app = express();

// Middlewares - all 3
app.use(express.json());
app.use(
  // cookieSession handles authentication and maintenace of sessions for incoming requests.
  // any time a user is authenticated, some information is stored on the user's cookie.
  // cookieSession is what manages the data inside that cookie.
  // cookieSession parses the 'session' property of user to javascript object.
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey],
  })
);
// passport handles authentication inside of our app
app.use(passport.initialize());
app.use(passport.session());

require("./routes/authRoutes")(app);
require("./routes/blogRoutes")(app);

if (["production", "ci"].includes(process.env.NODE_ENV)) {
  // It says to serve up all the files in the build directory.
  app.use(express.static("client/build"));

  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Listening on port`, PORT);
});
