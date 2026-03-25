import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const assignmentSchema = new Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, default: null, index: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    assignedOn: { type: String, required: true },
    dueDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "generating", "generated", "error"],
      default: "draft",
    },
    outputId: { type: String, default: null },
    uploadedFilePaths: [{ type: String }],
    extractedText: { type: String },
    formData: { type: Schema.Types.Mixed },
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
        delete ret.uploadedFilePaths;
        delete ret.extractedText;
        delete ret.formData;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

export const AssignmentModel = mongoose.model("Assignment", assignmentSchema);
