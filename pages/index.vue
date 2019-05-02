<template>
  <section class="container">
    <div class="row">
      <div class="grid padded w-full">
        <h5 class="subtitle">
          DASHBOARD
        </h5>
        <h2 class="title">
          RISE OF ESPORTS
        </h2>
      </div>
    </div>
    <div class="row">
      <div class="w-1/2 h-full">
        <div class="row">
          <div class="grid padded w-full h-full">
            <h3 class="title">PRIZE DISTRIBUTION</h3>
          </div>
        </div>
        <div class="row">
          <div class="grid padded w-full h-full">
            <h3 class="title">PLAYER DISTRIBUTION</h3>
          </div>
        </div>
      </div>
      <div class="grid padded w-1/2 h-full">
        <h3 class="title">
          WORLD MAP
        </h3>
      </div>
    </div>
    <div class="row"></div>
  </section>
</template>

<script>

export default {
  mounted() {
    
  }
}
</script>

<style>
.container {
  @apply border border-2 border-secondary;
  @apply min-h-screen min-w-full justify-center items-center mx-auto;
}

.row {
  @apply flex;
}

.subtitle {
  font-family: Orbitron;
  letter-spacing: 2pt;
  @apply text-tertiary text-left font-semibold;
}

.title {
  font-family: Orbitron;
  letter-spacing: 2pt;
  @apply text-white text-left font-semibold mt-px;
}

.grid {
  @apply border border-2 border-secondary bg-primary;
}

.padded {
  @apply pt-3 pl-3 pb-2 pr-3;
}

.kv {
  font-family: Orbitron;
  letter-spacing: 1pt;
  @apply text-white mt-1 ml-2;
}
</style>
