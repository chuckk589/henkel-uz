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
    rowSelection="multiple"
    sizeColumnsToFit
    :animateRows="true"
    :suppressRowClickSelection="true"
    @grid-ready="onGridReady"
  >
  </AgGridVue>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import UserCell from '../components/cellRenderers/UserCell.vue';
export default {
  name: 'UsersView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    UserCell,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
        },
        { field: 'chatId', headerName: 'Telegram Id' },

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
          field: 'promo',
          headerName: 'Промо',
          valueFormatter: (params) =>
            this.$ctable.promotions.find((c) => c.value == params.value)?.title,
          sortable: true,
        },
        {
          field: 'role',
          headerName: 'Роль',
          valueFormatter: (params) =>
            this.$ctable.roles.find((c) => c.value == params.value)?.title,
          sortable: true,
        },
        {
          field: 'registered',
          headerName: 'Регистрация пройдена',
          valueFormatter: (params) => (params.value ? 'Да' : 'Нет'),
          sortable: true,
        },

        { field: 'createdAt', headerName: 'Дата регистрации', sortable: true },
        {
          field: 'action',
          headerName: '',
          cellRenderer: 'UserCell',
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
      console.log('grid ready');
      this.gridApi = params.api;
      this.$http({ method: 'GET', url: `/v1/user/` }).then((res) => {
        this.rowData = res.data;
      });
      this.$emitter.on('edit-user', (evt) => {
        const rowNode = this.gridApi.getRowNode(evt.id);
        rowNode.setData(evt);
      });
    },
  },
  mounted() {
    console.log('mounted');
  },
};
</script>
