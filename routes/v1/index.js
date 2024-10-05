let express = require("express");
let router = express.Router();
let path = require("path");
const multer = require("multer");
const middleware = require("../../service/middleware").middleware;
const userRoute = require("./user");
const userAuthController = require("../../controller/auth/user");
const categoryController = require("../../controller/category/category");
const questionController = require("../../controller/question/question");
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
// -----------------------------User Auth----------------------------------------------
router.post(
  "/user/register",
  upload.single("image"),
  userAuthController.registerUser
);
router.post("/user/login", userAuthController.loginUser);

// -----------------------------Category----------------------------------------------
router.post("/category", categoryController.createCategory);
router.get("/category-along-questions", categoryController.fetchAllCategory);
router.put("/category/:categoryId", categoryController.updateCategory);
router.delete("/category/:categoryId", categoryController.deleteCategory);

// -----------------------------Question----------------------------------------------
router.post("/question", questionController.createQuestion);
router.get("/question", questionController.fetchAllQuestion);
router.put("/question/:questionId", questionController.updateQuestion);
router.delete("/question/:questionId", questionController.deleteQuestion);
router.get(
  "/question/:categoryId",
  questionController.fetchAllQuestionByCategoryId
);
// ----------------Bulk Question Upload Using CSV-------------------------------
router.post(
  "/question-using-csv",
  upload.single("csvfile"),
  questionController.createBulkQuestion
);

router.use(middleware);
router.use("/user", userRoute);
module.exports = router;
