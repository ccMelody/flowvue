flowData={
  type:'start',//节点类型 start  approver copy condition branch empty
  content:'',//流程的信息(卡片里面的输入的文字)
  nodeId:"",//节点ID
  //第一节点，开始节点的信息
  properties:{
    title:"发起人",//开始节点的title
    //表单操作权限集合
    formOperates:[{formId:'',formOperate:'',}],
    initiator:'',//start节点和condition节点需要
  },
  //条件节点
  conditionNodes:[
    {
      content:'',
      nodeId:'',
      prevId:'',
      type:"condition",
      properties:{
        conditions:[],//??
        isDefault:false,//布尔 是否可以调整优先级
        priority:1 ,//number ?
        title:''
      },
      childNode:{
        content:'',
        nodeId:'',
        prevId:'',
        type:"approver",
        properties:{
          assigneeType:'user',//设定审批人(参数：role,user.director,position,myself,optional)
          counterSign:true,//是否为会签
          optionalMultiUser:false,//审批类型为自选 出现 optionalMultiUser optionalRange
          optionalRange:"ALl",
          title:"",
          //审批人信息
          approvers:[
            {
              deptId: 1,
              nodeId: 20,
              userId: 20,
              realName: "张三"
            }
          ],
          formOperates:[]
        },
        approverConfig: {
          type: 1,//审批人类型：1=指定成员 2=主管 3=发起人自己 4=发起人自选 （assigneeType）
          signType: "and",//会签/或签 （counterSign）
          users: ["1", "2", "3"],//审批人列表：type=1即指定成员时生效
          grade: 1,//主管级别：type=2即主管生效(1-N)
          gradeNext: true,//找不到主管时，由上级主管代审批标记(true:找不到往上找，false:指点主管层级：type=2即主管生效)
          allowMulti: true,//允许选择多人：type=4即发起人自选时生效(false=不允许 true=允许) （optionalMultiUser）
        }
        
      }
    },
    {}
  ],
  //除开始节点和条件节点外的节点
  childNode:{
    
  },
  

};
billType=[{
  "fieldName": "报销金额",
  "field": "applicationAmount",
  "fieldType": "number"
 },
 {
  "fieldName": "核销借款金额",
  "field": "verificationAmount",
  "fieldType": "number"
 },
 {
  "fieldName": "支付金额",
  "field": "totalAmount",
  "fieldType": "number"
 }
]
