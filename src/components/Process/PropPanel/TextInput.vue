<template>
 <el-row :gutter="12">
   <el-col :span="12">
     <el-select
       v-model="cloneData.type"
       size="small"
       placeholder="请选择"
       style="width:100%;"
       @change="onTypeChange"
     >
       <el-option label="等于" value="eq"></el-option>
       <el-option label="包含" value="contains"></el-option>
     </el-select>
   </el-col>
   <el-col :span="12">
     <el-input
       size="small"
       style="width:100%;"
       v-model="cloneData.value"
       @change="update"
     ></el-input>
   </el-col>
 </el-row>
</template>
<script>
import RowWrapper from './RowWrapper'
export default {
  model: {
    prop: "value",
    event: "update"
  },
  props: ["value", "title"],
  components: {
    "row-wrapper": RowWrapper
  },
  data() {
    let cloneData = JSON.parse(JSON.stringify(this.value || {}));
    cloneData = Object.assign({ type: "eq", value: null }, cloneData);
    return {
      cloneData
    };
  },
  mounted(){
    this.update()
  },
  methods: {
    onTypeChange(newVal) {
      if (newVal === "bet") {
        this.cloneData.value = [1, "lt", "lt", 2];
      }
      this.update();
    },
    update() {
      this.$emit("update", this.cloneData);
    }
  }
};
</script>
<style lang="stylus" scoped>
// 三点省略 支持单行多行
// Mixin { n:Number } n：省略行数限制
ellipsis(n) {
  overflow: hidden;
  text-overflow: ellipsis;

  if (n > 1) {
    display: -webkit-box;
    -webkit-line-clamp: n;
    -webkit-box-orient: vertical;
  } else {
    white-space: nowrap;
  }
}

.cmp-container {
  line-height: 30px;
  padding: 10px;

  >>> .el-input--small .el-input__inner {
    padding-left: 10px;
    padding-right: 15px;
  }

  >>> .el-input-number.is-controls-right .el-input__inner {
    padding-left: 15px;
    padding-right: 0;
    text-align: left;
  }

  >>> .el-input:hover .el-input__inner {
    border-color: #529eff;
  }
}

.label {
  font-size: 12px;
  padding-right: 16px !important;
  ellipsis(2);
}

.range-title {
  font-size: 12px;
  text-align: center;
  ellipsis(1);
}

.icon-wrapper {
  i {
    cursor: pointer;
    color: #c5c5c5;

    &:hover {
      color: #333;
    }
  }
}
</style>