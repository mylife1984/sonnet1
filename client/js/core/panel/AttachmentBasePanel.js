/**
 * 附件面板基类
 */
divo.panel.AttachmentBasePanel = Ext.extend(Ext.Panel, {
	adding : false,
	initComponent : function() {
		this.attachmentListId = this.myId('list')
		this.uploadedAttachmentListId = this.myId('list-uploaded')

		Ext.apply(this, {
			bodyStyle : "padding:5px;",
			border : false,
			items : [{
				layout : "table",
				defaults : {
					border : false
				},
				border : false,
				layoutConfig : {
					columns : 2
				},
				items : [{
					html : "<span class='common-text'>附件:&nbsp;&nbsp;&nbsp;&nbsp;</span>"
				}, this.readOnly?{html:""}:{
					items : [new Ext.Button({
						handler : this.showAttachmentDialog,
						text : "上传",
						scope : this
					})]
				}, {
					html : ""
				}, {
					html : "<div class='common-text' id='"
							+ this.uploadedAttachmentListId + "'></div><div class='common-text' id='"
							+ this.attachmentListId + "'></div>"
				}]
			}]
		})
		
		divo.panel.AttachmentBasePanel.superclass.initComponent.call(this)
	},
	afterRender : function() {
		divo.panel.AttachmentBasePanel.superclass.afterRender.call(this)
		
		var f = function() {
		if (!this.adding)
		    this.renderUploadedFiles()
		}
		f.defer(100,this)
	},
	showAttachmentDialog : function() {
		if (!this.uploadDialog) {
			this.uploadDialog = new Ext.ux.UploadDialog.Dialog({
			  url: this.getUploadUrl()+"?auth="+Ext.Ajax.defaultHeaders.Authorization,
			  reset_on_hide: false,
			  allow_close_on_upload: false,
			  upload_autostart: true
		    })
		    this.uploadDialog.on('uploadsuccess',this.onUploadSuccess,this) 
		    this.uploadDialog.on('fileremove',this.onUploadFileRemove,this) 
		    this.uploadDialog.on('resetqueue',this.onUploadFileRemoveAll,this) 
		}
		this.uploadDialog.show()
	},
	onUploadSuccess : function(o,fileName,resp) {
	    if (!resp.success) return
	    
		if (!this.uploadFiles) {
			this.uploadFiles = {}
		}
		this.uploadFiles[resp.fileName] = fileName
		this.showAttacheFiles()
	},
	onUploadFileRemove : function(o,fileName) {
		for (var obj in this.uploadFiles) {
			if (this.uploadFiles[obj] == fileName)
			    delete this.uploadFiles[obj]
		}
		this.showAttacheFiles()
	},
	onUploadFileRemoveAll : function() {
		this.uploadFiles = {}
		this.showAttacheFiles("")
	},
	showAttacheFiles : function(c) {
		var listEl = Ext.get(this.attachmentListId)
		if (c!=undefined) {
			listEl.dom.innerHTML = c
			return
		}
		var html = "<ul>"
		for (var obj in this.uploadFiles) {
			html += "<li>" + this.uploadFiles[obj]
		}
		html += "</ul>"
		listEl.dom.innerHTML = html
	},
	beforeDestroy : function() {
		if (this.uploadDialog)
			Ext.destroy(this.uploadDialog)
		divo.panel.AttachmentBasePanel.superclass.beforeDestroy.apply(this,arguments)
	},
	//public
	getAttachments : function() {
		var data = ""
		if (this.uploadedFiles) {
			for (var obj in this.uploadedFiles) {
				data += obj+","
			}
		}
		if (this.uploadFiles) {
			for (var obj in this.uploadFiles) {
				data += obj+","
			}
		}
		return data?data.substr(0,data.length-1):""
	},
	//public （仅新建时用）
	clearContent : function(code) {
		this.uploadFiles = null
		this.uploadDialog && Ext.destroy(this.uploadDialog)
		this.uploadDialog = null
		this.showAttacheFiles("")
	},
	//---- 以下为修改时用 -------------
	loadUploadedFiles : function() {
		this.uploadedFiles = {}
		this.uploadedFileIds = {}
		
		Ext.Ajax.request({
			scope : this,
			url : this.getAttachmentListUrl(),
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.totalCount>0) {
					for (var i = 0; i <resp.totalCount; i++) {
						var id = resp.rows[i].id
						var fn = resp.rows[i].client_file_name
						this.uploadedFiles[resp.rows[i].file_name+"|"+fn] = fn
						this.uploadedFileIds[id] = fn
					}
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
	},
	showUploadedFiles : function() {
		var listEl = Ext.get(this.uploadedAttachmentListId)
		listEl.dom.innerHTML = ""
		var html = "<ul>"
		
		for (var id in this.uploadedFileIds) {
		    var fn = this.uploadedFileIds[id]
			var url = this.getAttachmentListUrl()+"/"+id+"?auth="+Ext.Ajax.defaultHeaders.Authorization
			html += '<li><a id="track-discussrecords-attachment-file-'+id+'" href="'+url+'" target="_self">'+fn+
			        '</a>&nbsp;&nbsp;&nbsp;&nbsp;'+(this.readOnly?"":
			        '<a id="track-ticket-attachment-'+id+'" class="common-text" href="#">'+
			        '<span style="TEXT-DECORATION: underline;cursor:hand;">删除</span></a>')
		}
		html += "</ul>"
		listEl.dom.innerHTML = html
	},
	canRenderUploadedFiles : function() {
		return Ext.get(this.uploadedAttachmentListId)
	},
	//public
	renderUploadedFiles : function() {
		if (this.uploadDialog) {
			this.uploadDialog.resetQueue()
			this.onUploadFileRemoveAll()
		}	
		
		this.loadUploadedFiles()
		this.showUploadedFiles()
		this.captureUploadedFileDeleteEvent()
	},
	captureUploadedFileDeleteEvent : function() {
		var listEl = Ext.get(this.uploadedAttachmentListId)
		listEl.on({
			click : {
				stopEvent : false,
				delegate : 'a',
				scope : this,
				fn : function(e, target) {
					var id = target.id
					if (id.indexOf('-file-') > 0)
					   return 
					var attacheId = id.split('-')[3]   
					this.deleteUploadedFile(attacheId)
				}
			}
		})
	},
	deleteUploadedFile : function(id) {
		var fn = ""
		for (var obj in this.uploadedFileIds) {
			if (obj == id)
			    fn = this.uploadedFileIds[obj]
		}
		for (var obj in this.uploadedFiles) {
			if (this.uploadedFiles[obj] == fn) {
			    delete this.uploadedFiles[obj]
			    delete this.uploadedFileIds[id]
			    break
			}    
		}
		this.showUploadedFiles()
	},
	//子类需要重写
	getAttachmentListUrl : function() {
		return ""
	},
	//子类需要重写
	getUploadUrl : function() {
		return ""
	}
	
})
// EOP

