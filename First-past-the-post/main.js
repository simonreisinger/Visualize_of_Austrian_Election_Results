let DEBUG = true;

let tooltip = null;
let tooltipTitle = null;
let tooltipText = null;
let tooltipBars = null;

let mainBarChartArea = {width: 300, height: 150}
let tooltipBarChartArea = {width: 200, height: 150}

function main() {
    d3.dsv(";", "./data/NRW19.csv").then(data => {

        data = data_initialize(data);

        let choroG = choropleth(data.municipalities, "#svg_choropleth_municipalities", "./data/gemeinden_wien_bezirke_gross_geo.json");

        let barFptpG = bar(data.municipalitiesReduced.mostVotedParty,
            "#svg_bar_fptp_municipalities",
            d3.select("#FPTPdiv"),
            mainBarChartArea);

        let barPrG = bar(data.municipalitiesReduced.mostVotedParty,
            "#svg_bar_pr_municipalities",
            d3.select("#PRdiv"),
            mainBarChartArea);

        // Tooltip
        tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .attr("class", "tooltip");
        tooltipTitle = tooltip.append("div");
        tooltipText = tooltip.append("div");
        tooltipBars = bar(null,
            "#bar_tooltip",
            tooltip.append("div"),
            tooltipBarChartArea);

    });
}
main();