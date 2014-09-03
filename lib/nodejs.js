/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 *
 */

var deep = require("deepjs"),
	cache = require("deepjs/lib/cache"),
	store =  require("deep-restful/lib/store"),
	swig = require("swig");
	
deep.swig = deep.swig || swig;

deep.swig.Nodejs = deep.compose.Classes(deep.Store, function(protocol, basePath, options) {
	this.basePath = basePath || this.basePath || "";
	if (options)
		deep.aup(options, this);
	this.watched = this.watched || {};
}, {
	responseParser: function(datas, path) {
		if (datas instanceof Buffer)
			datas = datas.toString("utf8");
		var res = swig.compile(datas, {
					filename: deep.utils.stripFirstSlash(id)
				});
		return res;
	},
	get: function(path, options) {
		options = options || {};
		path = (deep.Promise.context.rootPath ||  deep.globals.rootPath || "") + this.basePath + path;
		var cacheName = (this.protocol||"swig::") + path;
		if (options.cache !== false)
		{
		 	var cached = cache.get(cacheName);
			if(cached)
				return cached;
		}
		var prom = new deep.Promise(),
			self = this;
		if (!this.watched[path])
			this.watched[path] = fs.watch(path, function(event, filename) {
				switch (event) {
					case 'change':
						//console.log("deep swig : changes detected : reload")
						fs.readFile(path, function(err, datas) {
							var d = null;
							if (err)
								d = deep.when(deep.errors.Watch("Error while reloading file : " + path));
							else
								d = deep.when(self.responseParser(datas, path));
							cache.manage(d, cacheName);
						});
						break;
					case 'rename':
						cache.remove(cacheName);
						break;
				}
			});
		fs.readFile(path, function(err, datas) {
			if (err)
				return prom.reject(err);
			prom.resolve(self.responseParser(datas, path));
		});
		if (options.cache !== false)
			cache.add(prom, cacheName);
		return prom;
	}
});

deep.swig.nodejs = function(protocol, basePath, options) {
	if (typeof protocol === 'undefined')
		protocol = "marked";
	return new deep.swig.Nodejs(protocol, basePath, options);
};
return deep.swig.Nodejs;

module.exports = deep.swig.clients.Nodejs;
