import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Submission from "../models/submission.models.js";

const createSubmission = asyncHandler(async (req, res) => {});

const getSubmissionById = asyncHandler(async (req, res) => {});

const runCode = asyncHandler(async (req, res) => {});

const getAllSubmissions = asyncHandler(async (req, res) => {});

const getSubmissionCount = asyncHandler(async (req, res) => {});

export {
  createSubmission,
  getSubmissionById,
  runCode,
  getAllSubmissions,
  getSubmissionCount,
};
