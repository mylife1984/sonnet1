/**
 * 树节点排序窗口
 * 
 * --------------------------------------------------------------
 * 消息：
 * 节点排序成功
 * 
 * 消息名：     			
 * divo.win.TreeOrderChanged 
 * 
 * 消息内容：
 * {int} sender 当前组件Id
 * {Ext.tree.TreeNode} node 当前节点对象(被排序节点的父节点）
 * --------------------------------------------------------------
*/
divo.win.TreeSortWindow = Ext.extend(Ext.Window, {
	cancelAction : "destroy",  //还可以取值：hide
	closeAction : "destroy",
	parentNode : null,
	baseUrl : null,
	initComponent : function() {
		Ext.apply(this,{
			title : '排序',
			width : 540,	
			autoHeight : true,
			layout : "form",
			modal : true,
			closable : true,
			maximizable : false,
			minimizable : false,
			buttons : [{
				text : "确定",
				handler : this.onSave,
				scope : this
			}, {
				text : "取消",
				handler : this.onCancel,
				scope : this
			}],
			items : this.getSortForm()
		});
		
		divo.win.TreeSortWindow.superclass.initComponent.call(this);
	},
	//子类可重写
	getSortForm : function() {
		return {
			xtype : "divo.form.TreeSortForm",
			parentNode : this.parentNode,
			baseUrl : this.baseUrl
		}
	},
	onSave : function() {
		this.items.itemAt(0).save(this.onSaveSucccess.createDelegate(this))
	},
	onSaveSucccess : function() {
		this.publish("divo.win.TreeOrderChanged",{
			sender:this.id, 
			node:this.parentNode
		})
		this.close()
	}
});
// EOP

