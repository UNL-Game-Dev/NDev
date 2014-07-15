/**
 * Component that allows an entity to collect and hold items.
 */
Crafty.c("ItemEquip", {
	init:
	function() {
		this.requires("2D");
		this._pickupState = Crafty("PickupState");
		this._itemsInfo = [];
		this._equippedItemIndex = -1;
		this._loadItems();
		this.bind("GameStateLoaded", this._loadItems);
	},
	
	/**
	 * Switch to the next item and equip it.
	 */
	switchItem:
	function() {
		var oldItemInfo = this._itemsInfo[this._equippedItemIndex];
		this._equippedItemIndex =
			this._getNextItemIndex(this._equippedItemIndex);
		var newItemInfo = this._itemsInfo[this._equippedItemIndex];
		
		if(oldItemInfo) {
			_([oldItemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemUnequip", {
					item: oldItemInfo.name
				});
			});
		}
		
		if(newItemInfo) {
			_([newItemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemEquip", {
					item: newItemInfo.name
				});
			});
		}
		
		return this;
	},
	
	/**
	 * Activate the currently equipped item.
	 */
	activateItem:
	function(params) {
		var itemInfo = this._itemsInfo[this._equippedItemIndex];
		if(itemInfo) {
			// Trigger the activate signal for both the item and the holder.
			_([itemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemActivate", {
					item: itemInfo.name,
					params: params
				});
			});
		}
		
		return this;
	},
	
	/**
	 * Deactivate the currently equipped item.
	 */
	deactivateItem:
	function() {
		var itemInfo = this._itemsInfo[this._equippedItemIndex];
		if(itemInfo) {
			// Trigger the deactivate signal for both the item and the holder.
			_([itemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemDeactivate", {
					name: itemInfo.name
				});
			});
		}
		
		return this;
	},
	
	/**
	 * Load all items from the pickup state.
	 */
	_loadItems:
	function() {
		var itemsDict = {
			pistol: "PistolItem",
			dynamite: "DynamiteItem"
		};
		_(itemsDict).each(function(itemName, pickupName) {
			if(this._pickupState.hasPickup(pickupName)) {
				var newItem = Crafty.e(itemName).attr({
					x: this.x + this.w / 2,
					y: this.y + this.h / 2
				});
				this.attach(newItem);
				this._itemsInfo.push({
					name: pickupName,
					item: newItem
				});
			}
		}, this);
	},
	
	/**
	 * Get the next item index to switch to. An index of -1 means no item is
	 * equipped.
	 */
	_getNextItemIndex:
	function(index) {
		return (index + 2) % (this._itemsInfo.length + 1) - 1;
	}
});
