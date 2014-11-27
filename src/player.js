/**
 * Player component.
 * Includes all the base components and animations for a player.
 */

// Default time to recover from being hit, in seconds.
var defaultRecoveryTime = 1.0;

Crafty.c("Player", {
    
	init:
	function() {
		var controls = Crafty("Controls");
		this
		// Base components
			.requires("2D")
			.requires("Canvas")
			.requires("SpriteAnimation")
			.requires("player")
			.requires("Collision")
			.requires("Physical")
			.requires("TileConstraint")
			.requires("PlatformConstraint")
            .requires("HazardResponse")
			.requires("DefaultPhysicsDraw")
			.requires("ScrollTarget")
			.requires("ItemEquip")
			.requires("Controls")
			.requires("PlatformControls")
			.requires("ClimbingControls")
			.requires("SpriteData")
		// Collision bounds
			.collision([11, 0], [21, 0], [21, 32], [11, 32])
			.attr({ sensorBounds: [11, 0, 21, 32] })
		// Load controls
			.loadKeyMapping("assets/controls/player.json")
		// Bind animations
			.bind("Stand", function() {
				if (!this._setCollisionNormal()) {
					if (this._setCollisionCrouch()) {
						this.trigger("Crouch");
						return;
					}
					this._setCollisionNormal();
				}
				
				// Play stand animation.
				// If landing animation is playing, wait until done.
				var reel = this.reel();
				if(reel !== "PlayerLandLeft" && reel !== "PlayerLandRight") {
					this.animate(this.dxSelect("PlayerStandLeft", "PlayerStandRight"), -1);
				} else {
					this.one("AnimationEnd", function(reel) {
						if(reel.id === "PlayerLandLeft") {
							this.animate("PlayerStandLeft", -1);
						} else if(reel.id === "PlayerLandRight") {
							this.animate("PlayerStandRight", -1);
						}
					});
				}
				this.isCrouching = false;
			})
			.bind("Walk", function(ev) {
				if (!this._setCollisionNormal()) {
					if (this._setCollisionCrouch()) {
						this.trigger("Crawl");
						return;
					}
					this._setCollisionNormal();
				}
				if(this.isGrounded()) {
					this.animate(this.dxSelect("PlayerWalkLeft", "PlayerWalkRight"), -1);
				} else {
					this.animate(this.dxSelect("PlayerFallLeft", "PlayerFallRight"), -1);
				}
				this.isCrouching = false;
			})
			.bind("Jump", function() {
				this._setCollisionNormal();
				this.animate(this.dxSelect("PlayerJumpLeft", "PlayerJumpRight"), 0);
				this.isCrouching = false;
			})
			.bind("Fall", function() {
				this._setCollisionNormal();
				
				// Play fall animation.
				// If jumping animation is playing, wait until done.
				var reel = this.reel();
				if(reel !== "PlayerJumpLeft" && reel !== "PlayerJumpRight") {
					this.animate(this.dxSelect("PlayerFallLeft", "PlayerFallRight"), -1);
				} else {
					this.one("AnimationEnd", function(reel) {
						if(reel.id === "PlayerJumpLeft") {
							this.animate("PlayerFallLeft", -1);
						} else if(reel.id === "PlayerJumpRight") {
							this.animate("PlayerFallRight", -1);
						}
					});
				}
				
				this.isCrouching = false;
			})
			.bind("Land", function() {
				this._setCollisionNormal();
				this.animate(this.dxSelect("PlayerLandLeft", "PlayerLandRight"), 0);
				this.timeout(function() {
					if(this.isGrounded()) {
						this.animate(this.dxSelect("PlayerStandLeft", "PlayerStandRight"), -1);
					}
				}, 500);
				this.isCrouching = false;
			})
			.bind("Crouch", function() {
				this._setCollisionCrouch();
				this.animate(this.dxSelect("PlayerCrouchLeft", "PlayerCrouchRight"), -1);
				this.isCrouching = true;
			})
			.bind("Crawl", function(ev) {
				this._setCollisionCrouch();
				this.animate(this.dxSelect("PlayerCrawlLeft", "PlayerCrawlRight"), -1);
				this.isCrouching = true;
			})
		// Key handler
			.bind("ControlPressed", function(ev) {
				if(ev.control === "equip") {
					this.switchItem();
				} else if(ev.control === "action") {
					this._tryActivateItem();
				}
			})
			.bind("ControlReleased", function(ev) {
				if(ev.control === "action") {
					this.deactivateItem();
				}
			})
		// Harpoon attach/unattach
			.bind("HarpoonAttached", function() {
				this.stopInMidAir = false;
			})
			.bind("HarpoonUnattached", function() {
				this.stopInMidAir = true;
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
		
		this.bind("ItemActivate", function(data) {
			var oldReel = this.reel();
			if(data.item === "harpoon" || data.item === "pistol") {
				this.animate(this.dxSelect("PlayerShootLeft", "PlayerShootRight"), 0);
			}
			if(oldReel === "PlayerWalkLeft" || oldReel === "PlayerWalRight"
			|| oldReel === "PlayerStandLeft" || oldReel === "PlayerStandRight") {
				this.one("AnimationEnd", function(reel) {
					this.timeout(function() {
						this.animate(oldReel, -1);
					}, 0);
				});
			}
		});
		
		this.bind("Crush", this.die);
        
		this.makeScrollTarget();
		
		// Try to activate an item, and limit rate at which it can be activated.
		this._tryActivateItem = _.throttle(this._activateItem, 300, { trailing: false })
	},
	
	die:
	function() {
		console.log("You died!");
		this.destroy();
		Crafty("Clock").schedule(function() {
			Crafty.trigger("SpawnPlayer");
		}, 0.5);
	},
	
	/**
	 * Get the direction of the anticipated action in the form [x,y].
	 */
	_actionDirection:
	function() {
		var dir = Crafty("Controls").getControl("Direction");
		if(dir[0] == 0 && dir[1] == 0) {
			dir[0] = this.dxSelect(-1, +1);
		}
		return dir;
	},
	
	/**
	 * Set the collision bounds to that of a standing position.
	 */
	_setCollisionNormal:
	function() {
		this.collision(new Crafty.polygon([[11,0], [21,0], [21,32], [11,32]]));
		if( this.hitTile() )
			return false;
		return true;
	},
	
	/**
	 * Set the collision bounds to that of crouching.
	 */
	_setCollisionCrouch:
	function() {
		this.collision(new Crafty.polygon([[11,16], [21,16], [21,32], [11,32]]));
		if ( this.hitTile() )
			return false;
		return true;
	},
	
	/**
	 * Activate the currently equipped item.
	 */
	_activateItem:
	function() {
		this.activateItem({ direction: this._actionDirection() });
	}
});
