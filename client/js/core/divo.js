/**
 * 为 divo 对象定义属性和方法
 */
Ext.apply(divo, {
	//必输字段标记
    required : '<span style="font-size: 16px;color:red">*</span>',
	// 方便调用PageBus
	subscribe : function(name, callback, scope) {
		return window.PageBus.subscribe(name, scope, callback, null)
	},
	publish : function(name, message) {
		window.PageBus.publish(name, message);
	},
	unsubscribe : function(sub) {
		window.PageBus.unsubscribe(sub)
	},
	//循环等待执行funcRun方法，直到funcStopWaiting返回值为真
	waitFor : function(funcStopWaiting, funcRun, scope){
	    var task = { 
	        run : function(){
	            if (funcStopWaiting.call(scope || this)){
	                funcRun.call(scope || this)
	                return false
	            }            
	        },
	        interval: 100	
	    }
	    if (!(task.run()===false)){
	        if (!task.duration && !task.repeat ){task.repeat=300}    
	        Ext.TaskMgr.start(task)
	    }
	},
	//获取当前登录用户信息
	getUserId : function() {
		if (divo.appContext.user)
			return divo.appContext.user.id
		return null	
	},
	getUserFullName : function() {
		if (divo.appContext.user)
			return divo.appContext.user.fullName
		return null	
	},
	isAdmin : function() {
		var userId = divo.getUserId()
		return userId && userId == 1 
	},
    getDeptId : function() {
        if (divo.appContext.user)
            return divo.appContext.deptId
        return null 
    },
    getDeptName : function() {
        if (divo.appContext.user)
            return divo.appContext.deptName
        return null 
    },
	//模板开头和结尾
	t1 : '<tpl for=\".\">',
    t2 : '</tpl>',

    //当前用户是否具有指定全局权限
    hasPermission : function(name) {
        var ps = divo.appContext.globalPermissions
        for (var i=0; i < ps.length; i++) {
        	if (ps[i].name==name) return true
        }
        return false
    },
    //判断当前用户的菜单项操作权限
    //private
    isPermitted : function(menuItemId,pValue) {
        var ps = divo.appContext.funcPermissions
        var p
        for (var i=0; i < ps.length; i++) {
        	if (ps[i].item_id==menuItemId) {
        		p = ps[i].permission
        		break
        	}
        }
        return p && ((p & pValue) == pValue)
    },
    //有新建操作权限吗？
    canCreate : function(menuItemId) {
        return divo.isPermitted(menuItemId,1) //001
    },
    //有修改操作权限吗？
    canUpdate : function(menuItemId) {
        return divo.isPermitted(menuItemId,2) //010
    },
    //有删除操作权限吗？
    canDelete : function(menuItemId) {
        return divo.isPermitted(menuItemId,4) //100
    },
    //获取指定url的菜单项完整信息
    //private 
    getMenuItem : function(url) {
		var item = null
		Ext.Ajax.request({
			scope : this,
			url : "/menus/items/url/"+url,
			async : false,
			method : 'GET',
			success : function(response, options) {
				var resp = Ext.decode(response.responseText)
				if (resp.success) {
					item = resp.data
				}
			},
			failure : function(response, options) {
				this.alert(response.responseText)
			}
		})
		return item
    },
    /**
     * 用程序方式调用菜单项
     * @param {String} url 菜单项url
     * @param {Object} msg
     */
    callMenuItem : function(url,msg) {
    	var item = divo.getMenuItem(url)
    	msg.id = item.id   
    	msg.name = item.name    	
		this.publish("j.selectMenuItem",msg)
    },
	/**
	 * Shorthand way of creating a toast window as an alert in one line.
	 * @config {String} title 默认为“通知”
	 * @config {String} iconCls 默认为“information”，还可传入“error”
	 * @config {Boolean} autoDestroy 默认为false
	 * @config {int} hideDelay 默认为 5000，autoDestroy为true时有效  
 	 */
	toastAlert : function(config) {
	    the_title = typeof(config.title) != 'undefined' ? config.title : '通知'
	    the_icon = typeof(config.iconCls) != 'undefined' ? config.iconCls : 'information'
	    the_autoDestroy = typeof(config.autoDestroy) != 'undefined' ? config.autoDestroy : false
	    
	    // Create the toast window
	    var win = new Ext.ux.ToastWindow({
	        title: the_title,
	        html: config.message,
	        iconCls: the_icon,
	        autoDestroy: the_autoDestroy,
	        hideDelay: config.hideDelay 
	    })
	    win.show(document)
	    
	    if (config.flashTitle) {
			var step=0; 
			var t = document.title
			function flash_title(){
			  step++;  
			  if (step==3) {step=1}; 
			  if (step==1) {document.title=config.t2}; 
			  if (step==2) {document.title=config.t1}; 
			}
			var task = {
	            run: function(){
	                flash_title();
	            },
	            scope:this,
	            interval: (1000)
	        };
	        Ext.TaskMgr.start(task);
	        win.on('destroy',function() {
		        Ext.TaskMgr.stop(task);
		        document.title = t
	        },this)
	    }
	}, 
	//private
	//通过插件方式加入cmd的放入cmArray
	getGridMeta : function(scope,result,cmArray) {
		var meta = {};
		if (!result) {
			meta.recordDef = Ext.data.Record.create([{
				name : ""
			}]);
			meta.columnModel = new Ext.grid.ColumnModel([{
				header : ""
			}]);
			return meta;
		}

		var rs = [], cms = [], fs = [], metas = [];

		if (cmArray && scope.putFirst) {
			for (var i = 0; i < cmArray.length; i++) {
				if (cmArray[i])
					cms.push(cmArray[i])
			}
		}	
		
		for (var i = 0;i < result.length; i++) {
			metas.push( {
				name : result[i].name,
				header : result[i].header
			});
			rs.push( {
				name : result[i].name,
				type : result[i].type?result[i].type:'auto',
				convert : result[i].convert?result[i].convert:undefined
			});
			if (result[i].header) {
				cms.push( {
					header : result[i].header,
					dataIndex : result[i].name,
					type : result[i].type,
					align : result[i].align?result[i].align:undefined,
					renderer : result[i].renderer?result[i].renderer:null,
					id : result[i].id?result[i].id:undefined,
					width : result[i].width?result[i].width:undefined,
					css : result[i].css?result[i].css:undefined,
					sortable : result[i].sortable==undefined?true:result[i].sortable,
					editor : result[i].editor==undefined?undefined:result[i].editor,
					hidden : result[i].hidden==undefined?false:result[i].hidden,
					summaryType : result[i].summaryType==undefined?undefined:result[i].summaryType,
					summaryRenderer : result[i].summaryRenderer==undefined?undefined:result[i].summaryRenderer,
					cellActions : result[i].cellActions==undefined?undefined:result[i].cellActions
				});
				if (result[i].searchable)
					fs.push( {
						text : result[i].searchName?result[i].searchName:result[i].header,
						name : result[i].name
					});
			}
		}
			
		if (cmArray && !scope.putFirst) {
			for (var i = 0; i < cmArray.length; i++) {
				if (cmArray[i])
					cms.push(cmArray[i])
			}
		}	
		
		meta.recordDef = Ext.data.Record.create(rs);
		meta.columnModel = new Ext.grid.ColumnModel(cms);
		meta.columnModel.defaultSortable = true;
		meta.rs = rs;
		meta.cms = cms;
		meta.fs = fs;
		meta.metas = metas;
		
		return meta;
	},
	showPopupWindow : function(userCfg,p) {
		var cfg = {
			width : Ext.getBody().getSize().width - 100,
			height : Ext.getBody().getSize().height - 100,
			resizable : true,
			draggable : true,
			closable : true,
			closeAction : 'destroy',
			hideBorders : true,
			plain : true,
			maximizable : true,
			layout : 'fit',
			autoScroll : false,
			border : false,
			bodyBorder : false,
			frame : true,
			modal : true,
			pinned : true,
			bodyStyle : 'background-color: #ffffff;'
		}
		Ext.apply(cfg,userCfg)
		var win = new Ext.Window(cfg)
		win.add(p)
		win.show()
		return win
	},
	//Thanks: http://www.experts-exchange.com/Programming/Languages/Scripting/JavaScript/Q_22901430.html
	insertAtCurrentPosition : function(value, dest) {
	    /* for Internet Explorer */
	    if (document.selection) {
	        dest.focus();
	        var sel = document.selection.createRange();
	        sel.text = value;
	    }
	    /* for Mozilla */
	    else if (dest.selectionStart || dest.selectionStart == '0') {
	        var startPos = dest.selectionStart;
	        var endPos = dest.selectionEnd;
	        dest.value = dest.value.substring(0, startPos)
	            + value
	            + dest.value.substring(endPos, dest.value.length);
	    } else {
	        dest.value += value;
	    }
        dest.focus();
	},
    //下拉框：用py选择，显示name,返回值name
    //@config {String} fieldLabel
    //@config {String} hiddenName
    //@config {String} data 
    //@config {String/Number} value (可选)
    //@config {Number} width (可选)
    //@config {Number} labelWidth (可选)
    //@config {String} itemFld （可选，布局中嵌套在右边的字段定义）
    //@config {Object} listeners（可选）
    //@config {Object} items（可选）
    getLocalNamePyComboDefinition : function(config) {
        var tpl = '<div class="x-combo-list-item"><div style="position: absolute;left: 0;">{name}</div><div style="position: relative;left: 150;">{py}</div></div>';
        var combo = {
            xtype : 'combo',
            fieldLabel : config.fieldLabel,
            hiddenName : config.hiddenName,
            store : new Ext.data.SimpleStore( {
                fields : ['name', 'py'],
                data : config.data
            }),
            width : 110,
            displayField : 'name',
            searchField : 'py',
            forceSelection : true,
            valueField : 'name',
            typeAhead : false,
            mode : 'local',
            triggerAction : 'all',
            selectOnFocus : false,
            resizable : true,
            editable : true, //必须为true, 否则没有搜索的效果
            listWidth : 200,
            tpl : divo.t1+tpl+divo.t2
        }
        if (config.itemFld!=undefined) {
            combo.items = [config.itemFld]
        }
        if (config.listeners!=undefined) {
            combo.listeners = config.listeners
        }
        if (config.labelWidth!=undefined) {
            combo.labelWidth = config.labelWidth
        }
        if (config.width!=undefined) {
            combo.width = config.width
        }
        if (config.value!=undefined) {
            combo.value = config.value
        }
        if (config.items!=undefined) {
            combo.items = config.items
        }
        return combo
    },
    //下拉框：用py选择，显示name,返回值code
    //@config {String} fieldLabel
    //@config {String} hiddenName
    //@config {String} data 
    //@config {String} id 
    //@config {String/Number} value (可选)
    //@config {Number} width (可选)
    //@config {Number} labelWidth (可选)
    //@config {Object} itemFld （可选，布局中嵌套在右边的字段定义）
    //@config {Object} listeners（可选）
    //@config {Object} items（可选）
    getLocalCodeNamePyComboDefinition : function(config) {
        var tpl = '<div class="x-combo-list-item"><div style="position: absolute;left: 0;">{name}</div><div style="position: relative;left: 150;">{py}</div></div>';
        var combo = {
            xtype : 'combo',
            fieldLabel : config.fieldLabel,
            id : config.id,
            hiddenName : config.hiddenName,
            store : new Ext.data.SimpleStore( {
                fields : ['code','name', 'py'],
                data : config.data
            }),
            width : 110,
            displayField : 'name',
            searchField : 'py',
            forceSelection : true,
            valueField : 'code',
            typeAhead : false,
            mode : 'local',
            triggerAction : 'all',
            selectOnFocus : false,
            resizable : true,
            editable : true, //必须为true, 否则没有搜索的效果
            listWidth : 200,
            tpl : divo.t1+tpl+divo.t2
        }
        if (config.itemFld!=undefined) {
            combo.items = [config.itemFld]
        }
        if (config.listeners!=undefined) {
            combo.listeners = config.listeners
        }
        if (config.labelWidth!=undefined) {
            combo.labelWidth = config.labelWidth
        }
        if (config.width!=undefined) {
            combo.width = config.width
        }
        if (config.value!=undefined) {
            combo.value = config.value
        }
        if (config.items!=undefined) {
            combo.items = config.items
        }
        return combo
    },
	//客户端日志输出（只支持FireBug, 传递参数个数没有限制)
	log : function() {
		if (Ext.isIE) return
		if(console) console.log.apply(console, arguments);
	},
    //将数值四舍五入(保留2位小数)后格式化成金额形式
    //Thanks: http://blog.chinaunix.net/u1/37105/showart_446695.html
    money : function(num){
        if (num==null) return ""
        var strnum = num+""
        var sign = strnum.startsWith("-")
        num = Math.abs(num)
        num = num.toString().replace(/\$|\,/g,'');
        if(isNaN(num))
            num = "0";
        num = Math.floor(num*100+0.50000000001);
        var cents = num%100;
        num = Math.floor(num/100).toString();
        if(cents<10)
            cents = "0" + cents;
        for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
            num = num.substring(0,num.length-(4*i+3))+','+num.substring(num.length-(4*i+3));
            
        return (((!sign)?'':'-') + num + '.' + cents);
    },
    //将数量后面多余的小数0去掉
    amount : function(num) {
        //alert("0="+amount("0.0000"))
        //alert("1.22="+amount("1.22"))
        //alert("1.22="+amount("1.220"))
        //alert("1.22="+amount("1.2200"))
        //alert("1.22="+amount("1.22000"))
        //alert("1.2="+amount("1.2"))
        //alert("1.2="+amount("1.20"))
        //alert("1.2="+amount("1.200"))
        //alert("1.2="+amount("1.2000"))
        //alert("1="+amount("1.0000"))
        //alert("1.0001="+amount("1.0001"))
        //alert("0.0001="+amount("0.0001"))
        if(num==null) return ""
        var strnum = num+""
        var pos = strnum.indexOf(".")
        if(pos<0) return strnum
        var num2 = strnum.substr(pos)  //1.22 返回类似 .22
        var ss = ""
        for (var i = num2.length-1; i > 0; i--) {
            if(num2[i]!='0') {
                ss = num2.substring(0,i+1)
                break
            }
        }
        return strnum.replace(num2,ss)
    },
    //在屏幕顶部显示会自动消失的提示信息
    say :  function(title, text, timeout, classname, sound) {
        if (typeof text == 'undefined') {
            text = title
            title = "提示：" 
        }
        if (typeof timeout == 'undefined') timeout = 3;
        if (!classname) classname = "msg";
    
        var box = ['<div class="' + classname + '" title="点击移除">',
                '<div class="og-box-tl"><div class="og-box-tr"><div class="og-box-tc"></div></div></div>',
                '<div class="og-box-ml"><div class="og-box-mr"><div class="og-box-mc"><h3>{0}</h3><p>{1}</p>',
                '</div></div></div>',
                '<div class="og-box-bl"><div class="og-box-br"><div class="og-box-bc"></div></div></div>',
                '</div>'].join('');
        
        if( !this.msgCt){
            this.msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
        }
        //  this.msgCt.alignTo(document, 't-t');
        var m = Ext.DomHelper.append(this.msgCt, {html:String.format(box, title, text.replace(/([^>])\n/g, '$1<br/>\n'))}, true);
        Ext.get(m).on('click', function() {
            if (timeout > 0) {
                this.setStyle('display', 'none');
            } else {
                this.remove();
            }
        });
        if (timeout > 0) {
            m.slideIn('t').pause(timeout).ghost("t", {remove:true});
        } else {
            m.slideIn('t');
        }
    },
    err: function(text){
        var errors = Ext.query("div.err");
        var maxErrors = 2;
        for (var i = 0; i < errors.length - maxErrors + 1; i++) {
            Ext.fly(errors[i]).remove();
        }
        divo.say("错误：", text, 10, "err");
    },
	//用文字方式表达时间
	getTimeText : function(v) {
		if (!v || v.length < 18)
			return "";
		var d = Date.parseDate(v, 'Y-m-d H:i:s');
		var m = d.getElapsed();
		var minutes = Math.floor(m / 1000 / 60);
		var seconds = Math.floor(m / 1000) % 60;
		var hours = Math.floor(m / 1000 / 60 / 60);
		var days = Math.floor(m / 1000 / 60 / 60 / 24);
		var time = "";
		if (days > 30)
			time = v.substring(0, 10);
		else if (days > 0)
			time = days + '天前';
		else if (hours > 0)
			time = hours + '小时前';
		else if (minutes > 0)
			time = minutes + '分钟前';
		else
			time = seconds + '秒前';
		return time;
	}
})

// EOP
