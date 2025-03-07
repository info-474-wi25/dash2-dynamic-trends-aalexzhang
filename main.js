// 1: SET GLOBAL VARIABLES
const margin = { top: 50, right: 150, bottom: 60, left: 70 };
const width = 900 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Create SVG containers for both charts
const svg1_RENAME = d3.select("#lineChart1") // If you change this ID, you must change it in index.html too
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2_RENAME = d3.select("#lineChart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// (If applicable) Tooltip element for interactivity
// const tooltip = ...

d3.csv("weather.csv").then(data => {
    // Transform the data
    let transformedData = [];
    data.forEach(d => {
        d.date = new Date(d.date);
        d.average_min_temp = +d.average_min_temp;
        d.average_max_temp = +d.average_max_temp;

        // Add min temp entry
        transformedData.push({
            date: d.date,
            temp: d.average_min_temp,
            type: "min",
            city: d.city
        });

        // Add max temp entry
        transformedData.push({
            date: d.date,
            temp: d.average_max_temp,
            type: "max",
            city: d.city
        });
    });

    // Filter the data to include only max and min temperatures
    let maxTempData = transformedData.filter(d => d.type === "max");
    let minTempData = transformedData.filter(d => d.type === "min");

    // Group the data by city
    let maxDataByCity = d3.group(maxTempData, d => d.city);
    let minDataByCity = d3.group(minTempData, d => d.city);

    // Set up scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(transformedData, d => d.date))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(transformedData, d => d.temp)])
        .range([height, 0]);

    // Create a color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(Array.from(maxDataByCity.keys()));

    // Create line generator
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.temp));

    function updateChart(tempType) {
        const dataByCity = tempType === "max" ? maxDataByCity : minDataByCity;

        svg1_RENAME.selectAll(".line").remove();

        dataByCity.forEach((values, city) => {
            svg1_RENAME.append("path")
                .datum(values)
                .attr("fill", "none")
                .attr("stroke", colorScale(city))
                .attr("stroke-width", 1.5)
                .attr("d", line)
                .attr("class", "line")
                .attr("data-legend", city + " " + tempType);
        });
    }

    // Initial chart rendering
    updateChart("max");

    // Add x-axis
    svg1_RENAME.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add y-axis
    svg1_RENAME.append("g")
        .call(d3.axisLeft(yScale));

    // Add event listener to the dropdown menu
    d3.select("#tempType").on("change", function() {
        const selectedTempType = d3.select(this).property("value");
        updateChart(selectedTempType);
    });

    
    const legend = svg1_RENAME.selectAll(".legend")
        .data(Array.from(maxDataByCity.keys()))
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width - 150}, ${i * 20 - 30})`);

    const legendItems = Array.from(maxDataByCity.keys());

    console.log(legendItems)

    legend.append("rect")
        .attr("x", 160)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => colorScale(d));
    
    legend.append("text")
        .attr("x", 180)
        .attr("y", 10)
        .text(d => d);
});