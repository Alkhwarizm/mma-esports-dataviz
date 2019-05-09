<template>
  <section class="container">
    <div class="row">
      <div class="grid padded w-full">
        <h5 class="subtitle">
          DASHBOARD
        </h5>
        <h2 class="title">
          RISE OF ESPORTS AROUND THE GLOBE
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
        <div class="slider row w-full">
          <div class="information padded w-2/5 min-h-full">
            <h6 class="subtitle">INFORMATION</h6>
            <h4 class="title"></h4>
            <h5 class="content prize"></h5>
            <h5 class="content player">Hover to see additional information</h5>
            <h5 class="content distribution"></h5>
            <h5 class="content prize-rank"></h5>
            <h5 class="content player-rank"></h5>
          </div>
          <div hidden><input id="value-time" v-model="currentYear" type="text" /></div>
          <div class="w-3/5">
            <div class="row w-full text-center">
              <div class="w-2/5 padded text-center">
                <h6 class="subtitle">SELECT DATA:</h6>
              </div>
              <div class="w-1/4">
                <div 
                  class="button" 
                  :class="{active: currentMapData === 'prize'}"
                  @click="changeMapData('prize')"
                >
                  PRIZE
                </div>
              </div>
              <div class="w-1/4">
                <div 
                  class="button" 
                  :class="{active: currentMapData === 'player'}"
                  @click="changeMapData('player')"
                >
                  PLAYER
                </div>
              </div>
            </div>
            <div id="slider-time" class="w-full"></div>
          </div>
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

const byPlayer = (a, b) => b.player - a.player;
const byPrize = (a, b) => b.prize - a.prize;
const addPrizeRank = (el, i) => {
  el.prizeRank = i+1;
  return el;
}
const addPlayerRank = (el, i) => {
  el.playerRank = i+1;
  return el;
}

const topojson = require('topojson-client');
const world = require('../static/topojson/countries.json');
const wc = require('../static/topojson/world-continents.json');
const mainData = {
  '2016': require('../static/data/2016.json')
    .map(parseData).sort(byPlayer).map(addPlayerRank).sort(byPrize).map(addPrizeRank),
  '2017': require('../static/data/2017.json')
    .map(parseData).sort(byPlayer).map(addPlayerRank).sort(byPrize).map(addPrizeRank),
  '2018': require('../static/data/2018.json')
    .map(parseData).sort(byPlayer).map(addPlayerRank).sort(byPrize).map(addPrizeRank),
}

const continents = topojson.feature(wc, wc.objects.continent).features;
const countries = topojson.feature(world, world.objects.units).features;

export default {
  data() {
    return {
      countries,
      continents,
      currentYear: 2016,
      currentMapData: 'prize',
      currentFocusedContinent: '',
      dataType: {
        'player-dist': 'player',
        'prize-dist': 'prize',
      },
      prizeOpacity: this.$d3.scaleQuantile()
        .domain(
          [...mainData['2016'], ...mainData['2017'], ...mainData['2018']]
            .map(el => el.prize)
        )
        .range([.1, .3, .4, .45, .5, .55, .6, .65, .7, .75, .8, 1.0]),
      playerOpacity: this.$d3.scaleQuantile()
        .domain(
          [...mainData['2016'], ...mainData['2017'], ...mainData['2018']]
            .map(el => el.player)
        )
        .range([.1, .3, .4, .45, .5, .55, .6, .65, .7, .75, .8, 1.0]),
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
      }).filter(el => el.continent);
    }
  },
  watch: {
    currentYear: function () {
      this.$d3.select('div.prize-dist').html(null);
      this.drawPrizeDist();
      this.$d3.select('div.player-dist').html(null);
      this.drawPlayerDist();
      this.$d3.select('div.map').html(null);
      this.drawMap();
    },
    currentMapData: function () {
      this.$d3.select('div.map').html(null);
      this.drawMap();
    },
    currentFocusedContinent: function () {
      this.$d3.select('div.prize-dist').html(null);
      this.drawPrizeDist();
      this.$d3.select('div.player-dist').html(null);
      this.drawPlayerDist();
      this.$d3.select('div.map').html(null);
      this.drawMap();
    },
  },
  methods: {
    changeMapData: function (dataType) {
      this.currentMapData = dataType;
    },
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

      const opacity = this[`${this.currentMapData}Opacity`];

      const worldMap = this.mapSvg.append('g')
        .selectAll('path')
        .data(this.countries)
        .join('path')
          .attr('fill', this.$tw.colors.tertiary)
          .attr('opacity', d => {
            const country = this.countryData.find(c => c.iso3 === d.properties.iso3) || {};
            return country[this.currentMapData] ? opacity(country[this.currentMapData]) : 0.05;
          })
          .attr('d', path)
          .attr('class', 'country')
          .attr('id', d => d.properties.iso3)
          .on("mouseover", (d, i) => {
            const country = this.countryData.find(c => c.iso3 === d.properties.iso3) || {};
            const prize = country.prize ? this.$d3.format('$,.2f')(country.prize) : '-';
            const player = country.player ? country.player : '-';
            const prizeRank = country.prize ? country.prizeRank : '-';
            const playerRank = country.player ? country.playerRank : '-';
            this.$d3.select('.information .title').text(d.properties.name.toUpperCase());
            this.$d3.select('.information .content.prize').text(`PRIZE: ${prize}`);
            this.$d3.select('.information .content.player').text(`PLAYER: ${player}`);
            this.$d3.select('.information .content.prize-rank').text(`PRIZE RANK: #${prizeRank}`);
            this.$d3.select('.information .content.player-rank').text(`PLAYER RANK: #${playerRank}`);
          })
          .on("mouseout", () => {
            this.$d3.select('.information .title').text('');
            this.$d3.select('.information .content.prize').text('');
            this.$d3.select('.information .content.player').text('Hover to see additional information');
            this.$d3.select('.information .content.prize-rank').text('');
            this.$d3.select('.information .content.player-rank').text('');
          });
      
      const continents = this.mapSvg.append('g')
        .selectAll('path')
        .data(this.continents)
        .join('path')
          .attr('fill', 'none')
          .attr('d', path)
          .attr('class', 'continent')
          .attr('id', d => d.properties.continent.replace(' ', ''));

      // const tooltip = worldMap.append('title')
      //   .text(d => {
      //     const country = this.countryData.find(el => d.properties.iso3 === el.iso3) || {};
      //     const prize = country.prize ? this.$d3.format('$,.2f')(country.prize) : '-';
      //     const player = country.player ? country.player : '-';
      //     return `${d.properties.name}\nPrize: ${prize}\nPlayer: ${player}`;
      //   });

      const zoomed = () => {
        worldMap.attr("transform", this.$d3.event.transform);
        continents.attr("transform", this.$d3.event.transform);
        this.mapTransformState = this.$d3.event.transform;
      }

      const zoom = this.$d3.zoom()
        .scaleExtent([1, 20])
        .translateExtent([[0, 0], [this.mapView.attr('width'), this.mapView.attr('height')]])
        .on('zoom', zoomed);

      this.mapSvg.call(zoom);

      if (this.mapTransformState) {
        worldMap.attr("transform", this.mapTransformState);
        continents.attr("transform", this.mapTransformState);
      }
    },
    drawPrizeDist: function () {
      this.drawViewPort('prize-dist', 0.37);
      if (this.currentFocusedContinent != ''){
        this.drawFocusedBar('prize-dist', this.$d3.formatPrefix(',.1', 1e3), this.currentFocusedContinent);
        this.drawStats('prize-dist',  this.currentFocusedContinent);
      } else {
        this.drawPie('prize-dist');
        this.drawBar('prize-dist', this.$d3.formatPrefix('$,.0r', 1e6));
      }
    },
    drawPlayerDist: function () {
      this.drawViewPort('player-dist', 0.37);
      if (this.currentFocusedContinent != '') {
        this.drawFocusedBar('player-dist', this.$d3.formatPrefix(',.1', 1e3), this.currentFocusedContinent);
        this.drawStats('player-dist',  this.currentFocusedContinent);       
      } else {
        this.drawPie('player-dist');
        this.drawBar('player-dist', this.$d3.formatPrefix(',.1', 1e3));
        
      }
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
        .width(sliderWidth*0.8)
        .tickFormat(this.$d3.timeFormat('%Y'))
        .tickValues(dataTime)
        .default(new Date(2015, 5, 4))
        .on('onchange', val => {
          this.currentYear = this.$d3.timeFormat('%Y')(val);
          this.$d3.select('#value-time').attr('value', this.$d3.timeFormat('%Y')(val));
        });

      const gTime = this.$d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', '100%')
        .attr('height', 100)
        .append('g')
        .attr('transform', `translate(30,30)`);

      gTime.call(sliderTime);
      // this.$d3.select('p#value-time').text(this.$d3.timeFormat('%Y')(sliderTime.value()));
    },
    drawPie: function (elementRef) {
      const title = 'CONTINENTS DISTRIBUTION'
      const viewHeight = this.parseNumber(this[`${elementRef}View`].style('height'));
      const labelHeight = viewHeight*0.075;
      const labelWidth = viewHeight*0.1;
      const pieRad = viewHeight * 0.38;
      const center = {
        x: viewHeight * 0.425,
        y: viewHeight * 0.575,
      }
      const color = this.$d3.scaleOrdinal(this.$d3.schemeSet1)

      const labels = this[`${elementRef}Svg`]
        .append('g')
          .attr('transform', `translate(${center.x+pieRad+10}, ${center.y-pieRad})`);
      
      const label = labels.selectAll('g')
        .data(this.continentData)
        .enter()
          .append('g')
            .attr('transform', (d, i) => `translate(0, ${i*(labelHeight+2)})`);

      label.append('rect')
        .attr('fill', (d, i) => color(i))
        .attr('height', labelHeight)
        .attr('width', labelWidth);

      label.append('text')
        .attr('class', 'label-text')
        .attr('transform', `translate(${labelWidth+4}, ${labelHeight/2+4})`)
        .text(d => d.continent);

      labels.append('rect')
        // .attr('x', labelWidth-1)
        .attr('fill', this.$tw.colors.secondary)
        .attr('height', (labelHeight+2)*this.continentData.length-2)
        .attr('width', 2);

      const vis = this[`${elementRef}Svg`]
        .data(this.continentData)
        .append('g')
          .attr('transform', `translate(${center.x}, ${center.y})`)

      const pieTitle = this[`${elementRef}Svg`]
        .append('text')
          .attr('transform', `translate(${viewHeight*0.05}, ${viewHeight*0.1})`)
          .attr('class', 'pie-title')
          .text(title)

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
        .on('mouseover', (d, i) => {
          const prize = this.$d3.format('$,.2f')(this.continentData[i].prize);
          const player = this.continentData[i].player;
          const distribution = this.$d3.format('.2%')((d.endAngle - d.startAngle)/(2*Math.PI));

          this.$d3.select(`#${this.continentData[i].continent.replace(' ', '')}`)
            .classed('highlighted', true);
          this.$d3.select('.information .title').text(this.continentData[i].continent.toUpperCase());
          this.$d3.select('.information .content.prize').text(`PRIZE: ${prize}`);
          this.$d3.select('.information .content.player').text(`PLAYER: ${player}`);
          this.$d3.select('.information .content.distribution').text(`DISTRIBUTION: ${distribution}`);
        })
        .on('mouseout', (d, i) => {
          if (this.currentFocusedContinent == ''){
            this.$d3.selectAll('.continent')
              .classed('highlighted', false);
          }
          
          this.$d3.select('.information .title').text('');
          this.$d3.select('.information .content.prize').text('');
          this.$d3.select('.information .content.player').text('Hover to see additional information');
          this.$d3.select('.information .content.distribution').text('');
        })
        .on('click', (d, i) => {
          this.currentFocusedContinent = this.continentData[i].continent;
          this.$d3.select(`#${this.continentData[i].continent.replace(' ', '')}`)
            .classed('highlighted', true);
        })
        .transition()
          .attrTween('d', d => {
            const i = this.$d3.interpolate(d.startAngle+0.1, d.endAngle);
            return (t) => {
              d.endAngle = i(t);
              return arc(d);
            }
          })
          .delay((d, i) => i*100)

      arcs.append('title')
        .text((d, i) => this.continentData[i].continent);
    },
    drawBar: function (elementRef, axisFormat) {
      const title = 'TOP 5 COUNTRIES';
      const viewHeight = this.parseNumber(this[`${elementRef}View`].style('height'))
      const viewWidth = this.parseNumber(this[`${elementRef}View`].style('width'))
      const barHeight = viewHeight * 0.125;
      const barWidth = viewWidth * 0.35;
      const posX = viewWidth * 0.55;
      const posY = viewHeight * 0.175;
      const barData = this.countryData
        .sort((a, b) => b[this.dataType[elementRef]] - a[this.dataType[elementRef]])
        .slice(0, 5);
      const barMargin = 5;
      
      const x = this.$d3.scaleLinear()
        .domain([0, this.$d3.max(barData, (d) => d[this.dataType[elementRef]])])
        .range([0, barWidth]);

      const y = this.$d3.scaleBand()
        .domain(barData.map(el => el.iso3))
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

      const barTitle = this[`${elementRef}Svg`]
        .append('text')
          .attr('class', 'bar-title')
          .attr('transform', `translate(${posX}, ${viewHeight*0.1})`)
          .text(title);
      
      const bar = chart.selectAll('g')
        .data(barData)
        .enter()
        .append('g')
          .classed('bar', true)
          .attr('transform', (d, i) => `translate(0, ${i*(barHeight+barMargin)})`)
      
      bar.append('rect')
          .attr('fill', this.$tw.colors.tertiary)
          .attr('width', 0)
          .attr('height', barHeight)
          .on('mouseover', (d, i) => {
            this.$d3.select(`#${d.iso3}`)
              .classed('highlighted', true);
          })
          .on('mouseout', (d, i) => {
            this.$d3.selectAll('.country')
              .classed('highlighted', false);
          })
          .transition()
            .attr('width', (d) => x(d[this.dataType[elementRef]]))
            .delay(250)
            .ease();

      bar.append('text')
        .attr('class', 'bar-text')
        .attr('x', (d) => x(d[this.dataType[elementRef]]) + 2)
        .attr('y', (d, i) => (barHeight/2) + barMargin)
        .text((d) => axisFormat(d[this.dataType[elementRef]]))

      bar.append('title')
        .text(d => `${d.country}, ${this.$d3.format('$,.2f')(d[this.dataType[elementRef]])}`);
      
      chart.append('g')
        .classed('x axis', true)
        .attr('transform', `translate(0, ${barData.length*(barHeight+barMargin)})`)
        .call(xAxis);
      
      chart.append('g')
        .classed('y axis', true)
        .attr('transform', 'translate(0, -1)')
        .call(yAxis);
    },
    drawFocusedBar: function (elementRef, axisFormat = '', focusedContinent = 'North America') {
      var prefix = '';

      if (elementRef == 'prize-dist') {
          prefix = '$';
      }

      const title = 'TOP 5 ' + focusedContinent.toUpperCase() + ' COUNTRIES';
      const viewHeight = this.parseNumber(this[`${elementRef}View`].style('height'))
      const viewWidth = this.parseNumber(this[`${elementRef}View`].style('width'))
      const barHeight = viewHeight * 0.7;
      const barWidth = viewWidth * 0.030;
      const posX = viewWidth * 0.05;
      const posY = viewHeight * 0.125;

      function filterByContinent(item) {
        return (item.continent == focusedContinent);
      }

      const barData = this.countryData
        .filter(filterByContinent)
        .sort((a, b) => b[this.dataType[elementRef]] - a[this.dataType[elementRef]])
        .slice(0, 5);

      const barMargin = barWidth * 1.2;
      
      const x = this.$d3.scaleBand()
        .domain(barData.map(el => el.iso3))
        .range([0, barData.length*(barWidth + 2 * barMargin)]);;

      const y = this.$d3.scaleLinear()
        .domain([0, this.$d3.max(barData, (d) => d[this.dataType[elementRef]])])
        .range([0, barHeight]);

      const bottomAxis = this.$d3.axisBottom()
        .scale(x)
        .tickSize(0)

      const chart = this[`${elementRef}Svg`]
        .append('g')
          .attr('transform', `translate(${posX}, ${posY})`)

      const barTitle = this[`${elementRef}Svg`]
        .append('text')
          .attr('class', 'bar-title')
          .attr('transform', `translate(${posX}, ${viewHeight*0.1})`)
          .text(title);
      
      const bar = chart.selectAll('g')
        .data(barData)
        .enter()
        .append('g')
          .classed('bar', true)
      
      bar.append('rect')
          .attr('fill', this.$tw.colors.tertiary)
          .attr('x', (d, i) => i*(barWidth+ 2 * barMargin) + barMargin)
          .attr('y', (d) => barHeight - y(d[this.dataType[elementRef]]))
          .attr('width', barWidth)
          //TODO: tambah mouseover ke axes, ada data yang sangat kecil e.g. North America
          .on('mouseover', (d, i) => {
            this.$d3.select(`#${d.iso3}`)
              .classed('highlighted', true);
          })
          .on('mouseout', (d, i) => {
            this.$d3.selectAll('.country')
              .classed('highlighted', false);
          })
          .transition()
            .attr('height', (d) =>  y(d[this.dataType[elementRef]]))
            .delay(250)
            .ease();;

      if (elementRef == 'player-dist'){
          bar.append('title')
              .text(d => `${d.country}, ${(d[this.dataType[elementRef]])} players`);
      } else if (elementRef == 'prize-dist') {
          bar.append('title')
              .text(d => `${d.country}, ${this.$d3.format('$,.2f')(d[this.dataType[elementRef]])}`);
      }
      
      
      chart.append('g')
        .classed('x axis', true)
        .attr('transform', `translate(0, ${barHeight})`)
        .call(bottomAxis);
      
      chart.append('line')
        .style('stroke', this.$tw.colors.secondary)
        .attr('x1', barMargin)
        .attr('y1', 0)
        .attr('x2', barMargin + 2.5 * (barWidth + 2 * barMargin))
        .attr('y2', 0)

      chart.append('text')
        .attr('class', 'bar-text')
        .attr('x', barMargin + 2 * (barWidth + 2 * barMargin))
        .attr('y', barMargin * 0.5)
        .text(prefix + this.$d3.format(',.1f')(barData[0][this.dataType[elementRef]]))
    },
    drawStats: function (elementRef, focusedContinent = 'Asia') {
      const title = focusedContinent.toUpperCase() + ' STATISTICS'
      const viewHeight = this.parseNumber(this[`${elementRef}View`].style('height'))
      const viewWidth = this.parseNumber(this[`${elementRef}View`].style('width'))
      const posX = viewWidth * 0.65;
      const posY = viewHeight * 0.125;

      var prefix = '';

      if (elementRef == 'prize-dist') {
          prefix = '$';
      }

      const display = this[`${elementRef}Svg`]
        .append('g')
        .attr('transform', `translate(${posX}, ${posY})`)

      const statTitle = this[`${elementRef}Svg`]
        .append('text')
          .attr('transform', `translate(${viewHeight*0.05}, ${viewHeight*0.1})`)
          .attr('transform', `translate(${posX}, ${posY})`)
          .attr('class', 'pie-title')
          .text(title)

      const displayData = this.countryData
        .filter(filterByContinent)
        .sort((a, b) => b[this.dataType[elementRef]] - a[this.dataType[elementRef]])
    
      const worldWideTotal = this.countryData.reduce(function (acc, curr) {
        if (!acc.prize && !acc.player) {
          acc = {
            prize: 0,
            player: 0
          }
        }
        acc.prize += curr.prize ? curr.prize : 0;
        acc.player += curr.player ? curr.player : 0;
        return acc;
      }, {});

      function filterByContinent(item) {
        return (item.continent == focusedContinent);
      }

      const continentTotal = displayData.reduce(function (acc, curr) {
        if (!acc.prize && !acc.player) {
          acc = {
            prize: 0,
            player: 0
          }
        }

        acc.prize += curr.prize ? curr.prize : 0;
        acc.player += curr.player ? curr.player : 0;
        return acc;
      }, {});

      const mean = (continentTotal[this.dataType[elementRef]] / displayData.length);

      let lowMiddle = Math.floor((displayData.length - 1) / 2);
      let highMiddle = Math.ceil((displayData.length - 1) / 2);

      const median = (displayData[lowMiddle][this.dataType[elementRef]] + displayData[highMiddle][this.dataType[elementRef]]) / 2;

      display.append('text')
        .attr('class', 'bar-text')
        .attr('x', 0)
        .attr('y', viewHeight * 0.1)
        .text('Total    : ' + prefix + this.$d3.format(',.0f')(continentTotal[this.dataType[elementRef]]))

      display.append('text')
        .attr('class', 'subdisplay-text')
        .attr('x', 0)
        .attr('y', viewHeight * 0.15)
        .text(this.$d3.format(',.1f')(continentTotal[this.dataType[elementRef]] * 100/worldWideTotal[this.dataType[elementRef]]) + '% worldwide')

      display.append('text')
        .attr('class', 'bar-text')
        .attr('x', 0)
        .attr('y', viewHeight * 0.4)
        .text('Mean     : ' + prefix + this.$d3.format(',.0r')(mean))

      display.append('text')
        .attr('class', 'bar-text')
        .attr('x', 0)
        .attr('y', viewHeight * 0.7)
        .text('Median   : ' + prefix + this.$d3.format(',.0r')(median))

      if (elementRef == 'prize-dist') {
        const backButton = display.append('polyline')
          .style('stroke', this.$tw.colors.secondary)
          .style('fill', 'none')
          .style('stroke-width', 5)
          .attr('points', '12,0 0,12 12,24')
          .attr('transform', `translate(${viewWidth * 0.3}, -${viewHeight * 0.075})`)
          .on('click', () => {
            this.currentFocusedContinent = '';
            this.$d3.selectAll('.continent')
              .classed('highlighted', false);
          })
          //event still buggy
          .on('mouseover', () => {
            this.$d3.select(backButton).style('stroke', this.$tw.colors.tertiary)
          })
          .on('mouseout', () => {
            this.$d3.select(backButton).style('stroke', this.$tw.colors.secondary)
          })
          .append('title')
              .text('Go Back to Overview')
          
      }    
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
.button {
  max-width: 8rem;
  letter-spacing: 1pt;
  @apply border border-white border-2 text-white text-xs text-center font-semibold p-2 mt-2 mr-2;
}

.button:hover {
  @apply bg-white text-primary;
}

.button.active {
  @apply bg-white text-primary;
}

.bar {
  @apply mb-2;
}

.bar-text {
  fill: white;
}

.subdisplay-text{
  fill: white;
  font-size: 60%
}

.dist .axis .domain, .dist .axis .tick line {
  stroke-width: 2px;
  @apply stroke-secondary;
}

.dist .x.axis .tick text {
  fill: white;
  font-size: 0.4rem;
}

.dist .y.axis .tick text {
  fill: white;
  font-size: 0.5rem;
}

.pie-title, .bar-title {
  @apply fill-tertiary font-semibold;
}

.label-text {
  @apply fill-white text-xs;
}

.continent {
  fill: none;
}

.continent.highlighted {
  stroke-width: 2px;
  @apply stroke-secondary fill-tertiary;
}

.country.highlighted {
  stroke-width: 2px;
  @apply stroke-secondary;
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

.content {
  font-family: Orbitron;
  letter-spacing: 1pt;
  @apply text-white mt-2 mb-1;
}

g.tick text, g.parameter-value text {
  font-family: Orbitron;
  letter-spacing: 2pt;
  @apply text-base font-bold fill-tertiary;
}

g.tick text {

}

g.parameter-value text {
  fill: white;
  @apply text-tertiary;
}

.handle {
  stroke-width: 2px;
  @apply fill-primary stroke-tertiary;
}

line.track, line.track-inset {
  @apply stroke-tertiary;
}
</style>
