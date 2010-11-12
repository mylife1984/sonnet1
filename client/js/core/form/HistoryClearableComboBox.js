// Thanks: http://extjs.com/forum/showthread.php?t=12030
Ext.namespace("Ext.ux.form");

Ext.ux.form.HistoryClearableComboBox = Ext.extend(Ext.form.ComboBox, {
	displayField : 'query',
	typeAhead : false,
	mode : 'local',
	triggerAction : 'all',
	maxInHistory : 10,
	save2ServerSide : false,
	save2Local : false,
	saveId : null,
	saveSplitChar : 'zzz',
	rememberOn : 'enter',  //可取值 'all'（输入即保存）,'blur'（光标离开后再保存）,'enter'（回车后再保存）
	hideTrigger : false,
	hideComboTrigger : false,
	hideClearTrigger : false,
	// private
	initComponent : function(){
        Ext.ux.form.HistoryClearableComboBox.superclass.initComponent.call(this);
        
		this.addEvents( {
			'change' : true,
			'clearvalue' : true
		});
	
		this.store = new Ext.data.SimpleStore( {
			fields : ['query'],
			data : []
		});
	
		this.historyRecord = Ext.data.Record.create([{
			name : 'query',
			type : 'string'
		}]);

		this.triggerConfig = {
			tag : 'span',
			cls : 'x-form-twin-triggers',
			style : 'padding-right:2px', // padding needed to prevent IE from
			// clipping 2nd trigger button
			cn : [ {
				tag : "img",
				src : Ext.BLANK_IMAGE_URL,
				cls : "x-form-trigger",
				style : this.hideComboTrigger ? "display:none" : ""
			}, {
				tag : "img",
				src : Ext.BLANK_IMAGE_URL,
				cls : "x-form-trigger x-form-clear-trigger",
				style : this.hideClearTrigger ? "display:none" : ""
			}]
		};
        
	},
	restoreEncodedData : function(result) {
		if (result) {
			var data = result.split(this.saveSplitChar)
			for (var i = 0; i < data.length; i++) {
				if (data[i]) {
					var vr = new this.historyRecord( {
						query : data[i]
					});
					this.store.insert(0, vr)
				}
			}
		}	
	},
	getTrigger : function(index) {
		return this.triggers[index];
	},
	initTrigger : function() {
		var ts = this.trigger.select('.x-form-trigger', true);
		this.wrap.setStyle('overflow', 'hidden');
		var triggerField = this;
		ts.each(function(t, all, index) {
			t.hide = function() {
				var w = triggerField.wrap.getWidth();
				this.dom.style.display = 'none';
				triggerField.el.setWidth(w - triggerField.trigger.getWidth());
			};
			t.show = function() {
				var w = triggerField.wrap.getWidth();
				this.dom.style.display = '';
				triggerField.el.setWidth(w - triggerField.trigger.getWidth());
			};
			var triggerIndex = 'Trigger' + (index + 1);

			if (this['hide' + triggerIndex]) {
				t.dom.style.display = 'none';
			}
			t.on("click", this['on' + triggerIndex + 'Click'], this, {
				preventDefault : true
			});
			t.addClassOnOver('x-form-trigger-over');
			t.addClassOnClick('x-form-trigger-click');
		}, this);
		this.triggers = ts.elements;
	},
	onTrigger1Click : function() {
		this.onTriggerClick()
	}, // pass to original combobox trigger handler
	onTrigger2Click : function() {
		this.reset();
		this.fireEvent('clearvalue', this);
		this.clearHistory()
	}, // clear contents of combobox
	afterRender : function(ct) {
		Ext.ux.form.HistoryClearableComboBox.superclass.afterRender.call(this)
		
		var f = function() {
			if (this.save2ServerSide) {
				var result
				divo.restoreProfile(function(retValue) {
				   result = retValue
				},divo.getUserId(), this.saveId || this.name+'-history')
				if (result)
					this.restoreEncodedData(result.msgValue)
			} 
			if (this.save2Local) {
				this.restoreEncodedData(divo.find(this.saveId || this.name+'-history'))
			}
		}
		f.defer(100,this) //避免时间过长引起其他器件不能渲染
	},
	initEvents : function() {
		Ext.ux.form.HistoryClearableComboBox.superclass.initEvents.call(this);
		if (this.rememberOn=="blur")
			this.el.on("blur", this.onHistoryKeyUp, this);
		else	
			this.el.on("keyup", this.onHistoryKeyUp, this);
	},
	historyChange : function(value) {
		var value = this.getValue().replace(/^\s+|\s+$/g, "");
		if (value.length == 0)
			return;
		this.store.clearFilter();
		var vr_insert = true;
		if (this.rememberOn == "all") {
			this.store.each(function(r) {
				if (r.data['query'].indexOf(value) == 0) {
					// backspace
					vr_insert = false;
					return false;
				} else if (value.indexOf(r.data['query']) == 0) {
					// forward typing
					this.store.remove(r);
				}
			});
		}
		if (vr_insert == true) {
			this.store.each(function(r) {
				if (r.data['query'] == value) {
					vr_insert = false;
				}
			});
		}
		if (vr_insert == true) {
			var vr = new this.historyRecord( {
				query : value
			});
			this.store.insert(0, vr)
		}
		var ss_max = this.maxInHistory;
		if (this.store.getCount() > ss_max) {
			var ssc = this.store.getCount();
			var overflow = this.store.getRange(ssc - (ssc - ss_max), ssc);
			for (var i = 0;i < overflow.length; i++) {
				this.store.remove(overflow[i]);
			}
		}
		this.saveHistory();
	},
    getStoreEncodedData : function() {
		var v = ""
		var sc = this.saveSplitChar
		this.store.each(function(r) {
			if (r.data['query'])
				v += r.data['query']+sc
		})
		return v
    },
	onHistoryKeyUp : function(e) {
		if ((this.rememberOn == "enter" && e.getKey() == 13) || 
		     this.rememberOn == "all" ||
		     this.rememberOn == "blur") {
			this.historyChange(this.getValue());
			this.fireEvent('change', this.getValue());
		}
	},
	setValue : function(v) {
		Ext.ux.form.HistoryClearableComboBox.superclass.setValue.call(this,	v);
		this.fireEvent('change', this.getValue());
	},
	clearValue : function() {
		this.setValue("")
	},
	saveHistory : function() {
		if (this.save2ServerSide) {
			var v = this.getStoreEncodedData()
			divo.saveProfileAsync({
				userId : this.getUserId(),
				msgCode : this.saveId || this.name+'-history',
				msgValue : v?v.substr(0,v.length-this.saveSplitChar.length):v
			})
		}
		if (this.save2Local) {
			var v = this.getStoreEncodedData()
			divo.save(this.saveId || this.name+'-history',v)
		}	
	},
	clearHistory : function() {
		this.store.removeAll()
        this.saveHistory()
	}
});

Ext.reg('historycombo', Ext.ux.form.HistoryClearableComboBox);

// EOP
