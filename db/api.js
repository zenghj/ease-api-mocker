const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const apiSchema = new Schema({
    name: {
        type: String
        , unique: true // 会自动建立索引，用建立了索引的字段query会比较快
        , index: true // unique: true时此项不设置也一样
        , sparse: true  // 不设置的这个会出现duplicate key error，创建project时这个为空，mongo默认设置为null,创建第二个project时就会报错
    },
    reqUrl: String,
    method: {
        type: String,
        uppercase: true
    },
    canCrossDomain: Boolean,
    mockRes: Object, // 等价于Schema.Types.Mixed
    // {
    //     statusCode: Number
    //     resBody: Object
    //     // html 文件的话此字段为空吧
    // }

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
    belongTo: {
        type: String,
        index: true
    }
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
