/**
 * 定义 portalcolumn 布局
 */
Ext.ux.PortalColumn = Ext.extend(Ext.Container, {
	layout : 'anchor',
	autoEl : 'div',
	defaultType : 'portlet',
	cls : 'x-portal-column'
});
Ext.reg('portalcolumn', Ext.ux.PortalColumn);
