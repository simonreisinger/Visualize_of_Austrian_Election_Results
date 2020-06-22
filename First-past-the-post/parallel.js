function parallel(yearToDataMap, id, where, height=300) {

    // Source: https://www.d3-graph-gallery.com/graph/parallel_basic.html

    let margin = {top: 30, right: 10, bottom: 10, left: 10};
    let rect = where.node().getBoundingClientRect();

    let width = rect.width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    let parG = where
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let years = Object.keys(yearToDataMap);
    let parties = partyNames;

    let firstYear = parallel_getFirstAndLastYears(years);
    let lastYear = firstYear.last;
    firstYear = firstYear.first;

    let y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, parallel_getMaxMainPercentage(yearToDataMap)]) // 0% to max%

    let x = d3.scalePoint()
        .range([0, width])
        .padding(1) // TODO what does this do?
        .domain(years)

    parG.selectAll(".parPath")
        .data(parties)
        .enter().append("path")
        .attr("d", function(d) {
            let party = d;
            let line = d3.line()(d3.keys(yearToDataMap).map(function (p) {
                let year = p;
                let percentage = yearToDataMap[year].percentages.partiesMain[party];
                let xx = x(year)
                let yy = y(percentage);
                return [xx, yy];
            }));
            return line;
        })
        .style("fill", "none") // TODO make style in CSS
        .style("stroke", d => data_getPartyColor(d))
        .style("opacity", 1)
        .style("stroke-width", 5);

    parG.selectAll(".parAxis")
        .data(years)
        .enter().append("g")
        .attr("transform", function(d) {
            return "translate(" + x(d) + ")";
        })
        .each(function(d, i) {
            return d3.select(this).call(d3.axisLeft().scale(y));
        })
        .append("text")
        .text(function(d) {
            return d;
        });
}

function parallel_getMaxMainPercentage(yearToDataMap) {
    let max = 0;
    for (let year in yearToDataMap) {
        let maxMain = yearToDataMap[year].percentages.maxMain;
        if (maxMain > max) max = maxMain;
    }
    return max;
}

function parallel_getFirstAndLastYears(years) {
    let first = Infinity;
    let last = 0;
    for (let year of years) {
        year = parseInt(year);
        if (year > last) last = year;
        if (year < first) first = year;
    }
    return {first, last};
}