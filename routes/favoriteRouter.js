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
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //req.body = [{"_id": "3534534"}, {"_id": "353345344"}]
    Favorites.findOne({ "user": req.user._id })
    .then((favorites) => {
        if(favorites !== null){
            var reqDishes = req.body;
            var favDishes = favorites.dishes;
            var newDishes = [];
            reqDishes.map((reqdish) => {
                favDishes.map((favdish) => {
                    if(!(favdish.equals(reqdish._id))){
                        newDishes.push(reqdish._id);
                    }
                });
            });
            favDishes.push(newDishes);
            favorites.save()
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
        } else {
            var dishes = [];
            req.body.map((dish) => {
                dishes.push(dish._id);
            });
            Favorites.create({ user: req.user._id, dishes: dishes })
            .then((favorites) => {
                console.log('Favorites Created', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({ "user": req.user._id })
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ "user": req.user._id })
    .then((favorites) => {
        if(favorites !== null){
            var dishParams = favorites.dishes.filter((dish) => dish.equals(req.params.dishId));
           if(dishParams.length > 0){
                err = new Error('Dish ' + req.params.dishId + ' already in your favorites!');
                err.status = 400;
                return next(err);
           } else {
            favorites.dishes.push(req.params.dishId);
            favorites.save()
            .then((favorites) => {
                Favorites.findById(favorites._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
            }, (err) => next(err))
            .catch((err) => next(err));
           }
        } else {
            Favorites.create({ user: req.user._id, dishes: [ req.params.dishId ] })
            .then((favorites) => {
                console.log('Favorites Created', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ "user": req.user._id })
    .then((favorites) => {
        var dishes = favorites.dishes.filter((dish) => !(dish.equals(req.params.dishId)));
        Favorites.findByIdAndUpdate(favorites._id, {
            $set: {
                user: req.user._id,
                dishes: dishes
            }
        }, { new: true })
        .then((resp) => {
            if(resp.dishes.length !== 0){
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            } else {
                Favorites.findByIdAndDelete(resp._id)
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;