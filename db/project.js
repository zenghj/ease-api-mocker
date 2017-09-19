const mongoose = require('mongoose');
const apiSchema = require('./api').schema;
const mongoosePaginate = require('mongoose-paginate');

const projectShema = new mongoose.Schema({
    name: {
        type: String
       
        ,unique: true
        
        // ,index: true
    },
    apis: apiSchema,
    isDeleted: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now // `Date.now()` returns the current unix timestamp as a number
    },
    createBy: String,
    updateAt: {
        type: Date,
        default: Date.now
    },
    updateBy: String
});

projectShema.plugin(mongoosePaginate);

const Project = mongoose.model('Project', projectShema);

module.exports = Project;