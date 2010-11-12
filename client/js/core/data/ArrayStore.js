/**
 * ArrayStore：数据在构造时可以加载，也可以重新加载
 */
divo.data.ArrayStore = function(config) {
	divo.data.ArrayStore.superclass.constructor.call(this, {
		reader : new Ext.data.ArrayReader({}, Ext.data.Record.create(config.fields))
	})
	this.loadData(config.data||[])
};

Ext.extend(divo.data.ArrayStore, Ext.data.Store)
// EOP
