const candidatesData = require("../data/candidates.json");

function getCandidateById(candidateId) {
    return candidatesData.candidates.find(
        candidate => candidate.member.id === candidateId
    );
}

function getAllCandidates() {
    return candidatesData.candidates;
}

module.exports = {
    getCandidateById,
    getAllCandidates
};