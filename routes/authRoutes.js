const passport = require("passport");

module.exports = (app) => {
  // start OAuth flow to log user in
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  // Where users get sent to after OAuth flow
  app.get(
    "/auth/google/callback",
    passport.authenticate("google"),
    (req, res) => {
      res.redirect("/blogs");
    }
  );

  // Logout the current user
  app.get("/auth/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // Get the current user
  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });
};
