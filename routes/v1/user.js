let express = require("express");
let router = express.Router();
let path = require("path");
const multer = require("multer");
const userController = require("../../controller/user/ownProfile");
// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory where the images will be saved
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Set up multer for any file
const upload = multer({ storage: storage });
// ----------------------------User------------------------------------------
router.get("/profile", userController.fetchOwnProfile);
router.put("/profile", upload.single("image"), userController.updateOwnProfile);
module.exports = router;
