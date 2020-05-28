let choroWidth = 700;
let choroHeight = 400;
let geoJson = null;
let choroG = null;
let data = null;
let map = null;
let svg_Map = null;
let projection = null;
let path = null;
let URL = "./data/bezirke_wien_gross_geo.json";


function choroplethCapital(used_data) {

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

        svg_Map = d3.select("#svg_choropleth_capital")
            .attr("width", choroWidth)
            .attr("height", choroHeight);

        choroG = svg_Map.append("g")
            .selectAll('path')
            .data(geoJson.features)
            .enter().append('path')
            .attr('d', path)
            .attr("stroke", "black")
            .attr("fill", function (d) {
                //return currentColor;
                return "white"
            })
    });
}