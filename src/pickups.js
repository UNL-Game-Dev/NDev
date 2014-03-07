/**
 A list of pickups available. Just a list of strings, really, but might allow
 for autocomplete or easier detection of fault.
 */
pickup = {
	icePick: "Ice Pick",
	icePick2: "Second Ice Pick",
	pistol: "Pistol",
	harpoon: "Harpoon Gun",
	dynamite: "Dynamite",
	shield: "Shield",
	boomstick: "Boomstick"
}

Crafty.c("PickupState", {
	init:
	function() {
		this.requires("GameState");
	},

	ensureInit:
	function() {
		// Set up pickups object if it doesn't already exist.
		this.data.pickups ||= {};
	}

	has:
	function(pickupName) {
		this.ensureInit();
		return !!this.data.pickups[pickupName];
	},

	give:
	function(pickupName) {
		this.ensureInit();
		this.data.pickups[pickupName] = true;
	},
});
