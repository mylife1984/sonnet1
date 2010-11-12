/**
 * 门户管理器
 * 
 * config:
 * {String} portalId 门户标识
 * {String} portalViewId 门户状态标识，如果没有定义，则等于门户标识
 * {Array} portletDefinitions 门户小窗口定义数组
 * {Boolean} barAlignLeft 真表示左对齐（默认为假，表示右对齐）
 * {Boolean} barContentMenuVisible 真表示显示内容选择下拉菜单（默认为假）
 * {Boolean} showPromptWhenInit 真表示初始化时提示正在加载（默认为真）
 */
Ext.ux.PortalManager = function(config) {
	var hasTbar = false
	var canSaveState = false
	
	var portalViewId = config.portalViewId==undefined?config.portalId:config.portalViewId
	var portalId = config.portalId
	var portletDefinitions = config.portletDefinitions
	var barContentMenuVisible = config.barContentMenuVisible==undefined?false:config.barContentMenuVisible
	var showPromptWhenInit = config.showPromptWhenInit==undefined?true:config.showPromptWhenInit
	
	// ----------------- 私有属性 ----------------------
	var colNumCombo, portletMenu
	var portalState, portal
	var msg

	// ----------------- 私有方法 ----------------------
	// 在portletDefinitions中添加前缀
	function adjustPortletDefinitions() {
		for (var i = 0; i < portletDefinitions.length; i++) {
			portletDefinitions[i].id = portalViewId + '-' + portletDefinitions[i].id
			portletDefinitions[i].closable = hasTbar
		}
	}

	// 创建门户管理用工具条控件
	function createToolbar() {
		var tb = []
		
		if (!barContentMenuVisible)
			for (var i = 0; i < portletDefinitions.length; i++) {
				tb.push({
					text : '<span>'+portletDefinitions[i].text+'</span>',
					icon : portletDefinitions[i].icon,
					cls : 'x-btn-text-icon',
					handler : onShowPortlet
				})
			}
		
		if (!config.barAlignLeft)
			tb.push('->')

		portletMenu = new Ext.ux.ColumnMenu({
        	columnHeight: 100,
        	columnWidth: 148,
			id : portalId + 'menu',
			items : getPortletMenuItems()
		})
		tb.push({
			text : '<span>内容选择...</span>',
			menu : portletMenu,
			hidden : !barContentMenuVisible
		})
		tb.push({
			text : '<span>栏目数</span>'
		})

		colNumCombo = new Ext.form.ComboBox({
			store : [[1, '1'], [2, '2'], [3, '3'], [4, '4']],
			typeAhead : true,
			width : 40,
			triggerAction : 'all',
			editable : false,
			selectOnFocus : true
		})

		tb.push(colNumCombo)
		return tb
	}

	// 生成内容菜单项
	function getPortletMenuItems() {
		var items = []
		for (var i = 0; i < portletDefinitions.length; i++) {
			items.push({
				text : portletDefinitions[i].text,
				hideOnClick:false,
				checked : false,
				checkHandler : onItemCheck
			})
		}
		return items
	}

	// 选择内容菜单项时
	function onItemCheck(item, checked) {
		var portletId = getPortletId(item.text)
		if (!checked) {
			portal.removePortlet(portletId);
			portal.doLayout();
		} else {
			var p = portal.showPortlet({
				text : item.text,
				id : portletId,
				checked : true
			});
			portal.doLayout();
			//portalState.restoreCollapseState([p]);
		}
		portalState.save()
		
		onRefresh(msg)   //刚显示就要刷新
	}
	
	//点击工具条上的按钮时（直接显示portlet，并最大化)
	function onShowPortlet(btn,e) {
		showPortletAndGoTop(btn.text.replace('<span>','').replace('</span>',''))
		onRefresh(msg)   //刚显示就要刷新
	}

	// 门户窗口关闭时, 设置相应的菜单项复选框状态
	function onPortletChanged(portletId, checked, suppressEvent) {
		if (suppressEvent==undefined)
		    suppressEvent = true
		var index = getItemIndex(portletId)
		if (index && portletMenu && portletMenu.items.itemAt(index))
			portletMenu.items.itemAt(index).setChecked(checked, suppressEvent)
	}

	// 栏目数改变时
	function onColNumChanged(o) {
		var colNum = o.getValue()
		if (colNum != portalState.getColNum()) {
			Ext.getBody().mask('','x-mask-loading')
			var f = function() {
				portalState.saveColNum(colNum)
				portal.restorePortlets(true)
				Ext.getBody().unmask()
				onRefresh(msg)   //刚显示就要刷新
			}
			f.defer(100,this)
		}
	}

	//通过名称获取id
	function getPortletId(text) {
		for (var i = 0; i < portletDefinitions.length; i++) {
			if (portletDefinitions[i].text == text)
				return portletDefinitions[i].id
		}
	}

	//通过id获取名称
	function getPortletText(id) {
		for (var i = 0; i < portletDefinitions.length; i++) {
			if (portletDefinitions[i].id == id)
				return portletDefinitions[i].text
		}
	}
	
	//通过id获得索引号
	function getItemIndex(id) {
		for (var i = 0; i < portletDefinitions.length; i++) {
			if (portletDefinitions[i].id == id)
				return [i]
		}
	}

	//刷新门户窗口内容
	function onRefresh(_msg) {
		if (!portal) return
		if (!_msg) return
		
		msg = _msg
		var portlets = portal.getAllPortlets()
        for (var i = 0; i < portlets.length; i++) {
        	var p = portlets[i]
        	if (p.items) {
        		var o = p.items.items[0]
        	    if (o.showList)
        	        o.showList(msg.id,msg)
        	    else if (o.showContent)
        	        o.showContent(msg.id,msg)
        	}
        }
	}

	//驱动门户窗口做某种操作
	function onCustomAction(_msg) {
		if (!_msg) return
		
		msg = _msg
		var portlets = portal.getAllPortlets()
        for (var i = 0; i < portlets.length; i++) {
        	var p = portlets[i]
        	if (p.items) {
        		var o = p.items.items[0]
        	    if (o.doCustomAction)
        	        o.doCustomAction(msg)
        	}
        }
	}
	
	//将预定义门户视图状态变成当前用户的初始门户状态
	function setDefaultPortalState() {
		Ext.Ajax.request({
			scope : this,
			url : "/portalviews/"+portalViewId+"/"+divo.getUserId(),
			async : false,
			method : 'PUT',
			jsonData : {aa:1}
		});
	}
	
	//显示portlet并可立即最大化
	function showAndMaximizePortlet(title) {
		Ext.getBody().mask('','x-mask-loading')
		var portletId = getPortletId(title)
		onPortletChanged(portletId,true,false)
		
		var f = function() {
			var portlet = Ext.getCmp(portletId)
			if (portlet) {
				var tool = portlet.ownerCt.tools['maximize']
				var listeners = Ext.lib.Event.getListeners(tool.dom)
				for (var i = 0; i < listeners.length; ++i) {
					if (listeners[i].type=='click') {
						listeners[i].fn(null,tool.dom,portlet)
					}
				}
			}
			Ext.getBody().unmask()			
		}
		f.defer(500,this)
	}
	
	//将portlet显示在左上角位置
	function showPortletAndGoTop(title) {
		Ext.getBody().mask('','x-mask-loading')
		var portletId = getPortletId(title)
		
		var f = function() {
			var portlet = Ext.getCmp(portletId)
			if (portlet) {
				var tool = portlet.ownerCt.tools['close']
				if (tool) {
					var listeners = Ext.lib.Event.getListeners(tool.dom)
					for (var i = 0; i < listeners.length; ++i) {
						if (listeners[i].type=='click') {
							listeners[i].fn(null,tool.dom,portlet)
						}
					}
				}
			} //先关闭
			onPortletChanged(portletId,true,false)
			Ext.getBody().unmask()			
		}
		f.defer(500,this)
	}
	
	// -------------------- public方法 -----------------------
	return {
		/**
		 * 初始化
		 */
		init : function() {
			var canSaveState = hasTbar
			
			if (showPromptWhenInit)
				divo.say("正在加载，请稍候...")
				
			var f = function() {
				portalState = new Ext.ux.PortalState()
				portalState.init(portalId,portalViewId)
	
				var v = portalState.getColNum()
				if (colNumCombo) {
					colNumCombo.on("select",onColNumChanged,this)
					colNumCombo.setValue(v)
				}
				
				adjustPortletDefinitions()
				
				portal = Ext.getCmp(portalId)
				portal.setPortletDefinition(portletDefinitions)
				portal.setPortalState(portalState)
				portal.setPortalViewId(portalViewId)
	
				portal.on('portletchanged', onPortletChanged, this)
				
				portalState.setCanSave(false)
				setDefaultPortalState()
				portal.restorePortlets()
				portalState.setCanSave(canSaveState)
			}
			f.defer(showPromptWhenInit?1000:100,this)
		},
		getTbar : function() {
			hasTbar = true
			return new Ext.Toolbar({
				cls: 'go-paging-tb',
				items: createToolbar()
			})
		},
		onRefresh : function(msg) {
			onRefresh(msg)
		},
		onCustomAction : function(msg) {
			onCustomAction(msg)
		},
		saveState : function() {
			portalState.save()
		},
		/**
		 * 显示指定标题的门户小窗口并将其最大化
		 * TODO: 非弹出窗口最大化，改变tab后会消失，暂时只将portlet显示再左上角位置
		 * {String} title 通过该标题找到要显示的portlet
		 */
		showPortlet : function(title) {
			showPortletAndGoTop(title)
		}
	}
}
// EOP

