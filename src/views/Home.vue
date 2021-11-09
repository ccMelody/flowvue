<template>
  <div class="home">
    <el-row class="top-info">
      <el-col :span="22">表单管理</el-col>
      <el-col :span="2">
        <el-button icon="el-icon-plus" size="small" 
          type="primary" @click="addFllow"
        >创建新表单</el-button>
      </el-col>
    </el-row>
    <el-table border :data="tableData" class="list-box">
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="billtype" label="单据类型"></el-table-column>
      <el-table-column label="操作" width="120">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="text"
            @click="handleDel(scope.$index, scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tableData: [
        {
          id: "001",
          name: "方案1",
          billtypeId: "2",
          billtype: "我的开票申请单",
        },
      ],
    };
  },
  methods: {
    //添加一个新的表单
    addFllow() {
      this.$router.push("/approver");
    },
    //编辑
    handleEdit(row) {
      this.$router.push({
        path: "/approver",
        query: {
          id: row.id,
        },
      });
    },
    //删除
    handleDel(index, row) {
      this.$confirm("此操作将永久删除该表单, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.tableData.splice(index, 1);
        this.$message({
          type: "success",
          message: "删除成功!",
        });
      }).catch(() => {});
    },
  },
};
</script>
<style lang="stylus" scoped>
.top-info {
  width: 98%;
  margin: 0 auto;
  padding-top: 15px;
}
.list-box {
  width: 98%;
  margin: 10px auto;
}
</style>



