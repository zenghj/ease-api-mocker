const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
// [{
//     key: String,
//     type: String,
//     necessary: {
//         type: Boolean,
//         default: true
//     },
//     remark: {
//         type: String,
//         required: true
//     }
// }]
const apiSchema = new Schema({
    projectName: {
        type: String,
        index: true
    },
    APIName: {
        type: String
        , required: true
        , index: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    reqUrl: String,
    version: {
        type: String,
        default: 'v0.0.1'
    },
    method: {
        type: String,
        uppercase: true
    },
    canCrossDomain: Boolean,
    reqParams: String,
    resParams: String,
    successMock: String,
    failMock: String,
    reqMock: String,
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

apiSchema.plugin(mongoosePaginate);

// apiSchema.pre('save', function(next) {

// });
const Api = mongoose.model('Api', apiSchema);
// module.exports = {
//     Api: Api,
//     apiSchema: apiSchema
// };

module.exports = Api;
