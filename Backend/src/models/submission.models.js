import { model, Schema } from "mongoose";
import {
  languageNamesArray,
  submissionStatusArray,
} from "../utils/constant.js";

const submissionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    language: {
      type: String,
      enum: languageNamesArray,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: submissionStatusArray,
      default: "Pending",
    },
    output: {
      type: String,
    },
    error: {
      type: String,
    },
    executionTime: {
      type: Number, // ms
    },

    memoryUsed: {
      type: Number, // MB
    },

    passedTestCases: {
      type: Number,
      requred: true,
    },

    totalTestCases: {
      type: Number,
      requred: true,
    },
  },
  { timestamps: true },
);

const Submission = model("Submission", submissionSchema);

export default Submission;
