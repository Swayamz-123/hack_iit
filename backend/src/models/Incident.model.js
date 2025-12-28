import mongoose from "mongoose";

const IncidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["accident", "medical", "fire", "other"],
      required: true,
    },
    description: { type: String, required: true },
    location: {
      lat: Number,
      lng: Number,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    status: {
      type: String,
      enum: ["unverified", "verified", "resolved"],
      default: "unverified",
    },
    voters: {
  type: [String], // anonymous device IDs
  default: [],
},


    upvotes: { type: Number, default: 0 },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Responder" }],
    media: { type: [String], default: [] },
    internalNotes: String,
  },
  { timestamps: true }
);

export const Incident =
  mongoose.model("Incident",IncidentSchema)