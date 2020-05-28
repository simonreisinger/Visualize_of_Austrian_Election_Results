let colors = {
    "ÖVP": "#63C3D0",
    "SPÖ": "#ce000c",
    "FPÖ": "#0056A2",
    "NEOS": "#E3257B",
    "JETZT": "#ADADAD",
    "GRÜNE": "#88B626",
    "SONST.": "#222"
};
var counties = null;
var nationalResults = null;

// In this file, all the data handling should be done, for example:
// * loading the CSV file

// * computing the overall percentages for entire Austria
// (check the correctness of your computation here: https://www.bmi.gv.at/412/Nationalratswahlen/Nationalratswahl_2019/ )


function init() {
    let file_location = "./data/NRW19.csv";
    d3.dsv(";", file_location).then(function (_data) {
        let data = _data;

        nationalResults = data.filter(function (value) {
            return value.GKZ.slice(-5) === "00000";
        })[0];
        counties = data.filter(function (value) {
            let toBeAdded = value.GKZ.slice(-2) === "00";
            toBeAdded = toBeAdded && value.GKZ.slice(-4) !== "0000";
            toBeAdded = toBeAdded && /^\d+$/.test(value.GKZ.substring(1));
            return toBeAdded
        });

        counties = counties.map(function (value) {
            value.Gebietsname = value.Gebietsname.replace(" - ", "-");
            value.Gebietsname = value.Gebietsname.replace(" Stadt", "");
            value.Gebietsname = value.Gebietsname.replace("-Stadt", "");
            value.Gebietsname = value.Gebietsname.replace(" Land", "-Land");
            value.Gebietsname = value.Gebietsname.replace(" Umgebung", "-Umgebung");
            value.Gebietsname = value.Gebietsname.replace("Innere", "Innere Stadt");
            let checkViennaBezirke = value.Gebietsname.split(',');
            value.Gebietsname = checkViennaBezirke[checkViennaBezirke.length - 1];

            return value
        });
        let localWinner = firstPassThePoll(counties);
        choropleth(localWinner);
        let pieChartResults = firstPastThePostByParty(localWinner);
        updatePieChart(pieChartResults, "#svg_pie_fptp");
        let selectedParties = [];
        let sumOfValidVotes = 0;
        for (let p in colors) {
            if (p !== "SONST." && p !== "JETZT") {
                sumOfValidVotes += parseInt(nationalResults[p].replace(/\./g, ""))
            }
        }

        for (let p in colors) {
            if (p !== "SONST." && p !== "JETZT") {
                console.log(parseFloat(nationalResults[p].replace(/\./g, "")))
                console.log(parseFloat(nationalResults[p].replace(/\./g, ""))/sumOfValidVotes)
                console.log(parseFloat(nationalResults[p].replace(/\./g, ""))/sumOfValidVotes * 183.0)
                selectedParties[p] = Math.round(parseFloat(nationalResults[p].replace(/\./g, ""))/sumOfValidVotes * 183.0)
            }
        }

        updatePieChart(selectedParties, "#svg_pie_pr");
    });
}

function firstPassThePoll(dataset) {
    let mostVotes = [];
    for (let selectedState in dataset) {
        mostVotes[dataset[selectedState].Gebietsname] = {party: "", votes: 0};
        for (let parties in colors) {
            if (parties !== "SONST.") {
                let currentPartyVotes = parseInt(dataset[selectedState][parties].replace(/\./g, ""));
                if (currentPartyVotes >= mostVotes[dataset[selectedState].Gebietsname].votes) {
                    mostVotes[dataset[selectedState].Gebietsname] = {
                        party: parties,
                        votes: currentPartyVotes
                    }
                }
            }
        }
    }
    return mostVotes
}

function firstPastThePostByParty(dataset) {
    let mostVotes = [];
    for (let party in colors) {
        mostVotes[party] = 0;
    }

    for (let county in dataset) {
        mostVotes[dataset[county].party] += 1
    }

    function receivedPeople(value) {
        return mostVotes[value] > 0;
    }

    let xxxx = Object.keys(mostVotes).filter(receivedPeople);
    let selectedParties = [];
    for (xxx in xxxx) {
        selectedParties[xxxx[xxx]] = mostVotes[xxxx[xxx]]
    }
    return selectedParties
}

init();








