import * as d3 from 'd3';

const width = 900;
const height = 700;

const mapSvg = d3.select("#map").append("svg").attr("width", width).attr("height", height);


const projection = d3.geoMercator().center([172, -41])      // approx NZ center
    .scale(2000)             // adjust until it fits
    .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

const tooltip = d3.select("#district-tooltip");
const infobox = d3.select("#lake-info-popup")
const checkedbox = document.getElementById("toggle-lakes");
let mouseTrackFunctions = {};
let mouseX;
let mouseY;

let selectedIndicator = "TP";

let lakeGroup;

let regionGroup;

let colouringGroup;

document.getElementById("indicator-select").addEventListener("change", function(e) {
    selectedIndicator = e.target.value;
    updateLakeLayer();
});

document.onmousemove = function (event) {
    mouseX = event.pageX;
    mouseY = event.pageY;

    for (const trackFunction in mouseTrackFunctions){
        if (typeof mouseTrackFunctions[trackFunction] === 'function') {
            mouseTrackFunctions[trackFunction]();
        }
    }
}

document.getElementById("toggle-lakes").addEventListener("change", function (event) {
    if (checkedbox.checked) {
        lakeGroup.selectAll("path").attr("opacity", 1)
    } else {
        lakeGroup.selectAll("path").attr("opacity", 0)
    }
})

function tooltipHover(){
    tooltip.style("left", `${mouseX + 10}px`)
        .style("top", `${mouseY + 10}px`);
}

function infoboxPoping(){
    infobox.style("left", `${mouseX + 10}px`)
    .style("top", `${mouseY + 10}px`);
}


function drawMapNZ(){
    d3.json("/static/geojson/nz.geojson").then(data => {
        regionGroup = mapSvg.append("g").attr("id", "region-layer")

    regionGroup.selectAll("path")
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
        })
    lakeGroup = mapSvg.append("g").attr("id", "lake-layer");
    updateLakeLayer();
    colouringGroup = mapSvg.append("g").attr("id", "colour-layer");
    mapColouring();
    d3.select("#indicator-select").on("change", () => {
        updateLakeLayer(); // redraw with updated indicator
        mapColouring();
    });

});}


function updateLakeLayer() {

    mapSvg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);

    infobox.classed("hidden", false)
        .html(``);

    d3.json("/static/geojson/lakewaterquality.geojson").then(lakedata =>{
        lakeGroup.remove();
        lakeGroup = mapSvg.append("g").attr("id", "lake-layer");


        lakeGroup.selectAll("path")
            .data(lakedata.features.filter(f => f.properties.indicator === selectedIndicator))
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#cce5df")
            .attr("stroke", "#333")
            .on("click", function (event, data) {
                lakeGroup.selectAll("path")
                    .attr("fill", "#cce5df")
                infobox.classed("hidden", false)
                    .html(`<strong>${data.properties.lake_name}<br></strong>
                            <strong>${data.properties.lake_type}<br></strong>
                            <strong>${data.properties.region}<br></strong>
                            <strong>${data.properties.indicator_name}<br></strong>
                            <strong>${data.properties.value}<br></strong>
                            <strong>${data.properties.units}<br></strong>`);
                mouseTrackFunctions["infoboxPoping"] = infoboxPoping;
                d3.select(this)
                    .raise()
                    .transition()
                    .duration(150)
                    .attr("fill", "black")
                    .attr("r", 10)
                    .transition()
                    .duration(300)
                    .attr("r", 5)
                    .attr("fill", "#f0f")
        }
        )
})}

const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);


// apply configured zoom behaviour to our svg
mapSvg.call(zoom);

function zoomed(event) {
    const { transform } = event;
    // apply calculated transform to the image
    mapSvg.attr("transform", transform.toString());
}

function mapColouring() {
    colouringGroup.remove();

    colouringGroup = mapSvg.append("g").attr("id", "colour-layer");


    d3.json("/static/geojson/lakewaterquality.geojson").then(lakeData => {
        const filtered = lakeData.features.filter(f => f.properties.indicator === selectedIndicator);

        console.log(filtered);

        const avgByRegion = d3.rollups(
            filtered,
            v => d3.mean(v, d => +d.properties.value),
            d => d.properties.region
        );

        console.log(avgByRegion);

        const regionColorData = new Map(avgByRegion);

        const colorScale = d3.scaleSequential()
            .domain(d3.extent(avgByRegion, d => d[1])) // min-max values
            .interpolator(d3.interpolateYlGnBu); // or interpolateOrRd, interpolateViridis, etc.


        regionGroup.selectAll("path")
            .attr("fill", d => {
                const regionName = d.properties.name;
                const avg = regionColorData.get(regionName);
                return avg !== undefined ? colorScale(avg) : "#ccc"; // gray for missing
            })

        const [min, max] = d3.extent(avgByRegion, d => d[1]);
        console.log(min);
        console.log(max);

        // Remove existing legend if any
        d3.select("#legend svg").remove();

// Create SVG for legend
        const legendWidth = 200;
        const legendHeight = 10;

        const legendSvg = d3.select("#legend")
            .append("svg")
            .attr("width", legendWidth + 50)
            .attr("height", 40);

// Create gradient definition
        const defs = legendSvg.append("defs");

        const linearGradient = defs.append("linearGradient")
            .attr("id", "legend-gradient");

        linearGradient.selectAll("stop")
            .data(d3.ticks(0, 1, 10)) // divide gradient into 10 steps
            .enter().append("stop")
            .attr("offset", d => `${d * 100}%`)
            .attr("stop-color", d => colorScale(d3.interpolateNumber(min, max)(d))); // range from min to max

// Background rect with gradient
        legendSvg.append("rect")
            .attr("x", 20)
            .attr("y", 10)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)");

// Legend axis (scale)
        const legendScale = d3.scaleLinear()
            .domain([min, max])
            .range([20, 20 + legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5)
            .tickFormat(d3.format(".2f"));

        legendSvg.append("g")
            .attr("transform", `translate(0, ${10 + legendHeight})`)
            .call(legendAxis);
})}

drawMapNZ();

d3.select("#center-map").on("click", () => {
    mapSvg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
});