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
		// Stay sharp when zooming
			.pixelArt()
		// Define animations
			.reel("PlayerStandLeft", 1000, [[0, 0], [1, 0], [2, 0], [3, 0], [3, 0], [2, 0], [1, 0], [0, 0]])
			.reel("PlayerStandRight", 1000, [[4, 0], [5, 0], [6, 0], [7, 0], [7, 0], [6, 0], [5, 0], [4, 0]])
			.reel("PlayerWalkLeft", 1000, 0, 1, 8)
			.reel("PlayerWalkRight", 1000, 0, 2, 8)
			.reel("PlayerJumpLeft", 500, 0, 3, 4)
			.reel("PlayerJumpRight", 500, 4, 3, 4)
			.reel("PlayerFallLeft", 1000, [[0, 4], [1, 4], [2, 4], [3, 4], [3, 4], [2, 4], [1, 4], [0, 4]])
			.reel("PlayerFallRight", 1000, [[4, 4], [5, 4], [6, 4], [7, 4], [7, 4], [6, 4], [5, 4], [4, 4]])
			.reel("PlayerLandLeft", 500, 0, 5, 4)
			.reel("PlayerLandRight", 500, 4, 5, 4)
		// Bind animations
			.bind("Stand", function() {
				this.animate(this.direction === "left" ? "PlayerStandLeft" : "PlayerStandRight", -1);
			})
			.bind("Walk", function(ev) {
				if(this.grounded) {
					this.animate(this.direction === "left" ? "PlayerWalkLeft" : "PlayerWalkRight", -1);
				} else {
					this.animate(this.direction === "left" ? "PlayerFallLeft" : "PlayerFallRight", -1);
				}
			})
			.bind("Jump", function() {
				this.animate(this.direction === "left" ? "PlayerJumpLeft" : "PlayerJumpRight", 0);
				this.timeout(function() {
					if(!this.grounded) {
						this.animate(this.direction === "left" ? "PlayerFallLeft" : "PlayerFallRight", -1);
					}
				}, 500);
			})
			.bind("Fall", function() {
				this.animate(this.direction === "left" ? "PlayerFallLeft" : "PlayerFallRight", -1);
			})
			.bind("Land", function() {
				this.animate(this.direction === "left" ? "PlayerLandLeft" : "PlayerLandRight", 0);
				this.timeout(function() {
					if(this.grounded) {
						this.animate(this.direction === "left" ? "PlayerStandLeft" : "PlayerStandRight", -1);
					}
				}, 500);
			});
	}
});
