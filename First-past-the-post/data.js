let partyNames = ["ÖVP", "SPÖ", "FPÖ", "NEOS", "GRÜNE", "SONST."];
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
    "FRANK": "#F8D323"
};

function data_getPartyColor(party) {
    if (party in _partyColors) {
        return _partyColors[party];
    } else {
        return _partyColors["SONST."];
    }
}

function data_initialize(data, year) {
    // Counties
    let counties = data.filter(function (value) {
        let gkz = value.GKZ;
        let gkz_last2 = gkz.substring(4);
        let gkz_last4 = gkz.substring(2);
        let gkz_3rd = gkz.substring(2, 3);

        return gkz_last2 === "00" && gkz_last4 !== "0000" && /[0-9]/.test(gkz_3rd);
    });
    let countiesXX = counties;

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
    let lol = countiesXX.map(function (value) {
        value.Gebietsname = data_parseGebietsname(value.Gebietsname);
        return value;
    });

    WahlkreiseDataSet[year] = firstPassThePostWahlkreis(lol, year)
    let mostVotedParty = clacBarData(year); // TODO edit here
    var wahlkreis = counties;
    wahlkreis.reduced = {};
    wahlkreis.reduced.mostVotedParty = mostVotedParty

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
                if (selectedParties["SONST."] === null || selectedParties["SONST."] === undefined) {
                    selectedParties["SONST."] = 0
                }
                selectedParties["SONST."] += Math.round(parseFloat(nationalResults[p].replace(/\./g, "")) / sumOfValidVotes * 183.0)
            } else {
                selectedParties[p] = Math.round(parseFloat(nationalResults[p].replace(/\./g, "")) / sumOfValidVotes * 183.0)
            }
        } else if (p === "SONST." || p === "GRÜNE") {
            selectedParties[p] = 0;
        }
    }
    return selectedParties;
}

function removeNonASCIICharacters(words) {
    if (words === null ||words === undefined){
        return words;
    }
    return words.replace("ß", "ss").replace("ü", "ue").replace("ö", "oe").replace("ä", "ae")
}

function data_parseGebietsname(gebietsname) {
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
        if (iso === 62268) iso = 62213;
        // Rohrbach --> Rohrbach an der Lafnitz
        if (iso === 62277) iso = 62240;
        if (iso === 32144) iso = 32408;
        if (iso === 30735) iso = 32410;
        if (iso === 30738) iso = 32417;
        if (iso === 30741) iso = 32424;
        if (iso === 30736) iso = 32411;
        if (iso === 30739) iso = 32418;
        if (iso === 31952) iso = 32416;
        if (iso === 31950) iso = 32412;
        if (iso === 31951) iso = 32415;
        if (iso === 31235) iso = 32404;
        if (iso === 30740) iso = 32419;
        if (iso === 30731) iso = 32405;
        if (iso === 30732) iso = 32406;
        if (iso === 31953) iso = 32421;
        if (iso === 30733) iso = 32407;
        if (iso === 30737) iso = 32413;
        if (iso === 30729) iso = 32401;
        if (iso === 31954) iso = 32423;
        if (iso === 30730) iso = 32402;
        if (iso === 31949) iso = 32403;
        if (iso === 30734) iso = 32409;
        // Ab 1. Jänner 2015 ist die Stadtgemeinde im Rahmen der steiermärkischen Gemeindestrukturreform mit den Gemeinden Oberwölz Umgebung, Schönberg-Lachtal und Winklern bei Oberwölz zusammengeschlossen, die neue Gemeinde führt den Namen „Oberwölz“ weiter.
        if (iso === 61440) iso = 61414; // + 61415 + 61434
        if (iso === 61445) iso = 61417; // + 61430
        if (iso === 61441) iso = 61418;
        if (iso === 61442) iso = 61421;
        if (iso === 61443) iso = 61422;
        if (iso === 61444) iso = 61427;
        if (iso === 62377) iso = 62309;
        if (iso === 61439) iso = 61412;
        if (iso === 61627) iso = 61602;
        if (iso === 61628) iso = 61604; // + 61623
        if (iso === 61629) iso = 61607; // + 61616
        if (iso === 61438) iso = 61411;
        if (iso === 61630) iso = 61608;
        if (iso === 61632) iso = 61613;
        if (iso === 61437) iso = 61404; // 61405 // 61406
        if (iso === 61446) iso = 61432;
        if (iso === 62144) iso = 62122;
        if (iso === 62143) iso = 62121;
        if (iso === 61756) iso = 61702;
        if (iso === 61757) iso = 61705;
        if (iso === 61758) iso = 62317;
        if (iso === 62145) iso = 62118; // + 62136 + 62137
        if (iso === 61759) iso = 61712;
        if (iso === 61760) iso = 61713;
        if (iso === 61761) iso = 61715; // 61749
        if (iso === 62266) iso = 61718; // https://de.wikipedia.org/wiki/Feistritztal
        if (iso === 61762) iso = 61721;
        if (iso === 62141) iso = 62114;
        if (iso === 61267) iso = 61244;
        if (iso === 61764) iso = 61737;
        if (iso === 61265) iso = 61242;
        if (iso === 61261) iso = 61225;
        if (iso === 61264) iso = 61239;
        if (iso === 61263) iso = 61238;
        if (iso === 61765) iso = 61436;
        if (iso === 61766) iso = 61755;
        if (iso === 61260) iso = 61224; // 61234
        if (iso === 61262) iso = 61228;
        if (iso === 61255) iso = 61226;
        if (iso === 61259) iso = 61223;
        if (iso === 62048) iso = 62037;
        if (iso === 62042) iso = 62016;
        if (iso === 61258) iso = 61221;
        //  Großsölk, Kleinsölk and Sankt Nikolai im Sölktal
        if (iso === 61266) iso = 61214; // 61220 // 61241
        if (iso === 62046) iso = 62030;
        // Oberzeiring, Bretstein, Sankt Johann am Tauern and Sankt Oswald-Möderbrugg
        if (iso === 62044) iso = 62019;
        if (iso === 61256) iso = 61210;
        if (iso === 61257) iso = 61218;
        if (iso === 61055) iso = 61031;
        if (iso === 61059) iso = 61047;
        if (iso === 61254) iso = 61202;
        if (iso === 61253) iso = 61201;
        if (iso === 61058) iso = 61039;
        if (iso === 61056) iso = 61036;
        if (iso === 61057) iso = 61048; // + 62364
        if (iso === 61054) iso = 61023;
        if (iso === 61053) iso = 61022;
        if (iso === 61052) iso = 61015;
        if (iso === 61051) iso = 61011;
        if (iso === 61050) iso = 61009;
        if (iso === 61049) iso = 61005;
        if (iso === 62264) iso = 62203;
        if (iso === 62278) iso = 62259;
        if (iso === 62276) iso = 62239;
        if (iso === 62275) iso = 62234;
        if (iso === 62274) iso = 62231;
        if (iso === 62279) iso = 62261; // 62229
        if (iso === 62272) iso = 62225;
        if (iso === 62270) iso = 62221;
        if (iso === 60660) iso = 60604; // 60658
        if (iso === 60670) iso = 60652; // 60657
        if (iso === 60669) iso = 60644; // 60633
        if (iso === 60668) iso = 60640;
        if (iso === 60667) iso = 60635; // 60612
        if (iso === 60666) iso = 60631;
        if (iso === 60665) iso = 60620;
        if (iso === 60664) iso = 60614;
        if (iso === 60663) iso = 60610;
        if (iso === 60662) iso = 60609; // 60630
        if (iso === 60661) iso = 60606;
        if (iso === 60659) iso = 60603;
        if (iso === 62273) iso = 62228;
        if (iso === 62271) iso = 62223;
        if (iso === 62269) iso = 62217;
        if (iso === 62267) iso = 62212;
        if (iso === 62389) iso = 62363;
        if (iso === 62387) iso = 62361;
        if (iso === 62386) iso = 62360;
        if (iso === 62384) iso = 62350;
        if (iso === 62382) iso = 62334;
        if (iso === 62381) iso = 62333;
        if (iso === 62380) iso = 62321;
        if (iso === 62385) iso = 62354;
        if (iso === 62379) iso = 62316;
        if (iso === 62378) iso = 62315;
        if (iso === 62375) iso = 62303;
        if (iso === 60351) iso = 60343;
        if (iso === 60350) iso = 60333;
        if (iso === 60349) iso = 60331;
        if (iso === 60348) iso = 60330;
        if (iso === 60347) iso = 60327;
        if (iso === 60346) iso = 60312;
        if (iso === 60345) iso = 60303;
        if (iso === 60344) iso = 60302;
        if (iso === 62147) iso = 62133;
        if (iso === 62142) iso = 62117;
        if (iso === 62146) iso = 62029;
        if (iso === 62148) iso = 62134; // 62127
        if (iso === 62140) iso = 62113;
        if (iso === 62139) iso = 62106; // 62123
        if (iso === 62138) iso = 62101; // 62101
        if (iso === 62390) iso = 62366;
        if (iso === 62388) iso = 62362; // 62307 // 62310
        if (iso === 62376) iso = 62357;
        if (iso === 62383) iso = 62346;
        if (iso === 61626) iso = 61601;
        if (iso === 61631) iso = 61609;
        if (iso === 61633) iso = 61622; // + 61620
        if (iso === 61763) iso = 61736;
        if (iso === 62039) iso = 62009;
        if (iso === 62040) iso = 62011;
        if (iso === 62041) iso = 62013;
        if (iso === 62043) iso = 62020; // + 62017
        if (iso === 62045) iso = 62129; // + 62005
        if (iso === 62047) iso = 62035;
        if (iso === 62265) iso = 62207;
        // The municipality was formed on 1 May 2015 by merging two municipalities,
        // Rohrbach in Oberösterreich and Berg bei Rohrbach.
        if (iso === 41344) iso = 41330; // + 41308
        if (iso === 41343) iso = 41303; // + 41339
        if (iso === 62268) iso = 62213;


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

var WahlkreiseMandate = [];
var WahlkreiseDataSet = [];
var weightedResult = [];
var pieChartResults = null;

function clacBarData(year) {
    var wkm = []
    for (var currentWahlkreis in WahlkreiseDataSet[year]) {
        if (wkm[WahlkreiseDataSet[year][currentWahlkreis].party] === undefined || wkm[WahlkreiseDataSet[year][currentWahlkreis].party] === null) {
            wkm[WahlkreiseDataSet[year][currentWahlkreis].party] = 0;
        }
        for (var currentBezirk in WahlkreiseMandate[year]) {
            if (currentBezirk === currentWahlkreis) {
                wkm[WahlkreiseDataSet[year][currentWahlkreis].party] += WahlkreiseMandate[year][currentBezirk].Mandate;
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
