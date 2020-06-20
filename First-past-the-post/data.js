let partyNames = ["ÖVP", "SPÖ", "FPÖ", "NEOS", "JETZT", "GRÜNE", "SONST."];
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
        return gkz_lastTwo !== "99"
            && gkz_lastTwo !== "00";
    });
    municipalities = data_preprocessRegions(municipalities);
    let municipalitiesReduced = data_reduce(municipalities);

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
                selectedParties[p] = Math.round(parseFloat(nationalResults[p].replace(/\./g, "")) / sumOfValidVotes * 183.0)
            }
        }

    return {
        counties,
        municipalities,
        municipalitiesReduced,
        pieChartResults,
        selectedParties
    };
}

function firstPassThePoll(dataset) {
    console.log(dataset)
    console.log("---------------")
    let mostVotes = [];
    for (let selectedState in dataset) {
        mostVotes[dataset[selectedState].Gebietsname] = {party: "", votes: 0};
        for (let parties in _partyColors) {
            if (parties !== "SONST.") {
                let currentPartyVotes = parseInt(dataset[selectedState][parties].replace(/\./g, ""));
                console.log(currentPartyVotes)
                if (currentPartyVotes >= mostVotes[dataset[selectedState].Gebietsname].votes) {
                    mostVotes[dataset[selectedState].Gebietsname] = {
                        party: parties,
                        votes: currentPartyVotes
                    }
                    console.log(mostVotes)
                }
            }
        }
    }
    return mostVotes
}

var WahlkreiseDataSet = [];


function removeNonASCIICharacters(words) {
    return words.replace("ß", "ss").replace("ü", "ue").replace("ö", "oe").replace("ä", "ae")
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

function data_preprocessRegions(manyRegions) {
    let data = {};
    for (region of manyRegions) {
        let value = {};

        let partiesMain = {};
        partiesMain.ÖVP = data_formatVotes(region.ÖVP);
        partiesMain.SPÖ = data_formatVotes(region.SPÖ);
        partiesMain.FPÖ = data_formatVotes(region.FPÖ);
        partiesMain.NEOS = data_formatVotes(region.NEOS);
        partiesMain.JETZT = data_formatVotes(region.JETZT);
        partiesMain.GRÜNE = data_formatVotes(region.GRÜNE);

        let partiesOther = {};
        partiesOther.KPÖ = data_formatVotes(region.KPÖ);
        partiesOther.WANDL = data_formatVotes(region.WANDL);
        partiesOther.BZÖ = data_formatVotes(region.BZÖ);
        partiesOther.BIER = data_formatVotes(region.BIER);
        partiesOther.CPÖ = data_formatVotes(region.CPÖ);
        partiesOther.GILT = data_formatVotes(region.GILT);
        partiesOther.SLP = data_formatVotes(region.SLP);
        partiesOther.invalid = data_formatVotes(region["Ungültige"]);

        value.partiesAll = Object.assign({}, partiesMain, partiesOther);

        partiesMain["SONST."] = 0;
        for (let key in partiesOther) partiesMain["SONST."] += partiesOther[key];
        value.partiesMain = partiesMain;

        value.mostVotedParty = Object.keys(Object.assign(value.partiesAll)).reduce(function (keyA, keyB) {
            return value.partiesAll[keyA] > value.partiesAll[keyB] ? keyA : keyB;
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

function data_reduce(manyPreprocessedRegions) {
    let mostVotedParty = {};

    for (let partyName of partyNames) {
        mostVotedParty[partyName] = 0;
    }

    for (let iso in manyPreprocessedRegions) {
        let preprocessedRegion = manyPreprocessedRegions[iso];
        mostVotedParty[preprocessedRegion.mostVotedParty]++;
    }

    return {
        mostVotedParty: mostVotedParty
    };
}

function data_processIso(iso) {
    // Different ids
    if (iso === 40819) iso = 40835;
    if (iso === 41310) iso = 41345;
    if (iso === 41625) iso = 41628;
    // 3 Gemeinden zusammengelegt
    // Mit 1. Jänner 2019 wurden die Gemeinden St. Stefan am Walde und Afiesl zur neuen Gemeinde St. Stefan-Afiesl fusioniert
    if (iso === 41301 || iso === 41335) iso = 41346;
    // Mit 1. Jänner 2019 wurde die Gemeinde Ahorn nach Helfenberg eingemeindet
    if (iso === 41302) iso = 41345;
    // Mit 1. Jänner 2018 wurde die Gemeinde Schönegg Teil der Gemeinde Vorderweißenbach, das ehemalige Gemeindegebiet wurde damit Teil des Bezirks Urfahr-Umgebung
    if (iso === 41340) iso = 41628;
    // Peuerbach mit den Nachbargemeinden Bruck-Waasen
    if (iso === 40803) iso = 40835;
    return iso;
}