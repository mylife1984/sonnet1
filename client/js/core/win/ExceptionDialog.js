/**
 * 异常信息显示窗口
 */
divo.win.ExceptionDialog = Ext.extend(Ext.Window, {
	errorMsg : "",
    width: 650,
    xtype: 'panel',
    layout: 'fit',
    plain: true,
	cancelAction : "destroy",  
	closeAction : "destroy",
    autoScroll: true,
    modal : false,
    initComponent: function() {
    	var isDebug = this.getAppContext().isDebug
    	this.height = isDebug?600:400
    	var msgHeight = isDebug?400:200
        this.title = '非正常结束';
        this.items = new Ext.FormPanel({
                bodyStyle: 'padding:5px;',
                buttonAlign: 'right',
                labelAlign: 'top',
                autoScroll: false,
                buttons: [{
                    text: '发送报告',
                    scope: this,
                    handler: this.onSendReport
                },{
                    text: '关闭',
                    scope: this,
                    handler: function() {
                        this.close();
                    }
                }],
                items: [{
                    xtype: 'panel',
                    border: false,
                    html: '<div>' + 
                              '<p>有错误发生，程序非正常终止。最后的动作可能没有正确执行。</p>' +
                              '<p>请协助改进本软件，在下面填写关于在哪里有什么错误发生的简短描述。</p>' + 
                          '</div>'
                }, {
                    id: 'divo-exceptiondialog-description',
                    height: 60,
                    xtype: 'textarea',
                    hideLabel : true,
                    name: 'description',
                    anchor: '95%'
                }, {
                    xtype: 'iframepanel',
                    collapsible: true,
                    collapsed: !isDebug,
                    title: '显示细节',
                    height : msgHeight,
					autoScroll : false,
					html : this.errorMsg
                }]
        });
        
        divo.win.ExceptionDialog.superclass.initComponent.call(this);
    },
    onSendReport: function() {
    	var descrip = Ext.getCmp('divo-exceptiondialog-description').getValue()
    	if (!descrip) {
    		this.say("请先输入有关异常的描述信息。")
    		return
    	}
    	Ext.MessageBox.wait("正在发送...", '请稍候');
    	var item = {
    		userName : this.getAppContext().user.name,
    		userFullName : this.getAppContext().user.fullName,
    		descrip : descrip
    	}
    	var f = function(item) {
    		Ext.Ajax.request({
    			scope : this,
    			url : "/exception/report",
    			async : true,		
    			method : 'POST',
    			jsonData : item, 
    			success : function(response, options) {
			    	Ext.MessageBox.hide();
			    	this.say("报告发送完毕。")
    			},
    			failure : function(response, options) {
			    	Ext.MessageBox.hide();
			    	this.say("报告发送失败。")
    			}
    		})
    	}
    	f.defer(100,this,[item])
    }
});
//EOP
