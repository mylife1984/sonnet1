/**
 * 门户类
 * 
 * Thanks: http://www.dnexlookup.com/
 */
Ext.ux.Portal = Ext.extend(Ext.Panel, {
	layout : 'column',
	//autoScroll : true,
	cls : 'x-portal',
	defaultType : 'portalcolumn',
	portlets : {},
	portalViewId : null,
	initComponent : function() {
		Ext.ux.Portal.superclass.initComponent.call(this)
		this.addEvents({
			validatedrop : true,
			beforedragover : true,
			dragover : true,
			beforedrop : true,
			drop : true,
			portletchanged : true
		})
	},
	initEvents : function() {
		Ext.ux.Portal.superclass.initEvents.call(this)
		this.dd = new Ext.ux.Portal.DropZone(this, this.dropConfig)
	},
	addPortlet : function(pInfo, pTools, portletDefinition, colAt) {
		var config = {
			autoCreate : true,
			tools : pTools,
			title : pInfo.text,
			height : pInfo.height,
			autoScroll : pInfo.autoScroll
		}
		if (portletDefinition.hbuttons) {
		    if (portletDefinition.maximizable || portletDefinition.maximizable==undefined)
			    Ext.apply(config,{
				   plugins : [new Ext.ux.MaximizeTool(),new Ext.ux.plugins.HeaderButtons()],
				   hbuttons: portletDefinition.hbuttons
			    })
			else    
			    Ext.apply(config,{
				   plugins : new Ext.ux.plugins.HeaderButtons(),
				   hbuttons: portletDefinition.hbuttons
			    })
		} else {
		    if (portletDefinition.maximizable || portletDefinition.maximizable==undefined)
			    Ext.apply(config,{
				   plugins : new Ext.ux.MaximizeTool()
			    })
		}				    
		if (portletDefinition.xtype) {
			var xtypeConfig = {
				id : portletDefinition.id,
				xtype : portletDefinition.xtype
			}
			if (portletDefinition.config) {
				Ext.apply(xtypeConfig,portletDefinition.config)
			}
			Ext.apply(config, {
				layout : 'fit',
				items : [xtypeConfig]
			})
		} else {
			var url = portletDefinition.url
			if (url.startsWith("/"))
			    url = url + (url.indexOf('?')>0?"&":"?")+"auth="+Ext.Ajax.defaultHeaders.Authorization
			var xtypeConfig = {
				id : portletDefinition.id,
				xtype : 'iframepanel',
				defaultSrc : url
			}
			if (portletDefinition.config) {
				Ext.apply(xtypeConfig,portletDefinition.config)
			}
			Ext.apply(config, {
				layout : 'fit',
				items : [xtypeConfig]
			})
		}
		
		var p = new Ext.ux.Portlet(config)
		p.pInfo = pInfo
		this.portlets[pInfo.id] = p

		var col = this.items.itemAt(0) // 第1列
		if (colAt != undefined) {
			col = this.items.itemAt(colAt)
			if (col.columnWidth == 0.01) {
				col = this.items.itemAt(0)
			}
		}
		//col.add(p)
		col.insert(0,p)
		p.pClmn = col
		
		return p
	},
	removePortlet : function(id) {
		var p = this.portlets[id]
		if (p) {
			p.pClmn.remove(p, true)
			delete this.portlets[id]
		}
	},
	removeAllPortlets : function() {
		for (var i = 0; i < this.items.length; i++) {
			var c = this.items.itemAt(i)
			if (c.items)
				for (var j = c.items.length - 1; j >= 0; j--) {
					c.remove(c.items.itemAt(j), true)
				}
		}
		this.portlets = {}
	},
	getAllPortlets : function() {
		var retVal = []
		for (var i = 0; i < this.items.length; i++) {
			var c = this.items.itemAt(i)
			if (c.items)
				for (var j = c.items.length - 1; j >= 0; j--) {
					retVal.push(c.items.itemAt(j))
				}
		}
		return retVal
	},
	getPortlet : function(id) {
		return this.portlets[id]
	},
	setColNum : function(colNum) {
		var cs = this.items
		var colWidth = 0.25
		if (colNum == 1) {
			colWidth = 0.97
		} else if (colNum == 2) {
			colWidth = 0.49
		} else if (colNum == 3) {
			colWidth = 0.33
		}

		for (var i = 0; i < colNum; i++) {
			this.items.itemAt(i).columnWidth = colWidth
		}
		for (var i = colNum; i < this.items.length; i++) {
			this.items.itemAt(i).columnWidth = 0.01
		}
	},
	// 恢复门户状态
	restorePortlets : function(colNumChanged) {
		var result, pConfig
		if (colNumChanged == undefined) {
			divo.restoreProfile(function(retValue) {
				result = retValue
			}, divo.getUserId(), this.portalViewId + '-layout')
			if (result) {
				var s = new Ext.state.Provider()
				pConfig = s.decodeValue(result.msgValue)
			} // 获取布局内容
		} // 改变列数时不用记忆的布局

		var portlets = this.portalState.getVisiblePortlets()
		if (!portlets) {
			return
		}	

		this.removeAllPortlets()
		this.setColNum(this.portalState.getColNum())
		var ps = []
		for (var i = 0; i < portlets.length && i < 9; i++) {
			var p = portlets[i]
			if (p && p.id) {
				ps.push(p)
			}
		}
		ps = this.showPortlets(ps, pConfig)
		this.doLayout()
		//this.portalState.restoreCollapseState(ps)
	},
	// 按指定布局显示多个Portlet
	showPortlets : function(pInfos, pConfig) {
		var ps = []
		if (pConfig) {
			for (var c = 0; c < this.columnCount; c++) {
				for (var s = 0; s < pConfig[c].length; s++) {
					var p = pConfig[c][s]
					if (!p)
						continue
					for (var i = 0; i < pInfos.length; i++) {
						if (pInfos[i].id == p.id) {
							var col = this.items.itemAt(c)
							if (col.columnWidth == 0.01)
								ps.push(this.showPortlet(pInfos[i], 0))
							else
								ps.push(this.showPortlet(pInfos[i], c))
						}
					}
				} // 某列中所有portlet循环
			} // 列循环
		} else {
			for (var i = 0; i < pInfos.length; i++) {
				ps.push(this.showPortlet(pInfos[i], 0))
			} // 调整列数后
		}

		return ps
	},
	// 显示单个Portlet
	showPortlet : function(pInfo,colAt) {
		var pd = this.getPortletDefinition(pInfo.id)
		if (!pd) return  //程序变动后，记忆的定义可能已经改变
		
		var me = this
		var pTools = []
		if (pd.closable!=false && (pd.closable==undefined || pd.closable)) {
	    	pTools = [{
				id : 'close',
				handler : function(e, target, panel) {
					panel.ownerCt.remove(panel, true)
					me.fireEvent("portletchanged",panel.pInfo.id,false)
					me.portalState.save()
				}
			}]
		}	
		var h = this.portalState.getHeight(pInfo.id)
		var p = this.addPortlet({
			id : pInfo.id,
			text : pInfo.text,
			autoScroll : pd.autoScroll==true,
			height : h || 200
		}, pTools, pd, colAt)
		
		this.fireEvent("portletchanged",pInfo.id,true)

		p.on("resize", function() {
			this.portalState.save()
		},this)

		return p
	},
	getPortletDefinition : function(id) {
		for (var i = 0; i < this.portletDefinitions.length; i++) {
			if (this.portletDefinitions[i].id == id)
				return this.portletDefinitions[i]
		}
	},
	setPortletDefinition : function(defs) {
		this.portletDefinitions = defs
	},
	setPortalState : function(ps) {
		this.portalState = ps
	},
	setPortalViewId : function(id) {
		this.portalViewId = id
	}

})

Ext.reg('portal', Ext.ux.Portal)
// EOP
