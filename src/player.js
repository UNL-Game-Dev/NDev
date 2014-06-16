/**
 * Player component.
 * Includes all the base components and animations for a player.
 */

// Default time to recover from being hit, in seconds.
var defaultRecoveryTime = 1.0;

Crafty.c("Player", {
    
	init:
	function() {
		this
		// Base components
			.requires("2D")
			.requires("Canvas")
			.requires("SpriteAnimation")
			.requires("player")
			.requires("Collision")
			.requires("Physical")
			.requires("PlatformConstraint")
            .requires("HazardResponse")
			.requires("PlatformControls")
			.requires("DefaultPhysicsDraw")
			.requires("ScrollTarget")
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
			})
		// Player attributes
			.attr({
				// Time to recover from being hit, in seconds.
				recoveryTime: defaultRecoveryTime,

				// Whether or not player can be hit.
				invincible: false,
			});
        
		this.bind("Hurt", function(hit) {
			if(!this.invincible) {
				this.invincible = true;
				var norm = hit.normal;
				// TODO: Respond to this hazardous collision somehow.
				this.timeout(function() {
					this.invincible = false;
				}, this.recoveryTime * 1000);
			}
		});
        
		this.makeScrollTarget();
	}
});
