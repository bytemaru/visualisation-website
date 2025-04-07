import * as d3 from 'd3';

const width = 900;
const height = 700;

const mapSvg = d3.select("#map").append("svg").attr("width", width).attr("height", height);

const projection = d3.geoMercator().center([172, -41])      // approx NZ center
    .scale(2000)             // adjust until it fits
    .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

const tooltip = d3.select("#district-tooltip");
let mouseTrackFunctions = {};
let mouseX;
let mouseY;

document.onmousemove = function (event) {
    mouseX = event.pageX;
    mouseY = event.pageY;

    for (const trackFunction in mouseTrackFunctions){
        if (typeof mouseTrackFunctions[trackFunction] === 'function') {
            mouseTrackFunctions[trackFunction]();
        }
    }
}

function tooltipHover(){
    tooltip.style("left", `${mouseX + 10}px`)
        .style("top", `${mouseY + 10}px`);
}

d3.json("/static/geojson/nz.geojson").then(data => {
    mapSvg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#cce5df")
        .attr("stroke", "#333")
        .on("mouseover", function (event, data) {
            tooltip.classed("hidden", false).html(`<strong>${data.properties.name}</strong>`);
            mouseTrackFunctions["tooltipHover"] = tooltipHover;
        })
        .on("mouseout", function () {
            tooltip.classed("hidden", true);
            delete mouseTrackFunctions["tooltipHover"];
        });
}).catch(error => {
    console.error("❌ Error loading NZ geojson:", error);
});

d3.json("/static/geojson/lakewaterquality.geojson").then(lakedata => {
    const lakeGroup = mapSvg.append("g").attr("id", "lake-layer");
    lakeGroup.selectAll("path")
        .data(lakedata.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#cce5df")
        .attr("stroke", "#333");
}).catch(error => {
    console.error("❌ Error loading NZ geojson:", error);
});

mapSvg.append("g");

const zoom = d3.zoom().scaleExtent([1, 4]).on("zoom", zoomed);


// apply configured zoom behaviour to our svg
mapSvg.call(zoom);

function zoomed(event) {
    const { transform } = event;
    // apply calculated transform to the image
    mapSvg.attr("transform", transform.toString());
}