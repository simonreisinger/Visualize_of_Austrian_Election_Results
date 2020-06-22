const DEBUG = true;

let tooltip = null;
let tooltipTitle = null;
let tooltipText = null;
let tooltipBarChartDiv = null;
let tooltipBarChartDivSecondary = null;
let tooltipBars = null;
let tooltipLabels = null;

let mainBarChartArea = {width: 400, height: 150}
let tooltipBarChartArea = {width: 300, height: 150}

let lastRegionType = null;

const REGION_TYPE_MUNICIPALITY = "Municipalities (Gemeinden)";
const REGION_TYPE_COUNTY = "Counties (Bezirke)";
const REGION_TYPE_WAHLKREISE = "Wahlkreise";
const REGION_TYPES = [REGION_TYPE_MUNICIPALITY, REGION_TYPE_COUNTY, REGION_TYPE_WAHLKREISE];

function main() {

    let yearDataMap = {};

    d3.dsv(";", "./data/NRW19.csv").then(data => {

        let year = 2019;

        data = data_initialize(data, year);

        choropleth(data.municipalities,
            year,
            "#svg_choropleth_municipalities",
            "./data/gemeinden_wien_bezirke_gross_geo.json");

        choropleth(data.counties,
            year,
            "#svg_choropleth_counties",
            "./data/bezirke_wien_gross_geo.json");
        d3.select("#svg_choropleth_counties").style("display", "none");


        choropleth(data.counties,
            year,
            "#svg_choropleth_wahlkreise",
            "./data/bezirke_wien_gross_geo.json");
        d3.select("#svg_choropleth_wahlkreise").style("display", "none");


        let barFptpG = bar(data.municipalities.reduced.mostVotedParty,
            "#svg_bar_fptp",
            d3.select("#FPTPdiv"),
            mainBarChartArea);

        let barPrG = bar(data.thisYearsResults,
            "#svg_bar_pr_municipalities",
            d3.select("#PRdiv"),
            mainBarChartArea);

        // Tooltip
        tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .attr("class", "tooltip");
        tooltipTitle = tooltip.append("div").attr("id", "tooltipTitle");
        tooltipText = tooltip.append("div").attr("id", "tooltipText");
        tooltipBarChartDiv = tooltip.append("div");
        tooltipBarChartDivSecondary = tooltip.append("div").style("display", "none");
        let tooltipBarElements = bar(null,
            "#bar_tooltip",
            tooltipBarChartDiv,
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

        lastRegionType = REGION_TYPE_MUNICIPALITY;

        d3.dsv(";", "./data/NRW17.csv").then(data => {
            let year = 2017;
            data = data_initialize(data, year);
            main_addYear(year);
            yearDataMap[year] = data;

            d3.dsv(";", "./data/NRW13.csv").then(data => {
                let year = 2013;
                data = data_initialize(data, year);
                main_addYear(year);
                yearDataMap[year] = data;

                main_parallel(yearDataMap, "municipalities");
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
    let selectedYear = parseInt(d3.select("#year_select").node().value);
    let selectedRegionType = d3.select("#region_select").node().value;
    let data = yearDataMap[selectedYear];
    main_updateData(data, yearDataMap, selectedRegionType, selectedYear, barPlots);
}

function main_updateData(newData, yearDataMap, regionType, year, barPlots) {
    console.log(newData)
    bar_update(barPlots[1].bars, barPlots[1].labels, mainBarChartArea, newData.thisYearsResults, 1000); // TODO

    let id;
    let key;
    switch (regionType) {
        case REGION_TYPE_MUNICIPALITY:
            key = "municipalities";
            id = "#svg_choropleth_municipalities";
            d3.select("#svg_choropleth_counties").style("display", "none");
            d3.select("#svg_choropleth_municipalities").style("display", null);
            d3.select("#svg_choropleth_wahlkreise").style("display", "none");
            break;

        case REGION_TYPE_COUNTY:
            key = "counties";
            id = "#svg_choropleth_counties";
            d3.select("#svg_choropleth_counties").style("display", null);
            d3.select("#svg_choropleth_municipalities").style("display", "none");
            d3.select("#svg_choropleth_wahlkreise").style("display", "none");
            break;

        case REGION_TYPE_WAHLKREISE:
            key = "wahlkreis"; // TODO edit this line
            id = "#svg_choropleth_wahlkreise";
            d3.select("#svg_choropleth_counties").style("display", "none");
            d3.select("#svg_choropleth_municipalities").style("display", "none");
            d3.select("#svg_choropleth_wahlkreise").style("display", null);
            break;

        default:
            console.error("update failed. unexpected regionType: " + regionType);
            return;
    }

    newData = newData[key];

    choropleth_updateFuns[id](newData, year);
    bar_update(barPlots[0].bars, barPlots[0].labels, mainBarChartArea, newData.reduced.mostVotedParty, 1000); // TODO

    if (regionType !== lastRegionType) main_parallel(yearDataMap, key);

    lastRegionType = regionType;
}

function main_parallel(yearDataMap, key) {
    let parallelId = "parallel_coordinates_fptp";
    let par = d3.select("#" + parallelId);
    par.remove();

    let yearPartiesMunicipalitiesMap = {};
    for (let year in yearDataMap) {
        yearPartiesMunicipalitiesMap[year] = yearDataMap[year][key].reduced;
    }

    let parallelCoordinatesDiv = d3.select("#parallel_coordinates_div");
    parallel(yearPartiesMunicipalitiesMap, parallelId, parallelCoordinatesDiv);
}

main();