function parallel(yearToDataMap, id, where, height=300) {

    let parallelData = parallel_preprocess(yearToDataMap);
    yearToDataMap = parallelData.data;
    let parties = parallelData.partyNames;
    let years = Object.keys(yearToDataMap);

    // Source: https://www.d3-graph-gallery.com/graph/parallel_basic.html

    let margin = {top: 30, right: 10, bottom: 10, left: 10};
    let rect = where.node().getBoundingClientRect();

    let width = rect.width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    let parG = where
        .append("svg")
            .attr("id", id)
            .attr("class", "parallelSvg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let firstYear = parallel_getFirstAndLastYears(years);
    let lastYear = firstYear.last;
    firstYear = firstYear.first;

    let y = d3.scaleLinear()
        .range([height, 0])
        //.domain([0, parallel_getMaxMainPercentage(yearToDataMap)]); // 0% to max%
        .domain([0, 100]); // 0% to 100%

    let x = d3.scalePoint()
        .range([0, width])
        .padding(1) // TODO what does this do?
        .domain(years);

    parG.selectAll(".parallelPath")
        .data(parties)
        .enter().append("path")
        .attr("d", function(d) {
            let party = d;
            let line = d3.line()(d3.keys(yearToDataMap).map(function (p) {
                let year = p;
                let percentage = yearToDataMap[year][party];
                let xx = x(year)
                let yy = y(percentage);
                if (isNaN(xx) || isNaN(yy)) {
                    console.error("xx or yy was NaN");
                }
                return [xx, yy];
            }));
            return line;
        })
        .style("fill", "none") // TODO make style in CSS
        .style("stroke", d => data_getPartyColor(d))
        .style("opacity", 1)
        .style("stroke-width", 5);

    parG.selectAll(".parallelAxis")
        .data(years)
        .enter().append("g")
        .attr("transform", function(d) {
            return "translate(" + x(d) + ")";
        })
        .each(function(d, i) {
            if (d !== firstYear) {
                return d3.select(this).call(d3.axisLeft().scale(y).tickFormat(() => ""));
            } else {
                return d3.select(this).call(d3.axisLeft().scale(y));
            }
        })
        .attr("class", d => {
            switch (d) {
                case firstYear: return "parallelAxisFirst";
                case lastYear: return "parallelAxisLast";
                default: return null;
            }
        })
        .append("text")
            .attr("class", "parallelAxisLabel")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) {
                return d;
            })
            .style("fill", "black");

    parG.selectAll(".parallelAxisPartyLabel")
        .data(parties)
        .enter().append("g")
        .attr("transform", function(d) {

        })
}

function parallel_getMaxMainPercentage(yearToDataMap) {
    let max = 0;
    for (let year in yearToDataMap) {
        let maxMain = yearToDataMap[year].percentages.maxMostVotedParty;
        if (maxMain > max) max = maxMain;
    }
    return max;
}

function parallel_getFirstAndLastYears(years) {
    let first = Infinity;
    let last = 0;
    for (let year of years) {
        year = parseInt(year);
        if (year > last) last = year;
        if (year < first) first = year;
    }
    return { first: first.toString(), last: last.toString() };
}

function parallel_preprocess(yearToDataMap) {
    let partiesSet = new Set();

    for (let year in yearToDataMap) {
        let data = yearToDataMap[year].percentages.mostVotedParty;
        for (let partyName in data) {
            if (partyName === SONST) continue;
            partiesSet.add(partyName);
        }
    }

    let parData = {};
    for (let year in yearToDataMap) {
        parData[year] = {};
        let data = yearToDataMap[year].percentages.mostVotedParty;
        for (let partyName of partiesSet) {
            let votes = data[partyName];
            if (votes === undefined) votes = 0;
            parData[year][partyName] = votes;
        }
    }

    return {
        data: parData,
        partyNames: Array.from(partiesSet)
    };
}