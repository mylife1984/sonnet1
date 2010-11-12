/**
 * 查看PDF窗口
 */
divo.win.PdfShowWindow = Ext.extend(Ext.Window, {
	cancelAction : "destroy",  
	closeAction : "destroy",
	url : null,
	title : null,
	initComponent : function() {
		
		Ext.apply(this,{
			stateful : true,
			stateId : 'check-pdf-showWin',
			width : 850,
			height : 520,
			modal : true,
			closable : true,
			maximizable : true,
			minimizable : false,
			layout : "fit",
			items : {
				xtype : "mediapanel",
				mediaCfg:{
				   mediaType:'PDFFRAME',
		           url: this.url+"?auth="+Ext.Ajax.defaultHeaders.Authorization+"&_dc="+new Date().getTime(),
		           controls:true,
		           start:true
	        }}
		})
		
		divo.win.PdfShowWindow.superclass.initComponent.call(this);
	}
})
// EOP

