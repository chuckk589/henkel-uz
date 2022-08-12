<template>
  <div>
    <div class="d-flex mb-2">
      <v-btn
        @click="addLottery"
        class="mr-2"
        size="small"
        color="success"
        variant="outlined"
        >Добавить розыгрыш</v-btn
      >
      <v-btn
        @click="deleteLottery"
        size="small"
        color="error"
        variant="outlined"
        >Удалить</v-btn
      >
    </div>
    <AgGridVue
      style="height: 100vh"
      class="ag-theme-alpine"
      :column-defs="columnDefs"
      :default-col-def="defaultColDef"
      :embed-full-width-rows="true"
      :master-detail="true"
      :animate-rows="true"
      :suppressCellFocus="true"
      :get-row-id="getRowId"
      :row-data="rowData"
      sizeColumnsToFit
      :detailCellRendererParams="detailCellRendererParams"
      @grid-ready="onGridReady"
    >
    </AgGridVue>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
import LotteryCell from '../components/cellRenderers/LotteryCell.vue';
import LotteryWinnerCell from '../components/cellRenderers/LotteryWinnerCell.vue';
export default {
  name: 'LotteryView',
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    LotteryCell,
    // eslint-disable-next-line vue/no-unused-components
    LotteryWinnerCell,
  },
  data() {
    return {
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
          checkboxSelection: true,
          cellRenderer: 'agGroupCellRenderer',
        },
        {
          field: 'start',
          headerName: 'Начало',
          valueFormatter: (params) =>
            new Date(params.value).toLocaleDateString(),
        },
        {
          field: 'end',
          headerName: 'Конец',
          valueFormatter: (params) =>
            new Date(params.value).toLocaleDateString(),
        },
        {
          field: 'status',
          headerName: 'Статус',
          valueFormatter: (params) =>
            this.$ctable.lottery_statuses.find((c) => c.value == params.value)
              ?.title,
          sortable: true,
        },
        {
          field: 'prize',
          headerName: 'Приз',
          valueFormatter: (params) =>
            this.$ctable.prizes.find((c) => c.value == params.value)?.title,
          sortable: true,
        },
        { field: 'primaryWinners', headerName: 'Основные победители' },
        { field: 'reserveWinners', headerName: 'Резервные победители' },
        {
          field: 'createdAt',
          headerName: 'Дата создания',
          valueFormatter: (params) =>
            new Date(params.value).toLocaleDateString(),
        },
        {
          field: 'action',
          headerName: '',
          cellRenderer: 'LotteryCell',
        },
      ],
      detailCellRendererParams: {
        detailGridOptions: {
          suppressCellFocus: true,
          columnDefs: [
            {
              headerName: 'ID',
              field: 'id',
            },
            {
              field: 'primary',
              headerName: 'Основной',
              valueFormatter: (params) => (params.value ? 'Да' : 'Нет'),
            },
            {
              field: 'confirmed',
              headerName: 'Подтвержден',
              valueFormatter: (params) => (params.value ? 'Да' : 'Нет'),
            },
            {
              field: 'notified',
              headerName: 'Уведомлен',
              valueFormatter: (params) => (params.value ? 'Да' : 'Нет'),
            },
            { field: 'prize', headerName: 'Приз' },
            { field: 'fancyId', headerName: 'Id чека' },
            { field: 'credentials', headerName: 'Имя' },
            { field: 'phone', headerName: 'Телефон' },
            {
              field: 'action',
              headerName: '',
              cellRenderer: 'LotteryWinnerCell',
              suppressFillHandle: true,
            },
          ],
          defaultColDef: {
            flex: 1,
          },
        },
        getDetailRowData: (params) => {
          params.successCallback(params.data.winners);
        },
      },
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
      this.$http({ method: 'GET', url: `/v1/lottery/` }).then((res) => {
        this.rowData = res.data;
      });
      this.$emitter.on('edit-lottery', (evt) => {
        const rowNode = this.gridApi.getRowNode(evt.id);
        rowNode.setData(evt);
      });
      this.$emitter.on('edit-winner', (evt) => {
        const row = this.rowData.find((c) =>
          c.winners.find((d) => d.id == evt.id),
        );
        const index = row.winners.findIndex((c) => c.id == evt.id);
        row.winners[index] = evt;
        setTimeout(() => {
          this.gridApi.applyTransaction({
            update: [row],
          });
        }, 0);
      });
      this.$emitter.on('new-lottery', (evt) => {
        setTimeout(() => this.gridApi.applyTransaction({ add: [evt] }), 0);
      });
      this.$emitter.on('new-winner', (evt) => {
        let rowNode = this.gridApi.getRowNode(evt.id);
        rowNode = evt;
        setTimeout(
          () => this.gridApi.applyTransaction({ update: [rowNode] }),
          0,
        );
      });
      this.$emitter.on('delete-winner', (id) => {
        this.$http({
          method: 'DELETE',
          url: `/v1/winner/${id}`,
        }).then(() => {
          const row = this.rowData.find((c) =>
            c.winners.find((d) => d.id == id),
          );
          const index = row.winners.findIndex((c) => c.id == id);
          row.winners.splice(index, 1);
          setTimeout(() => {
            this.gridApi.applyTransaction({ update: [row] });
          }, 0);
        });
      });
      this.$emitter.on('delete-lottery', (id) => {
        const rowNode = this.gridApi.getRowNode(id);
        this.$http({
          method: 'DELETE',
          url: `/v1/lottery/${id}`,
        }).then(() => {
          setTimeout(
            () => this.gridApi.applyTransaction({ remove: [rowNode] }),
            0,
          );
        });
      });
    },
    addLottery() {
      this.$emitter.emit('openModal', {
        url: `/lottery/`,
        method: 'POST',
        header: 'Создание лотереи',
        eventName: 'new-lottery',
        fields: [
          {
            label: 'Дата розыгрыша',
            key: 'start',
            type: 'date',
          },
          {
            label: 'Конец розыгрыша',
            key: 'end',
            type: 'date',
          },
          {
            key: 'prize',
            label: 'Что разыгрываем',
            type: 'select',
            value: this.$ctable.prizes[0].value,
            options: this.$ctable.prizes,
          },
        ],
      });
    },
    deleteLottery() {
      const selectedRows = this.gridApi.getSelectedRows();
      if (!selectedRows.length) return;
      this.$emitter.emit('openDialog', {
        header: 'Удалить розыгрыш',
        message: 'Вы уверены, что хотите удалить розыгрыш?',
        eventName: 'delete-lottery',
        id: selectedRows[0].id,
      });
    },
  },
  mounted() {
    console.log('mounted');
  },
};
</script>
