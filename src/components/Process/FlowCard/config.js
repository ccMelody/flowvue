export default {
  start: {
    type: "start",
    content: "所有人",
    properties: { title: '发起人', initiator: [] }
  },
  approver: {
    type: "approver",
    // content: "请设置审批人",
    // properties: { title: '审批人' },
    content: "发起人自选",
    properties:{
      approvers:[],
      assigneeType: "optional",
      counterSign: true,
      optionalMultiUser: false,
      title: "审批人"
    },
    approverConfig:{
      type:4,//审批人类型（assigneeType）
      signType:'and' ,//会签/或签
      users:[],//审批人列表：type=1即指定成员时生效
      grade:1,//主管级别：type=2即主管生效(1-N)
      gradeNext:true,//找不到主管时，由上级主管代审批标记
      allowMulti:false//允许选择多人
    }
  },
  copy:{
    type: 'copy',
    content: '发起人自选',
    properties: {
      title: '抄送人',
      menbers: [],
      userOptional: true
    },
    copyConfig: {users: [], allowSelfChoose: true}
  },
  condition: {
    type: "condition",
    content: "请设置条件",
    properties: { title: '条件', conditions: [], initiator: null }
  },
  branch: { type: "branch", content: "", properties: {} },
  empty: { type: "empty", content: "", properties: {} }
}