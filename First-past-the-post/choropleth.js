let choroWidth = 700;
let choroHeight = 400;
let geoJson = null;
let choroG = null;
let data = null;
let map = null;
let svg_Map = null;
let projection = null;
let path = null;
let URL = "./data/gemeinden_995_geo.json";


function choropleth(used_data) {

    data = used_data;
    // GeoJSON was retrieved from here: https://wahlen.strategieanalysen.at/geojson/
    // D3 choropleth examples: https://www.d3-graph-gallery.com/choropleth
    map = d3.json(URL).then(function (_geoJson) {
        geoJson = _geoJson;
        for (let item in geoJson.features) {
            geoJson.features[item].properties.name = geoJson.features[item].properties.name.replace("oe", "ö").replace("ue", "ü").replace("ue", "ü");
        }

        projection = d3.geoMercator()
            .fitExtent([[0, 0], [choroWidth, choroHeight]], geoJson);

        path = d3.geoPath()
            .projection(projection);

        svg_Map = d3.select("#svg_choropleth")
            .attr("width", choroWidth)
            .attr("height", choroHeight);

        choroG = svg_Map.append("g")
            .selectAll('path')
            .data(geoJson.features)
            .enter().append('path')
            .attr('d', path)
            .attr("stroke", "black")
    });

}

function updateChoropleth(party) {
    if (party === "allParties") {
        svg_Map.selectAll('path')
            .attr("opacity", 1.0)
            .attr("fill", function (d) {
                return colors[data[d.properties.name].party.name]
            });
    } else {
        let color = {};
        var min = Infinity;
        var max = -Infinity;
        for (let item in data) {
            if (item !== "total" && item !== "") {
                //color.push({state: item, value: data[item].percantage})
                color[item] = data[item].percantage;
                if (min > data[item].percantage) {
                    min = data[item].percantage;
                }
                if (max < data[item].percantage) {
                    max = data[item].percantage;
                }
            }
        }

        let sqrtScale = d3.scaleSqrt().domain([min, max]).range([20, 80]);

        svg_Map.selectAll('path')
            .attr("opacity", function (d) {
                //return data[d.properties.name].percantage / 100.0; // linear
                return sqrtScale(data[d.properties.name].percantage) / 100;
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

