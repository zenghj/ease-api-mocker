<template>
  <div>
    <my-header></my-header>
    <section class="page-container project">
      <el-row class="clearfix title">
        <h1 class="fl">Project List</h1>
        <el-button class="fr" type="primary" icon="el-icon-plus" circle @click="openAddDialog"></el-button>
      </el-row>

      <el-dialog title="添加项目" :visible.sync="addDialogVisible" :before-close="closeAddDialog" width="600px">
        <el-form label-width="80px" :model="form" :rules="rules" ref="createForm">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="closeAddDialog">取 消</el-button>
          <el-button type="primary" @click="createItem">确 定</el-button>
        </span>
      </el-dialog>

      <div class="projects clearfix">
        <router-link v-for="(item, key) in projects" :key="key" :to="`/page/projects/${item._id}?project=${encodeURIComponent(JSON.stringify(item))}`" class="project-item fl">
          <el-card>
            <div slot="header">
              <h2 class="project-name">{{item.name}}</h2>
              <div class="action-btns">
                <el-button class="el-icon-edit-btn" icon="el-icon-edit" type="primary" circle @click.stop.prevent="openEditDialog($event, item)"></el-button>
                <el-button class="delete-item-btn" icon="el-icon-delete" type="danger" circle @click.stop.prevent="confirmDelete($event, item)"></el-button>
              </div>

            </div>
            <div class="des">
              <p>updateAt: {{item.updateAt}}</p>
              <p>id: {{item._id}}</p>
            </div>
          </el-card>
        </router-link>
      </div>
    </section>
  </div>
</template>
<script>
  import axios from 'axios'
  import MyHeader from '../components/MyHeader.vue'

  const initForm = {
    name: '',
    editingItem: null,
  };
  export default {

    data() {
      return {
        projects: [],
        addDialogVisible: false,
        form: {
          ...initForm
        },
        rules: {
          name: {
            required: true, message: '请输入项目名称', trigger: 'blur' 
          }
        }
      }
    },
    created () {
        this.fetchList();
    },

    methods: {
      fetchList() {
        axios.get('/api/projects', {
          params: {
            page: 1, // pageNo default 1 
            limit: 1000 // pageSize default 10      
          }
        }).then(({data}) => {
          
          if(data.status === 200 && data.result.docs) {
            this.projects = data.result.docs;
            this.closeAddDialog();
          } else {
            this.$message.error(data.message);
          }
          
        }).catch(err => {
          this.$notify.error({
              title: '错误',
              message: '拉取项目列表失败',
              duration: 0
            })
        }) 
      },
      openAddDialog() {
        this.addDialogVisible = true;
        // this.initForm()
      },
      openEditDialog(e, item) {
        // this.initForm();
        Object.assign(this.form, {
          ...item,
          editingItem: item,
        })
        this.addDialogVisible = true;
      },
      closeAddDialog() {
        if(this.addDialogVisible === true) {
          this.addDialogVisible = false;
          Object.assign(this.form, {...initForm});
          // "ref 本身是作为渲染结果被创建的，在初始渲染的时候你不能访问它们 - 它们还不存在"
          // mounted之后才能获取到
          this.$refs['createForm'] && this.$refs['createForm'].clearValidate(); 
        }
      },
      createItem() {
        this.$refs['createForm'].validate(valid => {
          if(valid) {
            if(this.form.editingItem && this.form.editingItem._id) {
              this.updateAction({
                newProjectName: this.form.name,
                _id: this.form.editingItem._id,
              }) 
            } else {
              this.createAction({
                name: this.form.name,
              })
            }
          } 
        })
      },
      createAction({name}) {
        axios.post(`/api/projects/${encodeURIComponent(name)}`)
          .then((({data}) => {
            if(data.status === 201) {
              this.$message.success('创建成功')
              this.closeAddDialog();
              this.fetchList();
            }
          })).catch(({response}) => {
            this.$message.error(response.data.message || '创建失败')
          })
      },
      updateAction({newProjectName, _id}) {
        axios.patch(`/api/projects/${_id}`, {
          newProjectName,
        }).then(({data}) => {
          this.$message.success('更新成功');
          this.closeAddDialog();
          this.fetchList();
        }).catch(({data}) => {
          this.$message.error(data.message || '更新失败');
        })
      },
      confirmDelete(e, item) {
        this.$confirm('此操作将永久删除该项目及项目中的所有接口信息', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteItem(e, item);
        }).catch(() => {});
      },
      deleteItem(e, item) {
        axios.delete(`/api/projects/${item._id}`, {
          data: {
            isForceDelete: 'true'
          }
        })
        .then((({data}) => {
          this.$message.success('删除成功');
          this.fetchList();
          })).catch(({response}) => {
            this.$message.error(response.data.message || '删除失败')
          })
      }
    },
    components: {
      MyHeader
    }
   
  }
</script>
<style scoped lang="less">
@import '../assets/less/vars.less';
@import '../assets/less/mixin.less';
.page-container.project {
  .title {
    line-height: 40px;
  }
}
.projects {
  // display: flex;
  // flex-wrap: wrap;
  // flex: 1 1 300px;
  // justify-content: space-around;
}
.project-item {
  position: relative;
  display: block;
  box-sizing: border-box;
  // width: 33.3%;
  width: (@bodyWidth - 4 * 16)/3;
  margin-left: 2em;
  margin-top: 2em;
  text-decoration: none;
  // background: @primaryColor;
  &:nth-child(3n + 1) {
    margin-left: 0;
  }
  .project-name {
    .ellipsis();
    width: 250px;
  }
  .action-btns {
    position: absolute;
    right: 0.5em;
    top: 0.5em;
  }
}
</style>

