// the namespace
Ext.namespace("Ext.ux.DataView");

/**
 * a Ext.ux.DataView Plugin which imitates the famous LightBox in ExtJS style it
 * opens a window, provides back and forward buttons for cycling through images
 * 
 * it uses 2 different methods of showing the window...gecko browsers simply
 * reloads the image src, and syncs the window size so it fits
 * 
 * all other browser need the destroy the window, and create a new one
 * 
 * @author caziel
 * @copyright 2008
 * @license GPL
 * @namespace Ext.ux.DataView
 * @version 0.1
 * @see http://extjs.com/deploy/dev/examples/view/data-view.html
 *      @example
 *      http://extjs-ux.org/repo/authors/caziel/trunk/Ext/ux/DataView/LightBox/examples/
 * 
 * @param {Object}
 *            cfg overrides default window config
 * @extends {Ext.ux}
 *          -------------------------------------------------------------- 消息：
 *          选择了某个节点
 * 
 * 消息名： Ext.ux.DataView.LightBox.NodeSelect<本组件Id>
 * 
 * 消息内容： {String} sender 本器件的id值 {Number} index 节点index {Object} view
 * --------------------------------------------------------------
 */
Ext.ux.DataView.LightBox = function(cfg) {

	/**
	 * the window config
	 * 
	 * @private
	 * @type {Object}
	 */
	var cfg = cfg || {};

	/**
	 * the DataView
	 * 
	 * @private
	 * @type {Ext.DataView}
	 */
	var view;

	/**
	 * the LightBox Window
	 * 
	 * @private
	 * @type {Ext.Window}
	 */
	var win;

	/**
	 * the current image record
	 * 
	 * @private
	 * @type {Ext.data.Record}
	 */
	var rec;

	/**
	 * the current index
	 * 
	 * @private
	 * @type {int}
	 */
	var index;

	/**
	 * the init function for starting the plugin
	 * 
	 * @param {Ext.DataView}
	 *            dataView the DataView
	 * @return {void}
	 */
	this.init = function(dataView) {
		view = dataView;
		view.on('click', onDblClick, this); // 原来为dblclick
	};

	/**
	 * the double Click Event Handler
	 * 
	 * @private
	 * @param {Ext.DataView}
	 *            view
	 * @param {int}
	 *            index
	 * @param {Ext.data.Node}
	 *            node
	 * @param {Ext.EventObject}
	 *            e
	 * @return {void}
	 */
	function onDblClick(view, ind, node, e) {
		index = ind;
		rec = view.getRecord(view.getNode(index));

		if (cfg.id)
			divo.publish("Ext.ux.DataView.LightBox.NodeSelect" + cfg.id, {
						sender : cfg.id,
						index : index,
						view : view
					})
		var config = { // the default window config
			modal : true,
			hideBorders : true,
			border : false,
			layout : 'fit',
			resizable : false,
			draggable : true,
			bodyBorder : false,
			//autoScroll : true,
			//maximizable : true, 最大化后下方多出一横条
			title : rec ? rec.data.name + " [" + (index + 1) + " of "
					+ view.store.getCount() + "]" : '',
			items : [{
				autoScroll : true,
			    html : "<img id='divo-lightbox-image' src='"+(rec ? rec.data.url : '')+"'/>"
			}],
			bbar : new Ext.Toolbar({
						cls : 'go-paging-tb',
						items : [{
									xtype : 'tbbutton',
									icon : cfg.prevImage,
									iconCls : 'blist',
									id : 'prev_btn',
									text : "<span>上一张&nbsp;&nbsp;</span>",
									hidden : view.getNode(index - 1)
											? false
											: true,
									scope : this,
									handler : prevAction
								}, {
									xtype : 'tbfill'
								}, {
									xtype : 'tbbutton',
									id : 'next_btn',
									text : "<span>下一张&nbsp;&nbsp;</span>",
									iconCls : 'blist',
									icon : cfg.nextImage,
									scope : this,
									hidden : view.getNode(index + 1)
											? false
											: true,
									handler : nextAction
								}]
					}),
			keys : [{
						key : Ext.EventObject.LEFT,
						fn : prevAction,
						scope : this
					}, {
						key : Ext.EventObject.RIGHT,
						fn : nextAction,
						scope : this
					}],
			listeners : {
				"render" : function() {
					this.setSize( Ext.getBody().getSize().width - 100, Ext.getBody().getSize().height - 100);
				}
			}
		};
		win = new Ext.Window(config);
		win.show();
		if (Ext.isGecko) {
			// set the title
			win.setTitle(rec.data.name + " [第" + (index + 1) + "张 共"
					+ view.store.getCount() + "张]");

			// disable/enable previous/next buttons
			view.getNode(index - 1)
					? Ext.ComponentMgr.get('prev_btn').show()
					: Ext.ComponentMgr.get('prev_btn').hide();
			view.getNode(index + 1)
					? Ext.ComponentMgr.get('next_btn').show()
					: Ext.ComponentMgr.get('next_btn').hide();

			// change selection
			Ext.each(view.getSelectedNodes(), function(e) {
						view.deselect(e);
					}, this);
			view.select(index);

			if (cfg.id)
				divo.publish("Ext.ux.DataView.LightBox.NodeSelect" + cfg.id, {
							sender : cfg.id,
							index : index,
							view : view
						})

			Ext.get('divo-lightbox-image').dom.src = rec.data.url;		
			win.center();
		}
	};

	/**
	 * returns the current record
	 * 
	 * @return {Ext.data.Record}
	 */
	this.getRecord = function() {
		return rec;
	}

	/**
	 * returns the current index
	 * 
	 * @return {int}
	 */
	this.getIndex = function() {
		return index;
	}

	/**
	 * returns the view
	 * 
	 * @return {Ext.DataView}
	 */
	this.getView = function() {
		return view;
	}

	/**
	 * returns the window
	 * 
	 * @return {Ext.Window}
	 */
	this.getWindow = function() {
		return win;
	}

	/**
	 * loads an image into the window
	 * 
	 * @private
	 * @return {void}
	 */
	loadImage = function() {
		// set the title
		win.setTitle(rec.data.name + " [第" + (index + 1) + "张 共"
				+ view.store.getCount() + "张]");

		// disable/enable previous/next buttons
		view.getNode(index - 1)
				? Ext.ComponentMgr.get('prev_btn').show()
				: Ext.ComponentMgr.get('prev_btn').hide();
		view.getNode(index + 1)
				? Ext.ComponentMgr.get('next_btn').show()
				: Ext.ComponentMgr.get('next_btn').hide();

		// change selection
		Ext.each(view.getSelectedNodes(), function(e) {
					view.deselect(e);
				}, this);
		view.select(index);

		if (cfg.id)
			divo.publish("Ext.ux.DataView.LightBox.NodeSelect" + cfg.id, {
						sender : cfg.id,
						index : index,
						view : view
					})

		Ext.get('divo-lightbox-image').dom.src = rec.data.url;
		win.center();
	}

	/**
	 * the action to show the previous image
	 * 
	 * @private
	 * @return {void}
	 */
	prevAction = function() {
		index = index - 1;
		rec = view.getRecord(view.getNode(index));
		loadImage();
	}

	/**
	 * the action to show the next image
	 * 
	 * @private
	 * @return {void}
	 */
	nextAction = function() {
		index = index + 1;
		rec = view.getRecord(view.getNode(index));
		loadImage();
	}

	/**
	 * generate the LighBox Window on the fly
	 * 
	 * @private
	 * @param {int}
	 *            ind
	 * @return {void}
	 */
	showWindow = function() {
		var config = { 
			modal : true,
			hideBorders : true,
			border : false,
			layout : 'fit',
			resizable : false,
			draggable : true,
			bodyBorder : false,
			//autoScroll : true,
			//maximizable : true,最大化后下方多出一横条
			title : rec ? rec.data.name + " [" + (index + 1) + " of "
					+ view.store.getCount() + "]" : '',
			items : [{
				autoScroll : true,
			    html : "<img id='divo-lightbox-image' src='"+(rec ? rec.data.url : '')+"'/>"
			}],
			bbar : new Ext.Toolbar({
						cls : 'go-paging-tb',
						items : [{
									xtype : 'tbbutton',
									icon : cfg.prevImage,
									iconCls : 'blist',
									id : 'prev_btn',
									text : "<span>上一张&nbsp;&nbsp;</span>",
									hidden : view.getNode(index - 1)
											? false
											: true,
									scope : this,
									handler : prevAction
								}, {
									xtype : 'tbfill'
								}, {
									xtype : 'tbbutton',
									id : 'next_btn',
									text : "<span>下一张&nbsp;&nbsp;</span>",
									iconCls : 'blist',
									icon : cfg.nextImage,
									scope : this,
									hidden : view.getNode(index + 1)
											? false
											: true,
									handler : nextAction
								}]
					}),
			keys : [{
						key : Ext.EventObject.LEFT,
						fn : prevAction,
						scope : this
					}, {
						key : Ext.EventObject.RIGHT,
						fn : nextAction,
						scope : this
					}],
			listeners : {
				"render" : function() {
					this.setSize(Ext.getBody().getSize().width - 100, Ext.getBody().getSize().height - 100);
				},
				scope: this
			}
		};

		win = new Ext.Window(config);
		win.show();
	};
};