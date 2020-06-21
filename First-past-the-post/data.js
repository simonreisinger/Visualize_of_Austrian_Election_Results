let partyNames = ["ÖVP", "SPÖ", "FPÖ", "NEOS", "GRÜNE", "SONST."];
let _partyColors = {
    "ÖVP": "#63C3D0",
    "SPÖ": "#ce000c",
    "FPÖ": "#0056A2",
    "NEOS": "#E3257B",
    //"JETZT": "#ADADAD",
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
        let gkz = value.GKZ;
        let gkz_last2 = gkz.substring(4);
        let gkz_last4 = gkz.substring(2);
        let gkz_3rd = gkz.substring(2,3);

        return gkz_last2 === "00" && gkz_last4 !== "0000" && /[0-9]/.test(gkz_3rd);
    });
    if (DEBUG && Object.keys(counties).length !== 116) {
        let len = Object.keys(counties).length;
        console.error("counties length was " + len + " but it should be 116");
    }
    counties = data_preprocessRegions(counties);

    // Municipalities (Gemeinde)
    let municipalities = data.filter(function (value) {
        let gkz = value.GKZ;
        let gkz_lastTwo = gkz.substring(4);
        return gkz_lastTwo !== "99"
            && gkz_lastTwo !== "00";
    });
    municipalities = data_preprocessRegions(municipalities);

    return {
        counties,
        municipalities
    };
}

function firstPassThePoll(dataset) {
    console.log(dataset)
    console.log("---------------")
    let mostVotes = [];
    for (let selectedState in dataset) {
        selectedState = parseInt(selectedState);
        mostVotes[dataset[selectedState].Gebietsname] = {party: "", votes: 0};
        for (let parties in _partyColors) {
            if (parties !== "SONST.") {
                if (DEBUG && dataset[selectedState][parties] == undefined) {
                    console.log("parseInt(dataset[selectedState][parties] was undefined");
                }
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
    return votes === undefined ? null : (votes === "" ? 0 : parseInt(votes.replace(".","")));
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
        partiesMain.GRÜNE = data_formatVotes(region.GRÜNE);

        let partiesOther = {};
        partiesOther.JETZT = data_formatVotes(region.JETZT);
        partiesOther.KPÖ = data_formatVotes(region.KPÖ);
        partiesOther.WANDL = data_formatVotes(region.WANDL);
        partiesOther.BZÖ = data_formatVotes(region.BZÖ);
        partiesOther.BIER = data_formatVotes(region.BIER);
        partiesOther.CPÖ = data_formatVotes(region.CPÖ);
        partiesOther.GILT = data_formatVotes(region.GILT);
        partiesOther.SLP = data_formatVotes(region.SLP);
        partiesOther.PILZ = data_formatVotes(region.PILZ);
        partiesOther.FLÖ = data_formatVotes(region.FLÖ);
        partiesOther.WEIßE = data_formatVotes(region.WEIßE);
        partiesOther.EUAUS = data_formatVotes(region.EUAUS);
        partiesOther.M = data_formatVotes(region.M);
        partiesOther.NBZ = data_formatVotes(region.NBZ);
        partiesOther.ODP = data_formatVotes(region.ODP);
        partiesOther.FRANK = data_formatVotes(region.FRANK);
        partiesOther.PIRAT = data_formatVotes(region.PIRAT);
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
        value.votes = data_getVotesTotal(region);

        if (DEBUG) {
            let votesSum = 0;
            for (let key in value.partiesAll) votesSum += value.partiesAll[key];
            if (votesSum !== value.votes) {
                //console.assert(votesSum === value.votes);
                console.error("vote count " + votesSum + " was wrong (expected: " + value.votes + ")");
            }
        }

        data[value.iso] = value;
    }

    if (DEBUG) console.log(Object.keys(data).length + " values in data array");

    data.reduced = data_reduce(data);

    return data;
}

function data_getVotesTotal(region) {
    if (region.Stimmen !== undefined) return data_formatVotes(region.Stimmen);
    if (region.Gültige !== undefined && region.Ungültige !== undefined)
        return data_formatVotes(region.Gültige) + data_formatVotes(region.Ungültige);
}

function data_reduce(manyPreprocessedRegions) {
    let mostVotedParty = {};
    let proportionalRepresentation = {};

    for (let partyName of partyNames) {
        mostVotedParty[partyName] = 0;
        proportionalRepresentation[partyName] = 0;
    }

    for (let iso in manyPreprocessedRegions) {
        let preprocessedRegion = manyPreprocessedRegions[iso];
        mostVotedParty[preprocessedRegion.mostVotedParty]++;

        // For each region (municipality or county or whatever)...
        // compute proportional representation for this region and accumulate it
    }

    return {
        mostVotedParty,
        proportionalRepresentation
    };
}

function data_processIso(iso, year) {
    if (year === "2013") {
        //41308, 41330
    } else if (year === "2019") {
        // 3 Gemeinden zusammengelegt
        // Mit 1. Jänner 2019 wurden die Gemeinden St. Stefan am Walde und Afiesl zur neuen Gemeinde St. Stefan-Afiesl fusioniert
        if (iso === 41301 || iso === 41335) iso = 41346;
        // Mit 1. Jänner 2019 wurde die Gemeinde Ahorn nach Helfenberg eingemeindet
        if (iso === 41302 || iso === 41310) iso = 41345;
        // Mit 1. Jänner 2018 wurde die Gemeinde Schönegg Teil der Gemeinde Vorderweißenbach, das ehemalige Gemeindegebiet wurde damit Teil des Bezirks Urfahr-Umgebung
        if (iso === 41340 || iso === 41625) iso = 41628;
        // Peuerbach mit den Nachbargemeinden Bruck-Waasen
        if (iso === 40803 || iso === 40819) iso = 40835;
    }
    return iso;
}
