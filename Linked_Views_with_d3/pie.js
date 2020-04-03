// D3 pie chart example: https://observablehq.com/@d3/pie-chart
let width = 150;
let height = 150;
var svg_pie = null;

function pie(data) {
    var parties = Object.assign({}, Object.keys(colors))
    delete data.votes;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2;
    if (svg_pie !== null) {
        d3.select("#svg_pie").select("svg").remove();
    }
    // append the svg object to the div called 'my_dataviz'
    svg_pie = d3.select("#svg_pie")
        .append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    svg_pie.append("g")
        .attr("stroke", "white")
        .selectAll("path")
        .join("path");

    // Compute the position of each group on the pie:
    let pie = d3.pie().value(function (d) {
        return d.value.percantage;
    });
    let data_ready = pie(d3.entries(data));

    // shape helper to build arcs:
    var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg_pie
        .selectAll('#svg_pie')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        )
        .attr('fill', function (d) {
            return colors[d.data.key]
        })
        .attr("stroke", "black")
        .style("stroke-width", "0.5px")
        .on('mousemove', function (d) {
            updateMap(d.data.key);
        })
        .on('mouseout', function (d) {
            updateMap("allParties");
        });

    var u = svg_pie.selectAll("path")
        .attr("stroke", "white");

    // Now add the annotation. Use the centroid method to get the best coordinates
    svg_pie
        .selectAll('#svg_pie')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) {
            if (d.value > 3) {
                return d.data.key
            } else {
                return d.data.key.charAt(0)
            }
        })
        .attr("transform", function (d) {
            return "translate(" + arcGenerator.centroid(d) + ")";
        })
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .attr("fill", "white")
        .attr("y", "-0.4em")
        .attr("font-weight", "bold")
        .call(text => text.append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill", "black")
            .text(function (d) {
                if (d.value > 3) {
                    return Math.round(d.value * 10) / 10
                } else {
                    return Math.round(d.value)
                }
            }))
        .on('mousemove', function (d) {
            updateMap(d.data.key);
        })
        .on('mouseout', function (d) {
            updateMap("allParties");
        });
}