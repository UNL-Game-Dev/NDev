/**
 * Component that allows an entity to collect and hold items.
 */
Crafty.c("ItemEquip", {
	init:
	function() {
		this._pickupState = Crafty("PickupState");
		this._items = [];
		this._equippedItemIndex = -1;
		this._loadItems();
	},
	
	/**
	 * Switch to the next item and equip it.
	 */
	equipItem:
	function() {
		this._currentItemIndex =
		    (this._currentItemIndex + 1) % (this._items.length + 1) - 1;
		var item = this._items[this._currentItemIndex];
		if(item.equip) {
			item.equip();
		}
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
		_(itemsDict).each(function(item, pickup) {
			if(this._pickupState.hasPickup(pickup)) {
				var newItem = Crafty.e(item);
				this._items.push(newItem);
			}
		});
	},
	
	/**
	 * Activate the currently equipped item.
	 */
	_action:
	function() {
		if(this._currentItemIndex >= 0) {
			var item = this._items[this._currentItemIndex];
			if(item.activate) {
				item.activate();
			}
		}
	}
});
