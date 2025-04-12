import mongoose, { Schema } from "mongoose";

const movieSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  year: {
    type: Number,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  runtime: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  cast: {
    type: [String],
    required: true
  },
  plot: {
    type: String,
    required: true
  },
  posterUrl: {
    type: String,
    required: true
  },
})

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
