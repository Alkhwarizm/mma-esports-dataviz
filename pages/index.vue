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
      <div class="w-1/2 min-h-full">
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
      <div class="grid padded w-1/2 min-h-full">
        <h3 class="title">
          WORLD MAP
        </h3>
        <div class="map w-full" ref="map"></div>
        <div class="slider w-full">
          <div hidden><input id="value-time" v-model="currentYear" type="text" /></div>
          <div><div id="slider-time" class="w-full"></div></div>
        </div>
      </div>
    </div>
    <div class="row"></div>
  </section>
</template>

<script>
function parseData(el) {
  el.prize = Number.parseFloat(el.prize.replace(/[$,]/gm, ''));
  el.player = Number.parseInt(el.player);
  return el;
}

const topojson = require('topojson-client');
const world = require('../static/topojson/countries.json');
const wc = require('../static/topojson/world-continents.json');
const mainData = {
  '2016': require('../static/data/2016.json').map(parseData),
  '2017': require('../static/data/2017.json').map(parseData),
  '2018': require('../static/data/2018.json').map(parseData),
}

const continents = topojson.feature(wc, wc.objects.continent).features;
const countries = topojson.feature(world, world.objects.units).features;

export default {
  data() {
    return {
      countries,
      continents,
      currentYear: 2016,
      dataType: {
        'player-dist': 'player',
        'prize-dist': 'prize',
      }
    }
  },
  computed: {
    countryData: function () {
      return mainData[this.currentYear];
    },
    continentData: function () {
      const temp = this.countryData.reduce(function (acc, curr) {
        const key = curr.continent
        if (!acc[key]) {
          acc[key] = {
            prize: 0,
            player: 0
          }
        }
        acc[curr.continent].prize += curr.prize ? curr.prize : 0;
        acc[curr.continent].player += curr.player ? curr.player : 0;
        return acc;
      }, {});
      return Object.keys(temp).map(key => {
        return {
          continent: key, 
          prize: temp[key].prize, 
          player: temp[key].player
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
          // .attr('stroke', this.$tw.colors.primary)
          .attr('d', path)
          .attr('class', 'country')
          .attr('id', d => d.properties.name.replace(/[. ]/gm, ''))
          // .on("mouseover", this.handleMouseOver)
          // .on("mouseout", this.handleMouseOut);
      
      const continents = this.mapSvg.append('g')
        .selectAll('path')
        .data(this.continents)
        .join('path')
          .attr('fill', 'none')
          .attr('d', path)
          .attr('class', 'continent')
          .attr('id', d => d.properties.continent.replace(' ', ''));

      const tooltip = worldMap.append('title')
        .text(d => {
          const country = this.countryData
            .find(el => d.properties.name.toLowerCase() === el.country.toLowerCase())
            || {prize: '-', player: '-'};
          return `${d.properties.name}\nPrize: ${country.prize}\nPlayer: ${country.player}`;
        });

      const zoomed = () => {
        worldMap.attr("transform", this.$d3.event.transform);
        continents.attr("transform", this.$d3.event.transform);
      }

      const zoom = this.$d3.zoom()
        .scaleExtent([1, 20])
        .translateExtent([[0, 0], [this.mapView.attr('width'), this.mapView.attr('height')]])
        .on('zoom', zoomed);

      this.mapSvg.call(zoom);
    },
    drawPrizeDist: function () {
      this.drawViewPort('prize-dist', 0.37);
      this.drawPie('prize-dist');
      this.drawBar('prize-dist', this.$d3.formatPrefix('$,.0r', 1e6));
    },
    drawPlayerDist: function () {
      this.drawViewPort('player-dist', 0.37);
      this.drawPie('player-dist');
      this.drawBar('player-dist', this.$d3.formatPrefix(',.1', 1e3));
    },
    drawSlider: function () {
      const sliderWidth = this.parseNumber(this.$d3.select('#slider-time').style('width'));

      const dataTime = this.$d3.range(0,3).map(d => {
        return new Date(2016 + d, 5, 4);
      });

      const sliderTime = this.$d3
        .sliderBottom()
        .min(this.$d3.min(dataTime))
        .max(this.$d3.max(dataTime))
        .step(1000 * 60 * 60 * 24 *365)
        .width(sliderWidth*0.5)
        .tickFormat(this.$d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(2015, 5, 4))
        .on('onchange', val => {
          this.currentYear = this.$d3.timeFormat('%Y')(val);
          // this.$d3.select('p#value-time').text(this.$d3.timeFormat('%Y')(val));
          this.$d3.select('#value-time').attr('value', this.$d3.timeFormat('%Y')(val));
        });

      const gTime = this.$d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 100)
        .append('g')
        .attr('transform', `translate(${sliderWidth*0.45},30)`);

      gTime.call(sliderTime);
      // this.$d3.select('p#value-time').text(this.$d3.timeFormat('%Y')(sliderTime.value()));
    },
    drawPie: function (elementRef) {
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
        .value(d => d[this.dataType[elementRef]]);

      const arcs = vis.selectAll('g.slice')
        .data(piePrize(this.continentData))
        .enter()
          .append('g')
            .attr('class', 'slice');
      
      arcs.append('path')
        .attr('fill', (d, i) => color(i))
        .attr('d', arc)
        .on('mouseover', (d, i) => {
          this.$d3.select(`#${this.continentData[i].continent.replace(' ', '')}`)
            .classed('highlighted', true);
        })
        .on('mouseout', (d, i) => {
          this.$d3.selectAll('.continent')
            .classed('highlighted', false);
        })

      arcs.append('title')
        .text((d, i) => this.continentData[i].continent);
    },
    drawBar: function (elementRef, axisFormat) {
      const viewHeight = this.parseNumber(this[`${elementRef}View`].style('height'))
      const viewWidth = this.parseNumber(this[`${elementRef}View`].style('width'))
      const barHeight = viewHeight * 0.125;
      const barWidth = viewWidth * 0.35;
      const posX = viewWidth * 0.55;
      const posY = viewHeight * 0.125;
      const barData = this.countryData
        .sort((a, b) => b[this.dataType[elementRef]] - a[this.dataType[elementRef]])
        .slice(0, 5);
      const barMargin = 5;
      console.log(barData);
      
      const x = this.$d3.scaleLinear()
        .domain([0, this.$d3.max(barData, (d) => d[this.dataType[elementRef]])])
        .range([0, barWidth]);

      const y = this.$d3.scaleBand()
        .domain(barData.map(el => el.country))
        .range([0, barData.length*(barHeight+barMargin)]);

      const yAxis = this.$d3.axisRight()
        .tickSize(0)
        .scale(y)
        .tickPadding(5)

      const xAxis = this.$d3.axisBottom()
        .scale(x)
        .tickSize(7)
        .ticks(5)
        .tickFormat(axisFormat);

      const chart = this[`${elementRef}Svg`]
        .append('g')
          .attr('transform', `translate(${posX}, ${posY})`)
      
      const bar = chart.selectAll('g')
        .data(barData)
        .enter()
        .append('g')
          .classed('bar', true)
          .attr('transform', (d, i) => `translate(0, ${i*(barHeight+barMargin)})`)
      
      bar.append('rect')
          .attr('fill', this.$tw.colors.tertiary)
          .attr('width', (d) => x(d[this.dataType[elementRef]]))
          .attr('height', barHeight)
          .on('mouseover', (d, i) => {
            this.$d3.select(`#${d.country.replace(/[. ]/gm, '')}`)
              .classed('highlighted', true);
          })
          .on('mouseout', (d, i) => {
            this.$d3.selectAll('.country')
              .classed('highlighted', false);
          });

      bar.append('text')
        .attr('class', 'bar-text')
        .attr('x', (d) => x(d[this.dataType[elementRef]]) + 2)
        .attr('y', (d, i) => (barHeight/2) + barMargin)
        .text((d) => axisFormat(d[this.dataType[elementRef]]))
      
      chart.append('g')
        .classed('x axis', true)
        .attr('transform', `translate(0, ${barData.length*(barHeight+barMargin)})`)
        .call(xAxis);
      
      chart.append('g')
        .classed('y axis', true)
        .attr('transform', 'translate(0, -1)')
        .call(yAxis);
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
.bar {
  @apply mb-2;
}

.bar-text {
  fill: white;
}

.dist .axis .domain, .dist .axis .tick line {
  stroke: #64DDDC;
  stroke-width: 2px;
}

.dist .x.axis .tick text {
  fill: white;
  font-size: 0.4rem;
}

.dist .y.axis .tick text {
  fill: white;
  font-size: 0.5rem;
}

.continent {
  fill: none;
}

.continent.highlighted {
  fill: #1f9d55;
  stroke: #64DDDC;
  stroke-width: 2px;
}

.country.highlighted {
  stroke:#64DDDC;
  stroke-width: 2px;
}

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
