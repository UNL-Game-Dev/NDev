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
				spriteSheet.tileSize = self._vec2(spriteSheet.tileSize);
				spriteSheet.padding = self._vec2(spriteSheet.padding);
				spriteSheet.paddingAroundBorder = !!spriteSheet.paddingAroundBorder;
				spriteSheet.sprites = spriteSheet.sprites || _.object([spriteSheetName], [[0, 0]]);
				spriteSheet.data = spriteSheet.data
					? _.mapValues(spriteSheet.data, self._normalizeSpriteSheetData)
					: {};

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
				self._defineAnimations(ent);
			});
		}
	},

	loadAnimation: function(ent, animation) {
		var spriteSheet = this._animationToSpriteSheet[animation];
		ent.requires(spriteSheet, 'Sprite');
		this._defineAnimations(ent);
	},
	
	_normalizeSpriteSheetData: function(data) {
		if(!_(data).isArray()) {
			return [[data]];
		}
		if(data.length > 0 && !_(data[0]).isArray()) {
			return [data];
		}
		return data;
	},
	
	_vec2: function(param) {
		var _param = _(param);
		if(_param.isArray()) {
			param = _param.map(parseFloat);
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
	},
	
	getSpriteData:
	function(sprite, dataSetName, spriteTileCoords) {
		var spriteSheetName = this._spriteToSpriteSheet[sprite];
		if(!spriteSheetName) {
			return;
		}
		var spriteSheet = this._spriteSheets[spriteSheetName];
		var data = spriteSheet.data[dataSetName];
		if(!data) {
			return;
		}
		if(spriteTileCoords[1] >= data.length
		|| spriteTileCoords[0] >= data[spriteTileCoords[1]].length) {
			return;
		}
		var dataPoint = data[spriteTileCoords[1]][spriteTileCoords[0]];
		return dataPoint;
	},
	
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
		return spriteSheet.sprites[sprite] || null;
	},
	
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
	 * Define the associated animations for a given entity.
	 */
	_defineAnimations:
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
 * Get the directory of a file path.
 */
function getDirectory(filename) {
	return filename.substring(0, filename.lastIndexOf('/') + 1);
}
