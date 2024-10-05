var user = {};

var userController = require("../controller/auth/user");

var response = require("../service/response");

const permission = [
  {
    url: "/user/registation",
  },
  {
    url: "/user/login",
  },
];

user.middleware = async (req, res, next) => {
  if (permission.filter((it) => it.url == req.url).length > 0) {
    next();
  } else {
    if (!req.headers.usertype || !req.headers.authorization) {
      return res.status(400).json({
        error: "No credentials sent!",
        status: false,
        credentials: false,
      });
    } else {
      let authorization = req.headers.authorization;
      let userData = null;

      let userType =
        typeof req.headers.usertype != "undefined"
          ? req.headers.usertype
          : "User";
      // console.log("userType", userType);
      // console.log('userType', userType, req.headers);
      if (userType == "User") {
        userData = await userController.getTokenData(authorization);
      }

      // console.log('userData', userData);

      if (userData && userData != null) {
        userData.password = null;
        //  console.log(userData)
        req.user = userData;
        req.userType = userType;
        // console.log(userType)
        (req.token = req.headers.authorization),
          // console.log( req.token)
          next();
      } else {
        res.status(response.errorCode.badRequest).json({
          error: "credentials not match",
          status: false,
          credentials: false,
        });
      }
    }
  }
};

module.exports = user;
