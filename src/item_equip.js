/**
 * Component that allows an entity to collect and hold items.
 */
Crafty.c("ItemEquip", {
	init:
	function() {
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
		this._equippedItemIndex = this._getNextItemIndex(this._equippedItemIndex);
		var newItemInfo = this._itemsInfo[this._equippedItemIndex];
		
		if(oldItemInfo) {
			_([oldItemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemUnequipped", oldItemInfo.name);
			});
		}
		
		if(newItemInfo) {
			_([newItemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemEquipped", newItemInfo.name);
			});
		}
		
		return this;
	},
	
	/**
	 * Activate the currently equipped item.
	 */
	activateItem:
	function() {
		var itemInfo = this._itemsInfo[this._equippedItemIndex];
		if(itemInfo) {
			_([itemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemActivated", itemInfo.name);
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
			_([itemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemDeactivated", itemInfo.name);
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
			pistol: "Pistol",
			dynamite: "Dynamite"
		};
		_(itemsDict).each(function(itemName, pickupName) {
			if(this._pickupState.hasPickup(pickupName)) {
				var newItem = Crafty.e(itemName);
				this._itemsInfo.push({
					name: itemName,
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
