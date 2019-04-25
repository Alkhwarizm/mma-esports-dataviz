<template>
  <section class="container">
    <div class="row">
      <div class="grid padded w-full">
        <h4 class="subtitle">
          DASHBOARD
        </h4>
        <h1 class="title">
          RISE OF ESPORTS
        </h1>
      </div>
    </div>
    <div class="row">
      <div class="grid w-1/4">
        <div class="border border-secondary border-b-2 padded w-full h-half">
          <h4 id="country-name" class="subtitle mt-2 ml-2">COUNTRY NAME</h4>
          <br>
          <h5 class="kv">KEY 1</h5>
          <svg class="ml-2 mb-2" width="90%" height="10px">
            <rect y="2px" width="100%" height="3px" fill="grey"></rect>
            <rect width="100%" height="6px" fill="white"></rect>
          </svg>
          <h5 class="kv">KEY 2</h5>
          <svg class="ml-2 mb-2" width="90%" height="10px">
            <rect y="2px" width="100%" height="3px" fill="grey"></rect>
            <rect width="50%" height="6px" fill="white"></rect>
          </svg>
        </div>
        <div class="border border-secondary border-t-2 padded w-full h-half">
          <h4 class="subtitle mt-2 ml-2">OTHER DATA?</h4>
        </div>
      </div>
      <div id="map" class="grid padded w-3/4">
        <h5 class="subtitle">
          CHOROPLETH
        </h5>
        <h2 class="title">
          MAP TITLE HERE
        </h2>
      </div>
    </div>
    <div class="row">
      <div class="grid padded w-1/4 h-full">3</div>
      <div class="grid padded w-3/4 h-full">4</div>
    </div>
  </section>
</template>

<script>
const d3 = require('d3')
const topojson = require('topojson-client')
const world = require('../static/topojson/countries.json')
const tw = require('../tailwind.js')
const countries = new Map(world.objects.units.geometries.map(d => [d.properties.iso3, d.properties.name]))

function parseNumber(input) {
  const str = input.match(/[0-9]+/g)[0];
  return Number.parseInt(str);
}

function handleMouseOver(d, i) {
  d3.select('#country-name').text(d.properties.name.toUpperCase());
} 

function handleMouseOut(d, i) {
  d3.select('#country-name').text('COUNTRY NAME');
}

export default {
  data() {
    return {
      countries,
    }
  },
  computed: {
    width: function () {
      return parseNumber(d3.select('#map').style('width'));
    },
    height: function() {
      return parseNumber(d3.select('#map').style('width'))/2;
    }
  },
  mounted() {
    const projection = d3.geoEquirectangular()
      .scale(140)
      .translate([this.width/2, this.height/2])

    const path = d3.geoPath(projection);

    const svg = d3.select('#map')
      .append('svg')
        .attr('class', 'map')
        .attr('viewBox', `0 0 ${this.width} ${this.height}`)
        .style('width', '100%')
        .style('height', 'auto');

    const view = svg.append('rect')
      .attr('class', 'view')
      .attr('x', 0.5)
      .attr('y', 0.5)
      .attr('width', this.width - 1)
      .attr('height', this.height - 1)
      .attr('fill', tw.colors.secondary)
      .style('opacity', 0.1)

    const worldMap = svg.append('g')
      .selectAll('path')
      .data(topojson.feature(world, world.objects.units).features)
      .join('path')
        .attr('fill', tw.colors.tertiary)
        .attr('stroke', tw.colors.primary)
        .attr('d', path)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    const tooltip = worldMap.append('title')
      .text(d => `${d.properties.name}`);

    const zoomed = () => {
      worldMap.attr("transform", d3.event.transform);
    }

    const zoom = d3.zoom()
      .scaleExtent([1, 20])
      .translateExtent([[0, 0], [this.width, this.height]])
      .on('zoom', zoomed);

    svg.call(zoom)
        
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
  @apply border border-2 border-secondary bg-primary;
}

.padded {
  @apply pt-3 pl-3 pb-2 pr-3;
}

.kv {
  font-family: Orbitron;
  letter-spacing: 1pt;
  @apply text-white text-left mt-1 ml-2;
}
</style>
