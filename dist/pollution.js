/******/ (() => { // webpackBootstrap
/*!**************************!*\
  !*** ./src/pollution.js ***!
  \**************************/
d3.csv("/data/lake-water-quality-state-2016-2020.csv").then(data => {
    const indicators = Array.from(new Set(data.map(d => d.indicator_name))).sort();
    const indicatorSelect = d3.select("#indicator-select");

    indicatorSelect.selectAll("option")
        .data(indicators)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    const defaultIndicator = indicators[0];
    indicatorSelect.property("value", defaultIndicator);

    const tooltip = d3.select("#tooltip");

    const colorLevel = [
        {color: "#990000", label: "Very High", min: 2.8},
        {color: "#e34a33", label: "High", min: 2.3},
        {color: "#fdbb84", label: "Moderate", min: 1.8},
        {color: "#fee8c8", label: "Low", min: 0}
    ];

    function renderChart(selectedIndicator) {
        d3.select("#polluted-chart").html("");
        d3.select("#gradient-legend").html("");

        d3.select("#main-heading")
            .text(`Top 10 Lakes by Pollution Level (${selectedIndicator})`);

        const filtered = data.filter(d =>
            d["measurement"]?.trim().toLowerCase() === "median" &&
            d["indicator_name"]?.trim().toLowerCase() === selectedIndicator.trim().toLowerCase()
        );

        const averageByLake = d3.rollups(
            filtered,
            v => d3.mean(v, d => +d.value),
            d => d.lake_name
        );

        const top10 = averageByLake.sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (top10.length === 0) return;

        const width = 950, height = 500;
        const margin = {top: 30, right: 200, bottom: 100, left: 240};

        const svg = d3.select("#polluted-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3.scaleLinear()
            .domain([0.0, d3.max(top10, d => d[1]) * 1.05])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleBand()
            .domain(top10.map(d => d[0]))
            .range([margin.top, height - margin.bottom])
            .padding(0.2);

        const color = d3.scaleLinear()
            .domain([d3.min(top10, d => d[1]), d3.max(top10, d => d[1])])
            .range(["#fee8c8", "#990000"]);

        svg.selectAll("rect")
            .data(top10, d => d[0])
            .enter()
            .append("rect")
            .attr("x", x(0))
            .attr("y", d => y(d[0]))
            .attr("height", y.bandwidth())
            .attr("width", 0)
            .attr("fill", d => color(d[1]))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(100).style("opacity", 0.95);
                tooltip.html(
                    `<strong>Lake:</strong> ${d[0]}<br>` +
                    `<strong>${selectedIndicator}:</strong> ${d[1].toFixed(2)}`
                )
                    .style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mousemove", event => {
                tooltip.style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(200).style("opacity", 0);
            })
            .transition()
            .duration(800)
            .attr("width", d => x(d[1]) - x(0));

        svg.selectAll("text.value")
            .data(top10, d => d[0])
            .enter()
            .append("text")
            .attr("x", x(0))
            .attr("y", d => y(d[0]) + y.bandwidth() / 2 + 5)
            .attr("fill", "black")
            .attr("font-size", "16px")
            .text(d => d[1].toFixed(2))
            .transition()
            .duration(800)
            .attr("x", d => x(d[1]) + 5);

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y).tickSize(0))
            .selectAll("text")
            .attr("font-size", "14px");

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format(".1f")))
            .selectAll("text")
            .attr("font-size", "14px");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 60)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .attr("fill", "#333")
            .text(`Average ${selectedIndicator} Level`);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", margin.left - 200)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .attr("fill", "#333")
            .text("Name of the Lakes");

        const legend = svg.append("g")
            .attr("transform", `translate(${width - 160}, ${margin.top})`);

        legend.append("text")
            .text("Pollution Categories")
            .attr("font-size", "16px")
            .attr("font-weight", "bold");

        colorLevel.forEach((level, i) => {
            legend.append("rect")
                .attr("y", 25 + i * 25)
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", level.color);

            legend.append("text")
                .attr("x", 25)
                .attr("y", 25 + i * 25 + 13)
                .text(level.label)
                .attr("font-size", "12px");
        });

        const legendWidth = 600, legendHeight = 20;
        const legendSvg = d3.select("#gradient-legend")
            .append("svg")
            .attr("width", legendWidth + 40)
            .attr("height", 90);

        legendSvg.append("text")
            .attr("x", (legendWidth + 40) / 2)
            .attr("y", 18)
            .attr("text-anchor", "middle")
            .attr("font-size", "18px")
            .attr("font-weight", "bold")
            .text("Pollution Level (Average)");

        const defs = legendSvg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "legend-gradient");

        gradient.selectAll("stop")
            .data([
                {offset: "0%", color: "#fee8c8"},
                {offset: "100%", color: "#990000"}
            ])
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        legendSvg.append("rect")
            .attr("x", 20)
            .attr("y", 28)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)")
            .style("stroke", "#333")
            .style("stroke-width", "1.2px")
            .on("mousemove", function (event) {
                const mouseX = d3.pointer(event, this)[0];
                const value = d3.scaleLinear()
                    .domain([0, legendWidth])
                    .range([0.0, d3.max(top10, d => d[1])])
                    .clamp(true)(mouseX);

                tooltip.transition().duration(50).style("opacity", 0.9);
                tooltip.html(`<strong>Pollution Level:</strong> ${value.toFixed(2)}`)
                    .style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY - 40 + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(100).style("opacity", 0);
            });

        legendSvg.append("g")
            .attr("transform", `translate(0, ${28 + legendHeight})`)
            .call(d3.axisBottom(d3.scaleLinear()
                .domain([0.0, d3.max(top10, d => d[1])])
                .range([20, 20 + legendWidth])
            ).tickSize(0).tickFormat(() => ""))
            .selectAll("text").remove();
    }

    renderChart(defaultIndicator);
    indicatorSelect.on("change", () => {
        renderChart(indicatorSelect.property("value"));
    });
});
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sbHV0aW9uLmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxTQUFTLCtDQUErQztBQUN4RCxTQUFTLDBDQUEwQztBQUNuRCxTQUFTLDhDQUE4QztBQUN2RCxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0RBQXNELGtCQUFrQjs7QUFFeEU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0JBQXdCOztBQUV4QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhDQUE4QyxLQUFLO0FBQ25ELCtCQUErQixrQkFBa0IsYUFBYSxnQkFBZ0I7QUFDOUU7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0Q0FBNEMsWUFBWTtBQUN4RDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwrQ0FBK0MsdUJBQXVCO0FBQ3RFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QixtQkFBbUI7O0FBRWhEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDRDQUE0QyxZQUFZLElBQUksV0FBVzs7QUFFdkU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxpQkFBaUIsK0JBQStCO0FBQ2hELGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrRUFBa0UsaUJBQWlCO0FBQ25GO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQSwrQ0FBK0Msa0JBQWtCO0FBQ2pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsQ0FBQyxFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vc3JjL3BvbGx1dGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJkMy5jc3YoXCIvZGF0YS9sYWtlLXdhdGVyLXF1YWxpdHktc3RhdGUtMjAxNi0yMDIwLmNzdlwiKS50aGVuKGRhdGEgPT4ge1xuICAgIGNvbnN0IGluZGljYXRvcnMgPSBBcnJheS5mcm9tKG5ldyBTZXQoZGF0YS5tYXAoZCA9PiBkLmluZGljYXRvcl9uYW1lKSkpLnNvcnQoKTtcbiAgICBjb25zdCBpbmRpY2F0b3JTZWxlY3QgPSBkMy5zZWxlY3QoXCIjaW5kaWNhdG9yLXNlbGVjdFwiKTtcblxuICAgIGluZGljYXRvclNlbGVjdC5zZWxlY3RBbGwoXCJvcHRpb25cIilcbiAgICAgICAgLmRhdGEoaW5kaWNhdG9ycylcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZChcIm9wdGlvblwiKVxuICAgICAgICAuYXR0cihcInZhbHVlXCIsIGQgPT4gZClcbiAgICAgICAgLnRleHQoZCA9PiBkKTtcblxuICAgIGNvbnN0IGRlZmF1bHRJbmRpY2F0b3IgPSBpbmRpY2F0b3JzWzBdO1xuICAgIGluZGljYXRvclNlbGVjdC5wcm9wZXJ0eShcInZhbHVlXCIsIGRlZmF1bHRJbmRpY2F0b3IpO1xuXG4gICAgY29uc3QgdG9vbHRpcCA9IGQzLnNlbGVjdChcIiN0b29sdGlwXCIpO1xuXG4gICAgY29uc3QgY29sb3JMZXZlbCA9IFtcbiAgICAgICAge2NvbG9yOiBcIiM5OTAwMDBcIiwgbGFiZWw6IFwiVmVyeSBIaWdoXCIsIG1pbjogMi44fSxcbiAgICAgICAge2NvbG9yOiBcIiNlMzRhMzNcIiwgbGFiZWw6IFwiSGlnaFwiLCBtaW46IDIuM30sXG4gICAgICAgIHtjb2xvcjogXCIjZmRiYjg0XCIsIGxhYmVsOiBcIk1vZGVyYXRlXCIsIG1pbjogMS44fSxcbiAgICAgICAge2NvbG9yOiBcIiNmZWU4YzhcIiwgbGFiZWw6IFwiTG93XCIsIG1pbjogMH1cbiAgICBdO1xuXG4gICAgZnVuY3Rpb24gcmVuZGVyQ2hhcnQoc2VsZWN0ZWRJbmRpY2F0b3IpIHtcbiAgICAgICAgZDMuc2VsZWN0KFwiI3BvbGx1dGVkLWNoYXJ0XCIpLmh0bWwoXCJcIik7XG4gICAgICAgIGQzLnNlbGVjdChcIiNncmFkaWVudC1sZWdlbmRcIikuaHRtbChcIlwiKTtcblxuICAgICAgICBkMy5zZWxlY3QoXCIjbWFpbi1oZWFkaW5nXCIpXG4gICAgICAgICAgICAudGV4dChgVG9wIDEwIExha2VzIGJ5IFBvbGx1dGlvbiBMZXZlbCAoJHtzZWxlY3RlZEluZGljYXRvcn0pYCk7XG5cbiAgICAgICAgY29uc3QgZmlsdGVyZWQgPSBkYXRhLmZpbHRlcihkID0+XG4gICAgICAgICAgICBkW1wibWVhc3VyZW1lbnRcIl0/LnRyaW0oKS50b0xvd2VyQ2FzZSgpID09PSBcIm1lZGlhblwiICYmXG4gICAgICAgICAgICBkW1wiaW5kaWNhdG9yX25hbWVcIl0/LnRyaW0oKS50b0xvd2VyQ2FzZSgpID09PSBzZWxlY3RlZEluZGljYXRvci50cmltKCkudG9Mb3dlckNhc2UoKVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGF2ZXJhZ2VCeUxha2UgPSBkMy5yb2xsdXBzKFxuICAgICAgICAgICAgZmlsdGVyZWQsXG4gICAgICAgICAgICB2ID0+IGQzLm1lYW4odiwgZCA9PiArZC52YWx1ZSksXG4gICAgICAgICAgICBkID0+IGQubGFrZV9uYW1lXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgdG9wMTAgPSBhdmVyYWdlQnlMYWtlLnNvcnQoKGEsIGIpID0+IGJbMV0gLSBhWzFdKS5zbGljZSgwLCAxMCk7XG4gICAgICAgIGlmICh0b3AxMC5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgICAgICBjb25zdCB3aWR0aCA9IDk1MCwgaGVpZ2h0ID0gNTAwO1xuICAgICAgICBjb25zdCBtYXJnaW4gPSB7dG9wOiAzMCwgcmlnaHQ6IDIwMCwgYm90dG9tOiAxMDAsIGxlZnQ6IDI0MH07XG5cbiAgICAgICAgY29uc3Qgc3ZnID0gZDMuc2VsZWN0KFwiI3BvbGx1dGVkLWNoYXJ0XCIpXG4gICAgICAgICAgICAuYXBwZW5kKFwic3ZnXCIpXG4gICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblxuICAgICAgICBjb25zdCB4ID0gZDMuc2NhbGVMaW5lYXIoKVxuICAgICAgICAgICAgLmRvbWFpbihbMC4wLCBkMy5tYXgodG9wMTAsIGQgPT4gZFsxXSkgKiAxLjA1XSlcbiAgICAgICAgICAgIC5yYW5nZShbbWFyZ2luLmxlZnQsIHdpZHRoIC0gbWFyZ2luLnJpZ2h0XSk7XG5cbiAgICAgICAgY29uc3QgeSA9IGQzLnNjYWxlQmFuZCgpXG4gICAgICAgICAgICAuZG9tYWluKHRvcDEwLm1hcChkID0+IGRbMF0pKVxuICAgICAgICAgICAgLnJhbmdlKFttYXJnaW4udG9wLCBoZWlnaHQgLSBtYXJnaW4uYm90dG9tXSlcbiAgICAgICAgICAgIC5wYWRkaW5nKDAuMik7XG5cbiAgICAgICAgY29uc3QgY29sb3IgPSBkMy5zY2FsZUxpbmVhcigpXG4gICAgICAgICAgICAuZG9tYWluKFtkMy5taW4odG9wMTAsIGQgPT4gZFsxXSksIGQzLm1heCh0b3AxMCwgZCA9PiBkWzFdKV0pXG4gICAgICAgICAgICAucmFuZ2UoW1wiI2ZlZThjOFwiLCBcIiM5OTAwMDBcIl0pO1xuXG4gICAgICAgIHN2Zy5zZWxlY3RBbGwoXCJyZWN0XCIpXG4gICAgICAgICAgICAuZGF0YSh0b3AxMCwgZCA9PiBkWzBdKVxuICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAuYXR0cihcInhcIiwgeCgwKSlcbiAgICAgICAgICAgIC5hdHRyKFwieVwiLCBkID0+IHkoZFswXSkpXG4gICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCB5LmJhbmR3aWR0aCgpKVxuICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAwKVxuICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIGQgPT4gY29sb3IoZFsxXSkpXG4gICAgICAgICAgICAub24oXCJtb3VzZW92ZXJcIiwgKGV2ZW50LCBkKSA9PiB7XG4gICAgICAgICAgICAgICAgdG9vbHRpcC50cmFuc2l0aW9uKCkuZHVyYXRpb24oMTAwKS5zdHlsZShcIm9wYWNpdHlcIiwgMC45NSk7XG4gICAgICAgICAgICAgICAgdG9vbHRpcC5odG1sKFxuICAgICAgICAgICAgICAgICAgICBgPHN0cm9uZz5MYWtlOjwvc3Ryb25nPiAke2RbMF19PGJyPmAgK1xuICAgICAgICAgICAgICAgICAgICBgPHN0cm9uZz4ke3NlbGVjdGVkSW5kaWNhdG9yfTo8L3N0cm9uZz4gJHtkWzFdLnRvRml4ZWQoMil9YFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKFwibGVmdFwiLCBldmVudC5wYWdlWCArIDE1ICsgXCJweFwiKVxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgZXZlbnQucGFnZVkgLSAyOCArIFwicHhcIik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uKFwibW91c2Vtb3ZlXCIsIGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICB0b29sdGlwLnN0eWxlKFwibGVmdFwiLCBldmVudC5wYWdlWCArIDE1ICsgXCJweFwiKVxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgZXZlbnQucGFnZVkgLSAyOCArIFwicHhcIik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uKFwibW91c2VvdXRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRvb2x0aXAudHJhbnNpdGlvbigpLmR1cmF0aW9uKDIwMCkuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgICAgIC5kdXJhdGlvbig4MDApXG4gICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIGQgPT4geChkWzFdKSAtIHgoMCkpO1xuXG4gICAgICAgIHN2Zy5zZWxlY3RBbGwoXCJ0ZXh0LnZhbHVlXCIpXG4gICAgICAgICAgICAuZGF0YSh0b3AxMCwgZCA9PiBkWzBdKVxuICAgICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAuYXR0cihcInhcIiwgeCgwKSlcbiAgICAgICAgICAgIC5hdHRyKFwieVwiLCBkID0+IHkoZFswXSkgKyB5LmJhbmR3aWR0aCgpIC8gMiArIDUpXG4gICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJibGFja1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJmb250LXNpemVcIiwgXCIxNnB4XCIpXG4gICAgICAgICAgICAudGV4dChkID0+IGRbMV0udG9GaXhlZCgyKSlcbiAgICAgICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgICAgIC5kdXJhdGlvbig4MDApXG4gICAgICAgICAgICAuYXR0cihcInhcIiwgZCA9PiB4KGRbMV0pICsgNSk7XG5cbiAgICAgICAgc3ZnLmFwcGVuZChcImdcIilcbiAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHttYXJnaW4ubGVmdH0sIDApYClcbiAgICAgICAgICAgIC5jYWxsKGQzLmF4aXNMZWZ0KHkpLnRpY2tTaXplKDApKVxuICAgICAgICAgICAgLnNlbGVjdEFsbChcInRleHRcIilcbiAgICAgICAgICAgIC5hdHRyKFwiZm9udC1zaXplXCIsIFwiMTRweFwiKTtcblxuICAgICAgICBzdmcuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgwLCAke2hlaWdodCAtIG1hcmdpbi5ib3R0b219KWApXG4gICAgICAgICAgICAuY2FsbChkMy5heGlzQm90dG9tKHgpLnRpY2tzKDcpLnRpY2tGb3JtYXQoZDMuZm9ybWF0KFwiLjFmXCIpKSlcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjE0cHhcIik7XG5cbiAgICAgICAgc3ZnLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgIC5hdHRyKFwieFwiLCB3aWR0aCAvIDIpXG4gICAgICAgICAgICAuYXR0cihcInlcIiwgaGVpZ2h0IC0gNjApXG4gICAgICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjE4cHhcIilcbiAgICAgICAgICAgIC5hdHRyKFwiZm9udC13ZWlnaHRcIiwgXCJib2xkXCIpXG4gICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCIjMzMzXCIpXG4gICAgICAgICAgICAudGV4dChgQXZlcmFnZSAke3NlbGVjdGVkSW5kaWNhdG9yfSBMZXZlbGApO1xuXG4gICAgICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInJvdGF0ZSgtOTApXCIpXG4gICAgICAgICAgICAuYXR0cihcInhcIiwgLWhlaWdodCAvIDIpXG4gICAgICAgICAgICAuYXR0cihcInlcIiwgbWFyZ2luLmxlZnQgLSAyMDApXG4gICAgICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjE4cHhcIilcbiAgICAgICAgICAgIC5hdHRyKFwiZm9udC13ZWlnaHRcIiwgXCJib2xkXCIpXG4gICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCIjMzMzXCIpXG4gICAgICAgICAgICAudGV4dChcIk5hbWUgb2YgdGhlIExha2VzXCIpO1xuXG4gICAgICAgIGNvbnN0IGxlZ2VuZCA9IHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7d2lkdGggLSAxNjB9LCAke21hcmdpbi50b3B9KWApO1xuXG4gICAgICAgIGxlZ2VuZC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAudGV4dChcIlBvbGx1dGlvbiBDYXRlZ29yaWVzXCIpXG4gICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjE2cHhcIilcbiAgICAgICAgICAgIC5hdHRyKFwiZm9udC13ZWlnaHRcIiwgXCJib2xkXCIpO1xuXG4gICAgICAgIGNvbG9yTGV2ZWwuZm9yRWFjaCgobGV2ZWwsIGkpID0+IHtcbiAgICAgICAgICAgIGxlZ2VuZC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIDI1ICsgaSAqIDI1KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgMTgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMTgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIGxldmVsLmNvbG9yKTtcblxuICAgICAgICAgICAgbGVnZW5kLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgMjUpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIDI1ICsgaSAqIDI1ICsgMTMpXG4gICAgICAgICAgICAgICAgLnRleHQobGV2ZWwubGFiZWwpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJmb250LXNpemVcIiwgXCIxMnB4XCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBsZWdlbmRXaWR0aCA9IDYwMCwgbGVnZW5kSGVpZ2h0ID0gMjA7XG4gICAgICAgIGNvbnN0IGxlZ2VuZFN2ZyA9IGQzLnNlbGVjdChcIiNncmFkaWVudC1sZWdlbmRcIilcbiAgICAgICAgICAgIC5hcHBlbmQoXCJzdmdcIilcbiAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgbGVnZW5kV2lkdGggKyA0MClcbiAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDkwKTtcblxuICAgICAgICBsZWdlbmRTdmcuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIChsZWdlbmRXaWR0aCArIDQwKSAvIDIpXG4gICAgICAgICAgICAuYXR0cihcInlcIiwgMTgpXG4gICAgICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgICAgICAuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjE4cHhcIilcbiAgICAgICAgICAgIC5hdHRyKFwiZm9udC13ZWlnaHRcIiwgXCJib2xkXCIpXG4gICAgICAgICAgICAudGV4dChcIlBvbGx1dGlvbiBMZXZlbCAoQXZlcmFnZSlcIik7XG5cbiAgICAgICAgY29uc3QgZGVmcyA9IGxlZ2VuZFN2Zy5hcHBlbmQoXCJkZWZzXCIpO1xuICAgICAgICBjb25zdCBncmFkaWVudCA9IGRlZnMuYXBwZW5kKFwibGluZWFyR3JhZGllbnRcIilcbiAgICAgICAgICAgIC5hdHRyKFwiaWRcIiwgXCJsZWdlbmQtZ3JhZGllbnRcIik7XG5cbiAgICAgICAgZ3JhZGllbnQuc2VsZWN0QWxsKFwic3RvcFwiKVxuICAgICAgICAgICAgLmRhdGEoW1xuICAgICAgICAgICAgICAgIHtvZmZzZXQ6IFwiMCVcIiwgY29sb3I6IFwiI2ZlZThjOFwifSxcbiAgICAgICAgICAgICAgICB7b2Zmc2V0OiBcIjEwMCVcIiwgY29sb3I6IFwiIzk5MDAwMFwifVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgICAuYXBwZW5kKFwic3RvcFwiKVxuICAgICAgICAgICAgLmF0dHIoXCJvZmZzZXRcIiwgZCA9PiBkLm9mZnNldClcbiAgICAgICAgICAgIC5hdHRyKFwic3RvcC1jb2xvclwiLCBkID0+IGQuY29sb3IpO1xuXG4gICAgICAgIGxlZ2VuZFN2Zy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAuYXR0cihcInhcIiwgMjApXG4gICAgICAgICAgICAuYXR0cihcInlcIiwgMjgpXG4gICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIGxlZ2VuZFdpZHRoKVxuICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgbGVnZW5kSGVpZ2h0KVxuICAgICAgICAgICAgLnN0eWxlKFwiZmlsbFwiLCBcInVybCgjbGVnZW5kLWdyYWRpZW50KVwiKVxuICAgICAgICAgICAgLnN0eWxlKFwic3Ryb2tlXCIsIFwiIzMzM1wiKVxuICAgICAgICAgICAgLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIFwiMS4ycHhcIilcbiAgICAgICAgICAgIC5vbihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb3VzZVggPSBkMy5wb2ludGVyKGV2ZW50LCB0aGlzKVswXTtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGQzLnNjYWxlTGluZWFyKClcbiAgICAgICAgICAgICAgICAgICAgLmRvbWFpbihbMCwgbGVnZW5kV2lkdGhdKVxuICAgICAgICAgICAgICAgICAgICAucmFuZ2UoWzAuMCwgZDMubWF4KHRvcDEwLCBkID0+IGRbMV0pXSlcbiAgICAgICAgICAgICAgICAgICAgLmNsYW1wKHRydWUpKG1vdXNlWCk7XG5cbiAgICAgICAgICAgICAgICB0b29sdGlwLnRyYW5zaXRpb24oKS5kdXJhdGlvbig1MCkuc3R5bGUoXCJvcGFjaXR5XCIsIDAuOSk7XG4gICAgICAgICAgICAgICAgdG9vbHRpcC5odG1sKGA8c3Ryb25nPlBvbGx1dGlvbiBMZXZlbDo8L3N0cm9uZz4gJHt2YWx1ZS50b0ZpeGVkKDIpfWApXG4gICAgICAgICAgICAgICAgICAgIC5zdHlsZShcImxlZnRcIiwgZXZlbnQucGFnZVggKyAxNSArIFwicHhcIilcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsIGV2ZW50LnBhZ2VZIC0gNDAgKyBcInB4XCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbihcIm1vdXNlb3V0XCIsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0b29sdGlwLnRyYW5zaXRpb24oKS5kdXJhdGlvbigxMDApLnN0eWxlKFwib3BhY2l0eVwiLCAwKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGxlZ2VuZFN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKDAsICR7MjggKyBsZWdlbmRIZWlnaHR9KWApXG4gICAgICAgICAgICAuY2FsbChkMy5heGlzQm90dG9tKGQzLnNjYWxlTGluZWFyKClcbiAgICAgICAgICAgICAgICAuZG9tYWluKFswLjAsIGQzLm1heCh0b3AxMCwgZCA9PiBkWzFdKV0pXG4gICAgICAgICAgICAgICAgLnJhbmdlKFsyMCwgMjAgKyBsZWdlbmRXaWR0aF0pXG4gICAgICAgICAgICApLnRpY2tTaXplKDApLnRpY2tGb3JtYXQoKCkgPT4gXCJcIikpXG4gICAgICAgICAgICAuc2VsZWN0QWxsKFwidGV4dFwiKS5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICByZW5kZXJDaGFydChkZWZhdWx0SW5kaWNhdG9yKTtcbiAgICBpbmRpY2F0b3JTZWxlY3Qub24oXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICByZW5kZXJDaGFydChpbmRpY2F0b3JTZWxlY3QucHJvcGVydHkoXCJ2YWx1ZVwiKSk7XG4gICAgfSk7XG59KTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=