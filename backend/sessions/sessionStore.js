// Simple in-memory session store for the hackathon.
// This can later be replaced with MongoDB/PostgreSQL/etc.

const sessions = new Map();

function createSession(sessionId, candidate) {
    const session = {
        sessionId,
        candidate,
        messages: [],
        questionCount: 0,
        askedDays: [],
        done: false,

        // Result information
        result: null,

        // Timing
        startedAt: new Date().toISOString(),
        finishedAt: null
    };

    sessions.set(sessionId, session);

    return session;
}

function getSession(sessionId) {
    return sessions.get(sessionId);
}

function updateSession(sessionId, data) {
    const session = sessions.get(sessionId);

    if (!session) {
        return null;
    }

    Object.assign(session, data);

    return session;
}

module.exports = {
    createSession,
    getSession,
    updateSession
};