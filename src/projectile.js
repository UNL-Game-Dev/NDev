/**
 * Includes base components for projectiles.
 */
Crafty.c("Projectile", {

	init:
	function() {
		this
		// Base components
			.requires("2D")
			.requires("DOM")
			.requires("projectile")
			.requires("Collision")
			.requires("Physical")
			.requires("Inertia")
			.requires("DefaultPhysicsDraw")
		// Destroy after delay
			.timeout(function() {
				this.destroy();
			}, 3000)
		// Destroy on collision with tile
			.onHit("Tile", this.onHitTile);
	},
	
	onHitTile:
	function() {
		this.destroy();
	}
});