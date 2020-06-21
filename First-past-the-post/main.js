let DEBUG = true;

let tooltip = null;
let tooltipTitle = null;
let tooltipText = null;
let tooltipBars = null;
let tooltipLabels = null;

let mainBarChartArea = {width: 400, height: 150}
let tooltipBarChartArea = {width: 300, height: 150}

function main() {

    let yearDataMap = {};

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
        let tooltipBarElements = bar(null,
            "#bar_tooltip",
            tooltip.append("div"),
            tooltipBarChartArea);
        tooltipBars = tooltipBarElements.bars;
        tooltipLabels = tooltipBarElements.labels;

        let year = "2019";
        main_addYear(year);
        yearDataMap[year] = data;

        let yearSelect = d3.select("#year_select");
        yearSelect.on("change", function(d) {
            let selectedYear = yearSelect.node().value;
            main_updateData(yearDataMap[selectedYear]);
        });

        d3.dsv(";", "./data/NRW17.csv").then(data => {
            let year = "2017";
            main_addYear(year);
            yearDataMap[year] = data;

            d3.dsv(";", "./data/NRW13.csv").then(data => {
                let year = "2013";
                main_addYear(year);
                yearDataMap[year] = data;
            });
        })
    });


}
main();

function main_addYear(year) {
    d3.select("#year_select").append("option")
        .attr("value", year)
        .html(year);
}

function main_updateData(newData) {
    console.log("Your data has changed!")
}