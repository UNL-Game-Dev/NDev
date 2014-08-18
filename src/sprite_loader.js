/**
 * Component for loading sprite and animation data from an XML file.
 */

Crafty.c("SpriteLoader", {
	init:
	function() {
		this._spriteAnimDict = {};
		this._spriteSheetDict = {};
		this._spriteToSpriteSheet = {};
	},
	
	/**
	 * Load sprite and animation data from a given file path.
	 */
	load:
	function(filename) {
		var that = this;
		$.ajax({
			type: "GET",
			url: filename,
			success: function (data) {
				
				data = $(data).children("spritesData");
				
				// Get the base URL and file extension for resolving sources.
				that._baseUrl = data.children("baseUrl").text().trim();
				that._fileExtension = data.children("fileExtension").text()
					.trim();
				that._currDirectory = getDirectory(filename);
				
				// Load each sprite sheet.
				data.children("spriteSheet").each(function(index,
														spriteSheetElement) {
					that._loadSpriteSheet(spriteSheetElement);
				});
			}
		});
		
		/**
		 * When new sprite entities are created, load their respective
		 * animations.
		 */
		Crafty.bind("NewEntity", function(data) {
			var ent = Crafty(data.id);
			if(!ent.has("Sprite")) {
				return;
			}
			
			// Define sprite animations, if definitions exist.
			that._defineAnimations(ent);
		});
	},
	
	getSpriteData:
	function(sprite, dataSetName, spriteTileCoords) {
		var spriteSheetName = this._spriteToSpriteSheet[sprite];
		if(!spriteSheetName) {
			return;
		}
		var spriteSheet = this._spriteSheetDict[spriteSheetName];
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
		return this._spriteSheetDict[this._spriteToSpriteSheet[sprite]].spriteDict[sprite];
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
	 * Get the sprite sheet and sprite associated with a given entity.
	 */
	_getSpriteInfo:
	function(ent) {
		for(var spriteSheet in this._spriteSheetDict) {
			var spriteDict = this._spriteSheetDict[spriteSheet].spriteDict;
			for(var sprite in spriteDict) {
				if(ent.has(sprite)) {
					return {
						spriteName: sprite,
						spriteSheetName: spriteSheet
					};
				}
			}
		}
	},
	
	/**
	 * Define the associated animations for a given entity.
	 */
	_defineAnimations:
	function(ent) {
		for(var sprite in this._spriteAnimDict) {
			if(ent.has(sprite)) {
				var animDict = this._spriteAnimDict[sprite];
				if(animDict) {
					for(var name in animDict) {
						var anim = animDict[name];
						if(anim.frames) {
							ent.reel(name, anim.duration, anim.frames);
						} else {
							ent.reel(name, anim.duration, anim.from[0],
									 anim.from[1], anim.frameCount);
						}
					}
				}
				return;
			}
		}
	},
	
	/**
	 * Load a sprite sheet from its XML definition.
	 */
	_loadSpriteSheet:
	function(spriteSheetElement) {
		
		var that = this;
		spriteSheetElement = $(spriteSheetElement);
		var src = spriteSheetElement.attr("src");
		var tileSize = spriteSheetElement.children("tileSize").text().trim();
		var tilePadding = spriteSheetElement.children("tilePadding").text()
			.trim();
		var paddingAroundBorder = spriteSheetElement
			.children("paddingAroundBorder").text().trim();

		if(!src) {
			throw "Sprite sheet src attribute missing";
		}

		// Get tile dimensions.
		var tileWidth = 1, tileHeight = 1;
		if(tileSize) {
			var tileSize = tileSize.split(" ");
			if(tileSize.length === 1) {
				tileWidth = tileHeight = parseInt(tileSize[0]);
			} else if(tileSize.length === 2) {
				tileWidth = parseInt(tileSize[0]);
				tileHeight = parseInt(tileSize[1]);
			}
		}

		// Get tile padding.
		var paddingX = 0, paddingY = 0;
		if(tilePadding) {
			tilePadding = tilePadding.split(" ");
			if(tilePadding.length === 1) {
				paddingX = paddingY = parseInt(tilePadding[0]);
			} else if(tilePadding.length === 2) {
				paddingX = parseInt(tilePadding[0]);
				paddingY = parseInt(tilePadding[1]);
			}
		}
		paddingAroundBorder = (paddingAroundBorder === "true");
		
		// Load extra data.
		var spriteSheetData = {};
		var dataElement = spriteSheetElement.children("data");
		$(dataElement).children("set").each(function(index, setElement) {
			setElement = $(setElement);
			var dataSetName = setElement.attr("name");
			var dataSet = [];
			$(setElement).children("row").each(function(index, rowElement) {
				var rowData = [];
				$(rowElement).children("point").each(function(index,
				                                                 pointElement) {
					var data = $(pointElement).getAttributes();
					rowData.push(data);
				});
				dataSet.push(rowData);
			});
			spriteSheetData[dataSetName] = dataSet;
		});

		// Load sprites.
		var spriteDict = {};
		spriteSheetElement.children("sprite").each(function(index,
		                                                       spriteElement) {
			var sprite = that._createSprite(spriteElement, src);

			// Create the sprite dict entry.
			spriteDict[sprite.name] = sprite.bounds;
		});

		// Determine the URL to get the image from.
		var url = src;
		if(this._baseUrl) {
			url = this._baseUrl + "/" + url;
		}
		if(this._fileExtension) {
			url += "." + this._fileExtension;
		}
		if(this._currDirectory) {
			url = this._currDirectory + "/" + url;
		}
		
		this._spriteSheetDict[src] = {
			data: spriteSheetData,
			tileSize: [tileWidth, tileHeight],
			spriteDict: spriteDict
		};
		
		// Load the sprite into Crafty.
		Crafty.sprite(tileWidth, tileHeight, url, spriteDict,
		              paddingX, paddingY, paddingAroundBorder);
	},
	
	/**
	 * Create a sprite object from its XML definition.
	 */
	_createSprite:
	function(spriteElement, spriteSheetName) {
		var that = this;
		spriteElement = $(spriteElement);
		var name = spriteElement.attr("name");

		if(!name) {
			throw "Sprite name attribute missing";
		}

		// Get the sprite location and dimensions.
		var spriteX = 0, spriteY = 0, spriteW = 1, spriteH = 1;
		var attrX = spriteElement.attr("x"), attrY = spriteElement.attr("y");
		var attrW = spriteElement.attr("w"), attrH = spriteElement.attr("h");
		if(attrX) {
			spriteX = parseInt(attrX);
		}
		if(attrY) {
			spriteY = parseInt(attrY);
		}
		if(attrW) {
			spriteW = parseInt(attrW);
		}
		if(attrH) {
			spriteH = parseInt(attrH);
		}

		// Load each animation.
		var animElements = spriteElement.children("reel");
		if(animElements.length) {
			var animDict = {};
			animElements.each(function(index, animElement) {
				var anim = that._createAnimation(animElement);
				animDict[anim.name] = anim;
			});
			that._spriteAnimDict[name] = animDict;
		}
		
		// Map sprite name to sprite sheet name for future reference.
		that._spriteToSpriteSheet[name] = spriteSheetName;
		
		return {
			name: name,
			bounds: [
				spriteX,
				spriteY,
				spriteW,
				spriteH
			]
		};
	},
	
	/**
	 * Create an animation object from its XML definition.
	 */
	_createAnimation:
	function(animElement) {
		animElement = $(animElement);

		var name = animElement.attr("name");
		var duration = animElement.children("duration").text().trim();
		var from = animElement.children("from").text().trim();
		var frameCount = animElement.children("frameCount").text().trim();
		var frameElements = animElement.children("frame");

		if(!name) {
			throw "Sprite animation name attribute missing";
		}

		if(!duration) {
			throw "Sprite animation duration attribute missing";
		}
		
		duration = parseInt(duration);

		// Data for current animation.
		var anim = {
			name: name,
			duration: duration
		};

		// Load animation frames.
		if(frameElements.length) {
			// Load explicit list of frames.
			var frames = [];
			frameElements.each(function(index, frame) {
				frame = $(frame);
				var location = frame.text().trim()
					.split(" ");

				if(location.length !== 2) {
					throw "Frame coordinates must be x y: "
						+ location.join(" ");
				}

				frames.push([
					parseInt(location[0]),
					parseInt(location[1])
				]);
			});
			anim.frames = frames;
		} else if(from && frameCount) {
			// Load start frame and frame count.
			from = from.split(" ");
			if(from.length !== 2) {
				throw "Frame coordinates must be x y: " + location.join(" ");
			}
			anim.from = [
				parseInt(from[0]),
				parseInt(from[1])
			];
			anim.frameCount = parseInt(frameCount);
		} else {
			throw "Sprite frames undefined: " + name;
		}
		
		return anim;
	}
});

Crafty.c("SpriteData", {
	init:
	function() {
		this._spriteLoader = Crafty("SpriteLoader");
		this._spriteTileCoords = [0, 0];
		this._currentSprite = this._spriteLoader.getSprite(this);
		this.bind("FrameChange", function(data) {
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
	
	getPoint:
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
	return filename.substring(0, filename.lastIndexOf("/") + 1);
}

/**
 * Get a dictionary of attributes of an XML element.
 */
$.fn.getAttributes = function() {
	var attributes = {}; 
	
	if(this.length) {
		$.each(this[0].attributes, function(index, attr) {
			attributes[attr.name] = tryParseNumber(attr.value);
       	}); 
	}
	
	return attributes;
};

function tryParseNumber(value) {
	var parsed = parseFloat(value);
	return !isNaN(parsed) ? parsed : value;
}
