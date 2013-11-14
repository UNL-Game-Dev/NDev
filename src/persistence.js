
/**
 * Saves various state variables when requested.
 */
Crafty.c("GameState", {
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
		var slot = slotName;
		if(!slot)
			slot = this._defaultSaveSlot;
		if(!slot) {
			console.log("No save slot specified!",
					slotName, this._defaultSaveSlot);
		}
		localStorage[slot] = JSON.stringify(this.data);
	},

	/**
	 * Loads from a given slotname.
	 * If no slot name passed, uses the default.
	 */
	load:
	function(slotName) {
		var slot = slotName;
		if(!slot)
			slot = this._defaultSaveSlot;
		if(!slot) {
			console.log("No load slot specified!",
					slotName, this._defaultSaveSlot);
		}
		this.data = JSON.parse(localStorage[slot]);
	}
});

