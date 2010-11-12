/**
 * 只读的动态加载树
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
divo.tree.SimpleTree = Ext.extend(Ext.tree.TreePanel, {
	url : null,
	nodeConfigFn : null,
	treeName : null,
	rootId : 1,
	tbarVisible : true,
	allowMaint : true,
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
				dataUrl : this.url,
				nodeConfigFn : this.nodeConfigFn.createDelegate(this),
				listeners : {
					"loadexception" : {
						fn : this.onLoadException,
						scope : this
					}
				}
			})
		})

		divo.tree.SimpleTree.superclass.initComponent.call(this)
	},
	render : function() {
		divo.tree.SimpleTree.superclass.render.apply(this, arguments);
		
		this.getSelectionModel().on('selectionchange', this.onNodeSelected, this, true)
		this.loader.on("load", this.onLoad,this)
	},	
	getTbar : function() {
		return	new Ext.Toolbar({
			cls: 'go-paging-tb',
			items: ['->', {
				icon : divo.iconCollapseAll2,
				cls : 'x-btn-icon',
				tooltip : '全部收缩',
				handler : this.onCollapseAll,
				scope : this
			}]
		})
	},
	// 处理加载异常
	onLoadException : function(loader, node, response) {
		divo.showError(response.responseText)
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
	onLoad : function(o, node, response) {
		if (this.currentNodeId) {
			var currentNode = node.findChild("id", this.currentNodeId)
			if (currentNode) {
				currentNode.ensureVisible() // 自动滚动到该节点，并展开
				currentNode.expand()
				this.getSelectionModel().select(currentNode)
			} // 光标定位
		}
	},
	createRootNode : function() {
		var root
		Ext.Ajax.request({
			scope : this,
			url : this.rootUrl,
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
		
		if (this.nodeConfigFn)
			var node = this.nodeConfigFn(root)
			
		Ext.apply(node,{
			draggable : false,
			expanded : false
		})
		return new Ext.tree.AsyncTreeNode(node)
	}

})
// EOP

