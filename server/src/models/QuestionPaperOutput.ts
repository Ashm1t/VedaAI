import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const questionSchema = new Schema(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "moderate", "hard"],
      default: "moderate",
    },
    marks: { type: Number, required: true },
    answer: { type: String },
  },
  { _id: false }
);

const sectionSchema = new Schema(
  {
    label: { type: String, required: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: [questionSchema],
  },
  { _id: false }
);

const questionPaperOutputSchema = new Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    assignmentId: { type: String, required: true, ref: "Assignment" },
    schoolName: { type: String, default: "" },
    subject: { type: String, default: "" },
    className: { type: String, default: "" },
    timeAllowed: { type: String, default: "" },
    maximumMarks: { type: Number, default: 0 },
    generalInstruction: { type: String, default: "" },
    sections: [sectionSchema],
    aiSummary: { type: String, default: "" },
    latexSource: { type: String },
    latexTemplateName: { type: String },
    pdfPath: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(_doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.latexSource;
        delete ret.latexTemplateName;
        delete ret.pdfPath;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

export const QuestionPaperOutputModel = mongoose.model(
  "QuestionPaperOutput",
  questionPaperOutputSchema
);
