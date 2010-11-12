/**
 * 定义 portlet 面板类型
 * 
 * Thanks: http://extjs.com/forum/showthread.php?t=18593
 */
Ext.ux.Portlet = Ext.extend(Ext.Panel, {
	anchor : '100%',
	frame : true,
	//autoScroll : true,
	hideMode : 'visibility',
	collapsible : true,
	draggable : true,
	cls : 'x-portlet',
	hideCollapseTool : false, 

	onRender : function(ct, position) {
		Ext.ux.Portlet.superclass.onRender.call(this, ct, position)

		this.resizer = new Ext.Resizable(this.el, {
			animate : true,
			duration : .6,
			easing : 'backIn',
			handles : 's',
			minHeight : this.minHeight || 100,
			pinned : false
		})
		this.resizer.on("resize", this.onResizer, this)
	},
	onResizer : function(oResizable, iWidth, iHeight, e) {
		this.setHeight(iHeight)
	},
	onCollapse : function(doAnim, animArg) {
		var o = {
			userId : this.getUserId(),
			msgCode : this.pInfo.id + '-collapsed',
			msgValue : 'Y'
		}
		divo.saveProfileAsync(o)

		this.el.setHeight("") // remove height set by resizer
		Ext.ux.Portlet.superclass.onCollapse.call(this, doAnim, animArg)
	},
	onExpand : function(doAnim, animArg) {
		var o = {
			userId : this.getUserId(),
			msgCode : this.pInfo.id + '-collapsed',
			msgValue : 'N'
		}
		divo.saveProfileAsync(o)

		Ext.ux.Portlet.superclass.onExpand.call(this, doAnim, animArg)
	},
	getConfig : function() {
		return {
			id : this.pInfo.id
		}
	}

})
Ext.reg('portlet', Ext.ux.Portlet)
//EOP
