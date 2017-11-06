const mongoose = require('mongoose');
// const apiSchema = require('./api').apiSchema;
const mongoosePaginate = require('mongoose-paginate');

const projectShema = new mongoose.Schema({
    name: {
        type: String
        ,index: true
        ,unique: true

    },
    // apis: [apiSchema],
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
    updateBy: String,
   
});

projectShema.plugin(mongoosePaginate);

const Project = mongoose.model('Project', projectShema);
Project.deleteProject = function(query, successCb, notFoundCb) {
    
};

Project.moveProjectToTrash = function(query, next, successCb, notFoundCb) {
    Project.findOne(query).exec((err, successCb, notFoundCb) => {
        if(err) {
            return next(err);
        }
        doc && typeof successCb === 'function' && successCb()

        
    });
};

module.exports = Project;