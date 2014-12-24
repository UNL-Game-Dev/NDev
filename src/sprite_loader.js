/**
 * Component for loading sprite and animation data from a file.
 */

Crafty.c('SpriteLoader', {
	init:
	function() {
		this._spriteSheets = {};
		this._spriteAnimations = {};
		this._spriteToSpriteSheet = {};
		this._animationToSpriteSheet = {};
	},

	/**
	 * Load sprite and animation data from an object or JSON file.
	 */
	load:
	function(param) {
		var self = this;
		var _param = _(param);
		if(_param.isString()) {
			var path = param;
			$.getJSON(path).success(function(data) {
				// Use paths relative to the directory containing the file.
				data.root = getDirectory(path) + (data.root || '');
				self.load(data);
			}).error(function(xhr, status, info) {
				console.error(path, ':', info);
			});
		} else if(_param.isObject()) {
			var sprites = param;

			sprites.root = sprites.root || '';
			if(sprites.root.length > 0 && sprites.root[sprites.root.length - 1] !== '/') {
				sprites.root += '/';
			}
			sprites.fileExtension = sprites.fileExtension || 'png';

			function getImageUrl(spriteSheetName) {
				return sprites.root + spriteSheetName + '.' + sprites.fileExtension;
			}

			_(sprites.spriteSheets).each(function(spriteSheet, spriteSheetName) {
				spriteSheet.url = getImageUrl(spriteSheetName);
				spriteSheet.tileSize = vec2(spriteSheet.tileSize);
				spriteSheet.padding = vec2(spriteSheet.padding);
				spriteSheet.paddingAroundBorder = !!spriteSheet.paddingAroundBorder;
				spriteSheet.sprites = spriteSheet.sprites || _.object([spriteSheetName], [[0, 0]]);
				spriteSheet.data = spriteSheet.data || {};

				self._spriteSheets[spriteSheetName] = spriteSheet;
				self._spriteAnimations[spriteSheetName] = spriteSheet.animations || {};
				_(spriteSheet.sprites).keys().each(function(key) {
					self._spriteToSpriteSheet[key] = spriteSheetName;
				});
				_(spriteSheet.animations).keys().each(function(key) {
					self._animationToSpriteSheet[key] = spriteSheetName;
				});
			});

			_(sprites.spriteSheets).each(function(spriteSheet) {
				Crafty.sprite(
					spriteSheet.tileSize[0],
					spriteSheet.tileSize[1],
					spriteSheet.url,
					spriteSheet.sprites,
					spriteSheet.padding[0],
					spriteSheet.padding[1],
					spriteSheet.paddingAroundBorder);
			});

			Crafty.bind('NewEntity', function(data) {
				var ent = Crafty(data.id);

				if(!ent.has('Sprite')) {
					return;
				}

				// Define sprite animations, if definitions exist.
				self._loadAnimationsForEntity(ent);
			});
		}
	},

	loadAnimation: function(ent, animation) {
		var spriteSheet = this._animationToSpriteSheet[animation];
		ent.requires(spriteSheet, 'Sprite');
		this._loadAnimationsForEntity(ent);
	},

	/**
	 * Get a sprite's data for a particular data set name.
	 * @param sprite The name of the sprite to get data from.
	 * @param dataSetName The name of the data set, e.g. 'hand.R'.
	 * @param spriteTileCoords The coordinates of the cell to get data from, e.g. [2, 4].
	 * @returns dataPoint The data point corresponding to the given sprite tile coordinates.
	 */
	getSpriteData:
	function(sprite, dataSetName, spriteTileCoords) {
		var spriteSheetName = this._spriteToSpriteSheet[sprite];
		if(!spriteSheetName) {
			return null;
		}
		var spriteSheet = this._spriteSheets[spriteSheetName];
		var data = spriteSheet.data[dataSetName];
		if(!data) {
			return null;
		}
		spriteTileCoords = vec2(spriteTileCoords);
		if(!data[spriteTileCoords[1]]) {
			console.log(spriteTileCoords);
			console.log(data, dataSetName, sprite);
		}
		if(spriteTileCoords[1] >= data.length
		|| spriteTileCoords[0] >= data[spriteTileCoords[1]].length) {
			return null;
		}
		var dataPoint = data[spriteTileCoords[1]][spriteTileCoords[0]];
		return dataPoint;
	},

	/**
	 * Get the tile coordinates of a sprite on its sprite sheet.
	 * @param sprite The name of the sprite.
	 * @returns coords The sprite's coordinates on its sheet.
	 */
	getSpriteTileCoords:
	function(sprite) {
		var spriteSheetName = this._spriteToSpriteSheet[sprite];
		if(!spriteSheetName) {
			return null;
		}
		var spriteSheet = this._spriteSheets[spriteSheetName];
		if(!spriteSheet) {
			return null;
		}
		var coords = spriteSheet.sprites[sprite] || null;
		return coords;
	},

	/**
	 * Get the sprite of a given entity.
	 * @param ent The entity.
	 * @returns sprite The entity's current sprite name.
	 */
	getSprite:
	function(ent) {
		for(var sprite in this._spriteToSpriteSheet) {
			if(ent.has(sprite)) {
				return sprite;
			}
			return null;
		}
	},

	/**
	 * Load the associated animations for a given entity.
	 * @param ent The entity to load animations for.
	 * @private
	 */
	_loadAnimationsForEntity:
	function(ent) {
		var self = this;
		_(this._spriteToSpriteSheet).each(function(spriteSheetName, spriteName) {
			if(ent.has(spriteName)) {
				var animations = self._spriteAnimations[spriteSheetName];
				ent.requires('SpriteAnimation');
				_(animations).each(function(animation, animationName) {
					var frames = animation.frames;
					if(_(frames).isArray()) {
						ent.reel(
							animationName,
							animation.duration,
							animation.frames);
					} else {
						ent.reel(
							animationName,
							animation.duration,
							animation.frames.start[0],
							animation.frames.start[1],
							animation.frames.count);
					}
				});
			}
		});
	}
});

Crafty.c('SpriteData', {
	init:
	function() {
		this._spriteLoader = Crafty('SpriteLoader');
		this._spriteTileCoords = [0, 0];
		this._currentSprite = this._spriteLoader.getSprite(this);
		this.bind('FrameChange', function(data) {
			this._spriteTileCoords = data.frames[data.currentFrame];
		});
	},

	getSprite:
	function() {
		return this._currentSprite;
	},

	setSprite:
	function(sprite) {
		if(sprite !== this._currentSprite) {
			if(this._currentSprite) {
				this.removeComponent(this._currentSprite);
			}
			this.addComponent(this._currentSprite = sprite);
			this._spriteTileCoords =
				this._spriteLoader.getSpriteTileCoords(sprite);
		}

		return this;
	},

	getSpriteData:
	function(dataSetName) {
		return this._spriteLoader.getSpriteData(
			this._currentSprite,
			dataSetName,
			this._spriteTileCoords);
	},

	getVector:
	function(pointName) {
		var data = this.getSpriteData(pointName);
		return data && data.x !== undefined && data.y !== undefined
			? [data.x, data.y]
			: null;
	}
});

/**
 * Convert a variable representing a 2D vector in a variety of forms into the form [x, y].
 * @param param The 2D vector, in the form [x, y], {x: x, y: y}, or x.
 * If just a single number x is given, then the resulting vector will be [x, x].
 * @returns vector The vector in list format, i.e. [x, y].
 * @private
 */
function vec2(param) {
	var _param = _(param);
	if(_param.isArray()) {
		param = _.map(param, parseFloat);
		if(param.length === 1) {
			return param.concat(param);
		}
		if(param.length === 0) {
			return [0, 0];
		}
		return param.slice(0, 2);
	} else if(_param.isObject()) {
		return [
			parseFloat(param.x || 0),
			parseFloat(param.y || 0)
		];
	} else {
		return [
			parseFloat(param || 0),
			parseFloat(param || 0)
		];
	}
}

/**
 * Get the directory of a file path.
 */
function getDirectory(filename) {
	return filename.substring(0, filename.lastIndexOf('/') + 1);
}
