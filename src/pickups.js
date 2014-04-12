
function PickupEntry(name, max) {
	this.name = name;
	this.max = max || 1;
}

function addPistol() {
	// Demonstrates how to use the PickupState component.
	Crafty("PickupState").addPickup("pistol");
	throw "Debug function!";
}

/**
 * Keeps track of pickups that the player encounters and uses.
 */
Crafty.c("PickupState", {
	
	/**
	 * A list of pickups available. Contains the name of the pickup and its bounds.
	 */
	pickup: {
		icePick: new PickupEntry("Ice Pick"),
		icePick2: new PickupEntry("Second Ice Pick"),
		pistol: new PickupEntry("Pistol"),
		harpoon: new PickupEntry("Harpoon Gun"),
		dynamite: new PickupEntry("Dynamite"),
		shield: new PickupEntry("Shield"),
		boomstick: new PickupEntry("Boomstick"),
	},
	
	init:
	function() {
		this.requires("GameState");
	},
	
	/**
	 * Returns the number of the specified pickup the player has. Checks for key
	 * validity, throwing if not. (Don't catch, let it surface: easier to fix.)
	 */
	hasPickup:
	function(pickupName) {
		var pickups = this._ensureInit();
		// Ensure name correct.
		this._pickupEntryByName(pickupName);
		return pickups[pickupName] || 0;
	},
	
	/**
	 * Adds pickups of the given name (see the pickup object for valid names)
	 * with the given count. Count's default is 1. Negatives work.
	 */
	addPickup:
	function(pickupName, count) {
		// Initialize count to 1 if undefined.
		count = count || 1;
		
		var pickups = this._ensureInit();
		var pickupEntry = this._pickupEntryByName(pickupName);
		
		// Initialize current if powerup didn't exist and add count.
		var old = (pickups[pickupName] || 0);
		var current = old + count;
		// Apply bounds.
		current = Math.max(Math.min(current, pickupEntry.max), 0);
		
		// Store pickup data in saved object.
		pickups[pickupName] = current;
		
		// Return actual applied difference for potential gameplay usage.
		return current - old;
	},
	
	_pickupEntryByName:
	function(pickupName) {
		this._ensureInit();
		
		var pickup = this.pickup[pickupName];
		if(pickup) {
			return pickup;
		}
		throw "Invalid pickup: " + pickupName;
	},
	
	_ensureInit:
	function() {
		// Set up pickups object if it doesn't already exist.
		return this.data.pickups = (this.data.pickups || {});
	}
});
