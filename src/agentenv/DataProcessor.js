module.exports = class DataProcessor {
  static NAME = "DataProcessor";

  //{ public

  /**
   * @return bool success
   */
  process(operationId = DataProcessor.ID_OP_PRIMARY) {}

  g_errorId() {
    return this._errorId;
  }

  g_errorDetails() {
    return this._errorDetails;
  }

  //} END OF public

  //{ ID
  static ID_OP_PRIMARY = 0;
  //} END IF ID

  //{ errors
  static ID_ERROR_NO_ERROR = DataProcessor.NAME + "-ID_ERROR_NO_ERROR";
  //} END OF errors

  //{ service
  _setErrorId(id) {
    this._errorId = id;
  }

  _setErrorDetails(a) {
    this._errorDetails = a;
  }

  //} END OF service

  //{ private
  _errorDetails = "no details";
  _errorId = DataProcessor.ID_ERROR_NO_ERROR;
  //} END OF private
};
