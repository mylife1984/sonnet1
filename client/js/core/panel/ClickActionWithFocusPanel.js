/**
  * 点击并能保持焦点的显项目列表显示面板
  * --------------------------------------------------------------
  * 消息：
  * 选择了项目
  * 
  * 消息名：     			
  * divo.panel.clickAction      
  * 
  * 消息内容：
  * {String} sender 本组件的id值
  * {String} code 所选项目编号
  * {String} name 所选项目名称
  * --------------------------------------------------------------
 */
divo.panel.ClickActionWithFocusPanel = Ext.extend(Ext.Panel, {
	customCls : "",
	customBodyStyle : "padding:10px",
	selectedItemCode : null,
	initComponent : function() {
		this.listId  = this.myId("list")
    	var navHTML = [				
		'<div id="'+this.listId+'" class="divo-list'+(this.customCls?'-'+this.customCls:'')+'">',
		'  <div id="'+this.listId+'-inner"></div>',
		'</div>'].join('')

		Ext.apply(this, {
			layout : 'fit',						
			bodyStyle : this.customBodyStyle,
			items : [{
	  		   autoScroll : true,
			   xtype : "panel",
			   html : navHTML
			}]
		})
		
		divo.panel.ClickActionWithFocusPanel.superclass.initComponent.apply(this,arguments)
	},
    afterRender : function() {
    	divo.panel.ClickActionWithFocusPanel.superclass.afterRender.call(this)
    	this.renderOther.defer(100,this)
    },
	renderOther : function() {
		var el = Ext.get(this.listId+"-inner")
		
	    var tpl = new Ext.XTemplate(
	    	'<tpl for=".">',
			'<tpl if="this.isLine(name)">',
            '    <br />',
        	'</tpl>',	    	
			'<tpl if="this.isLine(name)==false">',
	    	'  <a href="#" hidefocus="on" class="{cls}" id="'+this.listId +'-{code}">',
	    	'    <img src="/media/js/ext/resources/images/default/s.gif">',
	    	'    {name}',
	    	'  </a>',
        	'</tpl>',	    	
	    	'</tpl>',{
			isLine: function(name){
        		return name == "-";
     		}	    		
	    })
		
	    this.listData = this.getListData()
		tpl.overwrite(el, this.listData)

		el.on('click', function(e, t) {
			e.stopEvent()
			this.selectItem(t)
		},this)
		
		if (this.selectedItemCode) {
			this.selectItem.defer(100,this,[this.listId+"-"+this.selectedItemCode])
		}
	},
	selectItem : function(t) {
		var el = Ext.get(t)
		if (!el) return
		
		el.radioClass('active')
		if (t.id)
			var codes = t.id.split('-')
		else
		    var codes = t.split('-')
		code = codes[codes.length-1] 
		if (code=='inner') return
        this.publish("divo.panel.clickAction",{
        	code : code,
        	name : this.getListName(code),
        	sender:this.id
        })
	},
	getListName : function(code) {
		for (var i = 0; i < this.listData.length; i++) {
		    if (this.listData[i].code==code)
		        return this.listData[i].name
		}
		return ""
	},
	//子类需重写
	getListData : Ext.emptyFn
})

Ext.reg('divo.panel.ClickActionWithFocusPanel', divo.panel.ClickActionWithFocusPanel)
// EOP

