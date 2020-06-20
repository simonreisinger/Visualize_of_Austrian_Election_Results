let DEBUG = true;

let tooltip = null;

function main() {
    d3.dsv(";", "./data/NRW19.csv").then(data => {

        // Tooltip
        tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip");

        data = data_initialize(data);

        updatePieChart(data.pieChartResults, "#svg_pie_fptp");
        updatePieChart(data.selectedParties, "#svg_pie_pr");

        choropleth(data.municipalities, "./data/gemeinden_wien_bezirke_gross_geo.json")

    });
}
main();