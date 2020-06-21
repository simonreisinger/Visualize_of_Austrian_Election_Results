let DEBUG = true;

let tooltip = null;
let tooltipTitle = null;
let tooltipText = null;
let tooltipBars = null;
let tooltipLabels = null;

let mainBarChartArea = {width: 400, height: 150}
let tooltipBarChartArea = {width: 300, height: 150}

const REGION_TYPE_MUNICIPALITY = "Municipalities (Gemeinden)";
const REGION_TYPE_COUNTY = "Counties (Bezirke)";
const REGION_TYPES = [REGION_TYPE_MUNICIPALITY, REGION_TYPE_COUNTY];

function main() {

    let yearDataMap = {};

    d3.dsv(";", "./data/NRW19.csv").then(data => {

        let year = "2019";

        data = data_initialize(data);

        choropleth(data.municipalities,
            year,
            "#svg_choropleth_municipalities",
            "./data/gemeinden_wien_bezirke_gross_geo.json");

        choropleth(data.counties,
            year,
            "#svg_choropleth_counties",
            "./data/bezirke_wien_gross_geo.json");
        d3.select("#svg_choropleth_counties").style("display", "none");

        let barFptpG = bar(data.municipalities.reduced.mostVotedParty,
            "#svg_bar_fptp_municipalities",
            d3.select("#FPTPdiv"),
            mainBarChartArea);

        let barPrG = bar(data.municipalities.reduced.mostVotedParty,
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

        main_addYear(year);
        yearDataMap[year] = data;

        let barPlots = [barFptpG, barPrG];

        let yearSelect = d3.select("#year_select");
        yearSelect.on("change", () => main_selectionChangeFun(yearDataMap, barPlots));

        let regionSelect = d3.select("#region_select");
        for (let regionType of REGION_TYPES) {
            regionSelect.append("option")
                .attr("value", regionType)
                .html(regionType);
        }
        regionSelect.on("change", () => main_selectionChangeFun(yearDataMap, barPlots));

        d3.dsv(";", "./data/NRW17.csv").then(data => {
            data = data_initialize(data);
            let year = "2017";
            main_addYear(year);
            yearDataMap[year] = data;

            d3.dsv(";", "./data/NRW13.csv").then(data => {
                data = data_initialize(data);
                let year = "2013";
                main_addYear(year);
                yearDataMap[year] = data;
            });
        })
    });
}

function main_addYear(year) {
    d3.select("#year_select").append("option")
        .attr("value", year)
        .html(year);
}

function main_selectionChangeFun(yearDataMap, barPlots) {
    let selectedYear = d3.select("#year_select").node().value;
    let selectedRegionType = d3.select("#region_select").node().value;
    let data = yearDataMap[selectedYear];
    main_updateData(data, selectedRegionType, selectedYear, barPlots);
}

function main_updateData(newData, regionType, year, barPlots) {
    let id;
    switch (regionType) {
        case REGION_TYPE_MUNICIPALITY:
            newData = newData.municipalities;
            id = "#svg_choropleth_municipalities";
            d3.select("#svg_choropleth_counties").style("display", "none");
            d3.select("#svg_choropleth_municipalities").style("display", null);
            break;
        case REGION_TYPE_COUNTY:
            newData = newData.counties;
            id = "#svg_choropleth_counties";
            d3.select("#svg_choropleth_counties").style("display", null);
            d3.select("#svg_choropleth_municipalities").style("display", "none");
            break;
        default:
            console.error("update failed. unexpected regionType: " + regionType);
            return;
    }

    choropleth_updateFuns[id](newData, year);

    for (let barPlot of barPlots) {
        bar_update(barPlot.bars, barPlot.labels, mainBarChartArea, newData.reduced.mostVotedParty, 1000);
    }
}

main();