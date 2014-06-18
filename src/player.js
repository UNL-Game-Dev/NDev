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
			.reel("PlayerCrouchLeft", 1000, [[0, 6], [1, 6], [2, 6], [3, 6], [3, 6], [2, 6], [1, 6], [0, 6]])
			.reel("PlayerCrouchRight", 1000, [[4, 6], [5, 6], [6, 6], [7, 6], [7, 6], [6, 6], [5, 6], [4, 6]])
			.reel("PlayerCrawlLeft", 1000, 0, 7, 8)
			.reel("PlayerCrawlRight", 1000, 0, 8, 8)
		// Bind animations
			.bind("Stand", function() {
				if (!this._setCollisionNormal()) {
					this.trigger("Crouch");
					return;
				}
				this.animate(this.direction === "left" ? "PlayerStandLeft" : "PlayerStandRight", -1);
				this.isCrouching = false;
			})
			.bind("Walk", function(ev) {
				if (!this._setCollisionNormal()) {
					this.trigger("Crawl");
					return;
				}
				if(this.grounded) {
					this.animate(this.direction === "left" ? "PlayerWalkLeft" : "PlayerWalkRight", -1);
				} else {
					this.animate(this.direction === "left" ? "PlayerFallLeft" : "PlayerFallRight", -1);
				}
				this.isCrouching = false;
			})
			.bind("Jump", function() {
				this._setCollisionNormal();
				this.animate(this.direction === "left" ? "PlayerJumpLeft" : "PlayerJumpRight", 0);
				this.isCrouching = false;
				this.timeout(function() {
					if(!this.grounded) {
						this.animate(this.direction === "left" ? "PlayerFallLeft" : "PlayerFallRight", -1);
					}
				}, 500);
			})
			.bind("Fall", function() {
				this._setCollisionNormal();
				this.animate(this.direction === "left" ? "PlayerFallLeft" : "PlayerFallRight", -1);
				this.isCrouching = false;
			})
			.bind("Land", function() {
				this._setCollisionNormal();
				this.animate(this.direction === "left" ? "PlayerLandLeft" : "PlayerLandRight", 0);
				this.timeout(function() {
					if(this.grounded) {
						this.animate(this.direction === "left" ? "PlayerStandLeft" : "PlayerStandRight", -1);
					}
				}, 500);
				this.isCrouching = false;
			})
			.bind("Crouch", function() {
				this._setCollisionCrouch();
				this.animate(this.direction === "left" ? "PlayerCrouchLeft" : "PlayerCrouchRight", -1);
				this.isCrouching = true;
			})
			.bind("Crawl", function(ev) {
				this._setCollisionCrouch();
				if (this.grounded) {
					this.animate(this.direction === "left" ? "PlayerCrouchLeft" : "PlayerCrouchRight", -1);
				} else {
					this.animate(this.direction === "left" ? "PlayerFallLeft" : "PlayerFallRight", -1);
				}
				this.isCrouching = true;
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
	},
	
	_setCollisionNormal:
	function() {
		this.collision([0,0], [32,0], [32,32], [0,32]);
		if( this.hitTile() )
			return false;
		return true;
	},
	
	_setCollisionCrouch:
	function() {
		this.collision([0,16], [32,16], [32,32], [0,32]);
		return true;
	}
});
