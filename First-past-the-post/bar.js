let bar_estimatedLabelHeight = 10;

function bar(data, id, where, area={width: 200, height: 150}) {

    let x = d3.scaleBand()
        .range([0, area.width])
        .padding(0.15)
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
            return 0;
        })
        .attr("height", function (d) {
            return area.height;
        })
        .attr("fill", d => data_getPartyColor(d));

    barG.append("g")
        .attr("transform", "translate(0," + area.height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("class", "barText")
        .attr("transform", "rotate(-45)");

    let barLabels = barG.selectAll(".barLabel")
        .data(partyNames)
        .enter()
        .append("text")
        .attr("class", "barLabel")
        .attr("x", function(d) {
            return x(d) + (x.bandwidth() / 2);
        })
        .attr("width", d => x.bandwidth())
        .attr("y", function(d) {
            return area.height;
        })
    ;

    if (data != null) {
        bar_update(bars, barLabels, area, data);
    }

    return {
        bars: barG.selectAll(".bar"),
        labels : barG.selectAll(".barLabel")
    };
}

function bar_update(bars, labels, area, newData) {
    let y = bar_createY(newData, area);

    bars.transition().duration(100)
        .attr("y", function(d) {
            return y(newData[d]);
        })
        .attr("height", function(d) {
            return area.height - y(newData[d]);
        });

    labels.html(function(d) {
        return newData[d];
    });

    labels.transition().duration(100)
        .attr("y", function(d) {
            let ypos = y(newData[d]) - 5;
            if (ypos - bar_estimatedLabelHeight < 0)
                ypos = bar_estimatedLabelHeight + 5;
            return ypos;
        });
}

function bar_createY(data, area) {
    return d3.scaleLinear().range([area.height, 0])
        .domain([0, d3.max(partyNames, d => data[d])]);
}