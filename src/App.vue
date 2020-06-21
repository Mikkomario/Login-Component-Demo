<template>
  <div id="app" class="block container" style="max-width: 640px;">
    <h1 class="title is-1">Login Demo</h1>
    <app-login serverUri="http://localhost:9999/dummy/login" @login="onLogin"></app-login>
  </div>
</template>

<script>
  import Login from "./components/login.vue"

  export default { 
    components: {
      appLogin: Login
    }, 

    methods: {
      onLogin(email) { 
        // Simply shows an alert at this time. In the actual implementation, this method should 
        // update status or route to another component etc.
        alert("Welcome, " + email)
      }
    }
  }
</script>