module.exports = class AgentEnvironment {
	static NAME = 'AgentEnvironment';

	constructor(name) {
		this._name = name;
	}

	/**
	 * @param string|null $eventId
	 * @param IDUAM|null $details
	 * @param IAgent|null $fromAgent
	 */
	notifyAgents(eventId, details = null, fromAgent = null) {
		if (fromAgent != null && details != null) details.fromAgent = fromAgent;
		this._en_notifyEnabledInterestedOnlyAgents(eventId, details);
	}

	destruct() {
		this._em = [];
	}

	/**
	 * @param IAgent|null $a
	 */
	addAgent(a = null) {
		if (this._agents.indexOf(a) !== -1) return;
		this._agents.push(a);

		// subscribe
		var c = a.getAutoSubscribeEvents(this.get_name());
		c.forEach(function (d) { this.subscribe(a, d); }, this);

		a.enable(this);
		// inform agent about placement
		a.notify(AgentEnvironment.ID_E_ADDED_TO_ENV, null);

	}


	/**
	 * @param IAgent|null $a
	 */
	removeAgent(a) {
		var i = this._agents.indexOf(a);
		if (i === -1) return;
		this._agents.splice(i, 1);
		this.unsubscribeALL(a);
	}

	/**
	 * @param IAgent|null $target
	 * @param string|null $eventId
	 * @return bool true-added false-already subscribed
	 */
	subscribe(target = null, eventId = null) {
		if (!this._em.hasOwnProperty(eventId)) this._em[eventId] = [];

		var a = this._em[eventId];
		if (a.indexOf(target) !== -1) return false;

		a.push(target);
		return true;
	}


	/**
	 * @param IAgent|null $target
	 * @param string|null $eventId
	 * @return bool true-removed false-was not subscribed
	 */
	unsubscribe(target = null, eventId = null) {
		if (this._em.indexOf(eventId) === -1) return false;

		var a = this._em[eventId];
		var i = a.indexOf(target);
		if (i === -1) return false;

		a.splice(i, 1);
		if (a.length() < 1) { // no subscribers left
			this._em = [];
		}
		return true;
	}

	/**
	 * from all events
	 * @param IAgent|null $target
	 */
	unsubscribeALL(target = null) {
		this._em.forEach(function (alist, ind1) { // eventId
			alist.forEach(function (agent, ind) {
				if (agent === target) {
					alist.splice(ind, 1);
					if (alist.length < 1) { // no subscribers left
						this.em.splice(ind1, 1);
						return;// list deleted. goto next
					}
				}
			}, this);
		}, this);
	}

	get_name() {
		return this._name;
	}

	// events
	/**
	 * {success}
	 */
	static ID_E_ADDED_TO_ENV = AgentEnvironment.NAME + 'ID_E_ADDED_TO_ENV';

	// } END OF public


	_name = 'AE';
	_agents = [];
	/**
	 * events map
	 */
	_em = [];

	// { events

	/**
	 * @param string|null $eventId
	 * @param IDUAM|null $details
	 */
	_en_notifyEnabledInterestedOnlyAgents(eventId = null, details = null) {
		if (this._em[eventId] === undefined || this._em[eventId] === null || this._em[eventId].length < 1) return;
		if (this.loggingEnabled) {
			console.log(this._name + ' > ' + eventId)
		}
		var a = this._em[eventId];
		a.forEach(function (i) {
			i.notify(eventId, details);
		});
	}


	// } END OF events

	loggingEnabled = false
	setLoggingEnabled(a) {
		this.loggingEnabled = a
	}

}

