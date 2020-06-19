let _partyColors = {
    "ÖVP": "#63C3D0",
    "SPÖ": "#ce000c",
    "FPÖ": "#0056A2",
    "NEOS": "#E3257B",
    "JETZT": "#ADADAD",
    "GRÜNE": "#88B626",
    "SONST.": "#222"
};
function data_getPartyColor(party) {
    if (party in _partyColors) {
        return _partyColors[party];
    } else {
        return _partyColors["SONST."];
    }
}

function data_initialize(data) {
    // Counties
    let counties = data.filter(function (value) {
        let toBeAdded = value.GKZ.slice(-2) === "00";
        toBeAdded = toBeAdded && value.GKZ.slice(-4) !== "0000";
        toBeAdded = toBeAdded && /^\d+$/.test(value.GKZ.substring(1));
        return toBeAdded
    });
    counties = counties.map(function (value) {
        value.Gebietsname = data_parseGebietsname(value.Gebietsname);
        return value
    });

    // Municipalities (Gemeinde)
    let municipalities = data.filter(function (value) {
        let gkz = value.GKZ;
        let gkz_lastTwo = gkz.substring(4);
        return gkz_lastTwo != "99"
            && gkz_lastTwo != "00";
    });
    municipalities = data_preprocess(municipalities);

    // National results
    let nationalResults = data.filter(function (value) {
        return value.GKZ.slice(-5) === "00000";
    })[0];

    let localWinner = firstPassThePoll(counties);
    //choropleth(localWinner);
    let pieChartResults = firstPastThePostByParty(localWinner);
    let selectedParties = [];
    let sumOfValidVotes = 0;
    for (let p in _partyColors) {
        if (p !== "SONST." && p !== "JETZT") {
            sumOfValidVotes += parseInt(nationalResults[p].replace(/\./g, ""))
        }
    }

    if (DEBUG)
        for (let p in _partyColors) {
            if (p !== "SONST." && p !== "JETZT") {
                console.log(parseFloat(nationalResults[p].replace(/\./g, "")))
                console.log(parseFloat(nationalResults[p].replace(/\./g, "")) / sumOfValidVotes)
                console.log(parseFloat(nationalResults[p].replace(/\./g, "")) / sumOfValidVotes * 183.0)
                selectedParties[p] = Math.round(parseFloat(nationalResults[p].replace(/\./g, "")) / sumOfValidVotes * 183.0)
            }
        }

    return { counties, municipalities, pieChartResults, selectedParties };
}

function firstPassThePoll(dataset) {
    let mostVotes = [];
    for (let selectedState in dataset) {
        mostVotes[dataset[selectedState].Gebietsname] = {party: "", votes: 0};
        for (let parties in _partyColors) {
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
    for (let party in _partyColors) {
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

function data_parseGebietsname(gebietsname) {
    let name = gebietsname
        .replace(" - ", "-")
        .replace(" Stadt", "")
        .replace("-Stadt", "")
        .replace(" Land", "-Land")
        .replace(" Umgebung", "-Umgebung")
        .replace("Innere", "Innere Stadt");
    name = name.split(",")
    return name[name.length - 1];
}

function data_formatVotes(votes) {
    return votes === "" ? 0 : parseInt(votes.replace(".",""));
}

function data_preprocess(manyRegions) {
    let data = {};
    for (region of manyRegions) {
        let value = {};
        value.ÖVP = data_formatVotes(region.ÖVP);
        value.SPÖ = data_formatVotes(region.SPÖ);
        value.FPÖ = data_formatVotes(region.FPÖ);
        value.NEOS = data_formatVotes(region.NEOS);
        value.JETZT = data_formatVotes(region.JETZT);
        value.GRÜNE = data_formatVotes(region.GRÜNE);
        value.KPÖ = data_formatVotes(region.KPÖ);
        value.WANDL = data_formatVotes(region.WANDL);
        value.BZÖ = data_formatVotes(region.BZÖ);
        value.BIER = data_formatVotes(region.BIER);
        value.CPÖ = data_formatVotes(region.CPÖ);
        value.GILT = data_formatVotes(region.GILT);
        value.SLP = data_formatVotes(region.SLP);
        value.invalid = data_formatVotes(region.Ungültige);

        value.mostVotedParty = Object.keys(value).reduce(function (keyA, keyB) {
            return value[keyA] > value[keyB] ? keyA : keyB;
        });

        value.iso = parseInt(region.GKZ.substring(1));
        value.name = data_parseGebietsname(region.Gebietsname);
        //value.entitledToVote = parseInt(oldValue["Wahlbe-rechtigte"].replace(".",""));
        value.votes = data_formatVotes(region.Stimmen);

        data[value.iso] = value;
    }

    if (DEBUG) console.log(Object.keys(data).length + " values in data array");

    return data;
}