import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema({
  listing_id: {
    type: String,
    trim: true,
    lowercase: true,
  },

  listing_title: {
    type: String,
    trim: true,
    lowercase: true,
  },

  description: {
    type: String,
    trim: true,
    lowercase: true,
    maxLength: 1000,
  },

  street: {
    type: String,
    trim: true,
    lowercase: true,
  },

  city: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  postal_code: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },

  price: {
    type: String,
    default: 0.0,
    validate(value) {
      if (value < 0.0) {
        throw new Error("Price can not be negative ");
      }
    },
  },

  email: {
    type: String,
    trim: true,
  },

  username: {
    type: String,
    trim: true,
    lowercase: true,
  },

  type: {
    type: String,
    default: "admin",
  },

  created: {
    type: Date,
    default: Date.now,
  },

  token: {
    type: String,
  },
});

export default mongoose.model("Listing", ListingSchema);
