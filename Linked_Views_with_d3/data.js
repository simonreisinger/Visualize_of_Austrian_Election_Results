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
    let file_location = "./NRW2019_Bundeslaender.csv";
    d3.csv(file_location).then(function (data) {
        let parties = Object.keys(data[0]);

        let electionData = {};

        // Sum up total votes per party
        electionData["total"] = {};

        for (let i = 1; i < parties.length; i++) {
            if (parties[i] !== "Bundesland") {
            //if (Object.keys(colors).indexOf(parties[i]) > -1) {
                electionData["total"][parties[i].toString()] = {
                    name: parties[i].toString(),
                    percantage: 100,
                    abs: 0
                };
            }
        }

        //move line by line
        for (let i = 0; i < data.length; i++) {
            //split by separator (,) and get the columns
            let cols = data[i];

            //move column by column
            let currentState = "";
            for (let value of Object.keys(cols)) {
                if (value === "Bundesland") // Add New State
                {
                    currentState = cols[value];
                    electionData[currentState] = {};
                } else if (value === "votes") {
                    electionData["total"]["votes"].abs += parseInt(cols[value]);
                    electionData[currentState][value] = {percantage: 0, abs: cols[value]};

                } else {
                    electionData[currentState][value] = {
                        name: value,
                        percantage: cols[value],
                        abs: Math.floor(electionData[currentState]["votes"].abs * cols[value] / 100)
                    };
                    electionData["total"][value].abs += electionData[currentState][value].abs;
                }
            }
        }

        for (let value of Object.keys(colors)) {
        //for (var i = 2; i < Object.keys(colors).length; i++) {
            electionData["total"][value].percantage = 100 * electionData["total"][value].abs / electionData["total"]["votes"].abs;
        }
        election_data = electionData;
        // * synchronization between choropleth map and pie chart
        firstPassThePoll("Wien");
        choropleth(firstPassThePoll());
        updatePie("total");

    });
}

function firstPassThePoll() {
    let mostVotes = [];
    for (let selectedState in election_data) {
        mostVotes[selectedState] = {party: "", percantage: 0};
        for (let property in election_data[selectedState]) {
            if (election_data[selectedState].hasOwnProperty(property)) {
                var currentPartyPerc = parseFloat(election_data[selectedState][property].percantage);
                if (currentPartyPerc >= mostVotes[selectedState].percantage) {
                    mostVotes[selectedState] = {
                        party: election_data[selectedState][property],
                        percantage: currentPartyPerc
                    }
                }
            }
        }
    }
    return mostVotes
}

function updatePie(selectedState) {
    //createPie(election_data[selectedState]);
    updatePieChart(election_data[selectedState]);

}

function updateMap(party) {
    updateChoropleth(party);
}

init();








