/**
 * 带有定制按钮和链接的面板（只用作基类）
 */
divo.panel.PanelWithHtmlBtns = Ext.extend(Ext.Panel, {
	//public
	//btn是对象数组，数组元素表示按钮，例如：
	//
	// text : '修改',
	// icon : 'edit.gif',  //默认 /media/images/
	// handler :this.modifyCheckReport,
	// hidden : !this.isCheckerUser()
    //
	rightWidth : 100,
	btnRightCls : 'divo-big-btn-right',
	btnCls : 'divo-big-btn-left',
	initComponent : function() {
		divo.waitFor(this.canSetupBtns,this.setupBtns,this)
		divo.panel.PanelWithHtmlBtns.superclass.initComponent.call(this);
	},
	getHtmlBtnsPanel : function(btns) {
        this.hasRightBtns = false
        this.htmlBtns = btns

		var html = []
		html.push('<div class="divo-big-btn" >')
		
		//左侧按钮
		html.push('<div class="'+this.btnCls+'"><ul id="' + this.myId('btns') + '">')
		var hasBtns = false
		var rightBtnStartAt = 0
		for (var i = 0; i < this.htmlBtns.length; i++) {
			var item = this.htmlBtns[i]
			if (typeof item == 'string' && item=='->') {
				 this.hasRightBtns = true
				 rightBtnStartAt = i+1
			     break
			}
			if (item.hidden) continue 
			
			if (item.items==undefined) {
				var btnId = this.myId('btn-' + i)
				var img = ''
				if(item.icon)
					var img =  '<img src="/media/images/'+item.icon+'" />&nbsp;'
				var text = img+item.text
			} else {
				var btnId = this.myId('btn-items-' + i)
				var text = item.text+'▼'
			}	
			html.push('<li><a id="'
						+ btnId
						+ '" href="#">'
						+ text + '</a></li>')
			hasBtns = true
		}
		html.push('</ul></div>')
        html.push('</div>')
        //divo.log(html)
		
		//右侧链接, 或者纯文字
		if (this.hasRightBtns) {
			var html2 = []
            html2.push('<div class="divo-big-btn" >')
            html2.push('<div id="' + this.myId('btnsRight') + '" class="'+this.btnRightCls+'">')
            for (var i = rightBtnStartAt; i < this.htmlBtns.length; i++) {
                var item = this.htmlBtns[i]
                if (item.hidden) continue 
                if (item.handler==undefined) {
                	html2.push(item.text)
                } else {
                    html2.push('<a id="'
                                + this.myId('btn-' + i)
                                + '" href="#">'
                                + item.text + '</a>&nbsp;&nbsp;')
                }                
                hasBtns = true
            }
            html2.push('</div>')
            html2.push('</div>')
		}
		
        if (!this.hasRightBtns)
    		return {
    			region : 'north',
    			layout : 'fit',
    			height : hasBtns?38:0,
    			html : html.join('')
    		}
    	return {
            region : 'north',
            layout : 'fit',
            height : hasBtns?38:0,
            items : [this.createBtnLayoutPanel(html,html2)]
    	}
	},
    createBtnLayoutPanel : function(htmlLeft,htmlRight) {
        return new Ext.Panel({
            layout : 'border',
            items : [{
                region : 'center',
                layout : 'fit',
                html : htmlLeft.join('')
            },{
                region : 'east',
                width : this.rightWidth,
                layout : 'fit',
                html : htmlRight.join('')
            }] // items
        })  
    },
    canSetupBtns : function() {
    	return Ext.get(this.myId('btns'))
    },
    setupBtnsCore : function(el) {
        el.on({
            click : {
                stopEvent : false,
                delegate : 'a',
                scope : this,
                fn : function(e, target) {
                    var elIds = target.id.split('-')
                    var index = elIds[elIds.length-1]
                    //if  (!Ext.get(target.id).hasClass("inactive")) {
                        if (target.id.indexOf("-items-")>0) {
                            this.showContextMenu(index,target.id)
                        } else {
                            this.htmlBtns[index].handler.call(this)
                        }   
                    //}   
                }
            }
        })
    },    
	setupBtns : function() {
		this.setupBtnsCore(Ext.get(this.myId('btns')))
        if (this.hasRightBtns)		
            this.setupBtnsCore(Ext.get(this.myId('btnsRight')))
	},
	//public
	setBtnText : function(index,text) {
		var el = Ext.get(this.myId('btn-' + index))
		el.dom.innerHTML = text
	},
	//public
	setBtnVisible : function(index,visible) {
		var el = Ext.get(this.myId('btn-' + index))
		el.setVisibilityMode(Ext.Element.DISPLAY);
		el.setVisible(visible)
	},
	//public
	disableBtn : function(index) {
		this.setBtnVisible(index,false)
	},
	//public
	enableBtn : function(index) {
		this.setBtnVisible(index,true)
	},
	showContextMenu : function(index,btnId) {
		var menu = new Ext.menu.Menu({
			items: this.htmlBtns[index].items	
		});
		var position = Ext.get(btnId).getXY()
		position[1] = position[1]+22 //y
		menu.showAt(position);
	}
})

// EOP

