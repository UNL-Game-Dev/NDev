/**
 * Player component.
 * Includes all the base components and animations for a player.
 */

// Default time to recover from being hit, in seconds.
var defaultRecoveryTime = 1.0;

Crafty.c("Player", {
    
	init:
	function() {
		
		this._pickupState = Crafty("PickupState");
		this._items = [];
		this._equippedItemIndex = -1;
		this._loadItems();
		
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
			.requires("PlatformControls")
			.requires("ClimbingControls")
		// Bind animations
			.bind("Stand", function() {
				if (!this._setCollisionNormal()) {
					if (this._setCollisionCrouch()) {
						this.trigger("Crouch");
						return;
					}
					this._setCollisionNormal();
				}
				this.animate(this.dxSelect("PlayerStandLeft", "PlayerStandRight"), -1);
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
				if(this.grounded) {
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
				this.timeout(function() {
					if(!this.grounded) {
						this.animate(this.dxSelect("PlayerFallLeft", "PlayerFallRight"), -1);
					}
				}, 500);
			})
			.bind("Fall", function() {
				this._setCollisionNormal();
				this.animate(this.dxSelect("PlayerFallLeft", "PlayerFallRight"), -1);
				this.isCrouching = false;
			})
			.bind("Land", function() {
				this._setCollisionNormal();
				this.animate(this.dxSelect("PlayerLandLeft", "PlayerLandRight"), 0);
				this.timeout(function() {
					if(this.grounded) {
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
				if (this.grounded) {
					this.animate(this.dxSelect("PlayerCrouchLeft", "PlayerCrouchRight"), -1);
				} else {
					this.animate(this.dxSelect("PlayerFallLeft", "PlayerFallRight"), -1);
				}
				this.isCrouching = true;
			})
		// Key handler
			.bind("ControlPressed", function(ev) {
				if(ev.control === "equip") {
					this._equipItem();
				} else if(ev.control === "action") {
					this._action();
				}
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
	
	_loadItems:
	function() {
		var itemsDict = {
			pistol: "Pistol",
			dynamite: "Dynamite"
		};
		_(itemsDict).each(function(item, pickup) {
			if(this._pickupState.hasPickup(pickup)) {
				var newItem = Crafty.e(item);
				this._items.push(newItem);
			}
		});
	},
	
	_equipItem:
	function() {
		this._currentItemIndex =
		    (this._currentItemIndex + 1) % (this._items.length + 1) - 1;
		this._items[this._currentItemIndex].equip();
	},
	
	_action:
	function() {
		if(this._currentItemIndex >= 0) {
			var item = this._items[this._currentItemIndex];
			item.activate();
		}
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
		if ( this.hitTile() )
			return false;
		return true;
	}
});
