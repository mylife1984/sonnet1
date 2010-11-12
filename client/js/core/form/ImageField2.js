/**
 * 与 Ext.ux.form.ImageField 的区别：自定义接收上传文件的 url
 */
Ext.ux.form.ImageField2 = Ext.extend(Ext.form.Field, {
    /**
     * @cfg {bool}
     */
    border: true,
    /**
     * @cfg {String}
     */
    defaultImage: '/media/images/image-field-2-blank.gif',
    uploadUrl : "",
    
    defaultAutoCreate : {tag:'input', type:'hidden'},
    
    initComponent: function() {
        this.plugins = this.plugins || [];
        this.scope = this;
        this.handler = this.onFileSelect;
        
        this.browsePlugin = new Ext.ux.file.BrowsePlugin({});
        this.plugins.push(this.browsePlugin);
        
        Ext.ux.form.ImageField2.superclass.initComponent.call(this);
        this.imageSrc = this.defaultImage;
        if(this.border === true) {
            this.width = this.width;
            this.height = this.height;
        }
    },
    onRender: function(ct, position) {
        Ext.ux.form.ImageField2.superclass.onRender.call(this, ct, position);
        
        // the container for the browe button
        this.buttonCt = Ext.DomHelper.insertFirst(ct, '<div>&nbsp;</div>', true);
        this.buttonCt.applyStyles({
            border: this.border === true ? '1px solid #B5B8C8' : '0'
        });
        this.buttonCt.setSize(this.width, this.height);
        this.buttonCt.on('contextmenu', this.onContextMenu, this);
        
        // the click to edit text container
//        var clickToEditText = '点击开始上传';
//        this.textCt = Ext.DomHelper.insertFirst(this.buttonCt, '<div class="x-ux-from-imagefield-text">' + clickToEditText + '</div>', true);
//        this.textCt.setSize(this.width, this.height);
//        var tm = Ext.util.TextMetrics.createInstance(this.textCt);
//        tm.setFixedWidth(this.width);
//        this.textCt.setStyle({top: ((this.height - tm.getHeight(clickToEditText)) / 2) + 'px'});
        
        // the image container
        // NOTE: this will atm. always be the default image for the first few miliseconds
        this.imageCt = Ext.DomHelper.insertFirst(this.buttonCt, '<img src="' + this.imageSrc + '"/>' , true);
        this.imageCt.setOpacity(0.2);
        this.imageCt.setStyle({
            position: 'absolute',
            top: '18px'
        });
        
        Ext.apply(this.browsePlugin, {
            buttonCt: this.buttonCt,
            renderTo: this.buttonCt
        });
    },
    getValue: function() {
        var value = Ext.ux.form.ImageField2.superclass.getValue.call(this);
        return value;
    },
    setValue: function(value) {
        Ext.ux.form.ImageField2.superclass.setValue.call(this, value);
        if (! value || value == this.defaultImage) {
            this.imageSrc = this.defaultImage;
        } else {
            this.imageSrc = value;
            this.imageSrc.width = this.width;
            this.imageSrc.height = this.height;
            this.imageSrc.ratiomode = 0;
        }
        this.updateImage();
    },
    /**
     * @private
     */
    onFileSelect: function(bb) {
        var input = bb.detachInputFile();
        var uploader = new Ext.ux.file.Uploader({
            input: input,
            url : this.uploadUrl,
            imageWidth : this.width,
            imageHeight : this.height
        });
        if(! uploader.isImage()) {
            Ext.MessageBox.alert('提示', '上传文件不是图片(gif/png/jpeg)').setIcon(Ext.MessageBox.ERROR);
            return;
        }
        uploader.on('uploadcomplete', function(uploader, record){
            this.setValue(record.data.tempFile);
            this.updateImage();
        }, this);
        uploader.on('uploadfailure', this.onUploadFail, this);
        
        this.buttonCt.mask('Loading', 'x-mask-loading');
        uploader.upload();
        
    },
    /**
     * @private
     */
    onUploadFail: function() {
    	this.buttonCt.unmask()
        Ext.MessageBox.alert('提示', '上传失败').setIcon(Ext.MessageBox.ERROR);
    },
    /**
     * executed on image contextmenu
     * @private
     */
    onContextMenu: function(e, input) {
        e.preventDefault();
        
        var ct = Ext.DomHelper.append(this.buttonCt, '<div>&nbsp;</div>', true);
        this.ctxMenu = new Ext.menu.Menu({
            items: [
            {
                text: '删除图片',
                iconCls: 'action_delete',
                disabled: this.imageSrc == this.defaultImage,
                scope: this,
                handler: function() {
                    this.setValue('');
                }
                
            }]
        });
        this.ctxMenu.showAt(e.getXY());
    },
    updateImage: function() {
        // only update when new image differs from current
        if(this.imageCt.dom.src.substr(-1 * this.imageSrc.length) != this.imageSrc) {
            var ct = this.imageCt.up('div');
            var img = Ext.DomHelper.insertAfter(this.imageCt, '<img src="' + this.imageSrc + '"/>' , true);
            // replace image after load
            img.on('load', function(){
                this.imageCt.remove();
                this.imageCt = img;
                //this.textCt.setVisible(this.imageSrc == this.defaultImage);
                this.imageCt.setOpacity(this.imageSrc == this.defaultImage ? 0.2 : 1);
                this.buttonCt.unmask();
            }, this);
            img.on('error', function() {
                Ext.MessageBox.alert('Image Failed', 'Could not load image. Please notify your Administrator').setIcon(Ext.MessageBox.ERROR);
                this.buttonCt.unmask();
            }, this);
        }
    }
});

Ext.reg('ximagefield', Ext.ux.form.ImageField);
