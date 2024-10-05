const userModel = require("../../model/user");
const response = require("../../service/response");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

function generateToken(userData) {
  return jwt.sign(userData, process.env.SECRET_KEY_TOKEN);
}

const getTokenData = async (authorization) => {
  const userData = await userModel
    .findOne({
      token: authorization,
    })
    .exec();
  return userData;
};

const registerUser = async (req, res) => {
  try {
    const { body, file } = req;
    // console.log(file);
    const saltRounds = 10;
    const { email, mobile, password } = body;
    let emailCheck = await userModel.findOne({ email, isDeleted: false });
    if (emailCheck) {
      return res
        .status(response.errorCode.badRequest)
        .send({ status: false, message: "This email already exist in db!" });
    }
    let mobileCheck = await userModel.findOne({ mobile, isDeleted: false });
    if (mobileCheck) {
      return res
        .status(response.errorCode.badRequest)
        .send({ status: false, message: "This mobile already exist in db!" });
    }
    const encryptedPassword = await bcrypt.hash(password, saltRounds);
    let imagePath = `${file.destination}${file.filename}`;
    const userData = {
      ...body,
      password: encryptedPassword,
      profileImage: file ? imagePath : null,
    };
    let userDetails = await userModel.create(userData);
    if (userDetails) {
      let generatedToken = generateToken({ userDetails });
      let userDetailsWithToken = await userModel.findOneAndUpdate(
        {
          _id: userDetails._id,
          isDeleted: false,
        },
        { $set: { token: generatedToken } },
        { new: true }
      );
      return res.status(response.errorCode.success).send({
        status: true,
        message: "User registered successfully!",
        data: userDetailsWithToken,
      });
    } else {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "Can't register user!",
      });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("Form data received:", req.body);
    let userCheck = await userModel.findOne({
      email,
      isDeleted: false,
    });
    // console.log(userCheck);
    if (!userCheck) {
      return res
        .status(response.errorCode.badRequest)
        .send({ status: false, message: "This email is not registered!" });
    }
    let comparePassword = await bcrypt.compare(password, userCheck.password);
    if (comparePassword) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: `${userCheck.fullName},logged in successfully!`,
        data: userCheck,
      });
    } else {
      return res
        .status(response.errorCode.badRequest)
        .send({ status: false, message: "Invalid credentials!" });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
module.exports = { registerUser, loginUser, getTokenData };
