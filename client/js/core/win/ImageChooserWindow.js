/**
 * 上传图片(或Flash文件)选择窗口
 */
divo.win.ImageChooserWindow = Ext.extend(Ext.Window, {
	allowMaxWidth : null,
	allowMaxHeight : null,
	allowMaxFileSize : null,
	thumbWidth : null,
	thumbHeight : null,
	baseWidth : 0,
	baseHeight : 0,
	isFlash : false,
	initComponent : function() {
		//只能取固定值，才能和css配合好
		this.imagePanelId = 'divo-uploaded-image-panel' 
		
		Ext.apply(this,{
			title : '选择'+(this.isFlash?'Flash文件':'图片'),
			stateful : true,
			stateId : 'divo-image-chooser-win',
			modal : true,
			closable : true,
			maximizable : false,
			minimizable : false,
			cancelAction : "destroy",  //只能取值destroy，否则会有imagePanelId不唯一的情况
			closeAction : "destroy",
			buttons : [{
				text : "选择"+(this.isFlash?'Flash文件':'图片'),
				handler : this.onSave,
				scope : this
			}, {
				text : "删除"+(this.isFlash?'Flash文件':'图片'),
				handler : this.onDelete,
				scope : this
			},{
				text : "关闭",
				handler : this.onCancel,
				scope : this
			}],
			layout : "tdgi_border",
			items : [{
				region : 'west',
				title : '文件夹',
				stateful : true,
				stateId : this.myId('tree'),
				collapsible : true,
				width : 250,
				collapsedTitle : true,
				split : true,
				layout : 'fit',
				items : [{
				   id : this.myId('tree'),
				   xtype : "divo.tree.ImageCatalogTree",
				   allowMaxWidth : this.allowMaxWidth,
				   allowMaxHeight : this.allowMaxHeight,
				   allowMaxFileSize : this.allowMaxFileSize,
				   thumbWidth : this.thumbWidth,
				   thumbHeight : this.thumbHeight,
				   baseWidth : this.baseWidth,
				   baseHeight : this.baseHeight,
				   isFlash : this.isFlash
				}]
			}, {
				region : 'center',
				layout : 'fit',
				autoScroll : true,
				items : [{
					id : this.imagePanelId,
					border: true,
					xtype : 'divo.panel.UploadedImagePanel',
				    allowMaxWidth : this.allowMaxWidth,
				    allowMaxHeight : this.allowMaxHeight,
				    isFlash : this.isFlash
				}]
			}]
		})

		this.subscribe("divo.panel.SelectImage",this.onSelectImage,this)
		this.subscribe("divo.nodeSelect"+this.myId('tree'),this.onImageCatalogSelected,this)
		this.subscribe("divo.tree.ImageUploaded",this.onImageUploaded,this)		
		this.on('beforedestroy',function() {
		      this.unsubscribe()
		},this)
		
		divo.win.ImageChooserWindow.superclass.initComponent.call(this);
	},
	onImageCatalogSelected : function(subj, msg, data) {
		var p = Ext.getCmp(this.imagePanelId)
		p.showList(msg.node.attributes.code)
	},
	onImageUploaded : function(subj, msg, data) {
		if (msg.sender==this.myId('tree')) {
			var p = Ext.getCmp(this.imagePanelId)
			p.showList(msg.catalogCode,msg.fileId)
		}
	},
	onSelectImage : function(subj, msg, data) {
		if (msg.sender==this.imagePanelId) {
			this.selectNode(msg.node)
		}
	},
	onDelete : function() {
		var p = Ext.getCmp(this.imagePanelId)
		p.deleteImage()
	},
	onSave : function() {
		this.selectNode()
	},
	selectNode : function(selectedNode) {
		var p = Ext.getCmp(this.imagePanelId)
		if (!selectedNode)
			var node = p.getCurrentNode()
		else 
		    var node = selectedNode
		    
		if (node) {
			this.callback(this.imageSrcEl,node)
			this.close()
		}
	},
	//public
	showWindow: function(imageSrcEl, callback) {
		this.imageSrcEl = imageSrcEl
		this.callback = callback
		this.show()
	}
})
// EOP

