const A = require("../../agentenv/Agent");
const AEApp = require("../../ae/AEApp");

module.exports = class AM extends A {
  constructor(name) {
    super(name);
  }

  /**
   * @return {AEApp} ae
   */
  get_ae = () => this._ae;
};
