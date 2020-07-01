let choropleth_updateFuns = {};
let choropleth_lastShownRegion = null;

function choropleth(data, year, id, jsonUrl, rect = {width: 700, height: 400, x: 0, y: 0}) {
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
                .replace("ue", "ü");
        }

        let projection = d3.geoMercator()
            .fitExtent([[0, 0], [rect.width, rect.height]], geoJson);

        let path = d3.geoPath()
            .projection(projection);

        let choroPath = choroG.selectAll('path')
            .data(geoJson.features)
            .enter().append('path')
            .attr('d', path)
            .attr("stroke", "black");
        //.attr("fill", d => choropleth_computeRegionColor(data_processIso(d.properties.iso)));
        //.attr("id", d => d.properties.name);
        choropleth_updatePath(choroPath, data, year, id);

        choropleth_updateFuns[id] = (newData, year) => choropleth_updatePath(choroPath, newData, year, id);
    }); // End of d3.json(jsonUrl).then(function (geoJson) {...});
}

function choropleth_updatePath(choroPath, newData, year, id) {
    choroPath.attr("fill", d => choropleth_computeRegionColor(d, newData, year, id));

    // Events
    choroPath
        .on("mousemove", d => choropleth_mousemoveFun(choroPath, d, newData, year))
        .on("mouseout", function (d) {
            tooltip.style("opacity", 0);
            choroPath.style("opacity", 1);
            choropleth_lastShownRegion = null;
        })
        .on("click", (d) => {
            let name = d.properties.name;
            let iso = d.properties.iso;
            var region = getDatasetByISO(newData, iso, year);
            if (region == null) {
                iso = d.properties.iso;
                if (DEBUG) console.error("unable to show details for " + year + " region " + name + " with iso " + iso + " because region data was null");
                return;
            }
            d3.select("#detailed_bar_chart").remove();
            let area = tooltipBarChartArea;
            area.width = 700;
            bar_fromDict(region.partiesAll, tooltipBarChartDivSecondary, area);

            tooltipBarChartDiv.style("display", "none");
            tooltipBarChartDivSecondary.style("display", null);
            tooltipText.style("opacity", 0);
        });
}

function choropleth_computeRegionColor(path, data, year, id) {
    let iso = path.properties.iso;
    let region = getDatasetByISO(data, iso, year);
    if (DEBUG && region == null) {
        console.error("unable to compute region color for " + year + " region " + path.properties.name + "  with iso " + path.properties.iso + " because region data was null");
        region = {mostVotedParty: SONST};
    }
    var color = "white"
    if (id === "#svg_choropleth_wahlkreise") {
        let county_dataset = data_parseGebietsname(region.name);
        if (county_dataset === "Krems") county_dataset = "Krems an der Donau";
        color = data_getPartyColor(WahlkreiseDataSet[year][wahlkreisNach[removeNonASCIICharacters(county_dataset)].Wahlkreis].party)
    } else {
        color = data_getPartyColor(region.mostVotedParty);
    }
    return color;
}

function choropleth_mousemoveFun(choroPath, d, data, year) {

    let iso = d.properties.iso;
    var region = getDatasetByISO(data, iso, year)
    let name = d.properties.name;
    let x = d3.event.pageX;
    let y = d3.event.pageY;
    tooltip.style("opacity", 1)
        .style("left", x + "px")
        .style("top", y + "px");
    tooltipTitle.html(name);
    if (region == null) {
        tooltipBars.style("opacity", 0);
        tooltipLabels.style("opacity", 0);
        tooltipText.html("No data available");
    } else if (region !== choropleth_lastShownRegion) {
        tooltipBars.style("opacity", 1);
        tooltipLabels.style("opacity", 1);
        tooltipText.html("Click for more details");

        bar_update(tooltipBars, tooltipLabels, tooltipBarChartArea, region.partiesMain);
    } else {
        return;
    }

    choropleth_lastShownRegion = region;

    tooltipTitle.html(name);

    tooltipBarChartDiv.style("display", null);
    tooltipBarChartDivSecondary.style("display", "none").html("");
    tooltipText.style("opacity", 1);

    choroPath
        /*.style("stroke-width", function (d2) {
            return d === d2 ? 5 : 1;
        })*/
        .style("opacity", d2 => d === d2 ? 0.5 : 1);

    // TODO
    //let data = bundeslandData[bundeslandName];
    //updatePie(data, bundeslandName);
}
