module.exports = class Agent {
  static NAME = "Agent";

  constructor(name) {
    this.name = name;
  }

  notify(eventId, details) {}

  getAutoSubscribeEvents(envName) {
    return [];
  }

  enable(env) {
    this._ae = env;
  }

  get_name() {
    return this.name;
  }

  name;
  _ae = null;
};
