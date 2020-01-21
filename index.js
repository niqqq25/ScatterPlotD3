(async function ready() {
    const data = await fetchData();
    loadScatterPlot(data);
})();

async function fetchData() {
    const response = await fetch(
        "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
    );
    const json = await response.json();

    if (response.ok) {
        return json;
    } else {
        console.error(json);
    }
}

const tooltip = d3
    .select("#scatter-plot-container")
    .append("pre")
    .attr("id", "tooltip")
    .attr("class", "tooltip--hidden");

const margin = { top: 20, right: 20, bottom: 20, left: 50 };
const height = 400 - margin.top - margin.bottom;
const width = 800 - margin.right - margin.left;
const color = d3.scaleOrdinal(d3.schemeCategory10);

const svg = d3
    .select("#scatter-plot")
    .append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.top)
    .style("overflow", "visible")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

function loadScatterPlot(data) {
    const specifier = "%M:%S";
    // const parsedTime = data.map(d => d3.timeParse(specifier)(d.Time));
    const parsedTime = data.map(d => parseTime(d.Time));
    const parsedYears = data.map(d => new Date(d.Year));

    const yScale = d3
        .scaleTime()
        .domain(d3.extent(parsedTime))
        .range([0, height]);

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(parsedYears))
        .range([0, width])
        .nice();

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 6)
        .attr("cx", (d, i) => xScale(parsedYears[i]))
        .attr("cy", (d, i) => yScale(parsedTime[i]))
        .attr("fill", d => color(!!d.Doping))
        .attr("data-xvalue", d => d.Year)
        .attr("data-yvalue", (d, i) => parsedTime[i])
        .on("mouseover", (d, i) => {
            tooltip
                .classed("tooltip--hidden", false)
                .style("left", d3.event.pageX + 5 + "px")
                .style("top", d3.event.pageY + 5 + "px")
                .attr("data-year", d.Year)
                .text(formatTooltipText(d));
        })
        .on("mouseout", () => {
            tooltip.classed("tooltip--hidden", true);
        });

    //axis
    const yAxis = d3
        .axisLeft(yScale)
        .ticks(6)
        .tickFormat(d3.timeFormat(specifier));
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

    svg.append("g")
        .attr("id", "y-axis")
        .call(yAxis);
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    //axis titles
    svg.append("text")
        .attr("id", "yAxis-title")
        .style("transform", `translate(-40px, ${height / 2}px)rotate(-90deg)`)
        .text("Time in Minutes");

    svg.append("text")
        .attr("id", "xAxis-title")
        .style("transform", `translate(${width / 2}px, ${height + 40}px)`)
        .text("Years");

    //legend
    const legend = svg
        .append("g")
        .attr("id", "legend")
        .style("transform", `translate(65%, ${height / 2}px)`)
        .selectAll("g")
        .data(color.domain())
        .enter()
        .append("g");

    legend
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("x", 0)
        .attr("y", (d, i) => 20 * i)
        .attr("fill", d => color(d));

    legend
        .append("text")
        .attr("y", (d, i) => 20 * i + 10)
        .attr("x", 20)
        .text(d =>
            d ? "Riders with doping allegations" : "No doping allegations"
        );
}

function formatTooltipText(data) {
    const { Name, Nationality, Year, Time, Doping } = data;

    return `${Name}: ${Nationality}\nYear: ${Year}, Time: ${Time} ${
        Doping ? `\n \n${Doping}` : ""
    }`;
}

function parseTime(time) {
    const $time = new Date();
    const [mm, ss] = time.split(":");
    $time.setMinutes(mm);
    $time.setSeconds(ss);
    return $time;
}
