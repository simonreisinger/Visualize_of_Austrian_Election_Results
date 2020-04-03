let choroWidth = 700;
let choroHeight = 400;
let geoJson = null;
let choroG = null;
let data = null;
let map = null;
let svg = null;
let projection = null;
let path = null;

function choropleth(used_data) {
    data = used_data;
    // GeoJSON was retrieved from here: https://wahlen.strategieanalysen.at/geojson/
    // D3 choropleth examples: https://www.d3-graph-gallery.com/choropleth

    map = d3.json("https://users.cg.tuwien.ac.at/~waldner/oesterreich.json").then(function (_geoJson) {
        geoJson = _geoJson;

        projection = d3.geoMercator()
            .fitExtent([[0, 0], [choroWidth, choroHeight]], geoJson);

        path = d3.geoPath()
            .projection(projection);

        svg = d3.select("#svg_choropleth")
            .attr("width", choroWidth)
            .attr("height", choroHeight);

        choroG = svg.append("g")
            .selectAll('path')
            .data(geoJson.features)
            .enter().append('path')
            .attr('d', path)
            .attr("stroke", "black")
            .attr("fill", function (d) {
                return colors[data[d.properties.name].party.name]
            })
            .on('mousemove', function (d) {
                updatePie(d.properties.name);
                d3.select(this).attr("fill", function (d) {
                    return "gray"
                })
            })
            .on('mouseout', function (d) {
                updatePie("total");
                d3.select(this).attr("fill", function (d) {
                    return colors[data[d.properties.name].party.name]
                });
            });
    });

}

function updateChoropleth(party) {
    if (party === "allParties") {
        svg.selectAll('path')
            .attr("opacity", 1.0)
            .attr("fill", function (d) {
                return colors[data[d.properties.name].party.name]
            });
    } else {
        svg.selectAll('path')
            .attr("opacity", function (d) {
                return data[d.properties.name].percantage / 100.0;
            })
            .attr("fill", function (d) {
                if (data[d.properties.name].party.name === party) {
                    return colors[data[d.properties.name].party.name];
                } else {
                    return "white"
                }
            });
    }

}

function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}

