let colors = {
    "ÖVP": "#63C3D0",
    "SPÖ": "#ce000c",
    "FPÖ": "#0056A2",
    "NEOS": "#E3257B",
    "JETZT": "#ADADAD",
    "GRÜNE": "#88B626",
    "SONST.": "#222"
};
let election_data = null;

// In this file, all the data handling should be done, for example:
// * loading the CSV file

// * computing the overall percentages for entire Austria
// (check the correctness of your computation here: https://www.bmi.gv.at/412/Nationalratswahlen/Nationalratswahl_2019/ )


function init() {
    let file_location = "./data/NRW19.csv";
    d3.dsv(";", file_location).then(function(data) {
        //console.log(data);
        firstPassThePoll();
        choropleth(firstPassThePoll());
        updatePie("total");

    });
}

function firstPassThePoll() {
    let mostVotes = [];
    /*for (let selectedState in election_data) {
        mostVotes[selectedState] = {party: "", percantage: 0};
        for (let property in election_data[selectedState]) {
            if (election_data[selectedState].hasOwnProperty(property)) {
                currentPartyPerc = parseFloat(election_data[selectedState][property].percantage);
                if (currentPartyPerc >= mostVotes[selectedState].percantage) {
                    mostVotes[selectedState] = {
                        party: election_data[selectedState][property],
                        percantage: currentPartyPerc
                    }
                }
            }
        }
    }*/
    return mostVotes
}

function updatePie(selectedState) {
    //createPie(election_data[selectedState]);
    //updatePieChart(election_data[selectedState]);

}

function updateMap(party) {
    updateChoropleth(party);
}

init();








