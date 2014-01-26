/**
 * A zone that, when entered, allows the player to save the game.
 */
Crafty.c("SaveZone", {
	init:
	function() {
		this.requires("Collision");

		this.requires("ZoneEnterTrigger")
			.setOnZoneEnter(this.promptSave);
	},

	promptSave:
	function() {
		console.log("Save!");
	},
});