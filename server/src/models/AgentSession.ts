import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const messageSchema = new Schema(
  {
    id: { type: String, required: true, default: () => uuidv4() },
    role: {
      type: String,
      enum: ["system", "user", "assistant"],
      required: true,
    },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["complete", "error"],
      default: "complete",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const agentSessionSchema = new Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, default: null, index: true },
    title: { type: String, required: true, default: "Untitled Agent Session" },
    status: {
      type: String,
      enum: ["idle", "processing", "ready", "error"],
      default: "idle",
    },
    sourceDocumentName: { type: String, default: "Jake_s_Resume.pdf" },
    sourceFiles: { type: [Schema.Types.Mixed], default: [] },
    sourceContextText: { type: String, default: "" },
    messages: { type: [messageSchema], default: [] },
    latestArtifactId: { type: String, default: null },
    currentTex: { type: String, default: "" },
    currentPdfPath: { type: String, default: "" },
    workflow: { type: Schema.Types.Mixed, default: null },
    lastError: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform(_doc: any, ret: any) {
        ret.id = ret._id;
        ret.hasCurrentPdf = Boolean(ret.currentPdfPath);
        delete ret._id;
        delete ret.__v;
        delete ret.currentPdfPath;
        return ret;
      },
    },
  }
);

export const AgentSessionModel = mongoose.model(
  "AgentSession",
  agentSessionSchema
);
