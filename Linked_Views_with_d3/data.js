let colors = {
    "ÖVP":"#63C3D0",
    "SPÖ":"#ce000c",
    "FPÖ":"#0056A2",
    "NEOS":"#E3257B",
    "JETZT":"#ADADAD",
    "GRÜNE":"#88B626",
    "SONST.":"#222"
};
let election_data = null

// In this file, all the data handling should be done, for example:
// * loading the CSV file

// * computing the overall percentages for entire Austria
// (check the correctness of your computation here: https://www.bmi.gv.at/412/Nationalratswahlen/Nationalratswahl_2019/ )


function init_x()
{
    let file_location = "https://raw.githubusercontent.com/ippon1/Visualize_of_Austrian_Election_Results/master/Linked_Views_with_d3/NRW2019_Bundeslaender.csv"
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file_location, true);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                var rows = allText.split("\r\n");

                var electionData = {};

                parties = rows[0].split(',');

                // Sum up total votes per party
                electionData["total"] = {};
                electionData["total"]["votes"] = 0;
                for (var i = 2; i < parties.length; i++) {
                    electionData["total"][parties[i].toString() + "_abs"] = 0;
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
                            //console.log(electionData["total"])
                        } else {
                            electionData[currentState][parties[j].toString()] = value;
                            if (parties[j].toString() !== "votes"){
                                electionData[currentState][parties[j].toString() + "_abs"] = Math.floor(electionData[currentState]["votes"]* value/100);
                                electionData["total"][parties[j].toString() + "_abs"] += electionData[currentState][parties[j].toString() + "_abs"];
                            } else {
                                electionData["total"]["votes"] += parseInt(value);
                            }
                        }
                    }
                }
                for (var i = 2; i < parties.length; i++) {
                    electionData["total"][parties[i].toString()] = 100 * electionData["total"][parties[i].toString() + "_abs"] / electionData["total"]["votes"];
                }
                console.log(electionData);
                election_data = electionData;

                // * synchronization between choropleth map and pie chart
                choropleth();
                pie(election_data);

            }
        }
    };
    rawFile.send(null);
}


init_x();








