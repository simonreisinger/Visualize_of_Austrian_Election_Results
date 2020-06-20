let bars = {};

function bar(data, id, where, width=200) {

    let x = d3.scaleBand()
        .range([0, width])
        .padding(0.25)
        .domain(partyNames.map(d => d));

    let svg = where.append("svg")
        .attr("id", id)
        .attr("width", width)
        .attr("height", barHeight + 40);

    let barG = svg.append("g");

    let bars = barG.selectAll(".bar")
        .data(partyNames)
        .enter()
        .append("rect");

    bars.attr("class", "bar")
        .attr("x", function(d) {
            return x(d);
        })
        .attr("width", d => x.bandwidth())
        .attr("y", 0)
        .attr("height", barHeight)
        .attr("fill", d => data_getPartyColor(d));

    barG.append("g")
        .attr("transform", "translate(0," + barHeight + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");

    return barG.selectAll(".bar");
}