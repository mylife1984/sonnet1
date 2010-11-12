/**
 * 上传图片(或Flash文件)文件夹树维护
 * 
 * --------------------------------------------------------------
 * 消息：
 * 图片上传成功
 * 
 * 消息名：     			
 * divo.tree.ImageUploaded
 * 
 * 消息内容：
 * {int} sender 当前组件Id
 * {int} fileId 上传图片记录Id (可选)
 * {String} catalogCode 当前文件夹节点编号
 * --------------------------------------------------------------
 */
divo.tree.ImageCatalogTree = Ext.extend(divo.tree.DynamicTree, {
	allowMaxWidth : null,
	allowMaxHeight : null,
	allowMaxFileSize : null,
	thumbWidth : 0,   //采用底图中贴缩小后图片的方法
	thumbHeight : 0,
	baseWidth : 0,
	baseHeight : 0,
	isFlash : false,
	initComponent : function() {
		Ext.apply(this, {
			baseUrl : '/imagecatalogs/'+this.getUserId(),
			treeName : '文件夹'
		})

		divo.tree.ImageCatalogTree.superclass.initComponent.call(this)	
	},
	afterRender : function() {
		divo.tree.ImageCatalogTree.superclass.afterRender.apply(this, arguments);
		var f = function() {
			this.expandAll()
			this.root.select()
			//this.onUploadImage(this.root)
		}
		f.defer(100,this)
	},	
	//重写
	getTbar : function() {
		return [{
			text : '上传'+(this.isFlash?'Flash文件':'图片'),
			tooltip : '上传'+(this.isFlash?'Flash文件':'图片')+'到当前文件夹',
			icon :  divo.iconUrl + 'block-image.gif',
			cls : 'x-btn-text-icon',
			handler : function() {
				var selectedNode = this.getSelectNode()
				if (!selectedNode) {
					return
				}
				this.onUploadImage(selectedNode)
			},
			scope : this
		},{
			text : '批量上传',
			tooltip : '将多个'+(this.isFlash?'Flash文件':'图片')+'同时上传到当前文件夹',
			icon :  divo.iconUrl + 'arrow_up.png',
			cls : 'x-btn-text-icon',
			handler : function() {
				var selectedNode = this.getSelectNode()
				if (!selectedNode) {
					return
				}
				this.onUploadMultiImage(selectedNode)
			},
			scope : this
		},'->', {	
			tooltip : '新建下级文件夹',
			icon : divo.iconAdd,
			cls : 'x-btn-icon',
			handler : function() {
				var selectedNode = this.getSelectNode()
				if (!selectedNode) {
					return
				}
				this.onAdd(selectedNode)
			},
			scope : this
		}, {
			icon : divo.iconCollapseAll2,
			cls : 'x-btn-icon',
			tooltip : '全部收缩',
			handler : this.onCollapseAll,
			scope : this
		}]
	},
	onUploadImage  : function(node) {
		var win = new Ext.ux.UploadDialog.Dialog({
				url : "/uploadedimages/"+this.getUserId()+"/"+node.attributes.code+"/"+this.getImageLimitStr(),
				upload_autostart : true,
				allow_close_on_upload : false,
				permitted_extensions : this.isFlash?["swf","SWF"]:["gif", "jpg", "png","GIF","JPG","PNG"],
				closeAction : 'destroy'
			})
		win.on('uploadsuccess', this.onUploadSuccess, this)
		win.show()
	},
	onUploadSuccess : function(o, fileName, resp) {
		this.publish("divo.tree.ImageUploaded",{
			sender:this.id,
			fileId: resp.fileId,
			catalogCode : resp.catalogCode
		})
	},
	otherDeleteValidate : function(node) {
		if (this.hasItems(node)) {
			this.say('已经在此文件夹中保存了图片，不允许删除。')
			return false
		}
		return true
	},
	otherDragValidate : function(node) {
		if (this.hasItems(node)) {
			this.say('已经在此文件夹中保存了图片，不能再移动。')
			return false
		}
		return true
	},
	hasItems : function(node) {
		var ok = true
		var count = 0
		Ext.Ajax.request({
			scope : this,
			url : "/uploadedimages/"+this.getUserId()+"/"+node.attributes.code,
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				count = resp.totalCount
			},
			failure : function(response, options) {
				this.alert(response.responseText)
				ok = false
			}
		})
		return ok && count > 0
	},
	//上传多个文件
	onUploadMultiImage : function(node) {
		this.currentCatalogCode = node.attributes.code
		var dlg = new Ext.ux.SwfUploadPanel({
			  //title: 'Dialog Sample'
			  width: 500
			, height: 300
			, border: false
            , upload_url: "/uploadedimages/"+this.getUserId()+"/"+this.currentCatalogCode+"/multi/"+this.getImageLimitStr()
			, post_params: { id: 123}
			, file_types: this.isFlash?'*.swf':'*.jpg;*.jpeg;*.gif;*.png;'
			, file_types_description: (this.isFlash?'Flash文件':'图片文件')
			, single_file_select: false // Set to true if you only want to select one file from the FileDialog.
			, confirm_delete: false // This will prompt for removing files from queue.
			, remove_completed: true // Remove file from grid after uploaded.
		}); // End Dialog
		dlg.on('fileUploadComplete', this.onUploadMultiSuccess, this)
		var win = new Ext.Window({
			  title: '批量上传文件'
			, width: 514
			, modal : true
			, height: 330
			, resizable: false
			, items: [ dlg ]
		}); 
		win.show();
	},
	onUploadMultiSuccess : function(panel, file, response) {
		this.publish("divo.tree.ImageUploaded",{
			sender: this.id,
			catalogCode : this.currentCatalogCode
		})
	},
	getImageLimitStr : function() {
		var allow_max_width = this.allowMaxWidth || 0
		var allow_max_height = this.allowMaxHeight || 0
		var allow_max_file_size = this.allowMaxFileSize || 300  //KB
		var thumb_width = this.thumbWidth || 0
		var thumb_height = this.thumbHeight || 0
		var base_width = this.baseWidth || 0
		var base_height = this.baseHeight || 0
		var imageLimitStr = allow_max_width+"/"+allow_max_height+"/"+allow_max_file_size+"/"+
		                    thumb_width+"/"+thumb_height+"/"+base_width+"/"+base_height
		return imageLimitStr                    
	}
})

Ext.reg("divo.tree.ImageCatalogTree", divo.tree.ImageCatalogTree);
// EOP

