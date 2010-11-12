/**
  * 使用OFC显示图形的面板基类
 */
divo.panel.OFCPanel = Ext.extend(Ext.ux.Chart.OFC.Panel, {
	initComponent : function() {
		Ext.apply(this, {
            chartURL  : '/media/flash/open-flash-chart.swf',
            chartData: this.blankChartData
		})
		
		divo.panel.OFCPanel.superclass.initComponent.apply(this,arguments)
	}
})

// EOP

