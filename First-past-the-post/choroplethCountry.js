let choroWidthCountry = 700;
let choroHeightCountry = 400;
let geoJsonCountry = null;
let choroGCountry = null;
let dataCountry = null;
let svg_MapCountry = null;
let pathCountry = null;
//let URLCountry = "./data/bezirke_95_geo.json";
let URLCountry = "./data/bezirke_wien_gross_geo.json";

let mapCountry = null;
let projectionCountry = null;


function choroplethCountry(used_data) {

    dataCountry = used_data;
    // GeoJSON was retrieved from here: https://wahlen.strategieanalysen.at/geojson/
    // D3 choropleth examples: https://www.d3-graph-gallery.com/choropleth
    map = d3.json(URLCountry).then(function (_geoJson) {
        geoJsonCountry = _geoJson;
        for (let item in geoJsonCountry.features) {
            geoJsonCountry.features[item].properties.name = geoJsonCountry.features[item].properties.name.replace("oe", "ö").replace("ue", "ü").replace("ue", "ü");
        }

        projection = d3.geoMercator()
            .fitExtent([[0, 0], [choroWidthCountry, choroHeightCountry]], geoJsonCountry);

        pathCountry = d3.geoPath()
            .projection(projection);

        svg_MapCountry = d3.select("#svg_choropleth_country")
            .attr("width", choroWidth)
            .attr("height", choroHeight);

        choroGCountry = svg_MapCountry.append("g")
            .selectAll('path')
            .data(geoJsonCountry.features)
            .enter().append('path')
            .attr('d', pathCountry)
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
                return colors[dataCountry[county_dataset].party];
            })
    });
}
