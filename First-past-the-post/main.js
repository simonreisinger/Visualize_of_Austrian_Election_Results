let DEBUG = true;

let tooltip = null;
let tooltipTitle = null;
let tooltipText = null;
let tooltipBars = null;

let barHeight = 150;

function main() {
    d3.dsv(";", "./data/NRW19.csv").then(data => {

        data = data_initialize(data);

        updatePieChart(data.pieChartResults, "#svg_pie_fptp");
        updatePieChart(data.selectedParties, "#svg_pie_pr");

        let choroG = choropleth(data.municipalities, "#svg_choropleth_municipalities", "./data/gemeinden_wien_bezirke_gross_geo.json")

        // Tooltip
        tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .attr("class", "tooltip");
        tooltipTitle = tooltip.append("div");
        tooltipText = tooltip.append("div");
        tooltipBars = bar(data.municipalities, "#bar_tooltip", tooltip.append("div"));

    });
}
main();