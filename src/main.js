
/**
 * Main entry point to game. Called in html.
 */
Crafty.scene("testMap", function() {
	
	// Use pixel art mode so canvas doesn't show fractional seams.
	Crafty.pixelart(true);
	
	var map = Crafty.e("2D, Canvas, TiledMap, Persistent")
		// Temporary level loading using 1, 2, 3, etc.
		.bind('KeyDown', function(e) {
			if(e.key === Crafty.keys["1"]) {
				this.loadMap("test");
			} else if(e.key === Crafty.keys["2"]) {
				this.loadMap("test2");
			} else if(e.key === Crafty.keys["3"]) {
				this.loadMap("palace");
			} else if(e.key === Crafty.keys["0"]) {
				Crafty.trigger("SpawnPlayer");
			}
		});
	
	Crafty.sprite(32, "assets/sprites/player.png", {
		player: [0, 0]
	}, 0);
	
	Crafty.sprite("assets/sprites/projectile.png", {projectile: [0, 0, 8, 8]});
	
	Crafty.sprite("assets/sprites/test_enemy_1.png", {test_enemy_1: [0, 0, 32, 32]});
	Crafty.sprite("assets/sprites/test_enemy_2.png", {test_enemy_2: [0, 0, 32, 32]});
	
	Crafty.sprite(16, "assets/sprites/dynamite.png", { dynamite: [0, 0] });
	
	// Create the physics ticker.
	// This triggers physics ticks, which are used to more precisely control
	// when entities are updated.
	var ticker = Crafty.e("PhysicsTicker, Persistent");
	
	// Create the global game state object, which saves and loads data.
	var gs = Crafty.e("GameState, PickupState, Persistent");
	gs.setSaveSlot("defaultSaveSlot");
	gs.load();
	
	// Load up the starting info if the player hasn't made a save state yet.
	var savedLocation = gs.data.lastSavedLocation;
	if(savedLocation == undefined) {
		// No save--spawn at start.
		map.loadMap("test2", function() {
			Crafty.trigger("SpawnPlayer");
		});
	} else {
		// Player has a defined saved location.
		map.loadMap(savedLocation.map, function() {
			var restoredPlayer = Crafty.e("Player");
			restoredPlayer.setPhysPos(savedLocation.x, savedLocation.y);
		});
	}
});
