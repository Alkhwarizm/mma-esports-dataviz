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
        <div class="map w-full" ref="map"></div>
      </div>
    </div>
    <div class="row"></div>
  </section>
</template>

<script>

export default {
  data() {
    return {
    }
  },
  methods: {
    parseNumber: function (input) {
      const str = input.match(/[0-9]+/g)[0];
      return Number.parseInt(str);
    },
    drawMap: function () {
      const mapWidth = this.$refs.map.clientWidth;
      const mapHeight = mapWidth/2;
      
      this.mapSvg = this.$d3.select('.map')
        .append('svg')
          .attr('class', 'map')
          .attr('viewBox', `0 0 ${mapWidth} ${mapHeight}`)
          .style('width', '100%')
          .style('height', 'auto');

      this.mapView = this.mapSvg.append('rect')
        .attr('class', 'view')
        .attr('x', 0.5)
        .attr('y', 0.5)
        .attr('width', mapWidth - 1)
        .attr('height', mapHeight - 1)
        .attr('fill', this.$tw.colors.secondary)
        .style('opacity', 0.1)
    }
  },
  mounted() {
    this.drawMap();
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
