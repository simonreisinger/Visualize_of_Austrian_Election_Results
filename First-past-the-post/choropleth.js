function choropleth(data, id, jsonUrl, rect={width:700, height:400, x: 0, y:0}) {

    let svg = d3.select(id)
        .attr("width", rect.width)
        .attr("height", rect.height)
        .attr("x", rect.x)
        .attr("y", rect.y);

    let choroG = svg.append("g");

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
            .fitExtent([[0, 0], [rect.width, rect.height]], geoJson);

        let path = d3.geoPath()
            .projection(projection);

        let choroPath = choroG.selectAll('path')
            .data(geoJson.features)
            .enter().append('path')
            .attr('d', path)
            .attr("stroke", "black")
            .attr("fill", function (d) {
                let iso = data_processIso(d.properties.iso);

                let region = data[iso];
                if (DEBUG && region == null) {
                    console.error("region " + d.properties.name + "  with iso " + d.properties.iso + " was null");
                    region = {mostVotedParty: "SONST."};
                }
                let color = data_getPartyColor(region.mostVotedParty)
                return color;
            })
            .attr("id", d => d.properties.name);

        // Events
        choroPath
            .on("mousemove", function (d) {
                let iso = d.properties.iso;
                let name = d.properties.name;
                let x = d3.event.pageX;
                let y = d3.event.pageY;
                tooltip.style("opacity", 1)
                    .style("left", x + "px")
                    .style("top", y + "px");
                tooltipTitle.html(name);

                let region = data[iso];
                if (region == null) {
                    tooltipBars.style("opacity", 0);
                    tooltipLabels.style("opacity", 0);
                    tooltipText.style("opacity", 1);
                    tooltipText.html("No data available");
                } else {
                    tooltipBars.style("opacity", 1);
                    tooltipLabels.style("opacity", 1);
                    tooltipText.style("opacity", 0);

                    bar_update(tooltipBars, tooltipLabels, tooltipBarChartArea, region.partiesMain);
                }

                choroPath
                    .style("opacity", function (d) {
                        return iso === d.properties.iso ? 1 : 0.3;
                    })

                // TODO
                //let data = bundeslandData[bundeslandName];
                //updatePie(data, bundeslandName);
            })
            .on("mouseout", function (d) {
                tooltip.style("opacity", 0);
                choroPath.style("opacity", 1);
                //resetPie(); TODO
            })
            .on("click", (d) => {
                if (DEBUG) {
                    console.log(d.properties);
                    console.log(data[d.properties.iso]);
                }
            })
    }); // End of d3.json(jsonUrl).then(function (geoJson) {...});

    return choroG;
}

function choropleth_create(data) {
}