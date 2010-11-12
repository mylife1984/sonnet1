Ext.namespace('Ext.ux');

Ext.ux.ScreenshotUploadPanel = Ext.extend(Ext.Panel, {
    /**
     * The upload URL for the screenshot
     * @type String
     */
    uploadUrl: '',
    
    /**
     * The URL to a placeholder or an existing screenshot
     * that will be replaced with the upload
     * @type String
     */
    screenshotUrl: '/media/images/placeholder.gif',
    screenHtml : null,
    
    inputFileName: 'screenshot',
    
    width: 100,
    
    height: 110,
    
    waitTitle: 'Uploading Screenshot',
    
	waitMsg: 'Your screenshot is being uploaded...',
    
	promtOnUploadCompleted : true, //上传成功后是否提示
	onUploadCompleted : function() {
		this.refreshImage()
	},
	
    initComponent: function(){    	    	
        
        this.browseBtn = new Ext.ux.form.BrowseButton({
        	xtype: 'browsebutton',
			debug: false,
            handler: this.browseFile,
            scope: this,
            text : '&nbsp;浏览...&nbsp;',
            inputFileName: this.inputFileName
        });
        
    	Ext.apply(this, {
        	id: Ext.id(null, 'screenshot'),
        	width: this.width,
        	height: this.height + 36,
        	buttonAlign: 'right',
        	buttons: [
        		this.browseBtn
        	]
        });
        Ext.ux.ScreenshotUploadPanel.superclass.initComponent.apply(this, arguments);
        if (!this.screenHtml)
            var html = '<img id="' + this.myId("image") + '" src="' + this.screenshotUrl + '" />'
        else    
            var html = this.screenHtml
        this.imgViewPanel = new Ext.Panel({
            frame: false,
            border: false,       	
            html: html
        });
        this.add(this.imgViewPanel); 
    },
    refreshImage : function(url) {
    	if (!url) url = this.screenshotUrl
		var el = Ext.get(this.myId("image"))
		el.dom.src = url + "?_dc=" + (new Date().getTime())
    },
    browseFile: function(){
    	if (!this.uploadUrl) {
    		this.say(this.cannotUploadPrompt)
    		return 
    	}
    	if (!this.addScreenshotForm) {
            var addScreenshotFormEl = this.body.createChild({
                tag: 'form',
                style: 'display:none'
            });
            this.addScreenshotForm = new Ext.form.BasicForm(addScreenshotFormEl, {
                url: this.uploadUrl, 
                fileUpload: true
            });
        }
        var inputFileEl = this.browseBtn.detachInputFile();
        inputFileEl.appendTo(this.addScreenshotForm.getEl());
        
        this.uploadScreenshot.call(this);
    },
    
    uploadScreenshot: function(){
        this.addScreenshotForm.submit({
            //params: {
            //    extraParam1: 'value1'
            //},
            success: this.onSuccess,
            failure: this.onFailure,
            scope: this,
            waitTitle: this.waitTitle,
            waitMsg: this.waitMsg
        });
    },
        
    onSuccess: function(form, action){
        var inputFileEl = this.addScreenshotForm.getEl().child('input');
        inputFileEl.remove();
        if (this.promtOnUploadCompleted) {
	        Ext.Msg.show({
	            title: '上传',
	            msg: '操作成功。',
	            closable : false,  
	            buttons: Ext.Msg.OK,
	            minWidth: 300,
	            fn : this.onUploadCompleted.createDelegate(this,[form,action])
	        })
        } else {    
	        if (this.onUploadCompleted) {
	        	this.onUploadCompleted(form,action)
	        }
        }    
    },
        
    onFailure: function(form, action, rsp){
        var inputFileEl = this.addScreenshotForm.getEl().child('input');
        inputFileEl.remove();
        Ext.Msg.show({
            title: '上传失败',
            msg: action.result.error,
            buttons: Ext.Msg.OK,
            minWidth: 300
        });
    }
    
});

Ext.reg('screenshotupload', Ext.ux.ScreenshotUploadPanel);