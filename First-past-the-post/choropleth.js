let choroWidth = 700;
let choroHeight = 400;
let geoJson = null;
let choroG = null;
let data = null;
let svg_Map = null;
let path = null;
//let URL = "./data/bezirke_95_geo.json";
let URL = "./data/bezirke_wien_gross_geo.json";

let map = null;
let projection = null;


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
            .attr("fill", function (d) {
                let county_map = d.properties.name;
                var county_dataset = county_map.replace("(Stadt)", "-Stadt");
                county_dataset = county_dataset.replace(" Stadt", "");
                county_dataset = county_dataset.replace("-Stadt", "");
                county_dataset = county_dataset.replace("(Land)", "-Land");
                county_dataset = county_dataset.replace(" Land", "-Land");
                county_dataset = county_dataset.replace(" Umgebung", "-Umgebung");
                county_dataset = county_dataset.replace("Innere", "Innere Stadt");
                county_dataset = county_dataset.replace("Klagenfurt am Wörthersee", "Klagenfurt");
                console.log(county_dataset);
                if (county_dataset === "Wien-Stadt"){ console.log("WIEEEN!");return "white"; }
                return colors[data[county_dataset].party];
            })
    });
}
