
<template>
  <section
    v-if="show" 
    class="h-transfer" 
    :class="[tabConfig.length == 1 ? 'single-tab' : '']" >
    <div class="mask"></div>
    <!-- 内容面板 -->
    <div class="transfer__content">
      <!-- 面板顶部标题 -->
      <header class="transfer__header">
        <i class="el-icon-monitor"></i>
        {{ title }}
        <i class="el-icon-close" @click="closeTransfer" ></i>
      </header>
      <!-- 穿梭框主要内容 -->
      <div class="transfer__body">
        <!-- 左边穿梭框 -->
        <div class="transfer-pane">
          <div class="transfer-pane__tools">
            <el-input
              v-model="searchString"
              class="search-input"
              size="mini"
              style="width: 180px;"
              type="search"
              placeholder="搜索..."
              :disabled="!searchable"
            ></el-input>
            <span>
              <span style="margin-right: 1rem;font-size: 14px;">{{ selectedNum }} / {{ maxNum }}</span>
              <el-tooltip placement="top" content="清空">
                <i class="el-icon-delete" @click="removeAll"></i>
              </el-tooltip>
            </span>
          </div>
          <el-scrollbar class="transfer-pane__body shadow right-pane">
            <template v-for="type in tabKeys">
              <div
                v-for="(item, index) in selectedData[type]"
                :key="type + index"
                class="selected-item">
                <span>
                  <!-- <i v-if="item.deptName" class="iconfont iconbumen"></i>
                  <i v-else class="iconfont iconyuangong"></i> &nbsp; -->
                  <span>{{ getNodeProp(item, 'label') }}</span>
                </span>
                <i
                  class="el-icon-delete"
                  @click="removeData(item, type)"
                ></i>
              </div>
            </template>
            <template v-for="type in tabKeys">
              <div
                v-for="(item, index) in aloneCheckedData[type]"
                :key="'alone' + type + index"
                class="selected-item"
              >
                <span>
                  <!-- <i v-if="item.deptName" class="iconfont iconbumen"></i>
                  <i v-else class="iconfont iconyuangong"></i> &nbsp; -->
                  <span>{{ getNodeProp(item, 'label') }}</span>
                </span>
                <i
                  class="el-icon-delete"
                  @click="removeData(item, type, true)"
                ></i>
              </div>
            </template>
          </el-scrollbar>
          <footer class="transfer__footer">
            <el-button type="primary" plain size="mini" @click="confirm" >确定</el-button >
            <el-button plain size="mini" @click="closeTransfer">取消</el-button>
          </footer>
        </div>
        <!-- 右边穿梭框 -->
        
        <div class="transfer-pane">
          <!-- 操作栏 -->
          <!-- <div class="transfer-pane__tools">
            
          </div> -->
          <!-- 穿梭框 -->
          <div class="transfer-pane__body" style="height: 370px;">
            <div class="enough-mask" v-show="isEnough">
              <span class="p-center">最多选择{{ maxNum }}项</span>
            </div>
            <!-- 搜索查询的结果 -->
            <div
              class="searchResPane"
              :class="{ active: searchMode }"
              v-loading="searchLoading" >
              <div class="hidden-tag" @click="searchString = ''">关闭</div>
              <div v-if="tabConfig.length==1 && activeTabName == 'role' ">
                <div v-for="(item, index) in searchRes" :key="index" class="item" @click="handleNodeClick(item)">
                  <div>
                    <div>{{ getNodeProp(item, 'label') }}</div>
                  </div>
                </div>
              </div>
              <div v-else>
                <div v-for="(item, index) in searchRes" :key="index" class="item" @click="searchItemClick(item)">
                  <div>
                    <div>{{ getNodeProp(item, 'label') }}</div>
                    <div class="text-ellipsis search-res-tip" >
                      {{ getNodeProp(item, 'searchResTip') }}
                    </div>
                  </div>
                  <el-checkbox v-model="item.checked" @change="checked => checked ? addData(item) : removeData(item, activeTabName, true)" @click.stop.native="()=>{}"></el-checkbox>
                </div>
              </div>
            </div>  
            <!-- 手动选择的人员tree -->
            <el-scrollbar style="height:100%;">
              <el-tabs
                v-model="activeTabName"
                type="border-card"
                style="min-height: 370px;"
              >
                <el-tab-pane v-for="(tab_item, idx) in tabConfig" :name="tab_item.tabKey" :label="tab_item.tabName" :key="idx">
                  <el-tree
                    :ref="tab_item.tabKey"
                    lazy
                    :show-checkbox="tabConfig.length==1 && tab_item.tabKey == 'role' ? false : true"
                    :props="{
                      children: tab_item.children,
                      label: tab_item.label,
                      isLeaf: tab_item.isLeaf,
                      disabled: tab_item.disabled
                    }"
                    :load="(node,resolve)=>onLoad(node,resolve,tab_item.tabKey)"
                    node-key="nodeId"
                    :check-strictly="true"
                    @node-click="handleNodeClick"
                    @check-change="(data, checked) => onCheckChange(data, checked, tab_item.tabKey)"
                  >
                  </el-tree>
                </el-tab-pane>
              </el-tabs>
            </el-scrollbar>
          </div>
        </div>
      </div>
      
    </div>
  </section>
</template>

<script>
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-debugger */
/* eslint-disable no-return-assign */
/* eslint-disable handle-callback-err */
import { getDept} from '@/api'
import { DEP_CONFIG, ROLE_CONFIG, CONFIG_LIST } from './config.js'
import { debounce ,handlereduce} from '@/utils/index.js'
import ElTree from "@/lib/tree/src/tree.vue";
export default {
  name: 'fc-org-transfer',
  components: {ElTree},
  props: {
    // v-model 已经选择过的数据 用于回显
    value: {
      type: Object,
      default: () => ({})
    },
    // 字符串数组使用配置文件的预设值
    // 对象数组需要包含 key/conf 两个属性 conf 会覆盖对应key的默认配置
    tabList: {
      type: Array,
      default: () => ['dep', 'role']
    },
    title: {
      type: String,
      default: '组织机构'
    },
    show: {
      type: Boolean,
      reuired: true
    },
    // 是否支持模糊查询
    searchable: {
      type: Boolean,
      default: true
    },
    // 可选择的最大数量
    maxNum: {
      type: Number,
      default: 99
    }
  },
  data () {
    
    return {
      searchRes: [],  // 搜索后的结果
      selectedData: [],   // 用户手动选择的节点(在tree里面已经显示的节点)
      aloneCheckedData: [], // 已有的 但是未在tree中渲染的数据 例如回显时的数据
      isEnough: false,  // 是否选择了足够的人数
      searchString: '',  //搜索的关键词
      searchMode: false,  // 是否展示搜索面板
      searchLoading: false, 
      activeTabName: '',//默认获取tabKeys的第一个类型，右侧展示的title
      tabConfig: [],
      tabKeys: [],//选择的人员的类型：指定成员,主管,发起人自己,发起人自选
    }
  },
  computed: {
    selectedNum () {
      let num = 0
      for (const key of this.tabKeys) {
        const data1 = this.selectedData[key]
        data1 && data1.length && (num += data1.length)
        const data2 = this.aloneCheckedData[key]
        data2 && data2.length && (num += data2.length)
      }
      return num
    }
  },
  mounted () {
     //判断选择人数
    this.isNumEnough()
    this.debounceSearch = debounce(this.searchDepUser, 500)
  },
  methods: {
    //tab切换的el-tree的加载（没用到）
    handleTabClick(){

      // this.node_had = node;//这里是关键！在data里面定义一个变量，将node.level == 0的node存起来
      // this.resolve_had = resolve;//同上，把node.level == 0的resolve也存起来

      this.node_had.childNodes = [];//把存起来的node的子节点清空，不然会界面会出现重复树！
      this.onLoad(this.node_had, this.resolve_had);//再次执行懒加载的方法
    },
    //组织架构的数据懒加载
    onLoad (node, resolve,activeTabKey) {
      const subDepartList=node.data && node.data.subDepartList || [];
      subDepartList.length>0&&subDepartList.forEach(item=>{
        item.nodeId=item.id
      })
      const conf= this.tabConfig.find(t => t.tabKey === activeTabKey)
      // load 方法返回一个promise
      conf.onload(node).then(res => {
        if(conf.tabKey=='role'){
        let nodes = res.map( t => ( { nodeId: conf.nodeId(t), ...t } ) )
          nodes=[...nodes]
          resolve(nodes)
        }else{
          let nodesOther = res.map( t => ( { nodeId: conf.nodeId(t), ...t } ) )
          nodesOther=[...subDepartList,...nodesOther]
          resolve(nodesOther)
        }
      
        // for (const tabKey of this.tabKeys) {
        //   const tree = this.$refs[tabKey][0]
        //   this.selectedData[tabKey].forEach(data => {
        //     // tree.setChecked(data.nodeId, true)
        //     tree.setMyChecked(data, true, true);
        //   })
        // }
          const tree = this.$refs[activeTabKey][0]
          this.selectedData[activeTabKey].forEach(data => {
            tree.setMyChecked(data, true, true);
          })
      }).then(res=>{
        const tree = this.$refs[activeTabKey][0];
        this.aloneCheckedData[activeTabKey].forEach(data => {
          tree.setMyChecked(data, true, true);
        })
        // for (const tabKey of this.tabKeys) {
        //   const tree = this.$refs[tabKey][0]
        //   this.aloneCheckedData[tabKey].forEach(data => {
        //     // tree.setChecked(data.nodeId, true)
        //     tree.setMyChecked(data, true, true);
        //   })
        // }
      })
    },
    //通过关键字检索到的用户
    searchDepUser () {
      if (!this.searchString) {
        this.searchRes = []
        return
      }
      this.searchLoading = true
      const activeConfig = this.getActiveConf()
      new Promise((resolve, reject) => {
        activeConfig.onsearch(this.searchString, resolve, reject)
      })
        .then(res => {
          //获取查询结果
          this.searchRes = res.map(t => ({ nodeId: activeConfig.nodeId(t),checked:false, ...t }))
          //根据选中和查询结果做对比，已选中的添加选中状态
          const allSelectData = {}
          for (const type of this.tabKeys) {
            allSelectData[type] = this.selectedData[type].concat(this.aloneCheckedData[type])
          }
          for (const item in allSelectData){
            allSelectData[item].forEach(i=>{
              this.searchRes.forEach(j=>{
                if(i.nodeId===j.nodeId){
                  j.checked=true
                }
              })
            })
          }
            
        })
        .catch(err => console.warn(err))
        .finally(() => this.searchLoading = false)
    },
    //单独处理当为审批人时并且选择的职级(角色)选项的时候选中数据的操作
    handleNodeClick(data){
      if(this.tabConfig.length==1 && this.tabConfig[0].tabKey == 'role'){
        console.log("role",data)
        this.$set(this.selectedData, this.activeTabName,[data])
      }
    },
    //选中/取消选中的
    onCheckChange (data, checked, tabKey) {
      this.activeTabName = tabKey
      const index = this.aloneCheckedData[tabKey].findIndex(t => t.nodeId === data.nodeId)
      if (index > -1) {
        this.aloneCheckedData[tabKey].splice(index, 1)
      }
      this.$nextTick(() => {
        const tree = this.$refs[tabKey][0]
        let nodes = tree.getCheckedNodes().map(t => {
          !t.nodeId && (t.nodeId = this.getNodeProp(t, 'nodeId', this.activeTabName))
          return t
        })
        tree.setMyChecked(data, checked, true);
        nodes = handlereduce(nodes,'id');//去除添加的相同用户
        this.$set(this.selectedData, this.activeTabName,nodes )
        this.isNumEnough()
        this.$forceUpdate()
      })
    },
    //点击整条list添加选中或者取消状态
    searchItemClick(item){
      if(item.checked){
        item.checked=false
        this.removeData(item, this.activeTabName, true)
      }else{
        item.checked=true;
        this.addData(item)
      }
    },
    //添加检索后的数据添加到左侧
    addData (data) {
      const tabKey = this.activeTabName;
      const tree = this.$refs[tabKey][0];//获取tree
      // tree.setChecked(data.nodeId, true);//给当前选中的用户设置选中状态（在组织架构中设置）
      tree.setMyChecked(data, true, true);//给当前选中的用户设置选中状态
      console.log('getChecked',tree.getCheckedKeys(data))
      !tree.getCheckedKeys(data).includes(data.nodeId)
      && !this.aloneCheckedData[tabKey].find(t => t.nodeId === data.nodeId)
      && this.aloneCheckedData[tabKey].push(data)
      
      //相同的都设置选中状态（在搜索的结果页面中设置）
      this.searchRes.forEach(j=>{
        if(data.nodeId===j.nodeId){
          j.checked=true
        }
      })
    },
    //删除选中的数据
    removeData (data, tabKey, fromAloneData = false) {
      if (fromAloneData) {
        const index = this.aloneCheckedData[tabKey].findIndex(t => t.nodeId === data.nodeId)
        index > -1 && this.aloneCheckedData[tabKey].splice(index, 1)
        this.$refs[tabKey][0].setMyChecked(data, false, true);
      } else {
        //当为审批人选择职级时删除当前选择的数据
        if(this.tabConfig.length==1 && this.tabConfig[0].tabKey == 'role'){
          this.selectedData.role = []
        }
        // this.$refs[tabKey][0].setChecked(data.nodeId, false)  // 触发onCheckChange
        this.$refs[tabKey][0].setMyChecked(data, false, true);
      }
      this.searchRes.forEach(j=>{
        if(data.nodeId===j.nodeId){
          j.checked=false
        }
      })
    },
    //清空选中的数据
    removeAll () {
      for (const type of this.tabKeys) {
        const tree = this.$refs[type][0]
        tree.getCheckedKeys().forEach(key => {
          tree.setCheckedKeys([])
        })
        this.selectedData[type] = []
        this.aloneCheckedData[type] = []
      }
    },
    //是否选择了足够的人数
    isNumEnough () {
      let count = 0
      for (const type of this.tabKeys) {
        count += this.selectedData[type].length
        count += this.aloneCheckedData[type].length
      }
      this.isEnough = count >= this.maxNum
    },
    //关闭人员的弹窗
    closeTransfer () {
      this.$emit('update:show', false)
      this.tabKeys = []
      this.isEnough = false
      this.searchString = ''
    },
    //确定选择的人员数据
    confirm () {
      const res = {}
      for (const type of this.tabKeys) {
        res[type] = this.selectedData[type].concat(this.aloneCheckedData[type])
      }
      console.log("people-data",res)
      this.$emit('confirm', res)
      this.closeTransfer()
    },

    getActiveConf(tabKey){
      const target = tabKey || this.activeTabName
      return this.tabConfig.find(t => t.tabKey === target)
    },

    getConfProp(propName, tabKey){
      const conf = this.getActiveConf(tabKey)
      return conf ? conf[propName] : null
    },

    getNodeProp(data, propName, tabKey){
      try{
        const prop = this.getConfProp(propName, tabKey)
        if(typeof prop === 'string'){
          return data[prop]
        }
        if(typeof prop === 'function'){
          return prop(data)
        }
      }catch(e){
        console.error(e)
        return '执行出错，可联系开发人员'
      }
    },
    //初始化数据
    dataInit(){
      this.aloneCheckedData = {}// 已有的 但是未在tree中渲染的数据 例如回显时的数据
      this.selectedData = {}//手动选择的用户数据
      this.tabConfig = []
      this.tabKeys = []//要展示的角色（dep,user,role,position,dep&user...）
      const getTabProp = tabItem => typeof tabItem === 'object' ? [tabItem.key, tabItem.config] : [tabItem, {}]
      const initDefaultData = (key, mergedConfig) => {
        this.tabConfig.push(mergedConfig)
        this.tabKeys.push(key)
        let  data = this.value && this.value[key] ? this.value[key] : []
        data = data.map(t => ({ nodeId: mergedConfig.nodeId(t), ...t }))
        this.$set(this.aloneCheckedData, key, data)

      }
      //tabList,人员类型：指定成员，主管，发起人自己，发起人自选
      this.tabList.forEach(item => {
        const [key, customConf] = getTabProp(item)
        this.$set(this.aloneCheckedData, key, [])
        this.$set(this.selectedData, key, [])
        const defaultConf = CONFIG_LIST.find(t => t.tabKey === key);//获取节点配置
        // console.log("defaultConf",customConf)
        defaultConf && initDefaultData(key, Object.assign({}, defaultConf, customConf))
      })
      this.activeTabName = this.tabKeys[0]
    },
  },
  watch: {
    searchString (newVal) {
      this.searchMode = !!newVal
      this.debounceSearch()
    },

    show: {
      handler: function (show) {
        if (show) {
          this.dataInit() 
          this.isNumEnough()
        }
      },
      immediate: true
    },

    tabList:{
      handler: function(val){
        this.dataInit() // tablist 比show 延后 
      },
      immediate: true,
      deep: true
    }
  }
}
</script>
<style lang="stylus">
.h-transfer{
  text-align: left;
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 2999;
  line-height: 32px;

  > .mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .el-tabs--border-card {
    box-shadow: none;
  }

  .el-tabs__content {
    overflow: visible;
    min-height: 250px;
  }

  .el-tabs__nav {
    width: 100%;
    display: flex;

    > .el-tabs__item {
      flex-grow: 1;
      text-align: center
    }
  }

  &.single-tab .el-tabs__item {
    text-align: center;
    background: #f5f7fa !important;
    border-bottom: 1px solid #e4e7ed;
    border-right-width: 0px;
  }

  .el-tree-node__content > label.el-checkbox {
    // position: absolute;
    // right: 0;
  }

  .searchResPane{
    position: absolute;
    overflow-y: auto;
    z-index: 99;
    left: 0;
    top: 100%;
    width: 100%;
    height: 100%;
    background: white;
    border: 1px solid #dcdfe6;
    transition: top .5s;



    &.active{
        top: 0;
    }

    .hidden-tag{
        color:#999;
        font-size:12px;
        text-align:right;
        padding-top:4px;
        padding-right:12px;
        cursor pointer

        &:hover{
            color: #66b1ff;
        }
    }

    .item{
        padding: 4px 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        line-height 1.5
        &:hover{
            background-color: #ecf5ff;
            color: #66b1ff;
            cursor: pointer;
        }

        .search-res-tip{
          font-size:12px;
          color:#999;
          max-width: 280px;
        }
    }
  }

  .enough-mask{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    color: white;
    font-size: 16px;
    z-index: 100;
    height: 100%;
    background: rgba(0,0,0,0.5);
    letter-spacing: 4px;
  }

  .p-center{
      position absolute
      top 50%
      left 50%
      transform translate(-50%, -50%)
  }

  .transfer__content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  background: white;
  overflow: hidden;
  border-radius: 4px;
}

.transfer__header {
  margin-bottom: 6px;
  background: #565656;
  padding: 6px 24px;
  color: white;
  .el-icon-close{
    cursor:pointer;
    float: right;
    margin-top: 10px;
  }
}


.transfer__body {
  padding: 12px 0;
  display: flex;
  justify-content: space-around;
}

.transfer-pane {
  width: 360px;
}
  .search-input  input{
    border: 1px solid #DCDFE6 !important;
    &:focus{
      border-color:#409EFF !important;
    }
  }

.transfer-pane__tools {
  margin-bottom: 10px;
  height: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;



  span:last-child {
    cursor: pointer;
  }
}

.transfer-pane__body {
  position relative
  width: 100%;
  height: 330px;
  overflow hidden
  font-size: 14px;

  >>> .el-scrollbar__view{
    height: 100%;
  }

  .el-tabs__item {
    height: 26px;
    line-height: 26px;
  }
}

.transfer-icons {
  display: flex;
  flex-direction: column;
  justify-content: center;

  i {
    margin-top: 20px;
    margin-bottom: 20px;
    cursor: pointer;
    font-size: 20px;
    color: #696969;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;

  .node-label {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
  }

  .node-checkbox {
    position: absolute;
    right: 0;
  }

  i {
    &:hover {
      color: #1485f8;
      cursor: pointer;
    }

    font-size: 10px;
  }
}

.right-pane {
  box-sizing: border-box;
  overflow-x: hidden;
  height: 290px;
  margin-bottom: 10px;

  .selected-item {
    padding: 0px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      background-color: #F5F7FA;
    }

    span {
      max-width: 90%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    i {
      &:hover {
        color: #1485f8;
        cursor: pointer;
      }
    }
  }
}

.dot{
  width: 2px;
  height: 2px;
  display: inline-block;
  border-radius: 50%;
  background: #4caf50;
}

  .text-ellipsis{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
