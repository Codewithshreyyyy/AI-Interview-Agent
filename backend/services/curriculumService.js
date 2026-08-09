const curriculum = require("../data/curriculum.json");

function getDay(dayNumber) {
    return curriculum.days.find(
        day => day.day === Number(dayNumber)
    );
}

function getModule(moduleNumber) {
    return curriculum.modules.find(
        module => module.n === Number(moduleNumber)
    );
}

function getAllDays() {
    return curriculum.days;
}

function getAllModules() {
    return curriculum.modules;
}

module.exports = {
    getDay,
    getModule,
    getAllDays,
    getAllModules
};