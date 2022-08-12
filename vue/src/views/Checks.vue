<template>
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
    :suppressRowClickSelection="true"
    @grid-ready="onGridReady"
  >
  </AgGridVue>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import CheckCell from '../components/cellRenderers/CheckCell.vue';
export default {
  name: 'ChecksView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    CheckCell,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
        },
        { field: 'fancyId', headerName: 'Id чека' },

        { field: 'credentials', headerName: 'Имя' },
        {
          field: 'locale',
          headerName: 'Язык',
          valueFormatter: (params) =>
            this.$ctable.locales.find((c) => c.value == params.value)?.title,
          sortable: true,
        },
        { field: 'phone', headerName: 'Номер' },

        {
          field: 'status',
          headerName: 'Статус чека',
          valueFormatter: (params) =>
            this.$ctable.check_statuses.find((c) => c.value == params.value)
              ?.title,
          sortable: true,
        },

        { field: 'createdAt', headerName: 'Дата регистрации', sortable: true },
        {
          field: 'action',
          headerName: '',
          cellRenderer: 'CheckCell',
        },
      ],

      gridApi: null,
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
      this.$http({ method: 'GET', url: `/v1/check/` }).then((res) => {
        this.rowData = res.data;
      });
      this.$emitter.on('view-check', (evt) => {
        const rowNode = this.gridApi.getRowNode(evt.id);
        rowNode.setData(evt);
      });
    },
  },
};
</script>
