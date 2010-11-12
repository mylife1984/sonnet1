/*
 * Ext.ux.grid.AutoRefresher
 * 
 * Refresh a grid every x minutes
 */
Ext.ux.grid.AutoRefresher = function(config) {
	Ext.apply(this, config);
};
Ext.extend(Ext.ux.grid.AutoRefresher, Ext.util.Observable, {
	/**
	 * @cfg {Array} intervals
	 * List of refresh intervals (as minutes) to populate the comboBox with
	 */
	intervals : [[1], [5], [10], [15], [30], [60]],
	/**
	 * @cfg {integer} interval
	 * default value
	 */
	interval : 1,
	/**
	 * @cfg {String} beforeText
	 * Text to display before the comboBox
	 */
	beforeText : '刷新间隔',
	/**
	 * @cfg {String} afterText
	 * Text to display after the comboBox
	 */
	afterText : '分钟',
	/**
	 * @cfg {Mixed} addBefore
	 * Toolbar item(s) to add before the PageSizer
	 */
	addBefore : '-',
	/**
	 * @cfg {Mixed} addAfter
	 * Toolbar item(s) to be added after the PageSizer
	 */
	addAfter : null,
	init : function(Toolbar) {
		this.Toolbar = Toolbar;
		if (Toolbar.store) {
			this.store = Toolbar.store
		}
		Toolbar.on("render", this.onRender, this);

		this.store.startAutoRefresh = function(interval) {
			if (this.autoRefreshProcId) {
				clearInterval(this.autoRefreshProcId);
			}
			this.autoRefreshProcId = setInterval(this.reload
							.createDelegate(this, [{}]), interval * 1000);
		}
		this.store.stopAutoRefresh = function() {
			if (this.autoRefreshProcId) {
				clearInterval(this.autoRefreshProcId);
			}
		}
	},
	update : function(c) {
		var value = c.getValue();
		if (value > 0) {
			this.store.startAutoRefresh(value * 60);
		} else {
			this.store.stopAutoRefresh();
		}
	},
	onRender : function() {
		// this.intervals.unshift(['']); //add a 'never' value
		var config = {
			maskRe : /^d*$/,
			store : new Ext.data.SimpleStore({
						fields : ['autoRefresh'],
						data : this.intervals
					}),
			displayField : 'autoRefresh',
			typeAhead : true,
			mode : 'local',
			triggerAction : 'all',
			selectOnFocus : true,
			width : 50
		};
		Ext.apply(config, this.comboCfg)
		var combo = new Ext.form.ComboBox(config);
		combo.on("change", this.update, this);
		combo.on("select", this.update, this);
		if (this.addBefore) {
			this.Toolbar.add(this.addBefore)
		};
		this.Toolbar.add(this.beforeText, combo, this.afterText);
		if (this.addAfter) {
			this.Toolbar.add(this.addAfter)
		};
		combo.getEl().on('keydown', function(e) {
					var key = e.getKey();
					switch (key) {
						case Ext.EventObject.ENTER :
							this.update(combo);
					}
				}, this);
		combo.setValue(this.interval);
		if (this.interval > 0) {
			this.store.startAutoRefresh(this.interval * 60);
		} else {
			this.store.stopAutoRefresh();
		}
	}

});
//EOP
