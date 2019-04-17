<template>
  <section class="container">
    <div>
      <logo />
      <h1 class="title text-white">
        ESPORTS DASHBOARD
      </h1>
      <h2 class="subtitle text-tertiary">
        A simple data visualization project for IF4061 class assignment
      </h2>
      <div class="links">
        <a
          href="https://github.com/Alkhwarizm/mma-esports-dataviz"
          target="_blank"
          class="button button-grey"
        >GitHub</a>
        <router-link :to="{ path: '/dashboard' }" class="button button-red" append>
          Start
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  }
}
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS
.container {
  @apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
a.button {
  text-decoration: none;
}

.button {
  @apply bg-transparent font-semibold py-2 px-4 border rounded;
}

.button-grey {
  @apply text-white border-white;
}

.button-grey:hover {
  @apply bg-grey-darkest text-white border-transparent;
}

.button-red {
  @apply text-secondary border-secondary;
}

.button-red:hover {
  @apply bg-secondary text-primary border-transparent;
}

.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Raleway', 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-size: 100px;
  /* color: #35495e; */
  letter-spacing: 1px;
  @apply font-sans font-hairline;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  /* color: #526488; */
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
