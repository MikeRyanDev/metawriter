require('reflect-metadata');

module.exports = (function(){
	function Metawriter(namespace, parent){
		this.namespace = parent ? ( parent.namespace + ':' + namespace )  : namespace;
	}

	/**
	 * Get metadata for the given target/propertyKey
	 *
	 * @param  {string} key         The key of the metadata
	 * @param  {any} target      The target class, function, or object
	 * @param  {string} propertyKey Optional property key of the class, function, or object
	 * @return {any}             The metadata for the key on the target/property key
	 */
	Metawriter.prototype.get = function(key, target, propertyKey){
		return Reflect.getMetadata(this._k(key), target, propertyKey);
	};

	Metawriter.prototype.getOwn = function(key, target, propertyKey){
		return Reflect.getOwnMetadata(this._k(key), target, propertyKey);
	};

	Metawriter.prototype.set = function(key, value, target, propertyKey){
		Reflect.defineMetadata(this._k(key), value, target, propertyKey);
	};

	Metawriter.prototype.push = function(key, value, target, propertyKey){
		if(!this.has(key, target, propertyKey)){
			this.set(key, [], target, propertyKey);
		}

		this.get(key, target, propertyKey).push(value);
	};

	Metawriter.prototype.has = function(key, target, propertyKey){
		return Reflect.hasMetadata(this._k(key), target, propertyKey);
	};

	Metawriter.prototype.hasOwn = function(key, target, propertyKey){
		return Reflect.hasOwnMetadata(this._k(key), target, propertyKey);
	};

	Metawriter.prototype.keys = function(target, propertyKey){
		return this._cleanKeys(Reflect.getMetadataKeys(target, propertyKey));
	};

	Metawriter.prototype.ownKeys = function(target, propertyKey){
		return this._cleanKeys(Reflect.getOwnMetadataKeys(target, propertyKey));
	};

	Metawriter.prototype.values = function(target, propertyKey){
		var keys = this.keys(target, propertyKey);
		var values = [];

		for(var i = 0; i < keys.length; i++)
		{
			values.push(this.get(keys[i], target, propertyKey));
		}

		return values;
	};

	Metawriter.prototype.ownValues = function(target, propertyKey){
		var keys = this.ownKeys(target, propertyKey);
		var values = [];

		for(var i = 0; i < keys.length; i++)
		{
			values.push(this.getOwn(keys[i], target, propertyKey));
		}

		return values;
	};

	Metawriter.prototype.forEach = function(callback, target, propertyKey){
		var keys = this.keys(target, propertyKey);

		for(var i = 0; i < keys.length; i++)
		{
			callback(this.get(keys[i], target, propertyKey), keys[i]);
		}
	};

	Metawriter.prototype.forEachOwn = function(callback, target, propertyKey){
		var keys = this.ownKeys(target, propertyKey);

		for(var i = 0; i < keys.length; i++)
		{
			callback(this.getOwn(keys[i], target, propertyKey), keys[i]);
		}
	};

	Metawriter.prototype.delete = function(key, target, propertyKey){
		Reflect.deleteMetadata(this._k(key), target, propertyKey);
	};

	Metawriter.prototype.deleteKeys = function(keys, target, propertyKey){
		for(var i = 0; i < keys.length; i++)
		{
			this.delete(keys[i], target, propertyKey);
		}
	};

	Metawriter.prototype.clear = function(target, propertyKey){
		this.deleteKeys(this.keys(target, propertyKey), target, propertyKey);
	};

	Metawriter.prototype.clearOwn = function(target, propertyKey){
		this.deleteKeys(this.ownKeys(target, propertyKey), target, propertyKey);
	};

	Metawriter.prototype._mine = function(key){
		return key.indexOf(this.namespace) === 0
	};

	Metawriter.prototype._k = function(key){
		if(typeof key != 'string')
		{
			throw new TypeError('Metawriter only supports string-based key names');
		}
		else if(key.length === 0)
		{
			throw new Error('Key length must be greater than zero');
		}

		return this.namespace + ':' + key;
	};

	Metawriter.prototype._strip = function(key){
		if(this._mine(key))
		{
			return key.substr(this.namespace.length + 1);
		}
		else
		{
			return key;
		}
	};

	Metawriter.prototype._cleanKeys = function(rawKeys){
		var keys = [];

		for(var i = 0; i < rawKeys.length; i++)
		{
			if(this._mine(rawKeys[i])) keys.push(this._strip(rawKeys[i]));
		}

		return keys;
	};

	return Metawriter;
})();
