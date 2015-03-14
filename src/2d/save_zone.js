var dialogHTML = '<div class="save-dialog">Click to save!</div>';

/**
 * A zone that, when entered, allows the player to save the game.
 */
Crafty.c("SaveZone", {
	init:
	function() {
		this.requires("Collision");

		this.requires("ZoneEnterTrigger")
			.setOnZoneEnter(this.triggerSave);
	},
	
	triggerSave:
	function() {
		saveGame(this);
		// Show the GUI tip that saving's happening.
		$(".save-screen")
			.slideDown(1000)
			.delay(500)
			.slideUp(1000);
	},
});

function saveGame(saveZone) {
	// Save current map and position to respawn, then save.
	var gs = Crafty("GameState");
	
	gs.data.lastSavedLocation = {
		x: saveZone.x,
		y: saveZone.y,
		map: Crafty("TiledMap").mapName
	};
	
	gs.save();
	
	saveZone._promptActive = false;
}
