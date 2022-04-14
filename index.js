import { toJson } from "xml2json"
import fs from "fs"
import _ from "lodash"

let xml = fs.readFileSync("./base-data.xml")
let json = JSON.parse(toJson(xml))
let compendium = json.compendium
let items = compendium.item

function generateType(type) {
    let types = {
        $: "Currency",
        A: "Ammunition",
        G: "Adventuring Gear",
        HA: "Heavy Armor",
        LA: "Light Armor",
        M: "Melee Weapon",
        MA: "Medium Armor",
        R: "Ranged Weapon",
        S: "Shield",
        P: "Potion",
        RD: "Rod",
        RG: "Ring",
        SC: "Scroll",
        ST: "Staff",
        W: "Weapon",
        WD: "Wand",
    }

    return types[type]
}

function generateDescription(text) {
    let description = text
        .filter((node) => !_.isEmpty(node))
        .filter((node) => !node.includes("Source: "))
        .filter((node) => !node.includes("Proficiency: "))

    if (description.length > 0) return description

    return null
}

function generateSource(text) {
    let [book, page] = text
        .filter((node) => {
            if (!_.isEmpty(node)) return node.includes("Source: ")
        })[0]
        .replace("Source: ", "")
        .split(" p. ")

    return { book, page: _.toNumber(page) }
}

function generateWeight(weight) {
    return !weight || _.isEmpty(weight) ? null : _.toNumber(weight)
}

function generateRarity(detail) {
    return detail ? _.startCase(detail) : "Common"
}

function generateMagic(magic) {
    return magic === 1
}

function generateValue(value) {
    return value ? _.toNumber(value) : null
}

function generateRange(range) {
    return !range || _.isEmpty(range) ? null : range
}

function generateRoll(roll) {
    return !roll || _.isEmpty(roll) ? null : roll
}

function generateAC(ac) {
    return !ac || _.isEmpty(ac) ? null : _.toNumber(ac)
}

function generateProperties(property) {
    let properties = {
        M: "Melee",
        V: "Versatile",
        L: "Light",
        F: "Finesse",
        T: "Thrown",
        H: "Heavy",
        R: "Reach",
        "2H": "Two-Handed",
        S: "Special",
        A: "Ammunition",
        LD: "Loading",
    }

    if (!_.isEmpty(property)) {
        return property.split(",").map((key) => properties[key])
    }

    return null
}

function generateStrengthRequired(strength) {
    return !strength || _.isEmpty(strength) ? null : _.toNumber(strength)
}

function generateStealthDisadvantage(stealth) {
    return stealth === "1" || "YES" ? true : null
}

function generateDamageRolls(rollOne, rollTwo) {
    if (!_.isEmpty(rollOne)) {
        return {
            one: rollOne,
            ...(!_.isEmpty(rollTwo) && { two: rollTwo }),
        }
    }

    return null
}

function generateDamageType(type) {
    let damageTypes = {
        S: "Slashing",
        B: "Bludgeoning",
        P: "Piercing",
        N: "Necrotic",
    }

    if (!_.isEmpty(type)) {
        return damageTypes[type]
    }

    return null
}

function generateProficienciesRequired(text) {
    // get proficiency node from text array
    // if that exists proceed with splitting
    // if it doesn't continue to print out null

    let proficiencies = text.filter((node) => {
        if (!_.isEmpty(node)) return node.includes("Proficiency: ")
    })[0]

    if (!_.isEmpty(proficiencies)) {
        return proficiencies
            .split(" ")
            .filter((node) => !node.includes("Proficiency:"))
            .map((node) => _.startCase(node))
    }

    return null
}

function buildItemData(data) {
    return {
        name: data.name,
        type: generateType(data.type),
        description: generateDescription(data.text),
        source: generateSource(data.text),
        weight: generateWeight(data.weight),
        rarity: generateRarity(data.detail),
        magic: generateMagic(data.magic),
        value: generateValue(data.value),
        range: generateRange(data.range),
        roll: generateRoll(data.roll),
        ac: generateAC(data.ac),
        properties: generateProperties(data.property),
        strength_required: generateStrengthRequired(data.strength),
        stealth_disadvantage: generateStealthDisadvantage(data.stealth),
        damage_rolls: generateDamageRolls(data.dmg1, data.dmg2),
        damage_type: generateDamageType(data.dmgType),
        proficiencies_required: generateProficienciesRequired(data.text),
    }
}

let keys = [
    "name", // done
    "type", // done
    "weight", // done
    "text", // done (as description)
    "value", // done
    "roll", // done
    "ac", // done
    "strength", // done (as strength_required)
    "stealth", // done (as stealth_disadvantage)
    "dmg1", // done (as damage)
    "dmg2", // done (as damage)
    "dmgType", // done (as damage_type)
    "property", // done
    "range", // done
    "magic", // done
    "detail", // done (as rarity)
    "modifier", // not done, not needed yet
]

let api = items.map(buildItemData)

// let item = items[5]
// console.log(items.filter((item) => item.hasOwnProperty("dmgType"))[600])
// console.log(_.toNumber(items[5].value))
// console.log(buildItemData(item))
// console.log(buildItemData(items.filter((item) => item.name === "Longbow")[0]))
// console.log(items.filter((item) => item.name === "Longbow")[0])
