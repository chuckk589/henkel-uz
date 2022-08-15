<template>
  <v-dialog v-model="show" fullscreen transition="dialog-bottom-transition">
    <v-container class="h-screen bg-white" fluid>
      <v-card class="h-100 ma-auto d-flex flex-column justify-space-around">
        <v-card-title>{{ payload.header }}</v-card-title>
        <v-card-text>
          <template v-for="(field, index) in payload.fields">
            <v-textarea
              v-if="field.type == 'textarea'"
              :key="'t' + index"
              :label="field.label || field.key"
              :disabled="isFieldActive(field)"
              v-model="field.value"
            />
            <v-select
              v-else-if="field.type == 'select'"
              :key="'s' + index"
              :label="field.label || field.key"
              v-model="field.value"
              :disabled="isFieldActive(field)"
              :items="field.options"
            />
            <v-text-field
              v-else-if="field.type == 'date'"
              type="date"
              :key="'d' + index"
              :label="field.label || field.key"
              :disabled="isFieldActive(field)"
              v-model="field.value"
            />
            <v-img
              v-else-if="field.type == 'img'"
              class="bg-white mb-5"
              :key="'i' + index"
              max-width="60%"
              :src="field.value"
              cover
            ></v-img>
            <v-text-field
              v-else
              :key="'r' + index"
              :label="field.label || field.key"
              :disabled="isFieldActive(field)"
              v-model="field.value"
            />
          </template>
        </v-card-text>
        <v-card-actions class="mt-auto">
          <v-btn
            v-if="!payload.noSave"
            color="primary"
            size="small"
            @click="save"
            variant="outlined"
            >Сохранить</v-btn
          >
          <v-btn
            variant="outlined"
            color="primary"
            @click="show = false"
            size="small"
            >Отмена</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-container>
  </v-dialog>
</template>
<script>
export default {
  name: 'EditComponent',
  // props: {
  //   show: {
  //     type: Boolean,
  //     default: false,
  //   },
  //   payload: {
  //     noSave: {
  //       type: Boolean,
  //       default: false,
  //     },
  //     header: String,
  //     url: String,
  //     eventName: String,
  //     method: String,
  //     fields: Array,
  //   },
  // },
  data() {
    return {
      payload: {},
      show: false,
    };
  },
  created() {
    this.$emitter.on('openModal', (evt) => {
      this.show = true;
      this.payload = evt;
    });
  },
  methods: {
    isFieldActive(field) {
      return (
        field.dependsOn &&
        !field.dependsOn.value ===
          this.payload.fields.find((f) => f.key === field.dependsOn.key).value
      );
    },
    save() {
      this.$http({
        method: this.payload.method,
        url: `/v1${this.payload.url}`,
        data: this.payload.fields.reduce((s, c) => {
          if (c.key) {
            s[c.key] = c.value;
          }
          return s;
        }, {}),
      }).then((res) => {
        this.payload.eventName &&
          this.$emitter.emit(this.payload.eventName, res.data);
        this.show = false;
      });
    },
  },
};
</script>
<style>
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
  transition: transform 0.3s ease-in-out;
}
</style>
