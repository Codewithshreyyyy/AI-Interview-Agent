// Request/response controller for interview APIs.
// Gemini and interview logic will be connected here later.

module.exports = {
  startInterview: async (req, res) => {
    res.status(501).json({
      success: false,
      message: "startInterview is not implemented yet."
    });
  },

  submitAnswer: async (req, res) => {
    res.status(501).json({
      success: false,
      message: "submitAnswer is not implemented yet."
    });
  },

  endInterview: async (req, res) => {
    res.status(501).json({
      success: false,
      message: "endInterview is not implemented yet."
    });
  }
};
