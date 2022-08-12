<template>
  <div>
    <div class="d-flex mb-2">
      <v-btn @click="deletePrize" size="small" color="error" variant="outlined"
        >Удалить выбранное</v-btn
      >
    </div>
    <AgGridVue
      style="height: 100vh"
      class="ag-theme-alpine"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :embed-full-width-rows="true"
      :animate-rows="true"
      :suppressCellFocus="true"
      :get-row-id="getRowId"
      :row-data="rowData"
      sizeColumnsToFit
      :animateRows="true"
      rowSelection="multiple"
      rowMultiSelectWithClick
      @grid-ready="onGridReady"
    >
    </AgGridVue>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
export default {
  name: 'PrizesView',
  components: {
    AgGridVue,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          headerCheckboxSelection: true,
          checkboxSelection: true,
        },
        { field: 'qr_payload', headerName: 'QR code' },
        {
          field: 'prizeId',
          headerName: 'Тип приза',
          valueFormatter: (params) =>
            this.$ctable.prizes.find((c) => c.value == params.value)?.title,
          sortable: true,
        },
        {
          field: 'action',
          headerName: '',
        },
      ],

      gridApi: null,
      columnApi: null,
      defaultColDef: {
        flex: 1,
      },
      getRowId: function (params) {
        return params.data.id;
      },
      rowData: [],
    };
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
      this.$http({ method: 'GET', url: `/v1/prize-value/` }).then((res) => {
        this.rowData = res.data;
      });
      this.$emitter.on('delete-prize', (ids) => {
        this.$http({
          method: 'DELETE',
          url: `/v1/prize-value?ids=${ids.join(',')}`,
        }).then(() => {
          setTimeout(
            () =>
              this.gridApi.applyTransaction({
                remove: ids.map((id) => this.gridApi.getRowNode(id)),
              }),
            0,
          );
        });
      });
    },
    deletePrize() {
      const selectedRows = this.gridApi.getSelectedRows();
      if (!selectedRows.length) return;
      const ids = selectedRows.map((c) => c.id);
      this.$emitter.emit('openDialog', {
        header: 'Удаление призов',
        message: 'Вы уверены, что хотите удалить призы?',
        eventName: 'delete-prize',
        id: ids,
      });
    },
  },
  mounted() {
    console.log('mounted');
  },
};
</script>
