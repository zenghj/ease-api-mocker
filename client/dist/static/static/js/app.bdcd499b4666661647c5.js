webpackJsonp([1],{"2rmn":function(t,e){},NHnr:function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=a("7+uW"),s={render:function(){var t=this.$createElement,e=this._self._c||t;return e("div",{attrs:{id:"app"}},[e("router-view")],1)},staticRenderFns:[]};var i=a("VU/8")({name:"App"},s,!1,function(t){a("2rmn")},null,null).exports,n=a("/ocq"),r={render:function(){var t=this.$createElement,e=this._self._c||t;return e("section",{staticClass:"home section"},[e("h1",[this._v("To Make Front-End Dev Easier")]),this._v(" "),e("router-link",{attrs:{to:{name:"Projects"}}},[e("el-button",{attrs:{round:"",type:""}},[this._v("Start Using")])],1)],1)},staticRenderFns:[]};var c=a("VU/8")(null,r,!1,function(t){a("VzjY")},"data-v-99312c22",null).exports,l=a("woOf"),d=a.n(l),u=a("Dd8w"),m=a.n(u),p=a("mtWM"),f=a.n(p),h={render:function(){this.$createElement;this._self._c;return this._m(0)},staticRenderFns:[function(){var t=this.$createElement,e=this._self._c||t;return e("header",[e("div",{staticClass:"fl"},[this._v("Easy Mocker")]),this._v(" "),e("div",{staticClass:"user fr"},[e("a",{attrs:{href:"/auth/logout"}},[this._v("log out")])])])}]};var v=a("VU/8")(null,h,!1,function(t){a("oFIX")},"data-v-0bbb3987",null).exports,g={name:"",editingItem:null},_={data:function(){return{projects:[],addDialogVisible:!1,form:m()({},g)}},created:function(){this.fetchList()},methods:{fetchList:function(){var t=this;f.a.get("/api/projects",{params:{page:1,limit:1e3}}).then(function(e){var a=e.data;200===a.status&&a.result.docs?(t.projects=a.result.docs,t.closeAddDialog()):t.$message.error(a.message)}).catch(function(e){t.$notify.error({title:"错误",message:"拉取项目列表失败",duration:0})})},openAddDialog:function(){this.addDialogVisible=!0,this.initForm()},openEditDialog:function(t,e){this.initForm(),d()(this.form,m()({},e,{editingItem:e})),this.addDialogVisible=!0},closeAddDialog:function(){this.addDialogVisible=!1},initForm:function(){d()(this.form,m()({},g))},createItem:function(){this.form.editingItem&&this.form.editingItem._id?this.updateAction({newProjectName:this.form.name,_id:this.form.editingItem._id}):this.createAction({name:this.form.name})},createAction:function(t){var e=this,a=t.name;f.a.post("/api/projects/"+encodeURIComponent(a)).then(function(t){201===t.data.status&&(e.$message.success("创建成功"),e.closeAddDialog(),e.fetchList())}).catch(function(t){var a=t.response;e.$message.error(a.data.message||"创建失败")})},updateAction:function(t){var e=this,a=t.newProjectName,o=t._id;f.a.patch("/api/projects/"+o,{newProjectName:a}).then(function(t){t.data;e.$message.success("更新成功"),e.closeAddDialog(),e.fetchList()}).catch(function(t){var a=t.data;e.$message.error(a.message||"更新失败")})},confirmDelete:function(t,e){var a=this;this.$confirm("此操作将永久删除该项目及项目中的所有接口信息","警告",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(function(){a.deleteItem(t,e)}).catch(function(){})},deleteItem:function(t,e){var a=this;f.a.delete("/api/projects/"+e._id,{data:{isForceDelete:"true"}}).then(function(t){t.data;a.$message.success("删除成功"),a.fetchList()}).catch(function(t){var e=t.response;a.$message.error(e.data.message||"删除失败")})}},components:{MyHeader:v}},b={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("my-header"),t._v(" "),a("section",{staticClass:"page-container project"},[a("el-row",{staticClass:"clearfix"},[a("h1",{staticClass:"fl"},[t._v("project list")]),t._v(" "),a("el-button",{staticClass:"fr",attrs:{type:"primary",icon:"el-icon-plus",circle:""},on:{click:t.openAddDialog}})],1),t._v(" "),a("el-dialog",{attrs:{title:"添加项目",visible:t.addDialogVisible,width:"600px"},on:{"update:visible":function(e){t.addDialogVisible=e}}},[a("el-form",{attrs:{"label-width":"80px"}},[a("el-form-item",{attrs:{label:"项目名称"}},[a("el-input",{model:{value:t.form.name,callback:function(e){t.$set(t.form,"name",e)},expression:"form.name"}})],1)],1),t._v(" "),a("span",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{on:{click:t.closeAddDialog}},[t._v("取 消")]),t._v(" "),a("el-button",{attrs:{type:"primary"},on:{click:t.createItem}},[t._v("确 定")])],1)],1),t._v(" "),a("div",{staticClass:"projects clearfix"},t._l(t.projects,function(e,o){return a("router-link",{key:o,staticClass:"project-item fl",attrs:{to:"/page/projects/"+e._id+"?project="+encodeURIComponent(JSON.stringify(e))}},[a("el-card",[a("div",{attrs:{slot:"header"},slot:"header"},[t._v(t._s(e.name)+"\n            "),a("div",{staticClass:"action-btns"},[a("el-button",{staticClass:"el-icon-edit-btn",attrs:{icon:"el-icon-edit",type:"primary",circle:""},on:{click:function(a){a.stopPropagation(),a.preventDefault(),t.openEditDialog(a,e)}}}),t._v(" "),a("el-button",{staticClass:"delete-item-btn",attrs:{icon:"el-icon-delete",type:"danger",circle:""},on:{click:function(a){a.stopPropagation(),a.preventDefault(),t.confirmDelete(a,e)}}})],1)]),t._v(" "),a("div",{staticClass:"des"},[a("p",[t._v("updateAt: "+t._s(e.updateAt))]),t._v(" "),a("p",[t._v("id: "+t._s(e._id))])])])],1)}))],1)],1)},staticRenderFns:[]};var j=a("VU/8")(_,b,!1,function(t){a("v8UJ")},"data-v-720140a6",null).exports,y={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("section",{staticClass:"section login"},[a("h1",[t._v("Easy mocker")]),t._v(" "),a("el-form",{staticClass:"login-form",attrs:{action:"/auth/login",method:"post"}},[a("el-form-item",{attrs:{label:"username",prop:"username"}},[a("el-input",{attrs:{name:"username"},model:{value:t.form.username,callback:function(e){t.$set(t.form,"username",e)},expression:"form.username"}})],1),t._v(" "),a("el-form-item",{attrs:{label:"password",prop:"password"}},[a("el-input",{attrs:{type:"password",name:"password"},model:{value:t.form.password,callback:function(e){t.$set(t.form,"password",e)},expression:"form.password"}})],1),t._v(" "),a("el-form-item",[a("el-button",{attrs:{type:"primary","native-type":"submit"},on:{click:function(e){t.login()}}},[t._v("login")])],1)],1)],1)},staticRenderFns:[]};var D=a("VU/8")({data:function(){return{form:{username:"",password:""}}},methods:{login:function(){}}},y,!1,function(t){a("h+48")},null,null).exports,k=["GET","POST","HEAD","PUT","DELETE","CONNECT","OPTIONS","TRACE","PATCH"],I=["String","Object","Array","Boolean","Number","Null"];function A(t){return t.map(function(t){return{value:t,label:t}})}var $={APIName:"",method:"",reqUrl:"",successMock:"",editingItem:null};var C={props:{project:Object},data:function(){return{addDialogVisible:!1,list:[],form:m()({},$),methodOptions:A(k),paramTypeOpts:A(I)}},created:function(){this.fetchList()},computed:{parentProject:function(){return this.$props.project}},components:{MyHeader:v},methods:{fetchList:function(){var t=this;f.a.get("/api/"+this.parentProject._id+"/apis",{params:{page:1,limit:1e4}}).then(function(e){var a=e.data;200===a.status&&a.result.docs?(t.list=a.result.docs,t.closeAddDialog()):t.$message.error(a.message)}).catch(function(e){t.$notify.error({title:"错误",message:"拉取列表失败",duration:0})})},openAddDialog:function(){this.initForm(),this.addDialogVisible=!0},openEditDialog:function(t,e){this.initForm(),d()(this.form,m()({},e,{editingItem:e})),this.addDialogVisible=!0},closeAddDialog:function(){this.addDialogVisible=!1},initForm:function(){d()(this.form,m()({},$))},createItem:function(){try{var t=this.form.successMock.replace(/\n/g,"");JSON.parse(t);var e={method:this.form.method,reqUrl:this.form.reqUrl,successMock:this.form.successMock};this.form.editingItem&&this.form.editingItem._id?this.updateAction({projectId:this.parentProject._id,apiId:this.form.editingItem._id,data:m()({},e,{APIName:this.form.APIName})}):this.createAction({projectId:this.parentProject._id,APIName:this.form.APIName,data:e})}catch(t){this.$message.error("mock json 格式出错")}},createAction:function(t){var e=this,a=t.projectId,o=t.APIName,s=t.data;f.a.post("/api/projects/"+a+"/"+encodeURIComponent(o),s).then(function(t){var a=t.data;201===a.status?(e.$message.success("创建成功"),e.closeAddDialog(),e.fetchList()):e.$message.error(a.message||"创建失败")}).catch(function(t){var a=t.response;e.$message.error(a.data.message||"创建失败")})},updateAction:function(t){var e=this,a=t.projectId,o=t.apiId,s=t.data;f.a.put("/api/projects/"+a+"/"+o,s).then(function(t){t.data;e.$message.success("更新成功"),e.closeAddDialog(),e.fetchList()}).catch(function(t){var a=t.data;e.$message.error(a.message||"更新失败")})},confirmDelete:function(t,e){var a=this;this.$confirm("此操作将永久删除该接口的信息","警告",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(function(){a.deleteItem(t,e)}).catch(function(){})},deleteItem:function(t,e){var a=this;f.a.delete("/api/projects/"+this.parentProject._id+"/"+e._id,{data:{isForceDelete:"true"}}).then(function(t){t.data;a.$message.success("删除\b成功"),a.fetchList()}).catch(function(t){var e=t.response;a.$message.error(e.data.message||"删除失败")})},fetchTest:function(t,e){var a=this;f()({url:"/mock"+e.reqUrl,method:e.method.toLowerCase()}).then(function(t){console.log(Date.now(),t),a.$message.success("测试请求发送成功")}).catch(function(t){console.error(t)})}}},P={render:function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("my-header"),t._v(" "),a("section",{staticClass:"page-container project"},[a("el-row",{staticClass:"clearfix"},[a("el-breadcrumb",{staticClass:"fl breadcrumb ",attrs:{separator:"/"}},[a("el-breadcrumb-item",{attrs:{to:{name:"Projects"}}},[t._v(t._s(this.$props.project.name))]),t._v(" "),a("el-breadcrumb-item",[t._v("api list")])],1),t._v(" "),a("el-button",{staticClass:"fr",attrs:{type:"primary",icon:"el-icon-plus",circle:""},on:{click:t.openAddDialog}})],1),t._v(" "),a("div",{staticClass:"api-items"},t._l(t.list,function(e){return a("el-card",{key:e._id,staticClass:"api-item box-card"},[a("div",{staticClass:"clearfix",attrs:{slot:"header"},slot:"header"},[a("h1",[t._v(t._s(e.APIName)+" "+t._s(e.method)+" "+t._s(e.reqUrl)+"\n          ")]),t._v(" "),a("div",{staticClass:"action-btns"},[a("el-button",{attrs:{type:"primary"},on:{click:function(a){a.stopPropagation(),t.fetchTest(a,e)}}},[t._v("Test")]),t._v(" "),a("el-button",{staticClass:"el-icon-edit-btn",attrs:{icon:"el-icon-edit",type:"primary",circle:""},on:{click:function(a){a.stopPropagation(),t.openEditDialog(a,e)}}}),t._v(" "),a("el-button",{staticClass:"delete-item-btn",attrs:{icon:"el-icon-delete",type:"danger",circle:""},on:{click:function(a){a.stopPropagation(),t.confirmDelete(a,e)}}})],1)]),t._v(" "),a("h2",{staticClass:"field-title"},[t._v("成功响应")]),t._v(" "),a("el-input",{attrs:{type:"textarea",readonly:"",autosize:{minRows:2},placeholder:"请输入内容"},model:{value:e.successMock,callback:function(a){t.$set(e,"successMock",a)},expression:"item.successMock"}})],1)})),t._v(" "),a("el-dialog",{attrs:{title:"添加接口",visible:t.addDialogVisible,width:"600px","close-on-click-modal":!1},on:{"update:visible":function(e){t.addDialogVisible=e}}},[a("el-form",{attrs:{"label-width":"120px"}},[a("el-form-item",{attrs:{label:"APIName"}},[a("el-input",{model:{value:t.form.APIName,callback:function(e){t.$set(t.form,"APIName",e)},expression:"form.APIName"}})],1),t._v(" "),a("el-form-item",{attrs:{label:"Method"}},[a("el-select",{attrs:{placeholder:"请选择"},model:{value:t.form.method,callback:function(e){t.$set(t.form,"method",e)},expression:"form.method"}},t._l(t.methodOptions,function(t){return a("el-option",{key:t.value,attrs:{label:t.label,value:t.value}})}))],1),t._v(" "),a("el-form-item",{attrs:{label:"Uri"}},[a("el-input",{model:{value:t.form.reqUrl,callback:function(e){t.$set(t.form,"reqUrl",e)},expression:"form.reqUrl"}})],1),t._v(" "),a("el-form-item",{attrs:{label:"成功响应"}},[a("el-input",{attrs:{type:"textarea",autosize:{minRows:2},placeholder:"请输入内容"},model:{value:t.form.successMock,callback:function(e){t.$set(t.form,"successMock",e)},expression:"form.successMock"}})],1)],1),t._v(" "),a("span",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{on:{click:t.closeAddDialog}},[t._v("取 消")]),t._v(" "),a("el-button",{attrs:{type:"primary"},on:{click:t.createItem}},[t._v("确 定")])],1)],1)],1)],1)},staticRenderFns:[]};var w=a("VU/8")(C,P,!1,function(t){a("aNKf")},"data-v-33d8c24e",null).exports;o.default.use(n.a);var x=new n.a({mode:"history",fallback:!1,routes:[{path:"/page/",name:"Home",alias:"/",component:c},{path:"/page/projects.html",name:"Projects",component:j},{path:"/page/projects/:projectId",name:"ProjectDetail",component:w,props:function(t){return{project:JSON.parse(decodeURIComponent(t.query.project))}}},{path:"/authPage/login",name:"Login",component:D}]}),N=a("zL8q"),U=a.n(N);a("tvR6"),a("feh2"),a("w/9h");o.default.config.productionTip=!1,o.default.use(U.a),f.a.interceptors.response.use(function(t){return t},function(t){401===t.response.status&&(window.location.href="/authPage/login")}),new o.default({el:"#app",router:x,components:{App:i},template:"<App/>"})},VzjY:function(t,e){},aNKf:function(t,e){},feh2:function(t,e){},"h+48":function(t,e){},oFIX:function(t,e){},tvR6:function(t,e){},v8UJ:function(t,e){},"w/9h":function(t,e){}},["NHnr"]);
//# sourceMappingURL=app.bdcd499b4666661647c5.js.map