let choroWidth = 700;
let choroHeight = 400;
let geoJson = null;
let choroG = null;


function choropleth(data) {

    // GeoJSON was retrieved from here: https://wahlen.strategieanalysen.at/geojson/
    // D3 choropleth examples: https://www.d3-graph-gallery.com/choropleth

    d3.json("https://users.cg.tuwien.ac.at/~waldner/oesterreich.json").then(function (_geoJson) {
        geoJson = _geoJson;

        let projection = d3.geoMercator()
            .fitExtent([[0, 0], [choroWidth, choroHeight]], geoJson);

        let path = d3.geoPath()
            .projection(projection);

        let svg = d3.select("#svg_choropleth")
            .attr("width", choroWidth)
            .attr("height", choroHeight);

        choroG = svg.append("g")
            .selectAll('path')
            .data(geoJson.features)
            .enter().append('path')
            .attr('d', path)
            .attr("stroke", "black")
            .attr("fill", "white");

        console.log(geoJson)
    });
}
