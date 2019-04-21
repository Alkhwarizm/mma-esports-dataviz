<template>
  <section class="container">
    <div class="row">
      <div class="grid w-full bg-primary">
        <h4 class="subtitle">
          DASHBOARD
        </h4>
        <h1 class="title">
          RISE OF ESPORTS
        </h1>
      </div>
    </div>
    <div class="row">
      <div class="grid w-1/4 bg-primary">1</div>
      <div id="map" class="grid w-3/4 bg-primary">
        <h5 class="subtitle">
          CHOROPLETH
        </h5>
        <h2 class="title">
          MAP TITLE HERE
        </h2>
      </div>
    </div>
    <div class="row">
      <div class="grid w-1/4 bg-primary">3</div>
      <div class="grid w-3/4 bg-primary">4</div>
    </div>
  </section>
</template>

<script>
const d3 = require('d3')
const topojson = require('topojson-client')
const world = require('../static/topojson/countries.json')
const tw = require('../tailwind.js')
const countries = new Map(world.objects.units.geometries.map(d => [d.properties.iso3, d.properties.name]))

export default {
  data() {
    return {
      countries,
      // height: d3.select('#map').attr('width')/2
    }
  },
  computed: {
    width: function () {
      return d3.select('#map').style('width');
    }
  },
  mounted() {
    // const projection = d3.geoEquirectangular()
    //   .scale(150)
    //   .translate([960/2, 600/2+90])

    // const path = d3.geoPath(projection);

    // const svg = d3.select('#map')
    //   .append('svg')
    //     .attr('viewBox', '0 0 960 600')
    //     .style('width', '100%')
    //     .style('height', 'auto')
    //   .append('g')
    //     .selectAll('path')
    //     .data(topojson.feature(world, world.objects.units).features)
    //     .join('path')
    //       .attr('fill', tw.colors.tertiary)
    //       .attr('stroke', tw.colors.secondary)
    //       .attr('d', path)
    //     .append('title')
    //       .text(d => `${d.properties.name}`)
        
  }
}
</script>

<style scoped>
.container {
  @apply border border-2 border-secondary;
  @apply min-h-screen justify-center items-center mx-auto;
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
  @apply border border-2 border-secondary pt-3 pl-3 pb-2;
}
</style>
