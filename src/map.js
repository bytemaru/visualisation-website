import * as d3 from 'd3';

const width = 900;
const height = 700;

const svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
const projection = d3.geoMercator().center([172, -41])      // approx NZ center
    .scale(2000)             // adjust until it fits
    .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

d3.json("/static/geojson/nz.geojson").then(data => {
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#cce5df")
        .attr("stroke", "#333");
}).catch(error => {
    console.error("❌ Error loading NZ geojson:", error);
});
