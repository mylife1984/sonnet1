/**
 * 首页面板
 */
divo.home.DashWorkspacePanel = Ext.extend(divo.home.DashWorkspaceBasePanel, {
	initComponent : function() {
		var name = "demo" 
		var html = [
'<div class="dashWorkspace">',
'	<span class="name">'+name+'</span>',
'</div>',
'<div class="dashActions">',
'	<a class="internalLink" href="#">',
'		<div id="dash-refresh" class="viewRefresh"><img src="images/divo/refresh.gif"/>&nbsp;刷新</div>',
'	</a>',
'</div>',
'',
'<table style="width:100%;" cellspacing="0" cellpadding="0">',
'	<tr>',
'		<!-- 左边栏 -->',
'		<td valign="top">',
		this.getPortletHtml("activity","dashActivity","最近的操作一览",false),
'		</td>',
'	    <!-- 右边栏 -->',
		'<td valign="top" style="width:50%">',
		this.getPortletHtml("todo","dashTodo","提醒事项(0)",false),
'		</td>',
'	</tr>',
'</table>'
].join('')		
		Ext.apply(this, {
			layout : 'fit',
			items : [{
				autoScroll : true,
				bodyStyle : 'padding: 10px 10px 10px 10px',
				html : html				
			}]
		})
        this.subscribe("divo.home.TabChanged",this.onTabChanged,this)
        this.on('beforedestroy',function() {
              this.unsubscribe()
        },this)
		divo.waitFor(this.canRenderOther,this.renderOther,this)
		divo.home.DashWorkspacePanel.superclass.initComponent.apply(this,arguments)
	},
    onTabChanged : function(subj, msg, data) {
    	if(msg.tabId=="home-page") {
    		this.showContent()
    	} //刚显示时也会执行一次
    },
	canRenderOther : function() {
	    return Ext.get("dash-refresh")
	},
	renderOther : function() {
		Ext.fly("dash-refresh").on('click', function(e, t) {
			this.showContent()
		},this)
	},
	//public
	showContent : function() {
		//
	}
})

Ext.reg('divo.home.DashWorkspacePanel', divo.home.DashWorkspacePanel);
// EOP

