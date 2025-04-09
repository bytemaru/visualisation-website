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
    const width = 800, height = 500, margin = { top: 30, right: 50, bottom: 100, left: 200 };
    const svg = d3.select("#polluted-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleLinear()
        .domain([0, d3.max(top10, d => d[1])])
        .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
        .domain(top10.map(d => d[0]))
        .range([margin.top, height - margin.bottom])
        .padding(0.2);

    const color = d3.scaleLinear()
        .domain([d3.min(top10, d => d[1]), d3.max(top10, d => d[1])])
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
      `);})
        .on("mousemove", (event) => {
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
        .call(d3.axisLeft(y).tickSize(0));

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(6))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Average Total Nitrogen Level");

    const legendWidth = 300, legendHeight = 20;
    const legendSvg = d3.select("#legend")
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", 60);

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
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)")
        .on("mousemove", function(event) {
            const mouseX = d3.pointer(event, this)[0];
            const nitrogenVal = d3.scaleLinear()
                .domain([0, legendWidth])
                .range(d3.extent(top10, d => d[1]))(mouseX);
            tooltip.transition().duration(50).style("opacity", 0.9);
            tooltip.html(`<strong>Pollution Level:</strong> ${nitrogenVal.toFixed(2)} mg/m³`)
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY - 40 + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(100).style("opacity", 0);
        });
    const legendScale = d3.scaleLinear()
        .domain(d3.extent(top10, d => d[1]))
        .range([0, legendWidth]);

    legendSvg.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(d3.axisBottom(legendScale).ticks(5))
        .selectAll("text")
        .attr("font-size", "10px");

    legendSvg.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", legendHeight + 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Pollution Level (Average Total Nitrogen)");
});