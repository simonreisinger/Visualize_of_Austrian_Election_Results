const SONST = "SONST.";
const INVALID = "invalid";
const partyNames = ["ÖVP", "SPÖ", "FPÖ", "NEOS", "GRÜNE", SONST];

let NRParties = []
NRParties[2019] = ["ÖVP", "SPÖ", "FPÖ", "NEOS", "GRÜNE"];
NRParties[2017] = ["ÖVP", "SPÖ", "FPÖ", "NEOS", "PILZ"];
NRParties[2013] = ["ÖVP", "SPÖ", "FPÖ", "NEOS", "GRÜNE", "FRANK"];

let _partyColors = {
    "ÖVP": "#63C3D0", // WE IGNORE THAT THEY CHANGED COLOR
    "SPÖ": "#ce000c",
    "FPÖ": "#0056A2",
    "NEOS": "#E3257B",
    "GRÜNE": "#88B626",
    "SONST.": "#222",

    // Others
    "BZÖ": "Orange",
    "JETZT": "#ADADAD",
    "PILZ": "#ADADAD", // SAME PARTY DIFFERENT NAME
    "FRANK": "#F8D323",
    "KPÖ": "#F00",
    "PIRAT": "#4C2582"
};

function data_getPartyColor(party) {
    if (party in _partyColors) {
        return _partyColors[party];
    } else {
        return _partyColors[SONST];
    }
}

function data_initialize(data, year) {
    // Counties
    let counties = data_filterCounties(data);
    if (DEBUG && Object.keys(counties).length !== 116) {
        let len = Object.keys(counties).length;
        console.error(year + " counties length was " + len + " but it should be 116");
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

    let countiesXX = data_filterCounties(data);
    let lol = countiesXX.map(function (value) {
        value.Gebietsname = data_parseGebietsname(value.Gebietsname);
        return value;
    });

    WahlkreiseDataSet[year] = firstPassThePostWahlkreis(lol, year)
    let mostVotedParty = clacBarData(year); // TODO edit here
    var wahlkreis = data_filterCounties(data);
    wahlkreis = data_preprocessRegions(wahlkreis);
    //wahlkreis.reduced = {};
    wahlkreis.reduced.mostVotedParty = mostVotedParty;
    wahlkreis.reduced.percentages.mostVotedParty = data_calculatePercentageFromMostVotedParty(mostVotedParty);

    var nationalResults = data.filter(function (value) {
        return value.GKZ.slice(-5) === "00000";
    })[0];
    let thisYearsResults = getPRResults(nationalResults, year) // TODO


    return {
        counties,
        municipalities,
        wahlkreis,
        thisYearsResults
    };
}

function getPRResults(nationalResults, year) {
    let selectedParties = [];
    let sumOfValidVotes = 0;
    for (let p in _partyColors) {
        if (NRParties[year].includes(p)) {
            sumOfValidVotes += parseInt(nationalResults[p].replace(/\./g, ""))
        }
    }

    for (let p in _partyColors) {
        if (NRParties[year].includes(p)) {
            if (!partyNames.includes(p)) {
                if (selectedParties[SONST] === null || selectedParties[SONST] === undefined) {
                    selectedParties[SONST] = 0
                }
                selectedParties[SONST] += Math.round(parseFloat(nationalResults[p].replace(/\./g, "")) / sumOfValidVotes * 183.0)
            } else {
                selectedParties[p] = Math.round(parseFloat(nationalResults[p].replace(/\./g, "")) / sumOfValidVotes * 183.0)
            }
        } else if (p === SONST || p === "GRÜNE") {
            selectedParties[p] = 0;
        }
    }
    return selectedParties;
}

function removeNonASCIICharacters(words) {
    if (words === null || words === undefined) {
        return words;
    }
    return words.replace("ß", "ss").replace("ü", "ue").replace("ö", "oe").replace("ä", "ae")
}

function data_parseGebietsname(gebietsname) {
    if (DEBUG && gebietsname === undefined) {
        console.error("gebietsname was undefined");
        return "undefined";
    }
    let name = gebietsname
        .replace(" - ", "-")
        .replace(" Stadt", "")
        .replace("-Stadt", "")
        .replace("(Stadt)", "")
        .replace(" Land", "-Land")
        .replace("(Land)", "")
        .replace(" Umgebung", "-Umgebung")
        .replace("Innere", "Innere Stadt");
    name = name.split(",")
    return name[name.length - 1];
}

function data_formatVotes(votes) {
    return votes === undefined ? null : (votes === "" ? 0 : parseInt(votes.replace(".", "")));
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
        partiesOther[INVALID] = data_formatVotes(region["Ungültige"]);

        value.partiesAll = Object.assign({}, partiesMain, partiesOther);

        partiesMain[SONST] = 0;
        for (let key in partiesOther) partiesMain[SONST] += partiesOther[key];
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

        value.percentages = {};
        for (let partyName in partyNames) {
            if (partyName !== SONST) {
                let partyVotes = value.partiesMain[partyName];
                let percentage = partyVotes / value.votes // In range 0..1

                // In range 0..100 with two decimal places at most
                value.percentages[partyName] = Math.round(percentage * 10000) / 100;
            }
        }
        value.percentages[SONST] = 100;
        for (let partyName in value.percentages) {
            value.percentages[SONST] -= value.percentages[partyName];
        }

        data[value.iso] = value;
    }

    if (DEBUG) console.log(Object.keys(data).length + " values in data array");

    data.reduced = data_reduceRegions(data);

    return data;
}

function data_getVotesTotal(region) {
    if (region.Stimmen !== undefined) return data_formatVotes(region.Stimmen);
    if (region.Gültige !== undefined && region.Ungültige !== undefined)
        return data_formatVotes(region.Gültige) + data_formatVotes(region.Ungültige);
}

function data_reduceRegions(manyPreprocessedRegions) {
    let mostVotedParty = {};
    let proportionalRepresentation = {};

    let data = {
        mostVotedParty,
        proportionalRepresentation
    };
    let percentages = {
        mostVotedParty: {}
    };
    let maxMostVotedParty = 0;

    for (let partyName of partyNames) {
        mostVotedParty[partyName] = 0;
        percentages.mostVotedParty[partyName] = 0;
        proportionalRepresentation[partyName] = 0;
    }

    for (let iso in manyPreprocessedRegions) {
        let preprocessedRegion = manyPreprocessedRegions[iso];

        let mvp = preprocessedRegion.mostVotedParty;
        if (mostVotedParty[mvp] === undefined) mostVotedParty[mvp] = 0;
        if (percentages.mostVotedParty[mvp] === undefined) percentages.mostVotedParty[mvp] = 0;
        mostVotedParty[mvp]++;

        if (!partyNames.includes(mvp)) {
            if (mostVotedParty[SONST] === undefined) mostVotedParty[SONST] = 0;
            if (percentages.mostVotedParty[SONST] === undefined) percentages.mostVotedParty[SONST] = 0;
            mostVotedParty[SONST]++;
        }

        // For each region (municipality or county or whatever)...
        // compute proportional representation for this region and accumulate it
    }

    let numRegions = Object.keys(manyPreprocessedRegions).length;
    for (let key in percentages) {
        let max = 0;
        for (let partyName in percentages[key]) {
            let value = data[key][partyName];
            let perc = value / numRegions;
            perc = Math.round(perc * 10000) / 100;
            percentages[key][partyName] = perc;
            if (perc > max) max = perc;
        }
        if (key === "mostVotedParty") maxMostVotedParty = max;
    }

    percentages.maxMostVotedParty = maxMostVotedParty;

    return {
        mostVotedParty,
        proportionalRepresentation,

        percentages
    };
}

function getDatasetByISO(data, iso, year) {
    if (year === 2013) {
        if (iso === 62268) return getDataByISO(data, 62268, 62213, null);
        // Rohrbach --> Rohrbach an der Lafnitz
        if (iso === 62277) return getDataByISO(data, 62277, 62240, null);
        if (iso === 32144) return getDataByISO(data, 32144, 32408, null);
        if (iso === 30735) return getDataByISO(data, 30735, 32410, null);
        if (iso === 30738) return getDataByISO(data, 30738, 32417, null);
        if (iso === 30741) return getDataByISO(data, 30741, 32424, null);
        if (iso === 30736) return getDataByISO(data, 30736, 32411, null);
        if (iso === 30739) return getDataByISO(data, 30739, 32418, null);
        if (iso === 31952) return getDataByISO(data, 31952, 32416, null);
        if (iso === 31950) return getDataByISO(data, 31950, 32412, null);
        if (iso === 31951) return getDataByISO(data, 31951, 32415, null);
        if (iso === 31235) return getDataByISO(data, 31235, 32404, null);
        if (iso === 30740) return getDataByISO(data, 30740, 32419, null);
        if (iso === 30731) return getDataByISO(data, 30731, 32405, null);
        if (iso === 30732) return getDataByISO(data, 30732, 32406, null);
        if (iso === 31953) return getDataByISO(data, 31953, 32421, null);
        if (iso === 30733) return getDataByISO(data, 30733, 32407, null);
        if (iso === 30737) return getDataByISO(data, 30737, 32413, null);
        if (iso === 30729) return getDataByISO(data, 30729, 32401, null);
        if (iso === 31954) return getDataByISO(data, 31954, 32423, null);
        if (iso === 30730) return getDataByISO(data, 30730, 32402, null);
        if (iso === 31949) return getDataByISO(data, 31949, 32403, null);
        if (iso === 30734) return getDataByISO(data, 30734, 32409, null);
        // Ab 1. Jänner 2015 ist die Stadtgemeinde im Rahmen der steiermärkischen Gemeindestrukturreform mit den Gemeinden Oberwölz Umgebung, Schönberg-Lachtal und Winklern bei Oberwölz zusammengeschlossen, die neue Gemeinde führt den Namen „Oberwölz“ weiter.
        if (iso === 61440) return getDataByISO(data, 61440, 61414, [61415, 61434]);
        if (iso === 61445) return getDataByISO(data, 61445, 61417, [61430]);
        if (iso === 61441) return getDataByISO(data, 61441, 61418, null);
        if (iso === 61442) return getDataByISO(data, 61442, 61421, null);
        if (iso === 61443) return getDataByISO(data, 61443, 61422, null);
        if (iso === 61444) return getDataByISO(data, 61444, 61427, null);
        if (iso === 62377) return getDataByISO(data, 62377, 62309, null);
        if (iso === 61439) return getDataByISO(data, 61439, 61412, null);
        if (iso === 61627) return getDataByISO(data, 61627, 61602, null);
        if (iso === 61628) return getDataByISO(data, 61628, 61604, [61623]);
        if (iso === 61629) return getDataByISO(data, 61629, 61607, [61616]);
        if (iso === 61438) return getDataByISO(data, 61438, 61411, null);
        if (iso === 61630) return getDataByISO(data, 61630, 61608, null);
        if (iso === 61632) return getDataByISO(data, 61632, 61613, null);
        if (iso === 61437) return getDataByISO(data, 61437, 61404, [61405, 61406]);
        if (iso === 61446) return getDataByISO(data, 61446, 61432, null);
        if (iso === 62144) return getDataByISO(data, 62144, 62122, null);
        if (iso === 62143) return getDataByISO(data, 62143, 62121, null);
        if (iso === 61756) return getDataByISO(data, 61756, 61702, null);
        if (iso === 61757) return getDataByISO(data, 61757, 61705, null);
        if (iso === 61758) return getDataByISO(data, 61758, 62317, null);
        if (iso === 62145) return getDataByISO(data, 62145, 62118, [62136, 62137]);
        if (iso === 61759) return getDataByISO(data, 61759, 61712, null);
        if (iso === 61760) return getDataByISO(data, 61760, 61713, null);
        if (iso === 61761) return getDataByISO(data, 61761, 61715, [61749]);
        // https://de.wikipedia.org/wiki/Feistritztal
        if (iso === 62266) return getDataByISO(data, 62266, 61718, null);
        if (iso === 61762) return getDataByISO(data, 61762, 61721, null);
        if (iso === 62141) return getDataByISO(data, 62141, 62114, null);
        if (iso === 61267) return getDataByISO(data, 61267, 61244, null);
        if (iso === 61764) return getDataByISO(data, 61764, 61737, null);
        if (iso === 61265) return getDataByISO(data, 61265, 61242, null);
        if (iso === 61264) return getDataByISO(data, 61264, 61239, null);
        if (iso === 61263) return getDataByISO(data, 61263, 61238, null);
        if (iso === 61765) return getDataByISO(data, 61765, 61436, null);
        if (iso === 61766) return getDataByISO(data, 61766, 61755, null);
        if (iso === 61260) return getDataByISO(data, 61260, 61224, [61234]);
        if (iso === 61262) return getDataByISO(data, 61262, 61228, null);
        if (iso === 61255) return getDataByISO(data, 61255, 61226, null);
        if (iso === 61259) return getDataByISO(data, 61259, 61223, null);
        if (iso === 62048) return getDataByISO(data, 62048, 62037, null);
        if (iso === 62042) return getDataByISO(data, 62042, 62016, null);
        if (iso === 61258) return getDataByISO(data, 61258, 61221, null);
        //  Großsölk, Kleinsölk and Sankt Nikolai im Sölktal
        if (iso === 61266) return getDataByISO(data, 61266, 61214, [61220, 61241]);
        if (iso === 62046) return getDataByISO(data, 62046, 62030, null);
        // Oberzeiring, Bretstein, Sankt Johann am Tauern and Sankt Oswald-Möderbrugg
        if (iso === 62044) return getDataByISO(data, 62044, 62019, null);
        if (iso === 61256) return getDataByISO(data, 61256, 61210, null);
        if (iso === 61257) return getDataByISO(data, 61257, 61218, null);
        if (iso === 61055) return getDataByISO(data, 61055, 61031, null);
        if (iso === 61059) return getDataByISO(data, 61059, 61047, null);
        if (iso === 61254) return getDataByISO(data, 61254, 61202, null);
        if (iso === 61253) return getDataByISO(data, 61253, 61201, null);
        if (iso === 61058) return getDataByISO(data, 61058, 61039, null);
        if (iso === 61056) return getDataByISO(data, 61056, 61036, null);
        if (iso === 61057) return getDataByISO(data, 61057, 61048, [62364]);
        if (iso === 61054) return getDataByISO(data, 61054, 61023, null);
        if (iso === 61053) return getDataByISO(data, 61053, 61022, null);
        if (iso === 61052) return getDataByISO(data, 61052, 61015, null);
        if (iso === 61051) return getDataByISO(data, 61051, 61011, null);
        if (iso === 61050) return getDataByISO(data, 61050, 61009, null);
        if (iso === 61049) return getDataByISO(data, 61049, 61005, null);
        if (iso === 62264) return getDataByISO(data, 62264, 62203, null);
        if (iso === 62278) return getDataByISO(data, 62278, 62259, null);
        if (iso === 62276) return getDataByISO(data, 62276, 62239, null);
        if (iso === 62275) return getDataByISO(data, 62275, 62234, null);
        if (iso === 62274) return getDataByISO(data, 62274, 62231, null);
        if (iso === 62279) return getDataByISO(data, 62279, 62261, [62229]);
        if (iso === 62272) return getDataByISO(data, 62272, 62225, null);
        if (iso === 62270) return getDataByISO(data, 62270, 62221, null);
        if (iso === 60660) return getDataByISO(data, 60660, 60604, [60658]);
        if (iso === 60670) return getDataByISO(data, 60670, 60652, [60657]);
        if (iso === 60669) return getDataByISO(data, 60669, 60644, [60633]);
        if (iso === 60668) return getDataByISO(data, 60668, 60640, null);
        if (iso === 60667) return getDataByISO(data, 60667, 60635, [60612]);
        if (iso === 60666) return getDataByISO(data, 60666, 60631, null);
        if (iso === 60665) return getDataByISO(data, 60665, 60620, null);
        if (iso === 60664) return getDataByISO(data, 60664, 60614, null);
        if (iso === 60663) return getDataByISO(data, 60663, 60610, null);
        if (iso === 60662) return getDataByISO(data, 60662, 60609, [60630]);
        if (iso === 60661) return getDataByISO(data, 60661, 60606, null);
        if (iso === 60659) return getDataByISO(data, 60659, 60603, null);
        if (iso === 62273) return getDataByISO(data, 62273, 62228, null);
        if (iso === 62271) return getDataByISO(data, 62271, 62223, null);
        if (iso === 62269) return getDataByISO(data, 62269, 62217, null);
        if (iso === 62267) return getDataByISO(data, 62267, 62212, null);
        if (iso === 62389) return getDataByISO(data, 62389, 62363, null);
        if (iso === 62387) return getDataByISO(data, 62387, 62361, null);
        if (iso === 62386) return getDataByISO(data, 62386, 62360, null);
        if (iso === 62384) return getDataByISO(data, 62384, 62350, null);
        if (iso === 62382) return getDataByISO(data, 62382, 62334, null);
        if (iso === 62381) return getDataByISO(data, 62381, 62333, null);
        if (iso === 62380) return getDataByISO(data, 62380, 62321, null);
        if (iso === 62385) return getDataByISO(data, 62385, 62354, null);
        if (iso === 62379) return getDataByISO(data, 62379, 62316, null);
        if (iso === 62378) return getDataByISO(data, 62378, 62315, null);
        if (iso === 62375) return getDataByISO(data, 62375, 62303, null);
        if (iso === 60351) return getDataByISO(data, 60351, 60343, null);
        if (iso === 60350) return getDataByISO(data, 60350, 60333, null);
        if (iso === 60349) return getDataByISO(data, 60349, 60331, null);
        if (iso === 60348) return getDataByISO(data, 60348, 60330, null);
        if (iso === 60347) return getDataByISO(data, 60347, 60327, null);
        if (iso === 60346) return getDataByISO(data, 60346, 60312, null);
        if (iso === 60345) return getDataByISO(data, 60345, 60303, null);
        if (iso === 60344) return getDataByISO(data, 60344, 60302, null);
        if (iso === 62147) return getDataByISO(data, 62147, 62133, null);
        if (iso === 62142) return getDataByISO(data, 62142, 62117, null);
        if (iso === 62146) return getDataByISO(data, 62146, 62029, null);
        if (iso === 62148) return getDataByISO(data, 62148, 62134, [62127]);
        if (iso === 62140) return getDataByISO(data, 62140, 62113, null);
        if (iso === 62139) return getDataByISO(data, 62139, 62106, [62123]);
        if (iso === 62138) return getDataByISO(data, 62138, 62101, [62101]);
        if (iso === 62390) return getDataByISO(data, 62390, 62366, null);
        if (iso === 62388) return getDataByISO(data, 62388, 62362, [62307, 62310]);
        if (iso === 62376) return getDataByISO(data, 62376, 62357, null);
        if (iso === 62383) return getDataByISO(data, 62383, 62346, null);
        if (iso === 61626) return getDataByISO(data, 61626, 61601, null);
        if (iso === 61631) return getDataByISO(data, 61631, 61609, null);
        if (iso === 61633) return getDataByISO(data, 61633, 61622, [61620]);
        if (iso === 61763) return getDataByISO(data, 61763, 61736, null);
        if (iso === 62039) return getDataByISO(data, 62039, 62009, null);
        if (iso === 62040) return getDataByISO(data, 62040, 62011, null);
        if (iso === 62041) return getDataByISO(data, 62041, 62013, null);
        if (iso === 62043) return getDataByISO(data, 62043, 62020, [62017]);
        if (iso === 62045) return getDataByISO(data, 62045, 62129, [62005]);
        if (iso === 62047) return getDataByISO(data, 62047, 62035, null);
        if (iso === 62265) return getDataByISO(data, 62265, 62207, null);
        // The municipality was formed on 1 May 2015 by merging two municipalities,
        // Rohrbach in Oberösterreich and Berg bei Rohrbach.
        if (iso === 41344) return getDataByISO(data, 41344, 41330, [41308]);
        // Mitterberg-Sankt Martin ist seit Jahresbeginn 2015 eine Gemeinde
        if (iso === 61261) return getDataByISO(data, 61261, 61225, [61712, 61240]);
        if (iso === 41343) return getDataByISO(data, 41343, 41303, [41339]);
        if (iso === 62268) return getDataByISO(data, 62268, 62213, null);


    } else if (year === 2019) {
        //TODO 3 Gemeinden muessen zusammengelegt
        // Mit 1. Jänner 2019 wurden die Gemeinden St. Stefan am Walde und Afiesl zur neuen Gemeinde St. Stefan-Afiesl fusioniert
        if (iso === 41301 || iso === 41335) return getDataByISO(data, 41346, 41346, null);
        // Mit 1. Jänner 2019 wurde die Gemeinde Ahorn nach Helfenberg eingemeindet
        if (iso === 41302 || iso === 41310) return getDataByISO(data, 41345, 41345, null);
        // Mit 1. Jänner 2018 wurde die Gemeinde Schönegg Teil der Gemeinde Vorderweißenbach, das ehemalige Gemeindegebiet wurde damit Teil des Bezirks Urfahr-Umgebung
        if (iso === 41340 || iso === 41625) return getDataByISO(data, 41628, 41628, null);
        // Peuerbach mit den Nachbargemeinden Bruck-Waasen
        if (iso === 40803 || iso === 40819) return getDataByISO(data, 40835, 40835, null);
    }
    let xx = getDataByISO(data, iso, iso, null);
    return xx;
}

function getDataByISO(data, originalISO, iso1, iso2) { // TODO iso
    if (iso2 === null) return data[iso1]
    var maxPartyName = data[iso1].mostVotedParty;
    var maxPartyVotes = data[iso1].partiesAll[maxPartyName];

    let dataResult = {}
    dataResult.iso = originalISO;
    dataResult.name = data[iso1].name + "*"; //TODO edit here
    dataResult.votes = data[iso1].votes;
    dataResult.partiesAll = {};
    dataResult.partiesMain = {};
    for (var party in data[iso1].partiesAll) {
        dataResult.partiesAll[party] = data[iso1].partiesAll[party]
    }
    for (var party in data[iso1].partiesMain) {
        dataResult.partiesMain[party] = data[iso1].partiesMain[party]
    }
    for (var iso in iso2) {
        dataResult.votes += data[iso2[iso]].votes;
        for (var party in dataResult.partiesAll) {
            dataResult.partiesAll[party] += data[iso2[iso]].partiesAll[party]
            if (dataResult.partiesAll[party] > maxPartyVotes) {
                maxPartyName = party;
                maxPartyVotes = dataResult.partiesAll[party];
            }
        }
        for (var party in dataResult.partiesMain) {
            dataResult.partiesMain[party] += data[iso2[iso]].partiesMain[party]
        }
    }
    dataResult.mostVotedParty = maxPartyName
    data[originalISO] = dataResult;
    return dataResult;
}

var WahlkreiseMandate = [];
var WahlkreiseDataSet = [];
var weightedResult = [];
var pieChartResults = null;

function clacBarData(year) {
    var wkm = []
    wkm["SONST."] = 0;
    wkm["GRÜNE"] = 0;
    for (var i in NRParties[year]) {
        if (partyNames.includes(NRParties[year][i])) {
            wkm[NRParties[year][i]] = 0;
        } else {
            wkm["SONST."] = 0;
        }
    }
    for (var currentWahlkreis in WahlkreiseDataSet[year]) {
        if (wkm[WahlkreiseDataSet[year][currentWahlkreis].party] === undefined || wkm[WahlkreiseDataSet[year][currentWahlkreis].party] === null) {
            wkm[WahlkreiseDataSet[year][currentWahlkreis].party] = 0;
        }
        for (var currentBezirk in WahlkreiseMandate[year]) {
            if (currentBezirk === currentWahlkreis) {
                if (partyNames.includes(WahlkreiseDataSet[year][currentWahlkreis].party)) {
                    wkm[WahlkreiseDataSet[year][currentWahlkreis].party] += WahlkreiseMandate[year][currentBezirk].Mandate;
                } else {
                    wkm["SONST."] += WahlkreiseMandate[year][currentBezirk].Mandate;
                }
                break;
            }
        }
    }
    return wkm;
}

function firstPassThePostWahlkreis(dataset, year) {
    WahlkreiseMandate[year] = []
    let mostVotes = [];
    for (let selectedState in dataset) {
        let xxxx = data_parseGebietsname(removeNonASCIICharacters(dataset[selectedState].Gebietsname))
        if (xxxx === "Krems") xxxx = "Krems an der Donau"
        if (xxxx === "Wien-Umgebung") xxxx = "Korneuburg"
        let wahlkreis = wahlkreisNach[xxxx].Wahlkreis
        if (mostVotes[wahlkreis] === null || mostVotes[wahlkreis] === undefined) {
            mostVotes[wahlkreis] = {};
            mostVotes[wahlkreis].Gebietsname = wahlkreis;
            WahlkreiseMandate[year][wahlkreis] = {}
            WahlkreiseMandate[year][wahlkreis].Gebietsname = wahlkreis;
            WahlkreiseMandate[year][wahlkreis].Mandate = wahlkreisNach[removeNonASCIICharacters(dataset[selectedState].Gebietsname)].Mandate;
            for (let parties in NRParties[year]) {
                if (parties !== "SONST.") {
                    let currentPartyVotes = dataset[selectedState][NRParties[year][parties]].replace(/\./g, "");
                    mostVotes[wahlkreis][NRParties[year][parties]] = currentPartyVotes
                }
            }
        } else {
            for (let parties in NRParties[year]) {
                if (parties !== "SONST.") {
                    let currentPartyVotes = parseInt(dataset[selectedState][NRParties[year][parties]].replace(/\./g, ""));
                    mostVotes[wahlkreis][NRParties[year][parties]] = (parseInt(mostVotes[wahlkreis][NRParties[year][parties]]) + currentPartyVotes).toString();
                }
            }
        }
    }
    return firstPassThePost(mostVotes, year)
}

function firstPassThePost(dataset, year) {
    let mostVotes = [];
    for (let selectedState in dataset) {
        mostVotes[dataset[selectedState].Gebietsname] = {party: "", votes: 0};
        for (let parties in NRParties[year]) {
            if (parties !== "SONST.") {
                if (DEBUG && dataset[selectedState][NRParties[year][parties]] === undefined) {
                    console.log("parseInt(dataset[selectedState][parties] was undefined");
                }
                let currentPartyVotes = parseInt(dataset[selectedState][NRParties[year][parties]].replace(/\./g, ""));
                if (currentPartyVotes >= mostVotes[dataset[selectedState].Gebietsname].votes) {
                    mostVotes[dataset[selectedState].Gebietsname] = {
                        party: NRParties[year][parties],
                        votes: currentPartyVotes
                    }
                }
            }
        }
    }
    return mostVotes
}

function data_filterCounties(data) {
    return data.filter(function (value) {
        let gkz = value.GKZ;
        let gkz_last2 = gkz.substring(4);
        let gkz_last4 = gkz.substring(2);
        let gkz_3rd = gkz.substring(2, 3);

        return gkz_last2 === "00" && gkz_last4 !== "0000" && /[0-9]/.test(gkz_3rd);
    });
}

function data_calculatePercentageFromMostVotedParty(mostVotedParty) {
    let total = 0;
    for (let partyName in mostVotedParty) {
        total += mostVotedParty[partyName];
    }

    let percentages = {};
    for (let partyName in mostVotedParty) {
        let perc = mostVotedParty[partyName];
        perc = Math.round(perc / total * 10000) / 100;
        percentages[partyName] = perc;
    }

    return percentages;
}