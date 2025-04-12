import express from "express";
import { getUsers,addToFavorites, addToWatchList, deleteMovie, getFavoriteMovies, getHomeMovies, getMovie, getWatchListMovies, insertMovie, loginUser, logoutUser, signupUser } from "../controllers/userController.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get('/home', getHomeMovies);
router.get('/movies/:id', getMovie);
router.post('/movies/watch/:id', protectRoute, addToWatchList);
router.post('/movies/fav/:id', protectRoute, addToFavorites);
router.get('/watchlist', protectRoute, getWatchListMovies);
router.get('/favorites', protectRoute, getFavoriteMovies);
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/insert', insertMovie);
router.delete('/delete/:movieId', deleteMovie);
router.get('/users', getUsers);

export default router;
