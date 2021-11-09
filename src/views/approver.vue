<template>
  <div class="page" v-loading="processLoading">
    <header class="page__header">
      <div class="page-actions">
        <!-- <div>设置审批流程</div> -->
      </div>
      <el-button size="small" class="publish-btn" @click="publish">发布</el-button>
    </header>
    <section class="page__content">
      <Process
        v-if="mockData"
        ref="processDesign"
        :conf="mockData.processData"
        tabName="processDesign"
        @startNodeChange="onStartChange"/>
    </section>
  </div>
</template>

<script>
import Process from "@/components/Process";
import {getProcessData,saveData} from "@/api/index.js"
import {handlereduce} from "@/utils/index.js"
import { NodeUtils } from "@/components/Process/FlowCard/util.js";
export default {
  name: "Home",
  components: {
    Process,
  },
  data() {
    return {
      processLoading:false,//加载loading
      mockData: null, // 可选择诸如 $route.param，Ajax获取数据等方式自行注入
      fieldArr:[]
    };
  },
  mounted () {
    this.initData()
  },
  methods: {
    //获取选择的条件信息
    getCondition(data) {
      data.conditionNodes && data.conditionNodes.forEach((item) => {
        if (item.conditionConfigs) {
          this.fieldArr = this.setFieldArr(item.conditionConfigs, this.fieldArr)
        }
        if (item.conditionNodes) this.getCondition(item)
        if (item.childNode) this.getCondition(item.childNode)
      })
      if (data.childNode) {
        this.getCondition(data.childNode)
      }
    },
    setFieldArr(data, arr) {
      data.forEach((item) => {
        let obj={
          field: item.field,
          fieldName:item.fieldName,
          fieldType:item.fieldType
        }
        arr.push(obj);
      });
      return arr;
    },
    async initData(){
      this.processLoading=true;
      // this.$cookie.set('db', 'db_ck_oa', Infinity);//zszh
      let accountbookId=window.localStorage.getItem('accountbookId')
      let billType=window.localStorage.getItem('billType')
      if(accountbookId && billType){
        //获取流程图的数据 '2c91e3f674cfeac80174d85ce8a6021c',2 accountbookId,billType
        await this.getFlowData(accountbookId,billType)
      }else{
        this.$message.error("accountbookId或billType不存在")
      }  
    },
    getFlowData(accountbookId,billType){
      getProcessData(accountbookId,billType).then(res=>{
        console.log("res-approver",res)
        if(res.data !=''){
          let data = JSON.parse(res.data)
          this.mockData = data;
        }else{
          this.mockData={}
        }
        this.processLoading=false; 
      })
    },
    /**
     * 监听 流程节点发起人改变 并同步到基础设置 发起人数据
     */
    onStartChange(node) {
      // const basicSetting = this.$refs.basicSetting
      // basicSetting.formData.initiator = { 'dep&user': node.properties.initiator }
      console.log("监听 流程节点发起人改变 并同步到基础设置 发起人数据", node);
    },
    //发布
    publish() {
      const getCmpData = (name) => this.$refs[name].getData();
      const p3 = getCmpData("processDesign");
      console.log("p3",p3)
      Promise.all([p3])
        .then((res) => {
          let param ={
            processData:res[0].formData
          } ;
          this.fieldArr=[];//已经选取的条件字段
          this.getCondition(param.processData);
          let arrfieldtemp = handlereduce(this.fieldArr,'field')
          param.processData.conditionField=arrfieldtemp;
          // console.log('配置数据', param)
          this.sendToServer(param);
        })
        .catch((err) => {
          err.target && (this.activeStep = err.target);
          if(err.target){
            this.activeStep = err.target;
            this.$message.error('审批流程存在错误的节点，请检查标记为红色的节点，修复后再试')
          }
          err.msg && this.$message.warning(err.msg);
        });
    },
    sendToServer(param) {
      console.log('配置数据', param)
      this.processLoading=true;
      let accountbookId=window.localStorage.getItem('accountbookId')
      let billType=window.localStorage.getItem('billType')
      saveData(accountbookId,billType,param).then(res=>{       
        this.processLoading=false; 
        this.$message({
          type:res.data.success ? "success":'error',
          message:res.data.msg,
          center:true
        })
        
      })
    },
  },
};
</script>
<style lang="stylus" scoped>
$header-height = 54px;
.page {
  width: 100vw;
  height: 100vh;
  padding-top: $header-height;
  box-sizing: border-box;

  .page__header {
    width: 100%;
    height: $header-height;
    flex-center();
    justify-content: space-between;
    box-sizing: border-box;
    color: white;
    // background: #3296fa;
    background:#f5f5f7;
    font-size: 14px;
    position: fixed;
    top: 0;

    .page-actions {
      height: 100%;
      text-align: center;
      line-height: $header-height;

      > div {
        height: 100%;
        padding-left: 20px;
        padding-right: 20px;
        display: inline-block;
      }

      i {
        font-size: 22px;
        vertical-align: middle;
      }
    }

    .step-tab {
      display: flex;
      justify-content: center;
      height: 100%;
      position: relative;

      >.step {
        width: 140px;
        line-height: $header-height;
        padding-left: 30px;
        padding-right: 30px;
        cursor: pointer;
        position: relative;

        &.ghost-step {
          position: absolute;
          height: $header-height;
          left: 0;
          z-index: -1;
          background: #4483f2;
          transition: transform 0.5s;

          &::after {
            content: '';
            border-width: 6px 6px 6px;
            border-style: solid;
            border-color: transparent transparent white;
            position: absolute;
            bottom: 0;
            left: 50%;
            margin-left: -6px;
          }
        }

        &.active >.step-index {
          background: white;
          color: #4483f2;
        }

        >.step-index {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 1px solid #fff;
          border-radius: 8px;
          line-height: 18px;
          text-align: center;
          box-sizing: border-box;
        }
      }
    }
  }

  .page__content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    background: #f5f5f7;
  }
}

.publish-btn {
  margin-right: 30px;
  color: #3296fa;
  padding: 7px 20px;
  border-radius: 4px;
  font-size: 14px;
}

</style>
