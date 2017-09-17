// Dependencies
var mongoose = require('mongoose');
var DataCentre = require('./model.js');
const async = require('async');

var fs = require('fs');
var DATA_CENTRES = JSON.parse(
    fs.readFileSync('data/datacentres.json', 'utf8')
);

// Opens App Routes
module.exports = function(app) {
    // GET Routes
    // --------------------------------------------------------
    // Retrieve records for all datacentres in the db
    app.get('/datacentres', function(req, res) {
        // Uses Mongoose schema to run the search (empty conditions)
        var query = DataCentre.find({});
        query.exec(function(err, datacentres) {
            if (err) res.send(err);

            // If no errors are found, it responds with a JSON of all datacentres
            res.json(datacentres);
        });
    });

    // POST Routes
    // --------------------------------------------------------

    /**
     * Retrieves JSON records for all datacentres who meet a certain set of query conditions
     * @param  {object} req          request
     * @param  {object} res         response
     */
    app.post('/query/', function(req, res) {
        // Grab all of the query parameters from the body.
        var lat = req.body.latitude;
        var long = req.body.longitude;
        var distance = req.body.distance;
        var minLoadRating = req.body.minLoadRating;
        var minRating = req.body.minRating;

        // Opens a generic Mongoose Query.
        var query = DataCentre.find({});

        // ...include filter by Max Distance (converting km to meters)
        if (distance) {
            // Using MongoDB's geospatial querying features. (Note how coordinates are set [long, lat]
            query = query.where('location').near({
                center: { type: 'Point', coordinates: [long, lat] },

                // Converting km to meter
                maxDistance: distance * 1000,
				// Specifying spherical geometry (for globe)
                spherical: true,
            });
			console.log('maxDistance');
        } else if (long && lat) {
            //else just search basd on near
            query = query.where('location').near({
                center: { type: 'Point', coordinates: [long, lat] },
                spherical: true,
            });
        }

        // ...include filter by Min Load Rating
        if (minLoadRating) {
            query = query.where('load_rating').gte(minLoadRating);
        }

        // ...include filter by Min Rating
        if (minRating) {
            query = query.where('rating').gte(minRating);
        }

        // Execute Query and Return the Query Results
        query.exec(function(err, datacentres) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            // add custom sorting if required

            // If no errors, respond with a JSON of all datacentres that meet the criteria
            res.json(datacentres);
        });
    });

    /**
     * Provides method for saving new datacentres in the db
     * !!!!!!!! NOTE: This is not exposed externally and used for initial data population
     * @param  {object} req          request
     * @param  {object} res         response
     */
    app.post('/datacentres', function(req, res) {
        // Creates a new Data Centre based on the Mongoose schema and the post body
        var datacentre = new DataCentre(req.body);

        // New DataCentre is saved in the db.
        datacentre.save(function(err) {
            if (err) res.send(err);

            // If no errors are found, it responds with a JSON of the new Data Centre
            res.json(req.body);
        });
    });

    /**
     * Provides method for saving new datacentres in the db
     * !!!!!!!! NOTE: This is primarily used for initial data population
     * @param  {object} req          request
     * @param  {object} res         response
     */
    app.post('/populateDataCentres', function(req, res) {
        // Creates a new Data Centre based on the Mongoose schema and the post body

        if (req.body.yesIReallyWantToCreate) {
            // load data centres from payload if provided, else use the default data store
            var aDataCentres = req.body.customData
                ? req.body.customData
                : DATA_CENTRES;
            // populate the db
            async.eachSeries(
                aDataCentres,
                function iteratee(eachCentre, callback) {
                    _createDataCentreInDB(eachCentre, function(err, oSuccess) {
                        if (err) {
                            console.log('Failed to create data centre');
                            callback(err);
                            return;
                        }
                        console.log('created data centre');
                        callback(null, oSuccess);
                    });
                },
                function done(err) {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }
                    res.send('Done executing the populate function');
                }
            );
        } else {
            res
                .status(400)
                .send(
                    'Payload does not contain the boolean key to create entries'
                );
            return;
        }

        // creates a single entry in the DB
        function _createDataCentreInDB(object, callback) {
            var datacentre = new DataCentre(object);
            // New DataCentre is saved in the db.
            datacentre.save(function(err, savedObject) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, savedObject);
            });
        }
    });
};
