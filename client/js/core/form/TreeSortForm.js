/**
 * 树节点排序表单
 */
divo.form.TreeSortForm = Ext.extend(Ext.form.FormPanel, {
	baseUrl : null,
	parentNode : null,
	initComponent : function() {
		
		Ext.apply(this, {
			baseCls : "x-plain",
			labelWidth : 75,
			labelAlign : "right",
			autoScroll : true,
			bodyStyle : "padding:0",
			items : [{
				xtype : "itemselector",
				name : 'tree-childs',
				hideLabel : true,
				sorterOnly : true,
				fromStore:this.getFromDataStore(),
				msWidth : 500,
				msHeight : 300,
				valueField : "id",
				displayField : "name"
			}]
		});

		divo.form.TreeSortForm.superclass.initComponent.call(this);

	},
	getFromDataStore : function() {
		return new Ext.data.Store({					 
			autoLoad: true,
			proxy : new Ext.data.HttpProxy( {
				method : 'GET',
				url : this.baseUrl+"/children"
			}),
			reader: this.getReader(),
			baseParams: {
				node:this.parentNode.id,
				rootNeeded : 1
			}
		})		
	},
	getReader : function() {
		return new Ext.data.JsonReader({
			idProperty:'id',
			root:'rows',
			fields: [
				{name: 'id', type: 'int'},
				{name: 'name', type: 'string'}
			]
		})		
	},
	//public
	save : function(callbackOnSuccess) {
		var itemStr = this.getForm().findField('tree-childs').getValue()
		var ok = true    
		Ext.Ajax.request({
			scope : this,
			url : this.baseUrl+"/"+this.parentNode.id+"/order",
			async : false,
			method : 'PUT',
			jsonData : {idList:itemStr},
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.success) 
					this.say('显示顺序修改成功')
			},
			failure : function(response, options) {
				this.alert(response.responseText)
				ok = false
			}
		})
		
		if (ok) callbackOnSuccess.call()
	}
})

Ext.reg("divo.form.TreeSortForm", divo.form.TreeSortForm);
// EOP

