// import Vue from 'vue';
const d3 = require('d3');

// Vue.prototype.$d3 = d3;
export default ({ app }, inject) => {
    inject('d3', d3);
}