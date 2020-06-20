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
                var iso = d.properties.iso;
                // Different ids
                if (iso === 40819) {iso = 40835;}
                if (iso === 41310) {iso = 41345;}
                if (iso === 41625) {iso = 41628;}
                // 3 Gemeinden zusammengelegt
                // Mit 1. Jänner 2019 wurden die Gemeinden St. Stefan am Walde und Afiesl zur neuen Gemeinde St. Stefan-Afiesl fusioniert
                if (iso === 41301 || iso === 41335)  {iso = 41346;}
                // Mit 1. Jänner 2019 wurde die Gemeinde Ahorn nach Helfenberg eingemeindet
                if (iso === 41302) {iso = 41345;}
                // Mit 1. Jänner 2018 wurde die Gemeinde Schönegg Teil der Gemeinde Vorderweißenbach, das ehemalige Gemeindegebiet wurde damit Teil des Bezirks Urfahr-Umgebung
                if (iso === 41340) {iso = 41628;}
                // Peuerbach mit den Nachbargemeinden Bruck-Waasen
                if (iso === 40803) {iso = 40835;}

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
                    tooltipText.style("opacity", 1);
                    tooltipText.html("No data available");
                } else {
                    tooltipBars.style("opacity", 1);
                    tooltipText.style("opacity", 0);

                    bar_update(tooltipBars, null, tooltipBarChartArea, region.partiesAll);
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