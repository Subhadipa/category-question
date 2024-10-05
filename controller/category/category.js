const categoryModel = require("../../model/category");
const response = require("../../service/response");
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    let CategoryCheck = await categoryModel.findOne({
      name,
      isDeleted: false,
    });
    if (CategoryCheck) {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "You've already added this category!",
      });
    }
    let CategoryDetails = await categoryModel.create(req.body);
    if (CategoryDetails) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: "Category created successfully!",
        data: CategoryDetails,
      });
    } else {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "Can't create  category!",
      });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
const fetchAllCategory = async (req, res) => {
  try {
    let CategoryDetails = await categoryModel.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "questions",
          localField: "_id",
          foreignField: "categoryId",
          as: "questionList",
          pipeline: [
            {
              $match: {
                isDeleted: false,
              },
            },
            {
              $project: {
                _id: 1,
                question: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          questionList: 1,
        },
      },
    ]);
    if (CategoryDetails) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: "Category fetched successfully!",
        data: CategoryDetails,
      });
    } else {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "Can't fetch  category!",
      });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    let CategoryDetails = await categoryModel.findOneAndUpdate(
      {
        _id: categoryId,
        isDeleted: false,
      },
      { $set: { ...req.body } },
      { new: true }
    );
    if (CategoryDetails) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: "Category updated successfully!",
        data: CategoryDetails,
      });
    } else {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "Can't update category!",
      });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    let CategoryDetails = await categoryModel.findOneAndUpdate(
      {
        _id: categoryId,
        isDeleted: false,
      },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (CategoryDetails) {
      return res.status(response.errorCode.success).send({
        status: true,
        message: "Category updated successfully!",
        data: CategoryDetails,
      });
    } else {
      return res.status(response.errorCode.badRequest).send({
        status: false,
        message: "Can't update category!",
      });
    }
  } catch (error) {
    return res
      .status(response.errorCode.serverError)
      .send({ status: false, message: error.message });
  }
};

module.exports = {
  createCategory,
  fetchAllCategory,
  updateCategory,
  deleteCategory,
};
