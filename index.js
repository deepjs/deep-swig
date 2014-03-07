/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 */
//"use strict";
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(["require", "deepjs/deep", "./init", "deepjs/lib/stores/cache"],function (require, deep)
{
	if(deep.isNode)
		swig = require("swig");

	deep.ui = deep.ui ||  {};
	deep.ui.swig = function(string, options) {
		options = options || {};
		return swig.compile(string, options);
	};

	if(deep.isNode)
	{
		var fs = require("fs");
		deep.client.Swig = deep.compose.Classes(deep.Store, function(protocol, basePath, options){
			//console.log("swig constructor : ", protocol, basePath, options)
			this.basePath = basePath || this.basePath || "";
			if(options)
				deep.utils.up(options, this);
			this.watched = this.watched || {};
		}, {
			responseParser : function(datas, path){
				if(datas instanceof Buffer)
					datas = datas.toString("utf8");
				var res = swig.compile(datas);
				return res;
			},
			get:function(path, options)
			{
				options = options || {};
				path = (deep.context.rootPath || deep.globals.rootPath || "")+this.basePath+path;
				var cacheName = "swig::"+path;
				if(options.cache !== false && deep.mediaCache.cache[cacheName])
					return deep.mediaCache.cache[cacheName];
				var def = deep.Deferred(),
					self = this;
				if(!this.watched[path])
					this.watched[path] = fs.watch(path, function (event, filename) {
						switch(event)
						{
							case 'change' :
								//console.log("deep swig : changes detected : reload")
								fs.readFile(path, function(err, datas){
									var d = null;
									if(err)
										d = deep.when(deep.errors.Watch("Error while reloading file : "+path));
									else
										d = deep.when(self.responseParser(datas, path));
									deep.mediaCache.manage(d, cacheName);
								});
								break;
							case 'rename' :
								deep.mediaCache.remove(cacheName);
								break;
						}
					});
				fs.readFile(path, function(err, datas)
				{
					if(err)
						return def.reject(err);
					def.resolve(self.responseParser(datas, path));
				});
				var d = def.promise();
				if(options.cache !== false)
					deep.mediaCache.manage(d, cacheName);
				return d;
			}
		});
	}
	else
	{
		deep.client.Swig = deep.compose.Classes(deep.Store, function(protocol, basePath, options){
			this.basePath = basePath || this.basePath || "";
			if(options)
				deep.utils.up(options, this);
			this.watched = this.watched || {};
		}, {
			writeHeaders : function (req, headers)
			{
				for(var i in deep.globalHeaders)
					req.setRequestHeader(i, deep.globalHeaders[i]);
				for(i in this.headers)
					req.setRequestHeader(i, this.headers[i]);
				for(i in headers)
					req.setRequestHeader(i, headers[i]);
			},
			get : function (id, options) {
				//console.log("swig store : ", id, options)
				options = options || {};
				path = (deep.context.rootPath || deep.globals.rootPath || "")+this.basePath+path;
				var cacheName = "swig::"+id;
				if(options.cache !== false && deep.mediaCache.cache[cacheName])
					return deep.mediaCache.cache[cacheName];
				var self = this;
				var def = deep.Deferred();
				var promise = $.ajax({
					beforeSend :function(req) {
						self.writeHeaders(req, {
							"Accept" : "text/html; charset=utf-8"
						});
					},
					url:id,
					method:"GET"
				})
				.done(function(data, msg, jqXHR){
					def.resolve(data);
				})
				.fail(function(){
					def.reject(deep.errors.Protocole("deep.client.Swig failed : "+id+" - \n\n"+JSON.stringify(arguments)));
				});
				//console.log("ajax promise : ", promise);
				var d = def.promise()
				.done(function (data) {
					var resi = swig.compile(data, { filename:deep.utils.stripFirstSlash(id) });
					//console.log("swig store : resi ", resi);
					return resi;
				});
				if(options.cache !== false)
					deep.mediaCache.manage(d, cacheName);
				return d;
			}
		});
	}
	//__________________________________________________
	/*deep.extensions.push({
		store:deep.client.Swig,
		extensions : [
			/(\.(swig)(\?.*)?)$/gi
		]
	});*/
	deep.client.Swig.init = require("./init");
	deep.client.Swig.create = deep.client.Swig.createDefault = function(protocol, basePath, options){
		if(typeof protocol === 'undefined')
			protocol = "swig";
		return new deep.client.Swig(protocol, basePath, options);
	};
	return deep.client.Swig;
});






