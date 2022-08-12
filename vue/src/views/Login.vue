<template>
  <v-container fluid>
    <v-card class="elevation-12" max-width="400">
      <v-toolbar density="compact">
        <v-toolbar-title>Login</v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <form ref="form" @submit.prevent="login()">
          <v-text-field
            v-model="password"
            name="password"
            label="Password"
            type="password"
            density="compact"
            required
            class="mt-5"
          ></v-text-field>

          <div class="red--text">{{ errorMessage }}</div>
          <v-btn type="submit" class="mt-2" value="log in" size="small"
            >Login</v-btn
          >
        </form>
      </v-card-text>
    </v-card></v-container
  >
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    login() {
      this.$http
        .post('/auth/login', {
          username: 'admin',
          password: this.password,
        })
        .then((res) => {
          localStorage.setItem('jwt', res.data.access_token);
          this.$router.push({ name: 'users' });
        });
    },
  },
  computed: {
    toggleMessage: function () {
      return this.isRegister
        ? this.stateObj.register.message
        : this.stateObj.login.message;
    },
  },
};
</script>
