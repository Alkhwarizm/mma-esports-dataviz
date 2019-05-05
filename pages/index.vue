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
          <!-- <div><p id="value-time"></p></div> -->
          <div><div id="slider-time" class="w-full"></div></div>
        </div>
      </div>
    </div>
    <div class="row"></div>
  </section>
</template>

<script>
const topojson = require('topojson-client');
const world = require('../static/topojson/countries.json');
const worldContinents = require('../static/topojson/world-continents.json');
const countryData = require('../static/data/2018-country-data.json');

const continents = topojson.feature(worldContinents, worldContinents.objects.continent).features;
const countries = topojson.feature(world, world.objects.units).features;
const continentData = countryData.reduce(function (acc, curr) {
  const key = curr["Continent"]
  if (!acc[key]) {
    acc[key] = {
      prize: 0,
      player: 0
    }
  }
  acc[curr["Continent"]].prize += Number.parseFloat(curr["Prize"].replace(/[$,]/gm, ''));
  acc[curr["Continent"]].player += Number.parseInt(curr["Player"]);
  return acc;
}, {});

export default {
  data() {
    return {
      countries,
      continents,
      countryData,
      continentData: Object.keys(continentData).map(key => {
        return {
          continent: key, 
          prize: continentData[key].prize, 
          player: continentData[key].player
        }
      })
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
        .text(d => {
          const country = this.countryData
            .find(el => d.properties.name.toLowerCase() === el.Country.toLowerCase())
            || {Prize: '-', Player: '-'};
          return `${d.properties.name}\nPrize: ${country.Prize}\nPlayer: ${country.Player}`;
        });

      const zoomed = () => {
        worldMap.attr("transform", this.$d3.event.transform);
      }

      const zoom = this.$d3.zoom()
        .scaleExtent([1, 20])
        .translateExtent([[0, 0], [this.mapView.attr('width'), this.mapView.attr('height')]])
        .on('zoom', zoomed);

      this.mapSvg.call(zoom);
    },
    drawPrizeDist: function () {
      this.drawViewPort('prize-dist', 0.35);
      this.drawPie('prize-dist');
    },
    drawPlayerDist: function () {
      this.drawViewPort('player-dist', 0.35);
      this.drawPie('player-dist');
    },
    drawSlider: function () {
      const sliderWidth = this.parseNumber(this.$d3.select('#slider-time').style('width'));

      const dataTime = this.$d3.range(0,4).map(d => {
        return new Date(2015 + d, 5, 4);
      });

      const sliderTime = this.$d3
        .sliderBottom()
        .min(this.$d3.min(dataTime))
        .max(this.$d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 *365)
        .width(sliderWidth*0.9)
        .tickFormat(this.$d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(2015, 5, 4))
        .on('onchange', val => {
          this.currentYear = this.$d3.timeFormat('%Y')(val);
          // this.$d3.select('p#value-time').text(this.$d3.timeFormat('%Y')(val));
        });

      const gTime = this.$d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

      gTime.call(sliderTime);
      // this.$d3.select('p#value-time').text(this.$d3.timeFormat('%Y')(sliderTime.value()));
    },
    drawPie: function (elementRef) {
      const dataType = {
        'player-dist': 'player',
        'prize-dist': 'prize',
      }
      const pieRad = this.parseNumber(this[`${elementRef}View`].style('height')) * 0.4;
      const center = {
        x: this.parseNumber(this[`${elementRef}View`].style('height')) * 0.5,
        y: this.parseNumber(this[`${elementRef}View`].style('height')) * 0.5,
      }
      const color = this.$d3.scaleOrdinal(this.$d3.schemeSet1)

      const vis = this[`${elementRef}Svg`]
        .data(this.continentData)
        .append('g')
          .attr('transform', `translate(${center.x}, ${center.y})`)

      const arc = this.$d3.arc()
        .outerRadius(pieRad)
        .innerRadius(0)

      const piePrize = this.$d3.pie()
        .value(d => d[dataType[elementRef]]);

      const arcs = vis.selectAll('g.slice')
        .data(piePrize(this.continentData))
        .enter()
          .append('g')
            .attr('class', 'slice');
      
      arcs.append('path')
        .attr('fill', (d, i) => color(i))
        .attr('d', arc)

      arcs.append('title')
        .text((d, i) => this.continentData[i].continent);
    }
  },
  mounted() {
    this.drawMap();
    this.drawPrizeDist();
    this.drawPlayerDist();
    this.drawSlider();
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

g.tick text, g.parameter-value text {
  font-family: Orbitron;
  letter-spacing: 2pt;
  fill: #1f9d55;
  @apply text-base font-bold;
}

g.tick text {

}

g.parameter-value text {
  fill: white;
  @apply text-tertiary;
}

.handle {
  fill: #001A2C;
  stroke: #1f9d55;
  stroke-width: 2px;
}

line.track, line.track-inset {
  stroke: #1f9d55;
}
</style>
