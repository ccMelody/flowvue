import request from '@/axios';

// 流程图的数据
export const getProcessData = (accountbookId,billType,templateId) => {
  return request({
    url:  'oaBillConfigController.do?getProcessConfig',
    method: 'get',
    params:{
      accountbookId,
      billType,
      templateId
    }
  })
}

//获取条件
export const getField = (accountbookId,billType,templateId) => {
  return request({
    url: 'oaBillConfigController.do?getFieldConfig',
    method: 'get',
    params:{
      accountbookId,
      billType,
      templateId
    },
  })
}

//保存数据
export const saveData = (accountbookId, billType, templateId, data) => {
  return request({
    url:'oaBillConfigController.do?saveProcessConfig',
    method:'post',
    params:{
      accountbookId,
      billType,
      templateId
    },
    data:data
  })
}

//获取部门
export const getDept =(accountbookId)=>{
  return request({
    url:"newDepartDetailController.do?treeList",
    method:"get",
    params:{
      accountbookId
    }
  })
}
//获取部门下的人员
export const getUsersByDept = (departDetailId)=>{
  return request({
    url:"newDepartDetailController.do?userListByDepartDetailId",
    method:"get",
    params:{
      departDetailId
    }
  })
}
//搜索查询人员
export const getUsersBySearch = (accountbookId,userName)=>{
  return request({
    url:'newDepartDetailController.do?userListByUserName',
    method:"get",
    params:{
      accountbookId,
      userName,
    }

  })
}

//获取职级列表
export const getStaffLevelList =(params)=>{
  return request({
    url:"staffLevelController.do?getListForOA",
    method:"get",
    params:{
      ...params
    }
  })
}