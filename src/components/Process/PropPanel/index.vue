
<template>
  <el-drawer
    size="550px"
    class="drawer"
    :visible.sync="visible"
    :show-close="false"
    style="text-align:left;"
    @close="cancel"
    v-if="properties"
  >
    <!-- 标题 -->
    <header slot="title" class="header"  v-if="value && value.type=='start' && properties.title">{{properties.title}}</header>
    <header slot="title" class="header" v-else>
      <span @click="titleInputVisible = true" v-show="!titleInputVisible" style="cursor:pointer;">
        {{properties.title}}
        <i class="el-icon-edit"></i>
      </span>
      <el-input
        size="mini"
        v-model="properties.title"
        v-show="titleInputVisible"
        v-clickoutside="_ => titleInputVisible=false"
        style="z-index:9;max-width: 200px;"
      ></el-input>
      <el-select
        v-if="isConditionNode()"
        v-model="properties.priority"
        size="mini"
        class="priority-select" >
        <el-option v-for="item in priorityLength" :key="item" :value="item-1" :label="'优先级'+item"></el-option>
      </el-select>
    </header>

    <!-- 条件  -->
    <section class="condition-pane" v-if="value && isConditionNode()">
      <row-wrapper title="发起人" v-if="showingPCons.includes(-1)">
          <fc-org-select ref="condition-org" :tabList="['dep&user','role']" v-model="initiator" />
      </row-wrapper>
      
      <template v-for="(item, index) in pconditions">
        <!-- 计数 -->
        <row-wrapper 
          :key="index" 
          :title="item.fieldName" 
          v-if="couldShowIt(item,'el-input-number','fc-date-duration','fc-time-duration','fc-amount', 'fc-calculate','number')">
          <num-input
            :key="index"
            :title="timeTangeLabel(item)"
            v-model="item.conditionValue"
            style="padding-right: 6px;"
          ></num-input>
          <template v-slot:action>
            <i  class="el-icon-delete" style="cursor: pointer;" @click="onDelCondition(item)"></i>
          </template>
        </row-wrapper>
        <!-- 单选组 -->
        <!-- <row-wrapper 
          :key="index" 
          :title="item.label" 
          v-if="couldShowIt(item,'el-radio-group')">
          <el-radio-group v-model="item.conditionValue" class="radio-group">
            <el-radio v-for="item in item.options" :label="item.label" :key="item.label">{{item.label}}</el-radio>
          </el-radio-group>
          <template v-slot:action>
            <i  class="el-icon-delete" style="cursor: pointer;" @click="onDelCondition(item)"></i>
          </template>
        </row-wrapper> -->
        
        <!-- 下拉 -->
        <row-wrapper 
          :key="index" 
          :title="item.fieldName" 
          v-if="couldShowIt(item,'el-select')">
          <el-select v-model="item.conditionValue" placeholder="请选择" size="small">
            <el-option
              v-for="item in item.option"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <template v-slot:action>
              <i  class="el-icon-delete" style="cursor: pointer;" @click="onDelCondition(item)"></i>
            </template>
        </row-wrapper>
          <!-- 组织机构 -->
        <!-- <row-wrapper :key="index" :title="item.label" v-if="couldShowIt(item,'fc-org-select')">
          <fc-org-select 
          v-model="item.conditionValue" 
          :ref="'org' + index" 
          :tabList="['dep']" 
          />
          <template v-slot:action>
            <i  class="el-icon-delete" style="cursor: pointer;" @click="onDelCondition(item)"></i>
          </template>
        </row-wrapper> -->
      </template>
      <div style="padding-left:10px;margin-top:2em;">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="dialogVisible=true">添加条件</el-button>
        <span style="color:#aaa;margin-left:16px;">还有{{notUseConNum}}个可用条件</span>
      </div>
    </section>

    <!-- 审批人 -->
    <section class="approver-pane" style="height:100%;" v-if="value && (isApproverNode() || isStartNode())">
      <el-tabs v-model="activeName"  class="pane-tab">
        <el-tab-pane :label="'设置' + (value.type === 'approver' ? '审批人' : '发起人')" name="config">
          <!-- 开始节点 -->
          <el-row style="padding: 10px;"  v-if="value.type === 'start'">
            <el-col :span="4" style="font-size: 12px;">发起人</el-col>
            <el-col :span="18" style="padding-left: 12px;">
              <fc-org-select ref="start-org" :tabList="['dep&user']" v-model="initiator" />
            </el-col>
          </el-row>
          
          <div v-else-if="value.type === 'approver'">
            <div style="padding: 12px;">
              <el-radio-group v-model="approverForm.assigneeType" style="line-height: 32px;" @change="resetOrgColl">
                <el-radio v-for="item in assigneeTypeOptions" :label="item.value" :key="item.value" class="radio-item">{{item.label}}</el-radio>
              </el-radio-group>
            </div>
            <div style="border-bottom: 1px solid #e5e5e5;padding-bottom: 1rem;">
              <div v-if="approverForm.assigneeType === 'myself'"  class="option-box" style="color: #a5a5a5;">发起人自己将作为审批人处理审批单</div>
              <div v-else-if="approverForm.assigneeType === 'optional'"  class="option-box">
                <p>可选多人</p>
                <el-switch v-model="approverForm.optionalMultiUser" active-color="#13ce66"> </el-switch>
                <!-- <p>选择范围</p>
                <el-select v-model="approverForm.optionalRange" size="mini">
                  <el-option v-for="(item, index) in rangeOptions" :key="index" :label="item.label" :value="item.value"
                    :disabled="item.disabled"></el-option>
                </el-select> -->
              </div>
              <!-- 主管  -->
              <div v-else-if="approverForm.assigneeType === 'director'">
                <div style="font-size: 14px;padding-left: 1rem;">发起人的 
                  <el-select v-model="directorLevel" size="small">
                    <el-option v-for="item in 5" :key="item" :label="item === 1 ? '直接主管': `第${item}级主管`" :value="item"
                    ></el-option>
                  </el-select>
                  <br>
                  <el-checkbox v-model="useDirectorProxy" style="margin-top: 1rem;">找不到主管时，由上级主管代审批</el-checkbox>
                </div>
              </div>
              <div v-else class="option-box">
                <fc-org-select  
                ref="approver-org" 
                buttonType="button" 
                v-model="orgCollection" 
                :title="getAssignTypeLabel()" 
                :tabList="fcOrgTabList.includes(approverForm.assigneeType) ? [approverForm.assigneeType] : ['dep']" 
                @change="onOrgChange" />
              </div>
            </div>
            <div class="option-box" style="border-bottom: 1px solid #e5e5e5;" v-if="orgCollection[approverForm.assigneeType] && orgCollection[approverForm.assigneeType].length > 1 || ['optional','director','role'].includes(approverForm.assigneeType)">
              <p>多人审批时采用的审批方式</p>
              <el-radio v-model="approverForm.counterSign" :label="true" class="radio-item">会签（须所有审批人同意）</el-radio>
              <br>
              <el-radio  v-model="approverForm.counterSign"  :label="false" class="radio-item">或签（一名审批人同意或拒绝即可）</el-radio>
            </div>
          </div>

        </el-tab-pane>
        <!-- <el-tab-pane label="表单权限" name="formAuth">
          <div class="form-auth-table">
            <header class="auth-table-header">
              <div class="row">
                <div class="label">表单字段</div>
                <el-radio-group v-model="globalFormOperate"  class="radio-group" @change="changeAllFormOperate">
                  <el-radio :label="2" style="margin-left: 1rem;">可编辑</el-radio>
                  <el-radio :label="1">只读</el-radio>
                  <el-radio :label="0">隐藏</el-radio>
                </el-radio-group>
              </div>
            </header>
            <div class="auth-table-body">
              <div v-for="item in getFormOperates()" :key="item.formId" class="row">
                <div class="label">
                  <span class="required" v-show="item.required">*</span>
                  {{item.label}}
                </div>
                <el-radio-group v-model="item.formOperate"  class="radio-group">
                  <el-radio :label="2" style="margin-left: 1rem;"><span style="opacity: 0;">可编辑</span></el-radio>
                  <el-radio :label="1"><span style="opacity: 0;">只读</span></el-radio>
                  <el-radio :label="0"><span style="opacity: 0;">隐藏</span></el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>
        </el-tab-pane> -->
      </el-tabs>
    </section>

    <!-- 抄送人 -->
    <section  v-if="value && isCopyNode()" style="padding-left: 1rem;">
      <p>抄送人</p>
      <fc-org-select ref="copy-org" :tabList="['user']" v-model="properties.menbers" buttonType="button" title="抄送人" />
      <br>
      <el-checkbox v-model="properties.userOptional">允许发起人自选抄送人</el-checkbox>
    </section>

    <!-- 选择权限条件的弹窗 -->
    <el-dialog title="选择条件" :visible.sync="dialogVisible" width="500px" :append-to-body="true" custom-class="condition-dialog">
      <el-checkbox-group v-model="showingPCons">
        <!-- 发起人默认就有 -->
        <el-checkbox :label="-1">发起人</el-checkbox>
        <el-checkbox v-for="(item,index) in pconditions" :key="index" :label="item.field">
         {{item.fieldName}}
        </el-checkbox>
      </el-checkbox-group>
    </el-dialog>

    <div class="actions">
      <el-button size="small" @click="cancel">取消</el-button>
      <el-button size="small" type="primary" @click="confirm">确定</el-button>
    </div>
  </el-drawer>
</template>
<script>
import {getField} from "@/api/index.js"
//点击被插入该指令的元素外的任意空白处，触发指令所绑定的方法。
import Clickoutside from "element-ui/src/utils/clickoutside"
import { NodeUtils } from "../FlowCard/util.js"
//添加的表单信息条的样式
import RowWrapper from './RowWrapper';
//金额组件？
import NumInput from "./NumInput"
const rangeType = {
  'lt': '<',
  'lte':'≤',
  'gt':'>',
  'gte':'≥',
  'eq': '=',
}
const rangeTypeParams = {
  'lt': '<',
  'lte':'<=',
  'gt':'>',
  'gte':'>=',
  'eq': '==',
}
const defaultApproverForm = {
  approvers:[], // 审批人集合
  assigneeType: "user", // 指定审批人
  // formOperates:[], // 表单操作权限集合
  counterSign: true, //是否为会签
  // 审批类型为自选 出现 optionalMultiUser optionalRange
  optionalMultiUser: false,//是否可选多人
  // optionalRange: 'ALL', // USER<最多十个> / ALL / ROLE      发起人自选的选择范围（全公司，指定成员，角色）
}
export default {
  props: [/*当前节点数据*/"value", /*整个节点数据*/"processData"],
  data() {
    return {
      fcOrgTabList:['dep', 'role', 'user', 'position'],
      visible: false,  // 控制面板显隐
      // globalFormOperate: null,  // 统一设置节点表单权限
      titleInputVisible: false, // 是否显示标题输入框  startNode 不显示
      activeName: "config", // or formAuth  Tab面板key
      showingPCons: [], // 用户选择了得条件  被选中的才会被展示在面板上编辑
      pconditions: [], // 从vuex中获取的可以作为流程图条件的集合(弹窗里显示的条件)
      dialogVisible: false, // 控制流程条件选项Dialog显隐
      properties: {},// 当前节点数据
      // 发起人  start节点和condition节点需要
      initiator:{
        'dep&user': [],
        'role':[]
      }, 
      priorityLength: 0, // 当为条件节点时  显示节点优先级选项的数据
      //处理审批人的时候选择人的数据
      orgCollection:{
        dep: [],
        role: [],
        user: [],
        position: []
      },
      useDirectorProxy: true, // 找不到主管时 上级主管代理审批
      directorLevel: 1,  // 审批主管级别
      startForm:{
        formOperates: []
      },
      approverForm: JSON.parse(JSON.stringify(defaultApproverForm)),
      //目前没用到
      optionalOptions: [
        {
          label: '自选一个人',
          value: false
        }, {
          label: '自选多个人',
          value: true
        }],
      //选择范围（当审批节点为发起人自选的时候使用）
      // rangeOptions: [
      //     {
      //     label: '全公司',
      //     value: 'ALL'
      //   }, {
      //     label: '指定成员',
      //     value: 'USER'
      //   }, {
      //     label: '角色',
      //     value: 'ROLE'
      // }],
      //设置审批人类型
      assigneeTypeOptions:[
        {
          label:'指定成员',
          value: 'user',
          id:1
        },
        {
          label:'主管',
          value: 'director',
          id:2
        },    
        // {
        //   label:'岗位',
        //   value: 'position'
        // },
        {
          label:'发起人自己',
          value: 'myself',
          id:3
        },
        {
          label:'发起人自选',
          value: 'optional',
          id:4
        },
        {
          label:'职级',
          value: 'role',
          id:5
        },
      ],
      approverConfig:{},//新增的审批人的配置信息---用于配置bpmn
    };
  },
  computed: {
    // 未使用的条件个数
    notUseConNum() {
      // 发起人是默认就有得  所以需要加 1
      return this.pconditions.length - this.showingPCons.length + 1;
    },
    // usedFormItems(){
    //   return this.$store.state.formItemList
    // }
  },
  created(){
    this.getCondition()
  },
  directives: {
    Clickoutside
  },
  methods: {
    //获取表单权限的列表
    // getFormOperates(){
    //   let res = []
    //   this.isApproverNode() && (res = this.approverForm.formOperates)
    //   this.isStartNode() && (res = this.startForm.formOperates)
    //   return res
    // },
    resetOrgColl(){
      for(let key in this.orgCollection){
        this.$set(this.orgCollection, key, [])
      }
    },
    //审批人的时候涉及到的方法
    onOrgChange(data){ },
    //处理时间表单的时长
    timeTangeLabel(item){
      const index = ['fc-time-duration','fc-date-duration'].findIndex(t => t === item.tag)
      if(index > -1){
        return '时长' + ['(小时)','(天)'][index]
      }else{  
        return item.label
      }
    },
    //设置审批人的时候获取他的title
    getAssignTypeLabel(){
      const res = this.assigneeTypeOptions.find(t => t.value === this.approverForm.assigneeType)
      return res ? res.label : ''
    },
    //表单权限改变
    // changeAllFormOperate(val){
    //   const target = this.isStartNode() ? this.startForm : this.approverForm
    //   target.formOperates.forEach(t => t.formOperate = val)
    // },
    // 是否可以显示当前条件组件
    couldShowIt(item, ...tag) {
      return tag.includes(item.fieldType)  && this.showingPCons.includes(item.field);
    },
    //初始化节点的表单权限（即formOperates字段）
    // initFormOperates(target){
    //   const formOperates = target.properties && target.properties.formOperates || []
    //   // 自定义组件不加入权限控制
    //   const res = []
    //   const defaultType = this.isApproverNode() ? 1 : 2 // 操作权限 0 隐藏 1 只读 2 可编辑
    //   const getPermissionById = id => {
    //     const permission = formOperates.find(t => t.formId === id)
    //     return permission !== undefined ? permission.formOperate : defaultType
    //   }
    //   const format = (list, parentName = '') => list.map(t => {
    //     const data = {
    //         formId: t.formId, 
    //         required: t.required,
    //         label: parentName ? [parentName, t.label].join('.') : t.label, 
    //         formOperate: getPermissionById(t.formId)
    //     }
    //     res.push(data)
    //     Array.isArray(t.children) && format(t.children, t.label)
    //   })
    //   const formItems = this.$store.state.formItemList.filter(t => t.cmpType !== 'custom')
    //   format(formItems)
    //   return res
    // },
    //获取当前节点的数据信息 （给data里的properties赋值当前节点下的properties,目前没有用到）
    initCopyNode () {
      this.properties = this.value.properties
    },
    //处理开始节点的发起人(initInitiator)和表单权限(formOperates)
    initStartNodeData(){
      this.initInitiator()
      // this.startForm.formOperates = this.initFormOperates(this.value)
    },
    //抄送节点--点击确认按钮
    copyNodeConfirm () {
      console.log("this.properties.menbers",this.properties.menbers)
      let users=[]
        Object.keys(this.properties.menbers)&&Object.keys(this.properties.menbers).forEach(key=>[
          users =this.properties.menbers[key].map(t=>t.id)
        ])
      let copyConfig={
        users:users,//----------------
        allowSelfChoose:this.properties.userOptional
      }
      console.log("抄送-confirm",this.properties)
      this.$emit("confirm", this.properties, this.getOrgSelectLabel('copy') || '发起人自选','copyNode',copyConfig);
      this.visible = false;
    },

    /**
     * 条件节点确认保存得回调
     */
    conditionNodeComfirm() {
      // console.log('pconditions',this.pconditions)
      let nodeContent = ''
      const conditions = []
      this.showingPCons
      .map(fid => this.pconditions.find(t => t.field === fid))
      .forEach((t)=> {
        // console.log("ttttt",t)
        if(!t) return // 发起人条件时 t 为空 发起人在其他地方获取
        const cValue = t.conditionValue
        if(cValue === undefined || cValue === null){
          return 
        }
        const numberTypeCmp = ['el-input-number','fc-date-duration','fc-time-duration','fc-amount', 'fc-calculate','number']
        if(numberTypeCmp.includes(t.fieldType)){
          if(cValue.type === 'bet'){
            const numVal = cValue.value
            nodeContent += `[${numVal[0]} ${rangeType[numVal[1]]} ${t.fieldName} ${rangeType[numVal[2]]} ${numVal[3]}] ` + '\n'
          }else{
            nodeContent +=  `[${t.fieldName} ${rangeType[cValue.type]} ${cValue.value}] ` + '\n'
          }
        }else if(t.fieldType === 'fc-org-select'){
          const index = this.pconditions.findIndex(p => p.field === t.field)
          const labels = this.$refs['org' + index][0].selectedLabels
          nodeContent += `[${t.fieldName} = ${labels}] ` + '\n'
        }else if(t.fieldType === 'el-select'){
          var activeObj = t.option.find((cur)=>cur.value==cValue)
          nodeContent +=  `[${t.fieldName} = ${activeObj.label}] ` + '\n'
        }else{
          nodeContent +=  `[${t.fieldName} = ${cValue}] ` + '\n'
        }
        const res = { field: t.field, conditionValue: cValue,fieldType:t.fieldType,fieldName:t.fieldName}
        conditions.push(res)
      }, [])
      console.log("conditions",conditions)
      this.properties.conditions = conditions
      // 发起人虽然是条件 但是这里把发起人放到外部单独判断
      // this.properties.initiator = this.initiator['dep&user']
      this.properties.initiator = this.initiator
      // console.log("发起人----",this.initiator)
      this.initiator['dep&user'] && (nodeContent = `[发起人: ${this.getOrgSelectLabel('condition')}]` + '\n' + nodeContent)
      let conditionConfigs= [{
        field: "userId",
        fieldName:'提交人',
        fieldType: "string",
        operator: "=",
        value: []//---------------------
      }, {
        field: "departDetailId",
        fieldName:'提交部门',
        fieldType: "string",
        operator: "=",
        value: []
      },{
        field: "staffLevelId",
        fieldName:'职级',
        fieldType: "string",
        operator: "=",
        value: []
      }
      ]; 
      this.properties.initiator&&this.properties.initiator['dep&user'].forEach(item=>{
        if(item.hasOwnProperty('realName')){
          conditionConfigs[0].value.push(item.id)
          // userIdVal.push(item.id)
        }else{
          conditionConfigs[1].value.push(item.id)
          // departDetailIdVal.push(item.id)
        }
      }) 
      this.properties.initiator['role'].forEach(item=>{
        conditionConfigs[2].value.push(item.id)
      })
      conditionConfigs[0].value=conditionConfigs[0].value.join()
      conditionConfigs[1].value=conditionConfigs[1].value.join()
      conditionConfigs[2].value=conditionConfigs[2].value.join()
      conditions.forEach(item=>{
        let obj ={
          field:item.field,
          fieldName:item.fieldName,
          fieldType:item.fieldType
        }
        if(item.fieldType == 'number'&&item.conditionValue.type !='bet'){
          obj.operator=rangeTypeParams[item.conditionValue.type];
          obj.value=item.conditionValue.value;
          conditionConfigs.push(obj)
        }else if(item.fieldType=='el-select'){
          obj.operator='==';
          obj.value=item.conditionValue;
          conditionConfigs.push(obj)
        }else{
          let objBet =Object.assign({},obj) 
          obj.operator=rangeTypeParams[item.conditionValue.value[1]]
          obj.value=item.conditionValue.value[0];
          conditionConfigs.push(obj)
          objBet.operator=rangeTypeParams[item.conditionValue.value[2]]
          objBet.value=item.conditionValue.value[3];
          conditionConfigs.push(objBet)
        }
      })
      conditionConfigs=conditionConfigs.filter(cur=>{
        return cur.value!==''
      })
      this.$emit("confirm", this.properties, nodeContent || '请设置条件','conditionNode',conditionConfigs);
      this.visible = false;
    },
    //返回当前选择的人/部门/公司的文字
    getOrgSelectLabel (type) {
      return this.$refs[type + '-org']['selectedLabels']
    },
    /**
     * 开始节点确认保存
     */
    startNodeComfirm() {
      this.properties.initiator = this.initiator['dep&user']
      // const formOperates = this.startForm.formOperates.map(t=>({formId: t.formId, formOperate: t.formOperate}))
      // Object.assign(this.properties, {formOperates})
      this.$emit("confirm", this.properties, this.getOrgSelectLabel('start') || '所有人');
      this.visible = false;
    },
    /**
     * 审批节点确认保存
     */
    approverNodeComfirm() {
      const assigneeType = this.approverForm.assigneeType
      let content = ''
      if (['optional','myself'].includes(assigneeType)) {
        content = this.assigneeTypeOptions.find(t => t.value === assigneeType).label
      } else if('director' === assigneeType){
        content = this.directorLevel === 1 ? '直接主管' : `第${this.directorLevel}级主管`
      } else{
        content = this.getOrgSelectLabel('approver')
      }
      // const formOperates = this.approverForm.formOperates.map(t=>({formId: t.formId, formOperate: t.formOperate}))
      this.approverForm.approvers = this.orgCollection[assigneeType]
      // Object.assign(this.properties, this.approverForm, {formOperates})
      Object.assign(this.properties, this.approverForm)
      //新增的审批人节点的配置信息用于生成bpmn文件的配置
      let assigneeTypeIndex =this.assigneeTypeOptions.findIndex((item)=>item.value==assigneeType)
      let users=[]
      let staffLevelList =[]
      if(this.assigneeTypeOptions[assigneeTypeIndex].id == 5){
        staffLevelList = this.properties.approvers && this.properties.approvers.map(t=>t.id)
      }else{
        users= this.properties.approvers && this.properties.approvers.map(t=>t.id)
      }
      this.approverConfig={
        type:this.assigneeTypeOptions[assigneeTypeIndex].id,//审批人类型（assigneeType）
        signType:this.properties.counterSign ? 'and' :'or',//会签/或签
        users:users,//审批人列表：type=1即指定成员时生效-------------------
        staffLevel:staffLevelList,//type=5即角色/职级时生效
        grade:this.directorLevel,//主管级别：type=2即主管生效(1-N)
        gradeNext:this.useDirectorProxy,//找不到主管时，由上级主管代审批标记
        allowMulti:this.properties.optionalMultiUser//允许选择多人
      }
      this.$emit("confirm", this.properties, content || '请设置审批人','approverNode',this.approverConfig)
      this.visible = false
    },
    // 确认修改
    confirm() {
      this.isCopyNode() && this.copyNodeConfirm()
      this.isStartNode() && this.startNodeComfirm()
      this.isApproverNode() && this.approverNodeComfirm()
      this.isConditionNode() && this.conditionNodeComfirm() 
    },
    // 关闭抽屉
    cancel() {
      setTimeout(()=>{
        this.$emit("cancel");
        this.visible = false;
      }, 0)
    },
    /**
     * 删除流程条件
     */
    onDelCondition(condition){
      const index = this.showingPCons.findIndex(id => id === condition.field)
      if(index > -1){
        this.showingPCons.splice(index, 1)
        this.pconditions.find(t => t.field === condition.field).conditionValue = undefined
      }
    },
    // 配合getPriorityLength 获取前一个节点条件数组长度 用于设置优先级
    getPrevData() {
      return NodeUtils.getPreviousNode(this.value.prevId, this.processData);
    },
    // 用于获取节点优先级范围
    getPriorityLength() {
      this.priorityLength = this.getPrevData().conditionNodes.length;
    },
    // 判断是否是条件节点
    isConditionNode() {
      return this.value ? NodeUtils.isConditionNode(this.value) : false;
    },
    /** 判断是否是审批节点*/
    isApproverNode(){
      return this.value ? NodeUtils.isApproverNode(this.value) : false;
    },
    /** 判断是否是开始节点*/
    isStartNode(){
      return this.value ? NodeUtils.isStartNode(this.value) : false;
    },
    /** 判断是否是抄送节点*/
    isCopyNode () {
      return this.value ? NodeUtils.isCopyNode(this.value) : false
    },
    //初始化发起人
    initInitiator(){
      const initiator = this.value.properties && this.value.properties.initiator
      this.initiator['dep&user'] = Array.isArray(initiator) ? initiator : []
    },
    /**
     * 初始化审批节点所需数据
     */
    initApproverNodeData() {
      for (const key in this.approverForm) {
        if (this.value.properties.hasOwnProperty(key)) {
          this.approverForm[key] = this.value.properties[key];
        }
      }
      const approvers = this.approverForm.approvers
      this.resetOrgColl()
      if (Array.isArray(this.approverForm.approvers)) {
        this.orgCollection[this.approverForm.assigneeType] = approvers
      }
      // this.approverForm.formOperates = this.initFormOperates(this.value)
    },
    /**
     * 初始化条件节点数据
     */
    initConditionNodeData(){
      // 初始化条件表单数据
      let nodeConditions = this.value.properties && this.value.properties.conditions
      //获取要选择条件弹窗里要显示的条件
      // this.pconditions = JSON.parse(JSON.stringify(this.$store.state.processConditions));
      // this.initiator['dep&user'] = this.value.properties.initiator
      this.initiator= this.value.properties.initiator
      if(Array.isArray(this.pconditions)){
        this.showingPCons = [-1] // 默认显示发起人
        this.pconditions.forEach(t => {
          let temp = undefined
          if(Array.isArray(nodeConditions)){
            const con = nodeConditions.find(item => item.field == t.field)
            con && con.conditionValue && (temp = con.conditionValue, this.showingPCons.push(t.field))
          }
          //用于抽屉里的条件展示的值
          this.$set(t, 'conditionValue', temp)
        })
      }
    },
    getCondition(){
      // let accountbookId = window.localStorage.getItem('accountbookId')||'0053';
      // let billType =window.localStorage.getItem('billType')||2;
      let accountbookId = window.localStorage.getItem('accountbookId');
      let billType =window.localStorage.getItem('billType');
      getField(accountbookId,billType).then(res=>{
        if(res.data !=''){
          this.pconditions = JSON.parse(res.data)
        }
      })
    },
  },
  watch: {
    visible(val) {
      if (!val) {
        this.approverForm = JSON.parse(JSON.stringify(defaultApproverForm)) // 重置数据为默认状态
        return
      }
      // this.processData.properties.formOperates = 
      //   this.initFormOperates(this.processData)
      //   .map(t=>({formId: t.formId, formOperate: t.formOperate}))
      this.isStartNode() && this.initStartNodeData()
      this.isApproverNode() && this.initApproverNodeData()
      this.isConditionNode() && this.initConditionNodeData()
    },
    value(newVal) {
      if (newVal && newVal.properties) {
        this.visible = true;
        this.properties = JSON.parse(JSON.stringify(newVal.properties));
        if (this.properties) {  
          NodeUtils.isConditionNode(newVal) && this.getPriorityLength();
        }
      } 
    }
  },
  components: {
    "num-input": NumInput,
    "row-wrapper": RowWrapper
  }
};
</script>
<style lang="stylus">
.condition-dialog {
  .el-dialog__header{
    border-bottom : 1px solid #eee;
  }
}

</style>
<style lang="stylus" scoped>
.drawer {
  >>> .el-drawer__header {
    margin-bottom: 0;
    border-bottom: 1px solid #c5c5c5;
    padding-bottom: 8px;
  }

  >>> .el-drawer__body {
    padding-bottom: 44px;
    overflow: hidden;
  }

  .pane-tab{
    height: 100%;
  }

  .pane-tab >>>  .el-tabs__item.is-top:nth-child(2) {
    padding-left: 20px;
  }

  >>> .el-tabs__item:focus{
    box-shadow: none !important;
  }

  >>> .el-tabs__header {
    margin-bottom: 0;
  }
}

.header {
  line-height: 28px;
}

.actions {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 6px 12px;
  width: 100%;
  box-sizing: border-box;
  text-align: right;
}

.radio-item {
  width: 130px;
  // width: 220px;
  padding: 6px;
}

.priority-select {
  width: 118px;
  position: absolute;
  right: 26px;
}

.form-auth-table{
  font-size: 14px;
  .auth-table-header{
    background: #fafafa
    line-height: 40px;
  }
  .row{
    display: flex;
    align-items: center;
    line-height: 32px;
    padding: 8px 12px;
    border-bottom: 1px solid #efefef;
    &:hover{
      background: #f5f7fa;
    }
    .label{
      flex:1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .required{
        color: #f2725e;
      }
    }
    .radio-group{
      flex: 2;
      display: flex;
      justify-content: space-between;
    }
  }
}

.approver-pane{
  overflow-y: scroll;
  overflow-x: hidden; 
  .option-box {
    font-size 14px
    padding-left 1rem
  }
}

.condition-pane{
  height 100%
  overflow scroll
}
</style>