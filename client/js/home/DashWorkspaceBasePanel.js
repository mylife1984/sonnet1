/**
 * 首页面板(基类）
 */
divo.home.DashWorkspaceBasePanel = Ext.extend(Ext.Panel, {
	//------------------ 小窗口通用例程 ------------------------
	getPortletHtml : function(id,portletClass,title,allowCollapsed) {
		return [
'		<div class="'+portletClass+'">',
'			<table width="100%" cellspacing="0" cellpadding="0">',
'				<tr>',
'					<td colspan="2" rowspan="2" class="dashHeader">',
'						<table id="'+id+'-header" style="width:100%;'+(allowCollapsed?'cursor: pointer':'')+'">',
'							<tr>',
'								<td>',
'									<div id="'+id+'-title" class="dashTitle">'+title+'</div>',
'								</td>',
'								<td align="right" style="width:30px">',
'									<div id="'+id+'-header-state" class="'+(allowCollapsed?'dash-expander ico-dash-collapsed':'')+'"></div>',
'								</td>',
'							</tr>',
'						</table>',
'					</td>',
'					<td class="coViewTopRight">&nbsp;&nbsp;</td>',
'				</tr>',
'				<tr><td class="coViewRight" rowspan="2"></td></tr>',
'				<tr>',
'					<td class="coViewBody" colspan="2" style="padding:0px">',
'						<div id="'+id+'-body" style="display: block;">',
'						</div>',
'					</td>',
'				</tr>',
'				<tr>',
'					<td class="coViewBottomLeft"></td>',
'					<td class="coViewBottom">&nbsp;</td>',
'					<td class="coViewBottomRight"></td>',
'				</tr>',
'			</table>',
'		</div>'
].join('')
	},
	renderPortlet : function(id) {
		Ext.fly(id+"-header").on('click', function(e, t) {
			this.togglePortletState(id)
		},this)			
		this.restorePortletVisibility(id)
	},
	//------------------ 通用例程 ------------------------
	showDashItemList : function(id,rows,getContentCallback,shouldSkip) {
		if(rows.length==0) {
			Ext.get(id+"-body").update('')
			return
		}
		
		var html = [
'<div style="">',
'	<table style="width:100%">'
]
		for (var i = 0; i < rows.length; i++) {
			if(shouldSkip && shouldSkip(rows[i])) continue
			
			var c = (i%2==0)?"":"dashAltRow"
			html.push([
'		<tr class="'+c+'" style="">',
'			<td style="padding-left: 5px;">',
getContentCallback(rows[i]),
'			</td>',
'		</tr>'
].join(''))
		}
		html.push([		
'	</table>',
'</div>'
].join(''))
		Ext.get(id+"-body").update(html.join(''))
	}
})
// EOP

