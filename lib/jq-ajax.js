/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */
 
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "deepjs/lib/cache", "deep-restful/lib/store"], function(require, deep, marked, cache){
	
	deep.swig = deep.swig || swig; // swig should be global in browser
	deep.swig.JQAjax = deep.compose.Classes(deep.Store, function(protocol, basePath, options) {
		this.basePath = basePath || this.basePath || "";
		if (options)
			deep.utils.up(options, this);
	}, {
		writeHeaders: function(req, headers) {
			for (var i in deep.globalHeaders)
				req.setRequestHeader(i, deep.globalHeaders[i]);
			for (i in this.headers)
				req.setRequestHeader(i, this.headers[i]);
			for (i in headers)
				req.setRequestHeader(i, headers[i]);
		},
		get: function(id, options) {
			options = options || {};
			id = this.basePath + id;
			var cacheName = (this.protocol||"swig::") + id;

			if (options.cache !== false)
			{
			 	var cached = cache.get(cacheName);
				if(cached)
					return cached;
			}
			var self = this;
			var prom = new deep.Promise();
			var promise = $.ajax({
				beforeSend: function(req) {
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
				prom.reject(deep.errors.Protocol("deep.swig.JQAjax failed : " + id + " - \n\n" + JSON.stringify(arguments)));
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

	deep.swig.jqajax = function(protocol, basePath, options) {
		if (typeof protocol === 'undefined')
			protocol = "swig";
		return new deep.swig.JQAjax(protocol, basePath, options);
	};
	return deep.swig.JQAjax;
});