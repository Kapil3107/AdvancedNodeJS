// This is global jest setup
// This file is going to run one time before any tests run.
// This will allow us to use models like user through mongoose.

// updating the default time out period of jest(which is 5 sec).
// now jest will wait for 30 sec before failing a test.
jest.setTimeout(30000);

require("../models/User");

// connet with mongodb
const mongoose = require("mongoose");
const keys = require("../config/keys");
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
