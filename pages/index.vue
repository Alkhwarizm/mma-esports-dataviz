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
            <div class="dist prize-dist w-full" ref="prize-dist"></div>
          </div>
        </div>
        <div class="row">
          <div class="grid padded w-full h-full">
            <h3 class="title">PLAYER DISTRIBUTION</h3>
            <div class="dist player-dist w-full" ref="player-dist"></div>
          </div>
        </div>
      </div>
      <div class="grid padded w-1/2 h-full">
        <h3 class="title">
          WORLD MAP
        </h3>
        <div class="map w-full" ref="map"></div>
        <div class="slider w-full">

        </div>
      </div>
    </div>
    <div class="row"></div>
  </section>
</template>

<script>
const topojson = require('topojson-client');
const world = require('../static/topojson/countries.json');

const countries = topojson.feature(world, world.objects.units).features

export default {
  data() {
    return {
      countries
    }
  },
  methods: {
    parseNumber: function (input) {
      const str = input.match(/[0-9]+/g)[0];
      return Number.parseInt(str);
    },
    drawViewPort: function (elementRef, heightFactor = 0.5) {
      const width = this.$refs[elementRef].clientWidth;
      const height = width * heightFactor;
      
      this[`${elementRef}Svg`] = this.$d3.select(`.${elementRef}`)
        .append('svg')
          .attr('viewBox', `0 0 ${width} ${height}`)
          .style('width', '100%')
          .style('height', 'auto');

      this[`${elementRef}View`] = this[`${elementRef}Svg`].append('rect')
        .attr('class', 'view')
        .attr('x', 0.5)
        .attr('y', 0.5)
        .attr('width', width - 1)
        .attr('height', height - 1)
        .attr('fill', this.$tw.colors.secondary)
        .style('opacity', 0.1)
    },
    drawMap: function () {
      this.drawViewPort('map');

      const projection = this.$d3.geoEquirectangular()
        .scale(100)
        .translate([this.mapView.attr('width')/2, this.mapView.attr('height')/2])

      const path = this.$d3.geoPath(projection);

      const worldMap = this.mapSvg.append('g')
        .selectAll('path')
        .data(this.countries)
        .join('path')
          .attr('fill', this.$tw.colors.tertiary)
          .attr('stroke', this.$tw.colors.primary)
          .attr('d', path)
          // .on("mouseover", this.handleMouseOver)
          // .on("mouseout", this.handleMouseOut);

      const tooltip = worldMap.append('title')
        .text(d => `${d.properties.name}`);

      const zoomed = () => {
        worldMap.attr("transform", this.$d3.event.transform);
      }

      const zoom = this.$d3.zoom()
        .scaleExtent([1, 20])
        .translateExtent([[0, 0], [this.mapView.attr('width'), this.mapView.attr('height')]])
        .on('zoom', zoomed);

      this.mapSvg.call(zoom);
      // const mapWidth = this.$refs.map.clientWidth;
      // const mapHeight = mapWidth/2;
      
      // this.mapSvg = this.$d3.select('.map')
      //   .append('svg')
      //     .attr('class', 'map')
      //     .attr('viewBox', `0 0 ${mapWidth} ${mapHeight}`)
      //     .style('width', '100%')
      //     .style('height', 'auto');

      // this.mapView = this.mapSvg.append('rect')
      //   .attr('class', 'view')
      //   .attr('x', 0.5)
      //   .attr('y', 0.5)
      //   .attr('width', mapWidth - 1)
      //   .attr('height', mapHeight - 1)
      //   .attr('fill', this.$tw.colors.secondary)
      //   .style('opacity', 0.1)
    },
    drawPrizeDist: function () {
      this.drawViewPort('prize-dist', 0.35);
    },
    drawPlayerDist: function () {
      this.drawViewPort('player-dist', 0.35);
    }
  },
  mounted() {
    this.drawMap();
    this.drawPrizeDist();
    this.drawPlayerDist();
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
  @apply text-white text-left font-semibold mt-px mb-1;
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
