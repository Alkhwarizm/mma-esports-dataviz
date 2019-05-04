// import Vue from 'vue';
const d3 = require('d3');
const slider = require('d3-simple-slider');

// Vue.prototype.$d3 = d3;
export default ({ app }, inject) => {
    inject('d3', {...d3, ...slider});
}