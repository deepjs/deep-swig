/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */

var deep = require("deepjs"),
	cache = require("deepjs/lib/cache"),
	Store =  require("deep-restful/lib/store"),
	init =  require("./init"),
	swig = require("swig"),
	fs = require("fs");
	
deep.swig = swig;
deep.swig.init = init;

deep.nodejs = deep.nodejs || {};
deep.nodejs.files = deep.nodejs.files || {};

deep.nodejs.files.Swig = deep.Classes(Store, function(protocol, basePath, options) {
	this.basePath = basePath || this.basePath || "";
	if (options)
		deep.aup(options, this);
	this.watched = this.watched || {};
}, {
	responseParser: function(datas, path) {
		if (datas instanceof Buffer)
			datas = datas.toString("utf8");
		//console.log('swig response parser : ', datas);
		var res = swig.compile(datas);
		return res;
	},
	get: function(path, options) {
		options = options || {};
		if(path[0] == "/")
			path = path.substring(1);
		path = (deep.Promise.context.rootPath ||  deep.globals.rootPath || "") + this.basePath + path;
		var cacheName = this.protocol || "swig::";
	 	var cached = cache.get(cacheName, path);
		//console.log("swig.get : ", path, cached?"has cache":"no cache");
		if(cached)
			return cached;
		var prom = new deep.Promise(),
			self = this;
		if (!this.watched[path])
			this.watched[path] = fs.watch(path, function(event) {
				//console.log("swig watch : ", event, path);
				cache.remove(cacheName, path);
			});
		fs.readFile(path, function(err, datas) {
			if (err)
				return prom.reject(err);
			var res = self.responseParser(datas, path);
			cache.add(res, cacheName, path);
			prom.resolve(res);
		});
		cache.add(prom, cacheName, path);
		return prom;
	}
});

module.exports = deep.nodejs.files.Swig;
