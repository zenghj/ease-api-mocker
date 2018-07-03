<template>
  <div>
    <my-header></my-header>
    <section class="page-container project">
      <el-row class="clearfix">
        <el-breadcrumb separator="/" class="fl breadcrumb ">
          <el-breadcrumb-item :to="{ name: 'Projects' }">{{this.$props.project.name}}</el-breadcrumb-item>
          <el-breadcrumb-item>Api List</el-breadcrumb-item>
        </el-breadcrumb>

        <el-button class="fr" type="primary" icon="el-icon-plus" circle @click="openAddDialog"></el-button>
      </el-row>

      <div class="api-items">
        <el-card class="api-item box-card" v-for="item in list" :key="item._id">
          <div slot="header" class="clearfix">
            <h1>{{item.APIName}} {{item.method}} {{item.reqUrl}}
            </h1>
            <div class="action-btns">
              <el-button type="primary" @click.stop="fetchTest($event, item)">Test</el-button>
              <el-button class="el-icon-edit-btn" icon="el-icon-edit" type="primary" circle @click.stop="openEditDialog($event, item)"></el-button>
              <el-button class="delete-item-btn" icon="el-icon-delete" type="danger" circle @click.stop="confirmDelete($event, item)"></el-button>
            </div>

          </div>
          <h2 class="field-title">成功响应{{item.canCrossDomain && '（支持跨域）'}}</h2>
          <!-- <code>{{item.successMock}}</code> -->
          <el-input type="textarea" readonly :autosize="{ minRows: 2}" placeholder="请输入内容" v-model="item.successMock">
          </el-input>
        </el-card>
      </div>

      <el-dialog title="添加接口" :visible.sync="addDialogVisible" width="600px" :close-on-click-modal="false" :before-close="closeAddDialog">
        <el-form :model="form" :rules="rules" ref="createForm" label-width="120px" class="add-form">
          <el-form-item label="APIName" prop="APIName">
            <el-input v-model="form.APIName" ></el-input>
          </el-form-item>
          <el-form-item label="Method" prop="method" class="method-item inline-block">
            <el-select v-model="form.method" placeholder="请选择" >
              <el-option v-for="item in methodOptions" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="支持跨域" prop="canCrossDomain" class="inline-block">
            <el-switch v-model="form.canCrossDomain"></el-switch>
          </el-form-item>
          <el-form-item label="Uri" prop="reqUrl">
            <el-input v-model="form.reqUrl" ></el-input>
          </el-form-item>
          <!-- <el-form-item label="支持跨域">
          <el-switch v-model="form.canCrossDomain"></el-switch>
        </el-form-item>
        <el-form-item v-for="(reqParam, index) in form.reqParams"  :key="index" :prop="'domains.' + index" class="req-param-item">
          <p class="param-title">请求参数{{index}} <i class="el-icon-delete" @click.prevent="removeReqParam(reqParam)"></i></p>
          <el-form-item class="param-item" label="参数名">
            <el-input v-model="reqParam.name"></el-input>
          </el-form-item>
          <el-form-item class="param-item" label="是否必填">
            <el-switch v-model="form.required"></el-switch>
          </el-form-item>
          <el-form-item class="param-item" label="参数类型">
            <el-select v-model="reqParam.type" placeholder="请选择">
              <el-option v-for="item in paramTypeOpts" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="param-item" label="参数说明">
            <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="reqParam.describe">
            </el-input>
          </el-form-item>
          
        </el-form-item>
        <el-button @click.prevent="addReqParam()">添加请求参数</el-button> -->
          <el-form-item label="成功响应" prop="successMock">
            <el-input type="textarea" :autosize="{ minRows: 2}" placeholder="请输入JSON格式的内容" v-model="form.successMock" >
            </el-input>
          </el-form-item>
          <!-- <el-form-item label="失败响应">
          <el-input type="textarea" :autosize="{ minRows: 2}" placeholder="请输入内容" v-model="form.failMock">
          </el-input>
        </el-form-item> -->
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeAddDialog">取 消</el-button>
          <el-button type="primary" @click="createItem">确 定</el-button>
        </span>
      </el-dialog>

    </section>
  </div>
</template>
<script>
  import axios from 'axios'
  import MyHeader from '../components/MyHeader.vue'
  const httpMethods = ['GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH'];
  const paramTypes = ['String', 'Object', 'Array', 'Boolean', 'Number', 'Null'];
  function getSelectOpts (arr) {
    return arr.map(item => {
          return {
            value: item,
            label: item,
          }
        })
  }

  const initForm = {
          APIName: '',
          method: '',
          canCrossDomain: false,
          reqUrl: '',
          successMock: '',
          editingItem: null,
  }
  function toJsonStr(str) {
    return str.replace(/\n/g, '');
  }
  export default {
    props: {
      project: Object,
    },
    data() {
      return {
        addDialogVisible: false,
        list: [],
        form: {
          ...initForm
          // failMock: '',

        //   canCrossDomain: false,
        //   reqParams:[{
        //     name: '', // 参数名称 
        // required: true, // 是否必填
        // describe: '',   // 参数说明
        // type: '' // 参数类型
        //   }],
        //   resParams:[],
        //   successMock: {},
        //   failMock: {},
        },
        methodOptions: getSelectOpts(httpMethods),
        paramTypeOpts: getSelectOpts(paramTypes),
        rules: {
          APIName: [{
              required: true, 
              whitespace: true,
              message: '请输入接口名称', 
              trigger: 'blur' 
            },
          ],
          method: {
            required: true, message: '请选择接口请求方法', trigger: 'blur',
          },
          reqUrl: {
            required: true, whitespace: true, message: '请选择接口请求方法', trigger: 'blur'
          },
          successMock: [{
            required: true, message: '请输入成功响应', trigger: 'blur'
          },{
            validator: (rule, value, callback) => {
              let jsonStr = toJsonStr(value);
              try {
                JSON.parse(jsonStr);
                callback();
              } catch(e) {
                callback('不符合JSON格式');
              }
            }, trigger: 'blur'
          }],
        }

      }
    },
    created () {
        this.fetchList();
    },
    computed: {
      parentProject() {
        return this.$props.project;
      }
    },
    components: {
      MyHeader
    },
    methods: {
      fetchList() {
        axios.get(`/api/${this.parentProject._id}/apis`, {
          params: {
            page: 1, // pageNo default 1 
            limit: 10000 // pageSize default 10      
          }
        }).then(({data}) => {
          
          if(data.status === 200 && data.result.docs) {
            this.list = data.result.docs;
            this.closeAddDialog();
          } else {
            this.$message.error(data.message);
          }
          
        }).catch(err => {
          this.$notify.error({
              title: '错误',
              message: '拉取列表失败',
              duration: 0
            })
        }) 
      },
      openAddDialog() {
        // this.initForm()
        this.addDialogVisible = true;
      },
      openEditDialog(e, item) {
        // this.initForm();
        Object.assign(this.form, {
          ...item,
          editingItem: item,
        })
        this.addDialogVisible = true;
      },
      closeAddDialog(close) {
        if(this.addDialogVisible === true) {
          this.addDialogVisible = false;
          Object.assign(this.form, {...initForm});
          this.$refs['createForm'] && this.$refs['createForm'].clearValidate();
        }
      },
      createItem() {
        this.$refs['createForm'].validate(valid => {
          if(valid) {
            let apiItem = {
              method: this.form.method,
              canCrossDomain: this.form.canCrossDomain,
              reqUrl: this.form.reqUrl.trim(),
              successMock: this.form.successMock,
            }
            let APIName = this.form.APIName.trim();
            if(this.form.editingItem && this.form.editingItem._id) {
              this.updateAction({
                projectId: this.parentProject._id,
                apiId: this.form.editingItem._id,
                data: {
                  ...apiItem, 
                  APIName,
                },
              })
            } else {
              this.createAction({
                projectId: this.parentProject._id,
                APIName,
                data: apiItem,
              })
            }
          }
        })        
      },
      createAction({projectId, APIName, data}) {
        axios.post(`/api/projects/${projectId}/${encodeURIComponent(APIName)}`, data)
          .then((({data}) => {
            if(data.status === 201) {
              this.$message.success('创建成功')
              this.closeAddDialog();
              this.fetchList();
            } else {
              this.$message.error(data.message || '创建失败')
            }
          })).catch(({response}) => {
            this.$message.error(response.data.message || '创建失败')
          })
      },
      updateAction({projectId, apiId, data}) {
        axios.put(`/api/projects/${projectId}/${apiId}`, data)
          .then(({data}) => {
            this.$message.success('更新成功')
            this.closeAddDialog();
            this.fetchList();
          })
          .catch(({data}) => {
            this.$message.error(data.message || '更新失败')
          })
      },
      confirmDelete(e, item) {
        this.$confirm('此操作将永久删除该接口的信息', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteItem(e, item);
        }).catch(() => {});
      },
      deleteItem(e, item) {
        axios.delete(`/api/projects/${this.parentProject._id}/${item._id}`, {
          data: {
            isForceDelete: 'true'
          }
        })
        .then((({data}) => {
            this.$message.success('删除成功');
            this.fetchList();
          })).catch(({response}) => {
            this.$message.error(response.data.message || '删除失败')
          })
      },
      fetchTest(e, item) {
        axios({
          url: `/mock${item.reqUrl}`,
          method: item.method.toLowerCase(),
        }).then((data) => {
          console.log(Date.now(), data);
          this.$message.success('测试请求发送成功');
        }).catch(res => {
          console.error(res);
        })
      }
      // removeReqParam(reqParam) {},
      // addReqParam() {
        
      // },
      
    },

   
  }
</script>
<style scoped lang="less">
@import '../assets/less/vars.less';
.page-container.project {
  padding-bottom: 2em;
}
.req-param-item {
  box-shadow: 0px 0px 5px #999;
  padding: 10px;
  margin: 10px 0;
  // position: relative;
  .delete-req-param {
    // position: absolute;
    // top: 3em;
    // left: -70px;
  }
  .param-title {
    margin-left: -90px;
  }
  .param-item {
    margin-left: -120px;
  }
}
.delete-item-btn {
  // margin-left: 2em;
}
.breadcrumb {
  line-height: 40px;
}
.api-item {
  position: relative;
  margin-top: 2em;
  .field-title {
    margin-bottom: 1em;
  }
  .el-textarea__inner {
    &:focus {
      border-color: #dcdfe6;
    }
  }
  .action-btns {
    position: absolute;
    right: 18px;
    top: 6px;
  }
}

.add-form {
  .method-item {
    width: 50%;
  }
}
.inline-block {
  display: inline-block;
}
</style>

