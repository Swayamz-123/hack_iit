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
    upvotes: { type: Number, default: 0 },
    internalNotes: String,
  },
  { timestamps: true }
);

export const Incident =
  mongoose.model("Incident",IncidentSchema)