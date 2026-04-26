import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const agentArtifactSchema = new Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    sessionId: { type: String, required: true, ref: "AgentSession", index: true },
    sourceMessageId: { type: String, default: null },
    kind: {
      type: String,
      enum: ["response_snapshot", "compiled_pdf"],
      default: "response_snapshot",
    },
    title: { type: String, required: true, default: "Agent Artifact" },
    assistantSummary: { type: String, default: "" },
    latexSource: { type: String, default: "" },
    pdfPath: { type: String, default: "" },
    templateUsed: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(_doc: any, ret: any) {
        ret.id = ret._id;
        ret.hasPdf = Boolean(ret.pdfPath);
        ret.hasLatex = Boolean(ret.latexSource);
        delete ret._id;
        delete ret.__v;
        delete ret.pdfPath;
        return ret;
      },
    },
  }
);

export const AgentArtifactModel = mongoose.model(
  "AgentArtifact",
  agentArtifactSchema
);
