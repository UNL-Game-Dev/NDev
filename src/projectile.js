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
		// Collisions
			.onHit("Tile", this.destroy)
			.onHit("Enemy", function(hit) {
				for (var i = 0; i < hit.length; i++) {
					hit[i].obj.destroy();
				}
				this.destroy();
			});
	}
});