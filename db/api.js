const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const apiSchema = new Schema({
    name: {
        type: String

        ,unique: true
        , sparse: true  // 不设置的这个会出现duplicate key error，创建project时这个为空，mongo默认设置为null,创建第二个project时就会报错
    },
    reqUrl: String,
    method: {
        type: String,
        uppercase: true
    },
    canCrossDomain: Boolean,
    mockRes: Object , // 等价于Schema.Types.Mixed
                    // {
                    //     statusCode: Number
                    //     resBody: Object
                    //     // html 文件的话此字段为空吧
                    // }
    
    isDeleted: Boolean,
    createAt: Date,
    createBy: String,
    updateAt: Date,  // (初始化默认等价于createAt)
    updateBy: String
});

apiSchema.plugin(mongoosePaginate);


const Api = mongoose.model('Api', apiSchema);
module.exports = {
    model: Api,
    schema: apiSchema
};


