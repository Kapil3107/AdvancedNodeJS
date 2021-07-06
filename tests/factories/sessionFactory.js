const Buffer = require("safe-buffer").Buffer;

const Keygrip = require("keygrip");
const keys = require("../../config/keys");
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
  const sessionObject = {
    passport: {
      // user._id is actually a javascript object, not a string.
      // So, before trying to turn it into JSON we have to convert
      // this object into string.
      user: user._id.toString(),
    },
  };
  // sessionString is our final session that server accepts as cookies
  const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");

  // Now we have to generate the session signature to send with sessionString
  const sig = keygrip.sign("session=" + session);

  return { session, sig };
};
