
deep-swig provides protocol definition for swigjs (template engine) http://paularmstrong.github.io/swig/

## Required

* deepjs >= v0.9.4
* node >= 0.10.0

## Install
```shell
	git clone https://github.com/deepjs/deep-swig
	cd deep-swig
	npm install
```

## Usage

```javascript
require("deep-swig")();
require("deep-node-fs/json").createDefault();

var obj = {
	template:"swig::./path/to/my/swig/template",
	context:{
		myData:"json::./path/to/datas.json",
		myTitle:"Hello world"
	}
};

deep(obj)
.deepLoad()
.done(function(obj){
	return obj.template(obj.context);
})
.log();
```


