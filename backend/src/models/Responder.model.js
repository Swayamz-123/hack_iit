import mongoose from "mongoose";

const ResponderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["police", "ambulance", "fire"],
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Responder = mongoose.model("Responder", ResponderSchema);
