d3.csv("data/lake-water-quality-state-2016-2020.csv").then(data => {
    const filtered = data.filter(d =>
        d["measurement"]?.trim().toLowerCase() === "median" &&
        d["indicator_name"]?.trim().toLowerCase() === "total nitrogen"
    );
    const avg = d3.rollups(
        filtered,
        v => d3.mean(v, d => +d.value),
        d => d.lake_name
    );
    const top10 = avg.sort((a, b) => b[1] - a[1]).slice(0, 10);

    const width = 900, height = 500;
    const margin = { top: 30, right: 150, bottom: 100, left: 180 };

    const svg = d3.select("#polluted-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleLinear()
        .domain([0.0, 3.5])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
        .domain(top10.map(d => d[0]))
        .range([margin.top, height - margin.bottom])
        .padding(0.2);

    const color = d3.scaleLinear()
        .domain([2.0, 3.2])
        .range(["#fee8c8", "#990000"]);

    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "8px 12px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);

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
            tooltip.html(`
                <strong>Lake:</strong> ${d[0]}<br>
                <strong>Nitrogen:</strong> ${d[1].toFixed(2)} mg/m³
            `);
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", event.pageX + 15 + "px")
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
            .tickValues([0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5])
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
        .text("Average Total Nitrogen Level");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", margin.left - 140)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", "#333")
        .text("Name of the Lakes");

    const legendWidth = 600, legendHeight = 20;
    const legendMargin = 70;
    const legendMin = 0.0, legendMax = 3.5;
    const legendPadding = 40;

    const legendSvg = d3.select("#legend")
        .append("svg")
        .attr("width", legendWidth + legendPadding)
        .attr("height", legendHeight + legendMargin);

    legendSvg.append("text")
        .attr("x", (legendWidth + legendPadding) / 2)
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "#333")
        .text("Pollution Level (Average Total Nitrogen)");

    const defs = legendSvg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "legend-gradient");

    linearGradient
        .attr("x1", "0%")
        .attr("x2", "100%")
        .selectAll("stop")
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
        .on("mousemove", function(event) {
            const mouseX = d3.pointer(event, this)[0];
            const nitrogenVal = d3.scaleLinear()
                .domain([0, legendWidth])
                .range([legendMin, legendMax])
                .clamp(true)(mouseX);

            tooltip.transition().duration(50).style("opacity", 0.9);
            tooltip.html(`<strong>Pollution Level:</strong> ${nitrogenVal.toFixed(2)} mg/m³`)
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY - 40 + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(100).style("opacity", 0);
        });

    const legendScale = d3.scaleLinear()
        .domain([legendMin, legendMax])
        .range([20, 20 + legendWidth]);

    legendSvg.append("g")
        .attr("transform", `translate(0, ${28 + legendHeight})`)
        .call(d3.axisBottom(legendScale)
            .tickValues([0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5])
            .tickFormat(d3.format(".1f")))
        .selectAll("text")
        .style("font-size", "10px");
});