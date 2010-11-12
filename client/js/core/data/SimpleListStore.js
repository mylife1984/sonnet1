/**
 * SimpleListStore：数据必须在构造时加载（以后不能再重新加载?)
 * 
 * 数据源举例:
 *	[{versionId:1,versionNumber:'1.0',comments:'评论1',createdDate:new Date(),userName:'user1'},
 *	 {versionId:2,versionNumber:'2.0',comments:'评论2',createdDate:new Date(),userName:'user2'}
 *	]
 */
divo.data.SimpleListStore = function(config) {
	divo.data.SimpleListStore.superclass.constructor.call(this, {
		reader : new Ext.data.JsonReader({
			id : config.id
		}, Ext.data.Record.create(config.fields)),
		proxy : new Ext.data.MemoryProxy(config.data)
	});
	this.load()
}

Ext.extend(divo.data.SimpleListStore, Ext.data.Store)
//EOP
