/**
 * 可以动态新建、修改和删除的树，还能拖动和调整节点顺序
 */
divo.tree.DynamicTree = Ext.extend(divo.tree.SimpleTree, {
	readOnly : false,
	initComponent : function() {
		Ext.apply(this, {
			//ddAppendOnly : true,  会造成网格拖动到树无效！
			url : this.baseUrl+'/children',
			rootUrl : this.baseUrl+'/root',
			nodeConfigFn : this.createMyNode,
			autoScroll : true,
			enableDD : !this.readOnly || this.canUpdate()
		})	

		this.subscribe("divo.win.TreeOrderChanged",	this.onTreeOrderChanged, this)
		this.on('beforedestroy', function() {
			this.unsubscribe()
		}, this)

		
		divo.tree.DynamicTree.superclass.initComponent.call(this)
	},
	onTreeOrderChanged : function(subj, msg, data) {
		if (msg.sender == this.treeSortWinId) {
			if (msg.node.reload)
				msg.node.reload()
		}
	},
	onRender : function() {
		divo.tree.DynamicTree.superclass.onRender.apply(this, arguments);
		
		if(this.readOnly || !this.canCreate()) return
		
		this.on("contextmenu", this.onShowContext, this)
		this.on('beforemovenode', this.onMoveNode, this)
		this.createTreeEditor()
	},	
	getTbar : function() {
		return	new Ext.Toolbar({
			items: [{
				text : '新建',
				tooltip : '新建' + this.treeName,
				icon : divo.iconAdd,
				cls : 'x-btn-text-icon',
				hidden : this.readOnly || !this.canCreate(),
				handler : function() {
					var selectedNode = this.getSelectNode()
					if (!selectedNode) {
						return
					}
					this.onAdd(selectedNode)
				},
				scope : this
			},'->', {
				icon : divo.iconCollapseAll2,
				cls : 'x-btn-icon',
				tooltip : '全部收缩',
				handler : this.onCollapseAll,
				scope : this
			}]
		})
	},
	onShowContext : function(node, e) {
		if (this.readOnly) return
		
		this.createContextMenu()

		if (this.ctxNode) {
			this.ctxNode.ui.removeClass('x-node-ctx')
		}
		if (node) {
			this.ctxNode = node
			this.ctxNode.ui.addClass('x-node-ctx')
		}

		this.ctx.showAt(e.getXY())
	},
	createContextMenu : function() {
		if (this.ctx)
			return

		this.ctx = new Ext.menu.Menu({
			items : [{
				text : '修改',
				icon : divo.iconEdit,
				scope : this,
				hidden : !this.canUpdate(),
				handler : function() {
					var selectedNode = this.getSelectNode()
					if (!selectedNode) {
						return
					}
					this.onUpdate(selectedNode)
				}
			}, {
				text : '删除',
				icon : divo.iconDelete,
				scope : this,
				hidden : !this.canDelete(),
				handler : function() {
					var selectedNode = this.getSelectNode()
					if (!selectedNode) {
						return
					}
					this.onDelete(selectedNode)
				}
			}, '-', {
				text : '调整显示顺序',
				icon : divo.iconUrl + "/component.gif",
				scope : this,
				hidden : !this.canUpdate(),
				handler : function() {
					var selectedNode = this.validateOnChangeDisplayOrder()
					if (selectedNode)
						this.onChangeDisplayOrder(selectedNode)
				}
			}]
		});
		this.ctx.on('hide', this.onContextHide, this);
	},
	//子类可重写
	validateOnChangeDisplayOrder : function() {
		var selectedNode = this.getSelectNode()
		if (!selectedNode) {
			return null
		}
		if (!selectedNode.firstChild) {
			this.say("该节点无下级节点")
			return null
		}
		return selectedNode
	},
	hasSelection : function() {
		var selectedNode = this.getSelectionModel().getSelectedNode()
		if (!selectedNode) {
			this.say('请先选择' + this.treeName + '。')
			return false
		}
		return true
	},
	getSelectNode : function() {
		var selectedNode
		if (this.ctxNode) {
			selectedNode = this.ctxNode
			this.ctxNode.select()
		} else {
			if (!this.hasSelection()) {
				return null
			} else {
				selectedNode = this.getSelectionModel().getSelectedNode()
			}
		}
		return selectedNode
	},
	onContextHide : function() {
		if (this.ctxNode) {
			this.ctxNode.ui.removeClass('x-node-ctx')
			this.ctxNode = null
		}
	},
	onMoveNode : function(tree, node, oldParent, newParent, index) {
		var allowMove = true

		// prevent other events while processing this one
		Ext.util.Observable.capture(tree, function() {
			return false
		})

		allowMove = this.onChangeNodeParent(node,oldParent,newParent)

		// restore normal event handling
		Ext.util.Observable.releaseCapture(tree)

		return allowMove
	},
	createTreeEditor : function() {
		this.treeEditor = new Ext.tree.TreeEditor(this, {
			allowBlank : false,
			blankText : '请输入'+this.treeName+'名称',
			selectOnFocus : true
		})

		this.un('beforeclick', this.treeEditor.beforeNodeClick, this.treeEditor) //不要doubleclick效果
		this.treeEditor.on("complete", this.onNodeEdited, this, true)
	},
	onNodeEdited : function(o, newText, oldText) {
		var node = o.editNode
		var parentId = node.parentNode.attributes.id
		if (this.adding) {
			var result = this.save(null,newText,parentId) 
			if (result) {
				node.id = result.id
				node.attributes.id = result.id
				node.attributes.code = result.code
			}
		} else {
			var result = this.save(node.attributes.id,newText,parentId) 
			if (!result) 
				node.setText(oldText) 
		}
		this.editing = false
		this.adding = false
	},
	save : function(nodeId,nodeText,parentId) {
		this.getEl().mask('','x-mask-loading')
		var item = {name:nodeText,
					parent_id:parentId}
		var result = null			
		Ext.Ajax.request({
			scope : this,
			url : this.baseUrl+(nodeId?"/"+nodeId:""),
			method : !this.adding?'PUT':'POST',
			jsonData : item,
			async : false,
			success : function(response, options) {
				this.getEl().unmask()
				var resp = Ext.decode(response.responseText)
				result = resp
			},
			failure : function(response, options) {
				this.getEl().unmask()
			    this.alert(response.responseText)
			}
		})
		if (!result) {
			this.say("[" + newText + "]保存失败")
		} else {
		    if (!result.success) {
				this.say(result.errors.name)
				result = null
		    }	
		}	
		return result
	},
	//public
	clearSelectedNode : function() {
		this.getSelectionModel().clearSelections()
	},
	createMyNode : function(data) {
		var nodeData = {
			leaf : data.is_leaf,
			id : data.id,
			text : data.name,
			codeLevel : data.code_level,
			code : data.tree_code,
			parentId : data.parent_id,
			draggable : data.parent_id > 0
		}
		return this.createMyNodeAddon(nodeData,data)
	},
	//模板方法
	createMyNodeAddon : function(nodeData,data) {
		return nodeData
	},
	//若节点数据不同，子类可重写
	onAdd : function(parentNode) {
		var node = new Ext.tree.TreeNode(this.createMyNode({
			is_leaf : true,
			id : '99999999',
			name : this.treeName,
			code_level : parentNode.attributes.codeLevel+1,
			tree_code : '99999999',
			parent_id : parentNode.attributes.id		      	
		}));
		this.adding = true
		
		parentNode.appendChild(node)
		parentNode.expand()
		node.select()
		parentNode.lastChild.ensureVisible()
		this.treeEditor.triggerEdit(node)
	},
	//子类可重写
	onUpdate : function(node) {
		if (node.isRoot) {
			this.say("根节点不允许修改")
			return
		}
		this.treeEditor.triggerEdit(node)	
	},
	onDelete : function(node) {
		if (node.isRoot) {
			this.say('根节点不允许删除。')
			return
		}
		if (node.firstChild) {
			this.say('还有子节点，不允许删除。')
			return
		}
		if (!this.otherDeleteValidate(node)) {
			return
		}
		this.currentNode = node
		Ext.MessageBox.confirm('确认', '要删除吗？', this.deleteConfirm
				.createDelegate(this))
	},
	deleteConfirm : function(btn) {
		if (btn !== 'yes')
			return

		var ok = true
		var node = this.currentNode
		Ext.Ajax.request({
			scope : this,
			url : this.baseUrl+"/"+node.id,
			async : false,
			method : 'DELETE',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (!resp.success) {
					ok = false
					this.say(resp.errors.reason)
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
				ok = false
			}
		});
		if (ok)
			node.parentNode.removeChild(node)
	},
	onChangeNodeParent : function(node, oldParentNode, newParentNode) {
		if (!this.otherDragValidate(node)) {
			return false //返回值为false，表示不允许拖动
		}
		if (oldParentNode.id==newParentNode.id) {
			this.say("此拖动操作无效")
		    return false 
		}
		    
		Ext.Ajax.request({
			scope : this,
			url : this.baseUrl + "/"+node.id + "/parent",
			async : false,
			method : 'PUT',
			jsonData : {
				newParentId : newParentNode.id
			},
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.success) {
					this.say('拖动操作成功')
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
		return true
	},
	onChangeDisplayOrder : function(node) {
		this.treeSortWinId = this.myId('sort-win')
		var win = new divo.win.TreeSortWindow({
			id : this.treeSortWinId,
			parentNode : node,
			baseUrl : this.baseUrl
		})
		win.show()
	},
	//由子类实现或重写
	otherDeleteValidate : function(node) {
		return true
	},
	otherDragValidate : function(node) {
		return true
	}

})
// EOP

