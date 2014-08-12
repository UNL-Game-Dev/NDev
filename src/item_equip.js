/**
 * Component that allows an entity to collect and hold items.
 */
Crafty.c("ItemEquip", {
	init:
	function() {
		this.requires("2D");
		this._pickupState = Crafty("PickupState");
		
		/**
		 * List of item info dicts.
		 * name: item name
		 * item: item entity
		 */
		this._itemsInfo = [];
		
		// Index of currently equipped item. (-1 means no item is equipped.)
		this._equippedItemIndex = -1;
		
		// Dictionary mapping items to component names.
		this._itemsToComponents = {
			pistol: "PistolItem",
			dynamite: "DynamiteItem",
			harpoon: "HarpoonItem"
		};
		
		this._loadItems();
		this.bind("GameStateLoaded", this._loadItems);
		this.bind("PickupAdded", function(pickupData) {
			if(pickupData.count) {
				this._addItem(pickupData.name);
			}
		});
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
			var data = {
				item: oldItemInfo.name
			};
			_([oldItemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemUnequip", data);
			});
		}
		
		if(newItemInfo) {
			var data = {
				item: newItemInfo.name
			};
			_([newItemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemEquip", data);
			});
		}
		
		return this;
	},
	
	/**
	 * Get the currently equipped item entity.
	 */
	equippedItem:
	function() {
		var itemInfo = this._itemsInfo[this._equippedItemIndex];
		return itemInfo ? itemInfo.item : null;
	},
	
	/**
	 * Activate the currently equipped item.
	 */
	activateItem:
	function(params) {
		var itemInfo = this._itemsInfo[this._equippedItemIndex];
		if(itemInfo) {
			// Trigger the activate signal for both the item and the holder.
			var itemActivateData = {
				item: itemInfo.name,
				owner: this,
				params: params
			};
			_([itemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemActivate", itemActivateData);
			});
		}
		
		return this;
	},
	
	/**
	 * Deactivate the currently equipped item.
	 */
	deactivateItem:
	function(params) {
		var itemInfo = this._itemsInfo[this._equippedItemIndex];
		if(itemInfo) {
			// Trigger the deactivate signal for both the item and the holder.
			var data = {
				item: itemInfo.name,
				owner: this,
				params: params
			};
			_([itemInfo.item, this]).each(function(ent) {
				ent.trigger("ItemDeactivate", data);
			});
		}
		
		return this;
	},
	
	/**
	 * Load all items from the pickup state.
	 */
	_loadItems:
	function() {
		_(this._itemsToComponents).each(function(itemComponent, pickupName) {
			if(this._pickupState.hasPickup(pickupName)) {
				this._addItem(pickupName);
			}
		}, this);
	},
	
	/**
	 * Add an item, given the pickup name.
	 */
	_addItem:
	function(pickupName) {
		var itemComponent = this._itemsToComponents[pickupName];
		if(itemComponent) {
			var newItem = Crafty.e(itemComponent).attr({
				x: this.x + this.w / 2,
				y: this.y + this.h / 2
			});
			this.attach(newItem);
			var itemInfo = {
				name: pickupName,
				item: newItem
			};
			this._itemsInfo.push(itemInfo);
			
			var data = {
				item: itemInfo.name,
				owner: this
			};
			_([newItem, this]).each(function(ent) {
				ent.trigger("ItemAttach", data);
			}, this);
		}
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
