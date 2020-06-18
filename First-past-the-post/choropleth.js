let choroWidth = 700;
let choroHeight = 400;
let geoJson = null;


let choroPath = null;

let data = null;
let svg_Map = null;
let path = null;
//let URL = "./data/bezirke_95_geo.json";
let URL = "./data/bezirke_wien_gross_geo.json";

let map = null;


function choropleth(used_data) {

    data = used_data;
    // GeoJSON was retrieved from here: https://wahlen.strategieanalysen.at/geojson/
    // D3 choropleth examples: https://www.d3-graph-gallery.com/choropleth
    map = d3.json(URL).then(function (_geoJson) {
        geoJson = _geoJson;
        for (let item in geoJson.features) {
            geoJson.features[item].properties.name = geoJson.features[item].properties.name
                .replace("oe", "ö")
                .replace("ue", "ü")
                .replace("ue", "ü"); // TODO: remove this line?
        }

        let projection = d3.geoMercator()
            .fitExtent([[0, 0], [choroWidth, choroHeight]], geoJson);

        let path = d3.geoPath()
            .projection(projection);

        let svg = d3.select("#svg_choropleth")
            .attr("width", choroWidth)
            .attr("height", choroHeight);

        let choroG = svg.append("g");

        choroPath = choroG.selectAll('path')
            .data(geoJson.features)
            .enter().append('path')
            .attr('d', path)
            .attr("stroke", "black")
            .attr("fill", function (d) {
                let county_map = d.properties.name;
                let county_dataset = county_map.replace("(Stadt)", "-Stadt");
                county_dataset = county_dataset.replace(" Stadt", "");
                county_dataset = county_dataset.replace("-Stadt", "");
                county_dataset = county_dataset.replace("(Land)", "-Land");
                county_dataset = county_dataset.replace(" Land", "-Land");
                county_dataset = county_dataset.replace(" Umgebung", "-Umgebung");
                county_dataset = county_dataset.replace("Innere", "Innere Stadt");
                county_dataset = county_dataset.replace("Klagenfurt am Wörthersee", "Klagenfurt");
                if (county_dataset === "Wien-Stadt") {
                    return "white";
                }
                return colors[data[county_dataset].party];
            })
            .attr("id", d => d.properties.name);

        // Events
        choroPath
            .on("mousemove", function(d) {
                let bundeslandName = d.properties.name;
                let x = d3.event.pageX;
                let y = d3.event.pageY;


                tooltip.html(bundeslandName);
                tooltip.style("opacity", 1)
                    .style("left", x + "px")
                    .style("top", y + "px");

                choroPath
                    .style("opacity", function(d) {
                        return bundeslandName === d.properties.name ? 1 : 0.3;
                    })

                // TODO
                //let data = bundeslandData[bundeslandName];
                //updatePie(data, bundeslandName);
            })
            .on("mouseout", function(d) {
                tooltip.style("opacity", 0);
                choroPath.style("opacity", 1);
                //resetPie(); TODO
            })
    });
}
