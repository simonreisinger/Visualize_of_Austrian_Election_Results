let choroWidth = 700;
let choroHeight = 400;
let geoJson = null;
let choroG = null;
let data = null;
let map = null;


function choropleth(used_data) {
    data = used_data;
    console.log(data);
    // GeoJSON was retrieved from here: https://wahlen.strategieanalysen.at/geojson/
    // D3 choropleth examples: https://www.d3-graph-gallery.com/choropleth
    console.log(colors);

    map = d3.json("https://users.cg.tuwien.ac.at/~waldner/oesterreich.json").then(function (_geoJson) {
        geoJson = _geoJson;
        console.log(geoJson)

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
            .attr("fill", function (d) {
                return colors[data[d.properties.name].party.name]
            })
            .on('mousemove', function (d) {
                //console.log('mousemove');
                //console.log(d.properties.name);
                update(d.properties.name);
                d3.select(this).attr("fill", function (d) {
                    return "gray"
                })

            })
            .on('mouseout', function (d) {
                //console.log('mouseout');
                //console.log(d.properties.name);
                update("total")
                d3.select(this).attr("fill", function (d) {
                    return colors[data[d.properties.name].party.name]
                })

            });
    });
    update("ÖVP")
}
function update(parties){
    console.log("update");
    console.log(parties);
    let svg = d3.select("#svg_choropleth")
        .attr("width", choroWidth)
        .attr("height", choroHeight);

    var xxxxx = svg.append("g")
        .attr("fill", "black");
    console.log(xxxxx)
}


