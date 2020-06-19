let choroWidth = 700;
let choroHeight = 400;

let choroPath = null;

let path = null;

function choropleth(data, jsonUrl) {

    // GeoJSON was retrieved from here: https://wahlen.strategieanalysen.at/geojson/ // TODO was it?
    // D3 choropleth examples: https://www.d3-graph-gallery.com/choropleth
    d3.json(jsonUrl).then(function (geoJson) {
        for (let item in geoJson.features) {
            geoJson.features[item].properties.name = geoJson.features[item].properties.name
                .replace("oe", "ö")
                .replace("ue", "ü")
                .replace("ue", "ü"); // TODO: remove this line?
        }

        let projection = d3.geoMercator()
            .fitExtent([[0, 0], [choroWidth, choroHeight]], geoJson);

        let path = d3.geoPath()
            .projection(projection);

        let svg = d3.select("#svg_choropleth")
            .attr("width", choroWidth)
            .attr("height", choroHeight);

        let choroG = svg.append("g");

        choroPath = choroG.selectAll('path')
            .data(geoJson.features)
            .enter().append('path')
            .attr('d', path)
            .attr("stroke", "black")
            .attr("fill", function (d) {
                let iso = d.properties.iso;
                let region = data[iso];
                if (DEBUG && region == null) {
                    console.error("region " + d.properties.name + "  with iso " + d.properties.iso + " was null");
                    region = { mostVotedParty: "SONST." };
                }
                let color = data_getPartyColor(region.mostVotedParty)
                return color;
            })
            .attr("id", d => d.properties.name);

        // Events
        choroPath
            .on("mousemove", function(d) {
                let bundeslandName = d.properties.name;
                let x = d3.event.pageX;
                let y = d3.event.pageY;


                tooltip.html(bundeslandName);
                tooltip.style("opacity", 1)
                    .style("left", x + "px")
                    .style("top", y + "px");

                choroPath
                    .style("opacity", function(d) {
                        return bundeslandName === d.properties.name ? 1 : 0.3;
                    })

                // TODO
                //let data = bundeslandData[bundeslandName];
                //updatePie(data, bundeslandName);
            })
            .on("mouseout", function(d) {
                tooltip.style("opacity", 0);
                choroPath.style("opacity", 1);
                //resetPie(); TODO
            })
    }); // End of d3.json(jsonUrl).then(function (geoJson) {...});
}

function choropleth_create(data) {

}