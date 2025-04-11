d3.csv("data/lake-water-quality-state-2016-2020.csv").then(data => {
    const indicators = Array.from(new Set(data.map(d => d.indicator_name))).sort();
    const indicatorSelect = d3.select("#indicator-select");

    indicatorSelect.selectAll("option")
        .data(indicators)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    indicatorSelect.property("value", "Total Nitrogen");

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "8px 12px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    const colorLevels = [
        { color: "#990000", label: "Very High" },
        { color: "#e34a33", label: "High" },
        { color: "#fdbb84", label: "Moderate" },
        { color: "#fee8c8", label: "Low" }
    ];

    function renderChart(selectedIndicator) {
        d3.select("#polluted-chart").html("");
        d3.select("#gradient-legend").html("");

        const filtered = data.filter(d =>
            d["measurement"]?.trim().toLowerCase() === "median" &&
            d["indicator_name"]?.trim().toLowerCase() === selectedIndicator.trim().toLowerCase()
        );

        const avgByLake = d3.rollups(
            filtered,
            v => d3.mean(v, d => +d.value),
            d => d.lake_name
        );

        const top10 = avgByLake.sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (top10.length === 0) return;

        const width = 950, height = 500;
        const margin = { top: 30, right: 200, bottom: 100, left: 180 };

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
            .data(top10)
            .enter()
            .append("rect")
            .attr("x", x(0))
            .attr("y", d => y(d[0]))
            .attr("width", d => x(d[1]) - x(0))
            .attr("height", y.bandwidth())
            .attr("fill", d => color(d[1]))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(100).style("opacity", 0.95);
                tooltip.html(`<strong>Lake:</strong> ${d[0]}<br><strong>${selectedIndicator}:</strong> ${d[1].toFixed(2)}`);
            })
            .on("mousemove", event => {
                tooltip.style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(200).style("opacity", 0);
            });

        svg.selectAll("text.value")
            .data(top10)
            .enter()
            .append("text")
            .attr("x", d => x(d[1]) + 5)
            .attr("y", d => y(d[0]) + y.bandwidth() / 2 + 5)
            .text(d => d[1].toFixed(2))
            .attr("fill", "black")
            .attr("font-size", "12px");

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y).tickSize(0))
            .selectAll("text")
            .attr("font-size", "14px");

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x)
                .ticks(7)
                .tickFormat(d3.format(".1f"))
            )
            .selectAll("text")
            .attr("font-size", "14px");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 60)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("fill", "#333")
            .text(`Average ${selectedIndicator} Level`);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", margin.left - 140)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("fill", "#333")
            .text("Name of the Lakes");

        const colorLegend = svg.append("g")
            .attr("transform", `translate(${width - 160}, ${margin.top})`);

        colorLegend.append("text")
            .text("Pollution Categories")
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#111");

        colorLevels.forEach((level, i) => {
            colorLegend.append("rect")
                .attr("y", 25 + i * 25)
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", level.color);

            colorLegend.append("text")
                .attr("x", 25)
                .attr("y", 25 + i * 25 + 13)
                .text(level.label)
                .attr("font-size", "12px")
                .attr("alignment-baseline", "middle");
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
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .attr("fill", "#333")
            .text("Pollution Level (Average)");

        const defs = legendSvg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "legend-gradient");

        linearGradient.selectAll("stop")
            .data([
                { offset: "0%", color: "#fee8c8" },
                { offset: "100%", color: "#990000" }
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
                const nitrogenVal = d3.scaleLinear()
                    .domain([0, legendWidth])
                    .range([0.0, d3.max(top10, d => d[1])])
                    .clamp(true)(mouseX);

                tooltip.transition().duration(50).style("opacity", 0.9);
                tooltip.html(`<strong>Pollution Level:</strong> ${nitrogenVal.toFixed(2)}`)
                    .style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY - 40 + "px");
            })
            .on("mouseout", () => {
                tooltip.transition().duration(100).style("opacity", 0);
            });

        const legendScale = d3.scaleLinear()
            .domain([0.0, d3.max(top10, d => d[1])])
            .range([20, 20 + legendWidth]);

        legendSvg.append("g")
            .attr("transform", `translate(0, ${28 + legendHeight})`)
            .call(d3.axisBottom(legendScale)
                .tickSize(0)
                .tickFormat(() => "")
            )
            .selectAll("text").remove();
    }
    renderChart(indicatorSelect.property("value"));
    indicatorSelect.on("change", () => {
        renderChart(indicatorSelect.property("value"));
    });
});
