/**
 * 上传图片显示面板
 * 
 * --------------------------------------------------------------
 * 消息：
 * 选择了某个图片
 * 
 * 消息名：     			
 * divo.panel.SelectImage
 * 
 * 消息内容：
 * {int} sender 当前组件Id
 * {Object} node 被选中的图片对象
 */
divo.panel.UploadedImagePanel = Ext.extend(Ext.Panel, {
	allowMaxWidth : null,
	allowMaxHeight : null,
	lookup : {}, // cache data by image name for easy lookup
	isFlash : false,
	initComponent : function() {
		this.store = new Ext.data.JsonStore({
			root : 'images',
			fields : ['id', 'title','url','thumbnail_url',{
				name : 'size',
				type : 'int'
			},{
				name : 'height',
				type : 'int'
			},{
				name : 'width',
				type : 'int'
			},{
				name : 'added_on',
				type : 'string'
			}]
		});
		this.initTemplates();

		var formatFileSize = function(data){
	        if(data.size < 1024) {
	            return data.size + " 字节";
	        } else {
	            return (Math.round(((data.size*10) / 1024))/10) + " KB";
	        }
	    };
		
		var formatData = function(data){
	    	data.shortName = data.title.ellipse(15)
	    	data.imageSizeString = "宽度:"+data.width+"&nbsp;高度:"+data.height
	    	data.fileSizeString = formatFileSize(data)
	    	data.dateString = data.added_on;
	    	this.lookup['divo-img-chooser-img-'+data.id] = data;
	    	return data;
	    };
		
		this.view = new Ext.DataView({
			store : this.store,
			tpl : this.thumbTemplate,
			autoHeight : true,
			singleSelect: true,
			overClass : 'x-view-over',
			itemSelector : 'div.thumb-wrap',
			emptyText : '<div style="padding:10px;">(无文件)</div>',
			prepareData: formatData.createDelegate(this),
			listeners : {
				'click' : {
					fn : this.showDetails,
					scope : this,
					buffer : 100
				},
				'dblclick' : {
					fn : this.doCallback,
					scope : this
				},
				'loadexception' : {
					fn : this.onLoadException,
					scope : this
				}
			}
		}) // new Ext.DataView

		Ext.apply(this, {
			layout : 'border',
			autoScroll : true,
			items : [{
				id : 'divo-img-chooser-view',
				region : 'center',
				autoScroll : true,
				items : this.view
			}, {
				id : 'divo-img-detail-panel',
				region : 'east',
				split : true,
				stateful : true,
				stateId : this.myId('detail'),
				autoScroll : true,
				width : 250,
				minWidth : 50
			}]
		})

		divo.panel.UploadedImagePanel.superclass.initComponent.apply(this,
				arguments)
	},
	render : function() {
		divo.panel.UploadedImagePanel.superclass.render.apply(this,arguments)
		this.store.on("load", this.onStoreLoad, this)
	},
	formatSize : function(data) {
		if (data.size < 1024) {
			return data.size + " 字节";
		} else {
			return (Math.round(((data.size * 10) / 1024)) / 10) + " KB";
		}
	},
	initTemplates : function() {
		this.thumbTemplate = new Ext.XTemplate(
				'<tpl for=".">',
				'<div class="thumb-wrap" id="divo-img-chooser-img-{id}">',
				'<div class="thumb"><img src="{thumbnail_url}" title="{title}"></div>',
				'<span>{shortName}</span></div>',
				'</tpl>',
				'<div class="x-clear"></div>');
		this.thumbTemplate.compile();

		this.detailsTemplate = new Ext.XTemplate(
		        '<div class="details">',
				'<tpl for=".">', 
				'<img src="{url}"><div class="details-info">',
				'<b>标题:</b>',
				'<span>{title}</span>',
				'<b>图片大小:</b>',
				'<span>{imageSizeString}</span>',
				'<b>文件大小:</b>',
				'<span>{fileSizeString}</span>',
				'<b>创建时间:</b>',
				'<span>{dateString}</span></div>',
				'</tpl>',
				'</div>');
		this.detailsTemplate.compile();
	},
	showDetails : function(){
	    var selNode = this.view.getSelectedNodes();
	    var el = Ext.getCmp('divo-img-detail-panel')
	    if (!el) return
	    var detailEl = el.body;
		if(selNode && selNode.length > 0){
			selNode = selNode[0];
		    var data = this.lookup[selNode.id];
            detailEl.hide();
            this.detailsTemplate.overwrite(detailEl, data);
            detailEl.slideIn('l', {stopFx:true,duration:.2});
		}else{
		    detailEl.update('');
		}
	},
	doCallback : function(){
	    var selNode = this.view.getSelectedNodes()
	    if (selNode.length > 0) {
	        var node = selNode[0];
			var data = this.lookup[node.id]
			if (this.allowMaxWidth && this.allowMaxWidth > 0) {
				if (data.width!=this.allowMaxWidth || data.height!=this.allowMaxHeight) {
					this.say("图片大小要求:宽度"+this.allowMaxWidth+"&nbsp;高度"+this.allowMaxHeight)
					return
				}
			}
			this.publish("divo.panel.SelectImage",{
				sender:this.id,
				node:data
			})
		} else {
			this.say("请选择"+(this.isFlash?'Flash文件':'图片'))
		}
    },
	onLoadException : function(v,o){
	    this.view.getEl().update('<div style="padding:10px;">加载失败.</div>'); 
	},
	//public
	getCurrentNode : function() {
	    var selNode = this.view.getSelectedNodes()
	    if (selNode.length > 0) {
	        var node = selNode[0];
			return this.lookup[node.id]
		} else {
			this.say("请选择"+(this.isFlash?'Flash文件':'图片'))
			return null
		}
	},
	// public
	showList : function(catalogCode,currentFileId) {
		if (catalogCode)
			this.catalogCode = catalogCode

		this.currentFileId = null	
		if (currentFileId)
		    this.currentFileId = currentFileId

		if (!this.catalogCode)
			return

		this.store.proxy.conn.url = '/uploadedimages/' + this.getUserId()
				+ "/" + catalogCode+"/0/0/0/0/0/0/0"
		this.store.reload()
	},
	onStoreLoad : function(store, records, options) {
		if (this.store.getTotalCount() > 0 && this.currentFileId) {
			var el = Ext.get('divo-img-chooser-img-'+this.currentFileId)
			this.view.select(el)
			this.showDetails()
		}
	},
	//public
	deleteImage : function() {
		var rs = this.view.getSelectedRecords()
        if (rs.length==0) {
        	this.say("请先选择"+(this.isFlash?'Flash文件':'图片'))
        	return
        }
        this.getEl().mask('','x-mask-loading')
        Ext.Ajax.request({
        	scope : this,
        	url : '/uploadedimages/'+rs[0].data.id,
        	async : true,
        	method : 'DELETE',
        	success : function(response, options) {
        		this.getEl().unmask()
        		var resp = Ext.decode(response.responseText)
        		this.store.reload()
        	},
        	failure : function(response, options) {
        		this.getEl().unmask()
        		this.alert(response.responseText)
        	}
        })
	}
})

Ext.reg('divo.panel.UploadedImagePanel', divo.panel.UploadedImagePanel)
// EOP

