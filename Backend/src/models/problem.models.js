import { Schema, model } from "mongoose";
import {
  difficultyLevelsArray,
  languageNames,
  languageNamesArray,
} from "../utils/constant.js";

const testCaseSchema = new Schema(
  {
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    isSample: {
      type: Boolean,
      default: false, // sample or hidden test case
    },
  },
  { _id: false },
);

const boilerplateSchema = new Schema(
  {
    language: {
      type: String,
      enum: languageNamesArray,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const problemSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: difficultyLevelsArray,
      required: true,
    },
    inputFormat: {
      type: String,
      required: true,
    },

    outputFormat: {
      type: String,
      required: true,
    },

    constraints: {
      type: String,
      required: true,
    },

    tags: [{ type: String }],

    testCases: [testCaseSchema],

    boilerplateCode: [boilerplateSchema],
    supportedLanguages: {
      type: [String],
      default: languageNames.PYTHON,
    },
    timeLimit: {
      type: Number,
      default: 1, // seconds
    },

    memoryLimit: {
      type: Number,
      default: 256, // MB
    },

    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Problem = model("Problem", problemSchema);

export default Problem;
