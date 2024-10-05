const userModel = require("../../model/user");
const response = require("../../service/response");
const bcrypt = require("bcrypt");

const fetchOwnProfile = async (req, res) => {
  try {
    let profileDetails = await userModel.findOne({
      _id: req.user._id,
      isDeleted: false,
    });
    if (profileDetails) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: "Profile fetched successfully!",
        data: profileDetails,
      });
    } else {
      return res
        .status(response.errorCode.badRequest)
        .send({ status: false, message: "Can't fetch the profile!" });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
const updateOwnProfile = async (req, res) => {
  try {
    const { body, file } = req;
    let updateData = { ...body };
    if (body.password) {
      const saltRounds = 10;
      const encryptedPassword = await bcrypt.hash(body.password, saltRounds);
      updateData.password = encryptedPassword;
    }
    if (file) {
      const imagePath = `${file.destination}${file.filename}`;
      updateData.profileImage = imagePath;
    }

    let profileDetails = await userModel.findOneAndUpdate(
      {
        _id: req.user._id,
        isDeleted: false,
      },
      { $set: updateData },
      { new: true }
    );
    if (profileDetails) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: "Profile updated successfully!",
        data: profileDetails,
      });
    } else {
      return res
        .status(response.errorCode.badRequest)
        .send({ status: false, message: "Can't update the profile!" });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
module.exports = { fetchOwnProfile, updateOwnProfile };
