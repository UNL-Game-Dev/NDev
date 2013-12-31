/**
 * Player component.
 * Includes all the base components and animations for a player.
 */
Crafty.c("Player", {
	init:
	function() {
		this
		// Base components
			.requires("2D")
			.requires("DOM")
			.requires("SpriteAnimation")
			.requires("player")
			.requires("Collision")
			.requires("Physical")
			.requires("TileConstraint")
			.requires("PlatformControls")
			.requires("DefaultPhysicsDraw")
		// Define animations
			.animate("PlayerStandLeft", [[0, 0], [1, 0], [2, 0], [3, 0], [3, 0], [2, 0], [1, 0], [0, 0]])
			.animate("PlayerStandRight", [[4, 0], [5, 0], [6, 0], [7, 0], [7, 0], [6, 0], [5, 0], [4, 0]])
			.animate("PlayerWalkLeft", 0, 1, 7)
			.animate("PlayerWalkRight", 0, 2, 7)
			.animate("PlayerJumpLeft", 0, 3, 3)
			.animate("PlayerJumpRight", 4, 3, 7)
			.animate("PlayerFallLeft", [[0, 4], [1, 4], [2, 4], [3, 4], [3, 4], [2, 4], [1, 4], [0, 4]])
			.animate("PlayerFallRight", [[4, 4], [5, 4], [6, 4], [7, 4], [7, 4], [6, 4], [5, 4], [4, 4]])
			.animate("PlayerLandLeft", 0, 5, 3)
			.animate("PlayerLandRight", 4, 5, 7)
		// Bind animations
			.bind("PlayerStand", function() {
				this.stop();
				this.animate(this.direction === "left" ? "PlayerStandLeft" : "PlayerStandRight", 24, -1);
			})
			.bind("PlayerMove", function() {
				this.stop();
				if(this.grounded) {
					this.animate(this.direction === "left" ? "PlayerWalkLeft" : "PlayerWalkRight", 24, -1);
				} else {
					this.animate(this.direction === "left" ? "PlayerFallLeft" : "PlayerFallRight", 24, -1);
				}
			})
			.bind("PlayerJump", function() {
				this.stop();
				this.animate(this.direction === "left" ? "PlayerJumpLeft" : "PlayerJumpRight", 12, 0);
				this.timeout(function() {
					if(!this.grounded) {
						this.stop();
						this.animate(this.direction === "left" ? "PlayerFallLeft" : "PlayerFallRight", 24, -1);
					}
				}, 500);
			})
			.bind("PlayerFall", function() {
				this.stop();
				this.animate(this.direction === "left" ? "PlayerFallLeft" : "PlayerFallRight", 24, -1);
			})
			.bind("PlayerLand", function() {
				this.stop();
				this.animate(this.direction === "left" ? "PlayerLandLeft" : "PlayerLandRight", 12, 0);
				this.timeout(function() {
					if(this.grounded) {
						this.stop();
						this.animate(this.direction === "left" ? "PlayerStandLeft" : "PlayerStandRight", 24, -1);
					}
				}, 500);
			});
	}
});
