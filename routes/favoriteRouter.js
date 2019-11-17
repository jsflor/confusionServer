const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({ "user": req.user._id })
    .populate('user')
    .populate('dishes.dish')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var dishes = [];
    dishes.push(req.params.dishId);
    Favorites.create({ user: req.user._id, dishes: dishes })
    .then((favorites) => {
        console.log('Favorites Created', favorites);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
    // Favorites.find({ "user": req.user._id })
    // .then((favorites) => {
    //     console.log(favorites);
    //     if(favorites !== null){
    //         console.log('Favorites Created', favorites);
    //         res.statusCode = 200;
    //         res.setHeader('Content-Type', 'application/json');
    //         res.json(favorites);
    //     } else {
    //         Favorites.create({ user: req.user._id, dishes: req.params.dishId })
    //         .then((favorites) => {
    //             console.log('Favorites Created', favorites);
    //             res.statusCode = 200;
    //             res.setHeader('Content-Type', 'application/json');
    //             res.json(favorites);
    //         }, (err) => next(err))
    //         .catch((err) => next(err));
    //     }
    // })
    // .catch((err) => next(err));
})

module.exports = favoriteRouter;