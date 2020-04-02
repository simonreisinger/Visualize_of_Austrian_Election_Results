// D3 pie chart example: https://observablehq.com/@d3/pie-chart
let width = 150;
let height = 150;
let data = null

function pie(electionData) {

    var parties = Object.assign({},  Object.keys(colors))

    data = electionData["total"];
    delete data.votes

    // Create dummy data
    console.log(data);
    //data = {ÖVP: 9, SPÖ: 20, FPÖ:30, NEOS:8, JETZT:12};
    //console.log(data);

    var width = 300;
    var height = 300;

    var svg = d3.select("body").append("svg");
    svg.attr("width", width)
        .attr("height", height);

    var dataset = [11, 13, 18, 25, 31];

    var radius = width / 2;
    var innerRadius = 0;
    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    var pie = d3.pie();

    var arcs = svg.selectAll("g.arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + radius + ", " + radius + ")");

//Draw arc paths
    //var color = d3.scale.category10();

    arcs.append("path")
        .attr("fill", function (d, i) {
            console.log(d);
            return colors[i];
        })
        .attr("stroke", "white")
        .attr("d", arc);


    var newarc = d3.arc()
        .innerRadius(2 * radius / 3)
        .outerRadius(radius);

    arcs.append("text")
        .attr("transform", function (d) {
            return "translate(" + newarc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text(function (d) {
            return d.value + "%";
        });




    /*
    // set the dimensions and margins of the graph
    var margin = 40;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin;

    // append the svg object to the div called 'my_dataviz'
    var svg = d3.select("#svg_pie")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")


    // Compute the position of each group on the pie:
    var pie = d3.pie().value(function(d) {return d.value.percantage; });
    var data_ready = pie(d3.entries(data));

    console.log(data_ready);


    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
            .selectAll('whatever')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(radius)
            )
            .attr('fill', function(d){ return colors[d.data.key] })
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)

    /*

        const arcs = pie(data);

            let svg = d3.select("#svg_pie")
                .attr("viewBox", [-width / 2, -height / 2, width, height]);

            svg.append("g")
                .attr("stroke", "white")
                .selectAll("path")
                .data(arcs)
                .join("path")
                .attr("fill", d => colors(d.data.name))
                .attr("d", arc)
                .append("title")
                .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

            svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 12)
                .attr("text-anchor", "middle")
                .selectAll("text")
                .data(arcs)
                .join("text")
                //.attr("transform", d => `translate(${arcLabel.centroid(d)})`)
                .call(text => text.append("tspan")
                    .attr("y", "-0.4em")
                    .attr("font-weight", "bold")
                    .text(d => d.data.name))
        */
}