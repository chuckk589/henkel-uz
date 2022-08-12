<template>
  <v-card>
    <v-tabs v-model="current" fixed-tabs>
      <v-tab value="tab-new">Новая рассылка </v-tab>
      <v-tab value="tab-history"> История </v-tab>
    </v-tabs>
    <v-spacer></v-spacer>
    <v-window v-model="current">
      <v-window-item value="tab-new">
        <v-card>
          <v-card-content>
            <v-textarea
              v-model="text"
              rows="3"
              auto-grow
              density="compact"
              label="Наполнение"
            >
            </v-textarea>
            <div class="d-flex mb-2">
              <v-btn
                @click="addButton"
                class="mr-2"
                size="small"
                color="success"
                variant="outlined"
                >Добавить кнопку</v-btn
              >
              <v-btn
                @click="deleteButton"
                size="small"
                color="error"
                variant="outlined"
                >Удалить</v-btn
              >
            </div>
            <AgGridVue
              class="ag-theme-alpine mb-5"
              :column-defs="columnDefsB"
              :default-col-def="defaultColDef"
              :embed-full-width-rows="true"
              :animate-rows="true"
              :suppressCellFocus="true"
              :row-data="rowDataB"
              rowSelection="multiple"
              rowMultiSelectWithClick
              @grid-ready="onGridReadyB"
            ></AgGridVue>
            <v-file-input
              density="compact"
              label="Добавить изображения"
              accept="image/png, image/jpeg, image/bmp"
              filled
              v-model="files"
              prepend-icon="mdi-camera"
            ></v-file-input>
          </v-card-content>
        </v-card>
      </v-window-item>
      <v-window-item value="tab-history">
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
          @grid-ready="onGridReady"
        >
        </AgGridVue
      ></v-window-item>
    </v-window>
    <v-card-actions class="mt-auto">
      <v-btn
        color="primary"
        size="small"
        @click="createNotification"
        variant="outlined"
        >Создать</v-btn
      >
      <v-btn color="primary" size="small" variant="outlined"
        >Предпросмотр</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue3';
export default {
  name: 'NotificationsView',
  components: { AgGridVue },
  data() {
    return {
      current: 'tab-new',
      columnDefs: [
        {
          headerName: 'ID',
          field: 'id',
        },

        {
          field: 'status',
          headerName: 'Статус рассылки',
          valueFormatter: (params) =>
            this.$ctable.check_statuses.find((c) => c.value == params.value)
              ?.title,
          sortable: true,
        },
        { field: 'delivered', headerName: 'Фактически доставлено' },
        { field: 'expected', headerName: 'Колво ресипиентов' },
        { field: 'executeAt', headerName: 'Дата рассылки' },
        { field: 'createdAt', headerName: 'Дата создания' },
        {
          field: 'action',
          headerName: '',
          cellRenderer: 'CheckCell',
        },
      ],
      columnDefsB: [
        {
          headerName: 'Текст',
          field: 'text',
          editable: true,
          checkboxSelection: true,
          headerCheckboxSelection: true,
        },
        {
          headerName: 'Ссылка',
          field: 'url',
          editable: true,
        },
        {
          headerName: 'Ряд',
          field: 'row',
          editable: true,
        },
      ],
      gridApi: null,
      gridApiB: null,
      defaultColDef: {
        flex: 1,
      },
      getRowId: function (params) {
        return params.data.id;
      },
      getRowIdB: function (params) {
        return params.data.id;
      },
      rowData: [],
      rowDataB: [
        {
          text: 'Первая кнопка',
          url: 'https://google.com',
          row: 1,
          id: 1,
        },
      ],

      files: [],
      text: '',
    };
  },
  mounted() {
    this.$http.get('/v1/notification/').then((res) => {
      this.rowData = res.data || [];
    });
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
    },
    onGridReadyB(params) {
      this.gridApiB = params.api;
      this.gridApiB.setDomLayout('autoHeight');
    },
    addButton() {
      this.rowDataB.push({
        id: this.rowDataB.length + 1,
        text: 'Текст',
        url: 'https://www.twitch.tv/',
        row: this.rowDataB.length + 1,
      });
      this.gridApiB.setRowData(this.rowDataB);
    },
    createNotification() {
      const formData = new FormData();
      this.text && formData.append('text', this.text);
      formData.append('buttons', JSON.stringify(this.rowDataB));
      for (let i = 0; i < this.files.length; i++) {
        formData.append('images', this.files[i]);
      }
      const headers = { 'Content-Type': 'multipart/form-data' };
      this.$http.post('/v1/notification/', formData, headers).then(() => {
        this.$emitter.emit('alert', {
          header: 'Готово',
          color: 'info',
          text: 'Рассылка запущена',
        });
        this.erase();
      });
    },
    erase() {
      this.text = '';
      this.rowDataB = [];
      this.gridApiB.setRowData(this.rowDataB);
    },
    deleteButton() {
      const selectedRows = this.gridApiB.getSelectedRows();
      if (!selectedRows.length) return;
      this.rowDataB = this.rowDataB.filter(
        (row) => !selectedRows.includes(row),
      );
      this.gridApiB.setRowData(this.rowDataB);
    },
  },
};
</script>
