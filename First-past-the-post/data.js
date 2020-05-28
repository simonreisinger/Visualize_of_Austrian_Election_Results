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

        nationalResults = data.filter(function (value, index) {
            return value.GKZ.slice(-5) === "00000";
        });
        counties = data.filter(function (value, index) {
            let toBeAdded = value.GKZ.slice(-2) === "00";
            toBeAdded = toBeAdded && value.GKZ.slice(-4) !== "0000";
            toBeAdded = toBeAdded && /^\d+$/.test(value.GKZ.substring(1));
            return toBeAdded
        });
        console.log(counties);

        counties = counties.map(function (value) {
            value.Gebietsname = value.Gebietsname.replace(" - ", "-");
            value.Gebietsname = value.Gebietsname.replace(" Stadt", "");
            value.Gebietsname = value.Gebietsname.replace("-Stadt", "");
            value.Gebietsname = value.Gebietsname.replace(" Land", "-Land");
            value.Gebietsname = value.Gebietsname.replace(" Umgebung", "-Umgebung");
            value.Gebietsname = value.Gebietsname.replace("Innere", "Innere Stadt");
            let checkViennaBezirke = value.Gebietsname.split(',');
            value.Gebietsname = checkViennaBezirke[checkViennaBezirke.length -1];

            return value
        });
        let localWinner = firstPassThePoll(counties);
        choropleth(localWinner);
        updatePieChart(localWinner);
    });
}

function firstPassThePoll(dataset) {
    let mostVotes = [];
    for (let selectedState in dataset) {
        mostVotes[dataset[selectedState].Gebietsname] = {party: "", votes: 0};
        for (let parties in colors) {
            if (parties !== "SONST.") {
                let currentPartyVotes = parseInt(dataset[selectedState][parties].replace('.', ''));
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

function claculate()

function updatePie(selectedState) {
    //createPie(election_data[selectedState]);
    //updatePieChart(election_data[selectedState]);

}

function updateMap(party) {
    updateChoropleth(party);
}

init();








