deep-fs provides simple wrappers that wrap nodejs asynch fs call (read and write) in a deep compliant (promised base) way.

Provided protocoles (see deep protocoles) :

	- raw text file (or html)  (text:: or html::)
	- json (json::)


It support File watching.



Usage
=========

	require("deep-fs/json");

	deep("json::./my/file.json")
	.log();



	deep.store("json").post({ hello:"world" }, { id:"./my/path/to/output.json" })



	deep.store.JSON("myprotocole", schema, {
		fileWatching:true
	});


	deep.mode.dev = true;

	
