<template>
  <div>
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-image-area"
      @click="view"
    ></v-btn>
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      icon="mdi-pencil"
      @click="edit"
    ></v-btn>
    <v-btn
      density="compact"
      class="ma-2"
      variant="text"
      color="error"
      icon="mdi-delete"
      @click="deleteWinner"
    ></v-btn>
  </div>
</template>

<script>
export default {
  name: 'LotteryWinnerCell',
  data() {
    return {};
  },
  methods: {
    view() {
      this.$emitter.emit('openModal', {
        header: 'Просмотр чека',
        noSave: true,
        fields: [
          {
            //FIXME:
            type: 'img',
            // value: this.params.data.checkPath,
            value: 'https://cdn.vuetifyjs.com/images/parallax/material.jpg',
          },
        ],
      });
    },
    deleteWinner() {
      this.$emitter.emit('openDialog', {
        header: 'Удалить победителя',
        message: 'Вы уверены, что хотите удалить победителя?',
        eventName: 'delete-winner',
        url: `/winner/${this.params.data.id}`,
        id: this.params.data.id,
      });
    },
    edit() {
      this.$emitter.emit('openModal', {
        url: `/winner/${this.params.data.id}`,
        method: 'PUT',
        header: 'Редактировать победителя',
        eventName: 'edit-winner',
        fields: [
          {
            label: 'Основной',
            key: 'primary',
            type: 'select',
            value: this.params.data.primary,
            options: [
              {
                value: true,
                title: 'Да',
              },
              {
                value: false,
                title: 'Нет',
              },
            ],
          },
          {
            label: 'Подтвержден',
            key: 'confirmed',
            type: 'select',
            value: this.params.data.confirmed,
            options: [
              {
                value: true,
                title: 'Да',
              },
              {
                value: false,
                title: 'Нет',
              },
            ],
          },
          {
            label: 'Уведомлен',
            key: 'notified',
            type: 'select',
            value: this.params.data.notified,
            options: [
              {
                value: true,
                title: 'Да',
              },
              {
                value: false,
                title: 'Нет',
              },
            ],
          },
        ],
      });
    },
  },
};
</script>
