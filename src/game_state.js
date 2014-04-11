
/**
 * Saves various state variables when requested.
 */
Crafty.c("GameState", {

	/**
	 * Initializes the saving system, creating a blank save state object if
	 * there isn't already save info.
	 */
	init:
	function() {
		if(!this.slotList()) {
			localStorage["saveData"] = "{}";
		}
	},

	/**
	 * All sorts of data can be saved here.
	 * Make sure do to undefined checks in case stuff hasn't been saved yet.
	 */
	data: {},

	/**
	 * Sets the default save slot to the name given.
	 */
	setSaveSlot:
	function(slotName) {
		this._defaultSaveSlot = slotName;
	},

	/**
	 * Saves to a given slotname.
	 * If no slot name passed, uses the default.
	 */
	save:
	function(slotName) {
		var slot = this._getSlotByUndefineableName(slotName);
		if(slot) {
			var allData = JSON.parse(localStorage["saveData"]);
			allData[slot] = this.data;
			localStorage["saveData"] = JSON.stringify(allData);
		}
		return slot;
	},

	/**
	 * Loads from a given slotname.
	 * If no slot name passed, uses the default.
	 */
	load:
	function(slotName) {
		var slot = this._getSlotByUndefineableName(slotName);
		if(slot) {
			var allData = JSON.parse(localStorage["saveData"]);
			this.data = allData[slot] || {};
			console.log("Got slot ", slot, allData, this.data);
		}
		return slot;
	},

	/**
	 * true if slot exists, false if not.
	 */
	slotExists:
	function(slotName) {
		return !!(JSON.parse(localStorage["saveData"])[slotName]);
	},

	/**
	 * Returns a list of slots available to load. Returns 'undefined' if the
	 * save structure hasn't been set up. (This should be detected and remedied
	 * by the init function before anyone calls this themselves.)
	 */
	slotList:
	function() {
		if(localStorage["saveData"]) {
			var allData = JSON.parse(localStorage["saveData"]);
			var slots = [];
			for(var i in allData) {
				slots.push(i);
			}
			return slots;
		}
		return undefined;
	},

	_getSlotByUndefineableName:
	function(slotName) {
		var slot = slotName;
		if(!slot) {
			slot = this._defaultSaveSlot;
		}
		if(!slot) {
			console.log("No save/load slot specified!",
					slotName, this._defaultSaveSlot);
		}
		return slot;
	}
});
