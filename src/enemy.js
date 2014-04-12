/**
 * Includes base components for enemies.
 */
Crafty.c("Enemy", {
    
	init:
	function() {
        
		this.requires("2D")
            .requires("Canvas")
            .requires("TileConstraint")
            .requires("Collision")
            .requires("Physical")
            .requires("DefaultPhysicsDraw")
            .requires("Hazard");
	},
    
	setType:
	function(type) {
		if(type == "e1") {
			this.requires("EnemyGroundControls")
				.requires("test_enemy_1");
		} else if(type == "e2") {
			this.requires("EnemyAirControls")
				.requires("test_enemy_2");
		}
	}
});
