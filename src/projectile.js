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
			.onHit("Inertia", function(hits) {
				_(hits).each(function(hit) {
					hit.obj.applyImpulse(this.getDX(), this.getDY());
				}, this);
			})
			.onHit("Tile", this.destroy)
			.onHit("Enemy", function(hits) {
				_(hits).each(function(hit) {
					hit.obj.destroy();
				}, this);
				this.destroy();
			});
	}
});
