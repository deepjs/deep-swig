/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * swig protocol for deepjs using requirejs text plugin.
 *
 * Need requirejs text plugin loaded and configured.
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "deepjs/lib/cache", "./init"], function(require, deep, cache, init){
	return {
			get:function(path, options){
				options = options || {};
				var cacheName = (this.protocol||"swig::") + path;
				if (options.cache !== false)
				{
				 	var cached = cache.get(cacheName);
					if(cached)
						return cached;
				}
				var prom = deep.protocols.js.get("text!"+path)
				.done(function (data) {
					var resi = swig.compile(data, {
						filename: deep.utils.stripFirstSlash(path)
					});
					return resi;
				});
				if (options.cache !== false)
					cache.add(prom, cacheName);
				return prom;
			}
		};
});