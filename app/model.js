// Pulls Mongoose dependency for creating schemas
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Creates a DataCentre Schema.
// All DataCentres in the system will be stored on this basis
var DataCentreSchema = new Schema({
    ref_id: { type: String },
    centre_code: { type: String, required: true, unique: true },
    centre_name: { type: String, required: true },
    load_rating: { type: Number, required: true },
    rating: { type: Number, required: true },
    location: { type: [Number], required: true }, // [Long, Lat]
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

// Sets the created_at parameter equal to the current time
DataCentreSchema.pre('save', function(next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

// Indexes this schema in 2dsphere format (critical for running proximity searches)
DataCentreSchema.index({ location: '2dsphere' });

// Exports the DataCentreSchema for use elsewhere. Sets the MongoDB collection to be used as: "azure-datacentre"
module.exports = mongoose.model('azure-datacentre', DataCentreSchema);
