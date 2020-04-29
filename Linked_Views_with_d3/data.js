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


function init_x() {
    //let file_location = "https://raw.githubusercontent.com/ippon1/Visualize_of_Austrian_Election_Results/master/Linked_Views_with_d3/NRW2019_Bundeslaender.csv";
    let file_location = "./NRW2019_Bundeslaender.csv";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file_location, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                var rows = allText.split("\r\n");

                var electionData = {};

                parties = rows[0].split(',');

                // Sum up total votes per party
                electionData["total"] = {};

                //electionData["total"]["votes"] = 0;
                for (var i = 1; i < parties.length; i++) {
                    electionData["total"][parties[i].toString()] = {
                        name: parties[i].toString(),
                        percantage: 100,
                        abs: 0
                    };
                }

                //move line by line
                for (var i = 1; i < rows.length; i++) {
                    //split by separator (,) and get the columns
                    var cols = rows[i].split(',');
                    //move column by column
                    var currentState = "";
                    for (var j = 0; j < cols.length; j++) {
                        var value = cols[j];
                        if (j === 0) // Add New State
                        {
                            currentState = value.toString();
                            electionData[currentState] = {};
                        } else {
                            if (parties[j].toString() !== "votes") {
                                electionData[currentState][parties[j].toString()] = {
                                    name: parties[j].toString(),
                                    percantage: value,
                                    abs: Math.floor(electionData[currentState]["votes"].abs * value / 100)
                                };
                                electionData["total"][parties[j].toString()].abs += electionData[currentState][parties[j].toString()].abs;
                            } else {
                                electionData["total"]["votes"].abs += parseInt(value);
                                electionData[currentState][parties[j].toString()] = {percantage: 0, abs: value};
                            }

                        }
                    }
                }
                for (var i = 2; i < parties.length; i++) {
                    electionData["total"][parties[i].toString()].percantage = 100 * electionData["total"][parties[i].toString()].abs / electionData["total"]["votes"].abs;
                }
                election_data = electionData;
                // * synchronization between choropleth map and pie chart
                firstPassThePoll("Wien")
                choropleth(firstPassThePoll());
                pie(election_data["total"]);

            }
        }
    };
    rawFile.send(null);
}

function firstPassThePoll() {
    let mostVotes = [];
    for (let selectedState in election_data) {
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
    }
    return mostVotes
}

function updatePie(selectedState) {
    pie(election_data[selectedState]);
}

function updateMap(party) {
    updateChoropleth(party);
}

init_x();








