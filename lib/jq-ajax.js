/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */

if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "deepjs/lib/cache", "./init"], function(require, deep, cache, init) {

	deep.swig = deep.swig || swig; // swig should be global in browser
	deep.swig.init = init;
	deep.jquery = deep.jquery || {};
	deep.jquery.http = deep.jquery.http || {};
	deep.jquery.http.Swig = deep.Classes(function(protocol, basePath, options) {
		if (protocol && typeof protocol === 'object')
			deep.aup(protocol, this);
		else
			this.protocol = protocol || this.protocol;
		if (this.protocol)
			deep.protocol(this.protocol, this);
		this.basePath = basePath || this.basePath || "";
		if (options)
			deep.aup(options, this);
	}, {
		_deep_store_: true,
		get: function(id, options) {
			options = options || {};
			id = this.basePath + id;
			var cacheName = (this.protocol || "swig::") + id;

			if (options.cache !== false) {
				var cached = cache.get(cacheName);
				if (cached)
					return cached;
			}
			var self = this;
			var prom = new deep.Promise();
			var promise = $.ajax({
					beforeSend: function(req) {
						if (self.writeHeaders)
							self.writeHeaders(req, {
								"Accept": "text/html; charset=utf-8"
							});
					},
					url: id,
					method: "GET"
				})
				.done(function(data, msg, jqXHR) {
					prom.resolve(data);
				})
				.fail(function() {
					prom.reject(deep.errors.Error("deep.jquery.http.Swig failed : " + id));
				});
			prom.done(function(data) {
				var resi = swig.compile(data, {
					filename: deep.utils.stripFirstSlash(id)
				});
				return resi;
			});
			if (options.cache !== false)
				cache.add(prom, cacheName);
			return prom;
		}
	});
	return deep.jquery.http.Swig;
});
