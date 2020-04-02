// D3 pie chart example: https://observablehq.com/@d3/pie-chart
let width = 300;
let height = 300;
let data = null

function pie(electionData) {
    console.log("XXXXXX")
    var parties = Object.assign({},  Object.keys(colors))

    data = electionData["total"];
    delete data.votes;

    // Create dummy data
    console.log(data);
    //data = {ÖVP: 9, SPÖ: 20, FPÖ:30, NEOS:8, JETZT:12};
    //console.log(data);

    // set the dimensions and margins of the graph
    var margin = 0;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin;

    // append the svg object to the div called 'my_dataviz'
    var svg = d3.select("#svg_pie")
        .append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    svg.append("g")
        .attr("stroke", "white")
    .selectAll("path")



    // Compute the position of each group on the pie:
    let pie = d3.pie().value(function(d) {return d.value.percantage; });
    let data_ready = pie(d3.entries(data));

    console.log(data_ready);

    // Now I know that group A goes from 0 degrees to x degrees and so on.

    // shape helper to build arcs:
    var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
            .selectAll('#svg_pie')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(radius)
            )
            .attr('fill', function(d){ return colors[d.data.key] })
            .attr("stroke", "black")
            .style("stroke-width", "0.5px")
            .style("opacity", 0.7)


    // Now add the annotation. Use the centroid method to get the best coordinates
    svg
        .selectAll('#svg_pie')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function(d){ if( d.value > 3) {return d.data.key}else{return  d.data.key.charAt(0)}} )
        .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .attr("fill", "white")
        .attr("y", "-0.4em")
        .attr("font-weight", "bold")
        .call(text => text.filter(d => 2.0 > 0.25).append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .attr("fill", "black")
            .text(function(d){ if( d.value > 3) {return Math.round(d.value * 10) / 10}else{return  Math.round(d.value)}}  ))
}