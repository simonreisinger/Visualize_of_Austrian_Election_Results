let bars = {};

function bar(data, id, where, area={width: 200, height: 150}) {

    let x = d3.scaleBand()
        .range([0, area.width])
        .padding(0.25)
        .domain(partyNames.map(d => d));

    let svg = where.append("svg")
        .attr("id", id)
        .attr("width", area.width)
        .attr("height", area.height + 40);

    let barG = svg.append("g");

    let bars = barG.selectAll(".bar")
        .data(partyNames)
        .enter()
        .append("rect");

    let y = null;
    if (data != null) y = bar_createY(data, area);

    bars.attr("class", "bar")
        .attr("x", function(d) {
            return x(d);
        })
        .attr("width", d => x.bandwidth())
        .attr("y", function (d) {
            if (data == null) return 0;
            return y(data[d]);
        })
        .attr("height", function (d) {
            if (data == null) return area.height;
            return area.height - y(data[d]);
        })
        .attr("fill", d => data_getPartyColor(d));

    barG.append("g")
        .attr("transform", "translate(0," + area.height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "rightBarText")
        .attr("transform", "rotate(-45)");

    return barG.selectAll(".bar");
}

function bar_update(bars, labels, area, newData) {
    let y = bar_createY(newData, area);
    tooltipBars//.data(region.partiesMain)
        .transition().duration(100)
        .attr("y", function(d) {
            return y(newData[d]);
        })
        .attr("height", function(d) {
            return area.height - y(newData[d]);
        });
}

function bar_createY(data, area) {
    return d3.scaleLinear().range([area.height, 0])
        .domain([0, d3.max(partyNames, d => data[d])]);
}