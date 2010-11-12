/**
 * 动态加载节点的树（可以替换SimpleTree使用）
 * 
 * --------------------------------------------------------------
 * 消息：
 * 用户选中了某个节点
 * 
 * 消息名：     			
 * divo.nodeSelect<树器件Id>   
 * 
 * 消息内容：
 * {int} sender 本组件的id值
 * {Ext.tree.TreeNode} node 当前选中的节点对象
 * --------------------------------------------------------------
 */
divo.tree.SmartTree = Ext.extend(Ext.tree.TreePanel, {
	baseUrl : null,  //必须定义
	tbarVisible : true,
	initComponent : function() {
		Ext.apply(this, {
			animate : true,
			containerScroll : true,
			rootVisible : true,
			root : this.createRootNode(),
			tbar : this.tbarVisible?this.getTbar():undefined,
			autoScroll : true,
			loader : new Ext.tree.TreeLoader({
				requestMethod : 'GET',
				clearOnLoad: true,
				dataUrl : this.getChildrenUrl(),
				nodeConfigFn : this.nodeConfigFn.createDelegate(this), //参见 ExtOverride.js
				listeners : {
					"load" : {
						fn : this.onLoad,
						scope : this
					},
					"loadexception" : {
						fn : this.onLoadException,
						scope : this
					}
				}
			})
		})

		divo.tree.SmartTree.superclass.initComponent.call(this)
	},
	render : function() {
		divo.tree.SmartTree.superclass.render.apply(this, arguments);
		
		this.getSelectionModel().on('selectionchange', this.onNodeSelected, this, true)
	},	
	getTbar : function() {
		return	new Ext.Toolbar({
			items: ['->', {
				icon : divo.iconCollapseAll2,
				cls : 'x-btn-icon',
				tooltip : '全部收缩',
				handler : this.onCollapseAll,
				scope : this
			}]
		})
	},
	nodeConfigFn : function(data) {
		var nodeData = {
			leaf : data.is_leaf,
			id : data.id,
			text : data.name,
			codeLevel : data.code_level,
			code : data.tree_code,
			parentId : data.parent_id,
			draggable : false
		}
		return this.nodeConfigFnExtra(nodeData,data)
	},
	//模板方法
	nodeConfigFnExtra : function(nodeData,data) {
		return nodeData
	},
	//模板方法
	onLoad : function() {
		//不能写成 Ext.emptyFn ！
	},
	onLoadException : function(loader, node, response) {
		divo.error(response.responseText)
	},
	onCollapseAll : function() {
		this.root.collapse(true)
	},
	onNodeSelected : function(sm, node) {
		if (!node) return
		
		this.currentNodeId = node.id
		this.currentNode = node
		
		this.publish("divo.nodeSelect"+this.id,{sender:this.id,node:node})
	},
	getChildrenUrl : function() {
		return this.baseUrl+'/children'
	},	
	getRootUrl : function() {
		return this.baseUrl+'/root'
	},	
	createRootNode : function() {
		var root
		Ext.Ajax.request({
			scope : this,
			url : this.getRootUrl(),
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (!resp.success) {
					this.say(resp.errors.reason)
					return
				}
				root = resp.data
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
		if (!root) return null
		
		var node = this.nodeConfigFn(root)
			
		Ext.apply(node,{
			draggable : false,
			expanded : true
		})
		return new Ext.tree.AsyncTreeNode(node)
	}

})
// EOP

