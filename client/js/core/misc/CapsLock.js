/**
 * 检测并提示大写状态 
 * Thanks: http://17thdegree.com/wp/capslock.html
 */
divo.utils.CapsLock = function() {
	return {
		init : function() {
			var id = Ext.id();
			this.alertBox = Ext.DomHelper.append(document.body, {
				tag : 'div',
				style : 'width:10em',
				children : [{
					tag : 'div',
					style : 'text-align: center; background-color: black;color: white;',
					html : '现在是字母大写状态',
					id : id
				}]
			}, true);
			Ext.fly(id).boxWrap();
			this.alertBox.hide();

			var pwds = Ext.query("INPUT[type='password']");
			for (var i = 0;i < pwds.length; i++) {
				Ext.get(pwds[i].id)
						.on(
								'keypress',
								this.keypress.createDelegate(this, pwds[i],
										true), this);
			}
		},
		keypress : function(e, el) {
			var charCode = e.getCharCode();
			if ((e.shiftKey && charCode >= 97 && charCode <= 122)
					|| (!e.shiftKey && charCode >= 65 && charCode <= 90)) {
				this.showWarning(el);
			} else {
				this.hideWarning();
			}
		},
		showWarning : function(el) {
			var x = Ext.fly(el).getX();
			var width = Ext.fly(el).getWidth();
			var y = Ext.fly(el).getY();

			this.alertBox.setXY([x + width + 100, y]);
			this.alertBox.show();
		},
		hideWarning : function() {
			this.alertBox.hide();
		}
	}
	
}()
//EOP
	