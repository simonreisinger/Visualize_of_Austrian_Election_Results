const DEBUG = false;

let tooltip = null;
let tooltipTitle = null;
let tooltipText = null;
let tooltipBarChartDiv = null;
let tooltipBarChartDivSecondary = null;
let tooltipBars = null;
let tooltipLabels = null;

let choroplethMapArea = {width: 700, height: 400, x: 0, y: 0};
let mainBarChartArea = {width: 400, height: 150}
let tooltipBarChartArea = {width: 300, height: 150}

let lastRegionType = null;

const REGION_TYPE_MUNICIPALITY = "Municipalities"; // (Gemeinden)
const REGION_TYPE_COUNTY = "Districts"; // (Bezirke)
const REGION_TYPE_ELECTORALDISTRICT = "Electoral district"; //  (Wahlkreise) - Weighted https://en.wikipedia.org/wiki/Electoral_district
const REGION_TYPES = [REGION_TYPE_MUNICIPALITY, REGION_TYPE_COUNTY, REGION_TYPE_ELECTORALDISTRICT];

function main() {

    let yearDataMap = {};

    d3.dsv(";", "./data/NRW19.csv").then(data => {

        let year = 2019;

        data = data_initialize(data, year);

        choropleth(data.municipalities,
            year,
            "#svg_choropleth_municipalities",
            "./data/gemeinden_wien_bezirke_gross_geo.json",
            choroplethMapArea);

        choropleth(data.counties,
            year,
            "#svg_choropleth_counties",
            "./data/bezirke_wien_gross_geo.json",
            choroplethMapArea);
        d3.select("#svg_choropleth_counties").style("display", "none");


        choropleth(data.counties,
            year,
            "#svg_choropleth_electoralDistrict",
            "./data/bezirke_wien_gross_geo.json");
        d3.select("#svg_choropleth_electoralDistrict").style("display", "none");


        let barFptpG = bar(data.municipalities.reduced.mostVotedParty,
            "#svg_bar_fptp",
            d3.select("#FPTPdiv"),
            mainBarChartArea);

        let barPrG = bar(data.thisYearsResults,
            "#svg_bar_pr_municipalities",
            d3.select("#PRdiv"),
            mainBarChartArea);

        console.log(data.importantFPTP)
        console.log(data.importantPR)
        // PIE CHARTS
        //updatePieChart(data.importantFPTP.Municipalities, {imp: "green", notimp: "lightgrey", notimpX: "grey"}, "#svg_pie_Suppressed_fptp")
        //updatePieChart(data.importantPR, {imp: "green", notimp: "grey"}, "#svg_pie_Suppressed_pr")
        ///////////////////////////

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

                let pcArea = choroplethMapArea.width + mainBarChartArea.width;
                d3.selectAll(".pc_master_div")
                    .style("width", pcArea + "px");

                main_parallel(yearDataMap,
                    "municipalities",
                    "parallel_coordinates_fptp",
                    "parallel_coordinates_fptp_div",
                    PARALLEL_MODE_FPRP);

                main_parallel(yearDataMap,
                    "municipalities",
                    "parallel_coordinates_pr",
                    "parallel_coordinates_pr_div",
                    PARALLEL_MODE_PR);
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
    if (DEBUG) console.log(newData)
    bar_update(barPlots[1].bars, barPlots[1].labels, mainBarChartArea, newData.thisYearsResults, 1000); // TODO

    // Update Pie
    // PIE CHARTS
    updatePieChart(newData.importantFPTP[regionType.replace(" ", "")], {imp: "green", notimp: "grey", notimpX: "lightgrey"}, "#svg_pie_Suppressed_fptp")
    updatePieChart(newData.importantPR, {imp: "green", notimp: "grey"}, "#svg_pie_Suppressed_pr")

    let id;
    let key;
    switch (regionType) {
        case REGION_TYPE_MUNICIPALITY:
            key = "municipalities";
            id = "#svg_choropleth_municipalities";
            d3.select("#svg_choropleth_counties").style("display", "none");
            d3.select("#svg_choropleth_municipalities").style("display", null);
            d3.select("#svg_choropleth_electoralDistrict").style("display", "none");
            break;

        case REGION_TYPE_COUNTY:
            key = "counties";
            id = "#svg_choropleth_counties";
            d3.select("#svg_choropleth_counties").style("display", null);
            d3.select("#svg_choropleth_municipalities").style("display", "none");
            d3.select("#svg_choropleth_electoralDistrict").style("display", "none");
            break;

        case REGION_TYPE_ELECTORALDISTRICT:
            key = "electoralDistricts"; // TODO edit this line
            id = "#svg_choropleth_electoralDistrict";
            d3.select("#svg_choropleth_counties").style("display", "none");
            d3.select("#svg_choropleth_municipalities").style("display", "none");
            d3.select("#svg_choropleth_electoralDistrict").style("display", null);
            break;

        default:
            console.error("update failed. unexpected regionType: " + regionType);
            return;
    }

    newData = newData[key];

    choropleth_updateFuns[id](newData, year);
    bar_update(barPlots[0].bars, barPlots[0].labels, mainBarChartArea, newData.reduced.mostVotedParty, 1000); // TODO

    if (regionType !== lastRegionType) {
        main_parallel(yearDataMap, key, "parallel_coordinates_fptp", "parallel_coordinates_fptp_div", PARALLEL_MODE_FPRP);
        main_parallel(yearDataMap, key, "parallel_coordinates_pr", "parallel_coordinates_pr_div", PARALLEL_MODE_PR);
    }

    lastRegionType = regionType;
}

function main_parallel(yearDataMap, key, id, divId, mode) {
    let par = d3.select("#" + id);
    par.remove();

    let yearPartiesMap;
    if (mode === PARALLEL_MODE_FPRP) {
        yearPartiesMap = {};
        for (let year in yearDataMap) {
            yearPartiesMap[year] = yearDataMap[year][key].reduced;
        }
    } else {
        yearPartiesMap = yearDataMap;
    }

    let parallelCoordinatesDiv = d3.select("#" + divId);
    parallel(yearPartiesMap, id, parallelCoordinatesDiv, mode);
}

main();