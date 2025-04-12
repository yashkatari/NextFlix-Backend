import bcrypt from 'bcryptjs';
import generateTokenAndSetCookie from '../utils/helpers/generateWebToken.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import Movie from '../models/movieModel.js';


const signupUser = async (req, res) => {
  try {

    const { name, email, username, password } = req.body;

    // Check if password is defined;
    // Check if email or username already exists
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    // Return success response
    if (newUser) {

      generateTokenAndSetCookie(newUser._id, res);
      res.status(200).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        favorites: [],
        watchlist: [],
      });
    } else {
      res.status(400).json({ error: 'Failed to create user' });
    }
  } catch (err) {

    res.status(500).json({ error: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    // Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password || '');

    if (!user || !isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // If login is successful, generate token and set cookie
    generateTokenAndSetCookie(user._id, res);

    // Send success response with user data
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      favorites: user.favorites,
      watchlist: user.watchlist,
    });

  } catch (err) {

    res.status(500).json({ error: err.message });
  }
};

const logoutUser = (req, res) => {
  try {
    res.clearCookie("jwt");
    //res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const getHomeMovies = async (req, res) => {
  try {
    // Fetch movies from a movie database API
    const movie = await Movie.find();
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const insertMovie = async (req, res) => {
  try {
    console.log("hi")
    const { title, year, genre, runtime, rating, cast, plot, posterUrl } = req.body;

    // Create a new movie instance using the Movie model
    const movie = new Movie({
      title,
      year,
      genre,
      runtime,
      rating,
      cast,
      plot,
      posterUrl,
    });

    // Save the movie to the database
    await movie.save();

    console.log('Movie inserted successfully:', movie);
    res.status(201).json(movie);
  } catch (error) {
    console.error('Error inserting movie:', error.message);
    throw new Error('Could not insert movie');
  }
};

const addToWatchList = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const movieId = req.params.id;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the movie is already in the watchlist
    const movieIndex = user.watchlist.indexOf(movieId);

    if (movieIndex !== -1) {
      // Movie already in watchlist, remove it
      user.watchlist.splice(movieIndex, 1);
      await user.save();
      return res.status(200).json({ message: 'Movie removed from watchlist', user: user });
    }

    // Movie not in watchlist, add it
    user.watchlist.push(movieId);

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Movie added to watchlist successfully', user: user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const movieId = req.params.id;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the movie is already in the watchlist
    const movieIndex = user.favorites.indexOf(movieId);

    if (movieIndex !== -1) {
      // Movie already in watchlist, remove it
      user.favorites.splice(movieIndex, 1);
      await user.save();
      return res.status(200).json({ message: 'Movie removed from favorites', user: user });
    }

    // Movie not in watchlist, add it
    user.favorites.push(movieId);

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Movie added to favorites successfully', user: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWatchListMovies = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the list of movie IDs from the user's watchlist
    const watchlistMovieIds = user.watchlist;

    if (watchlistMovieIds.length === 0) {
      return res.status(200).json({ watchlist: [] }); // If watchlist is empty
    }

    // Find all movies with IDs in the user's watchlist
    const watchlistMovies = await Movie.find({ _id: { $in: watchlistMovieIds } });

    // Return the watchlist movies with full details
    res.status(200).json(watchlistMovies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getFavoriteMovies = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the list of movie IDs from the user's watchlist
    const favoriteMoviesIds = user.favorites;

    if (favoriteMoviesIds.length === 0) {
      return res.status(200).json([]); // If watchlist is empty
    }

    // Find all movies with IDs in the user's watchlist
    const favoriteMovies = await Movie.find({ _id: { $in: favoriteMoviesIds } });

    // Return the watchlist movies with full details
    res.status(200).json(favoriteMovies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const deleteMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const result = await Movie.findByIdAndDelete(movieId);

    if (!result) {
      return res.status(404).json({ message: "Movie not found" });
    }
    // if (result.posterUrl) {
    //   await cloudinary.uploader.destroy(result.posterUrl);
    // }

    const remainingMovies = await Movie.find();

    res.status(200).json({
      message: "Movie deleted successfully",
      newMovies: remainingMovies
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Assuming `User` is your MongoDB model
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  getHomeMovies,
  insertMovie,
  getMovie,
  addToWatchList,
  addToFavorites,
  getWatchListMovies,
  getFavoriteMovies,
  deleteMovie,
  getUsers, // Add this line to export getUsers
};


