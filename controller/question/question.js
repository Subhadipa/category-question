const questionModel = require("../../model/question");
const response = require("../../service/response");
const categoryModel = require("../../model/category");
const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const createQuestion = async (req, res) => {
  try {
    const { categoryId, question } = req.body;
    let questionCheck = await questionModel.findOne({
      categoryId,
      question,
      isDeleted: false,
    });
    if (questionCheck) {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "You've already added this question in this category!",
      });
    }
    let questionDetails = await questionModel.create(req.body);
    if (questionDetails) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: "question created successfully!",
        data: questionDetails,
      });
    } else {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "Can't create  question!",
      });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
const fetchAllQuestion = async (req, res) => {
  try {
    let questionDetails = await questionModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
    ]);
    if (questionDetails) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: "question fetched successfully!",
        data: questionDetails,
      });
    } else {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "Can't fetch  question!",
      });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    let questionCheck = await questionModel.findOne({
      _id: questionId,
      isDeleted: false,
    });
    if (questionCheck) {
      let particularQuestionCheck = await questionModel.findOne({
        categoryId: questionCheck?.categoryId,
        question: req.body.question,
        isDeleted: false,
      });
      if (particularQuestionCheck) {
        return res.status(response.errorCode.badRequest).send({
          status: false,
          message: "You've already added this question in this category!",
        });
      }
    }
    let questionDetails = await questionModel.findOneAndUpdate(
      {
        _id: questionId,
        isDeleted: false,
      },
      { $set: { question: req.body.question } },
      { new: true }
    );
    if (questionDetails) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: "question updated successfully!",
        data: questionDetails,
      });
    } else {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "Can't update question!",
      });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    let questionDetails = await questionModel.findOneAndUpdate(
      {
        _id: questionId,
        isDeleted: false,
      },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (questionDetails) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: "question updated successfully!",
        data: questionDetails,
      });
    } else {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "Can't update question!",
      });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
const fetchAllQuestionByCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    let questionDetails = await questionModel.aggregate([
      {
        $match: {
          categoryId: new mongoose.Types.ObjectId(categoryId),
          isDeleted: false,
        },
      },
    ]);
    if (questionDetails) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: "question fetched successfully depending on category!",
        data: questionDetails,
      });
    } else {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "Can't fetch question!",
      });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
// -------------------------------Bulk Question--------------------------------------------------
// Parse CSV file and return data as a Promise
function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

// Fetch category IDs from the database
async function getCategoryIds(categories) {
  const categoryIds = {};

  for (const category of categories) {
    let categoryDoc = await categoryModel.findOne({ name: category });

    if (categoryDoc) {
      categoryIds[category] = categoryDoc._id; // Map category name to its ID
    }
  }

  return categoryIds;
}

// Insert questions for each category
async function insertQuestions(questionsWithCategoryIds) {
  for (const questionData of questionsWithCategoryIds) {
    // Check if the question already exists for the category
    const existingQuestion = await questionModel.findOne({
      question: questionData.question,
      categoryId: questionData.categoryId,
      isDeleted: false,
    });

    if (existingQuestion) {
      //   console.log(
      //     `Question already exists for category ID ${questionData.categoryId}: "${questionData.question}"`
      //   );
      continue; // Skip this question if it already exists
    }

    // If not exists, saving the question
    const question = new questionModel({
      question: questionData.question,
      categoryId: questionData.categoryId,
      //   isDeleted: false,
    });

    // Save the question, avoiding duplicates
    await question.save().catch((error) => {
      if (error.code !== 11000) {
        console.error("Error saving question:", error);
      }
    });
  }
}

const createBulkQuestion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // ----------Parse the CSV file
    const parsedData = await parseCSVFile(req.file.path);

    // ------Extract unique categories from parsed data
    const categories = [...new Set(parsedData.map((item) => item.category))];

    // -------Get category IDs from the database
    const categoryIds = await getCategoryIds(categories);

    // ----------------Prepare questions with corresponding category IDs
    const questionsWithCategoryIds = parsedData.map((item) => ({
      question: item.question,
      categoryId: categoryIds[item.category], // Getting category ID
    }));

    // ------Insert questions in the Question collection
    await insertQuestions(questionsWithCategoryIds);

    // -------Delete the uploaded file after processing
    fs.unlinkSync(req.file.path);

    return res.status(200).json({ message: "Questions imported successfully" });
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
module.exports = {
  createQuestion,
  fetchAllQuestion,
  updateQuestion,
  deleteQuestion,
  createBulkQuestion,
  fetchAllQuestionByCategoryId,
};
