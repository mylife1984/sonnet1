/**
 * 配置ExtJS组件
 */
Ext.BLANK_IMAGE_URL = "/media/js/ext/resources/images/default/s.gif";

Ext.QuickTips.init()
Ext.apply(Ext.QuickTips.getQuickTip(), {
	showDelay : 250,
	hideDelay : 300,
	dismissDelay : 0
}); // don't automatically hide quicktip

Ext.form.Field.prototype.msgTarget = 'under'

Ext.Ajax.defaultHeaders = {
	'accept' : 'application/json'
};
Ext.lib.Ajax.defaultPostHeader = 'application/json';

Ext.Msg.minWidth = 200;

//Thanks: http://extjs.com/forum/showthread.php?p=167921
Ext.TabPanel.prototype.layoutOnTabChange = true; 

//Thanks: http://extjs.com/forum/showthread.php?t=8051
Ext.Ajax.timeout = 300000

//Thanks: http://extjs.com/forum/showthread.php?t=54549
//Enter2tab:todo: 文本区域中按回车键，要能插入换行！
//new Ext.KeyMap(document, {
//    key: Ext.EventObject.ENTER,
//    fn: function(k,e){
//        var l, i, f, j, o = e.target;
//        if (o.form && o.type!="textarea") {
//	        for(i = l = (f = o.form.elements).length; f[--i] != o;);
// 	            for(j = i; (j = (j + 1) % l) != i && (!f[j].type || f[j].disabled || f[j].readOnly || f[j].type.toLowerCase() == "hidden"););
//	               e.preventDefault();
//	               try {
//	               	  j != i && f[j].focus();
//	               } catch(e) {}
//        }
//    }
//});
new Ext.KeyMap(document, {
	key : Ext.EventObject.ENTER,
	fn : function(k, e) {
		var o = e.target
		if (!o.form || o.type == "textarea")
			return
			
		var l, i, f, j	
		f = o.form.elements	
		l = f.length
	    for (i = f.length-1; f[i] != o; i--) //让 f[i] = o (也就是找到当前元素所在位置）
		
//				for (j = i; (j = (j + 1) % l) != i
//						&& (!f[j].type || f[j].disabled || f[j].readOnly || f[j].type
//								.toLowerCase() == "hidden");
//						);
		//j = i
	    
		e.preventDefault();
		try {
			o = f[++i] 
			while (!o.type || o.type.toLowerCase() == "hidden" || o.disabled || o.readOnly)
			    o = f[++i] //如combo中加了【hiddenName : 'mc_code'】后，要跳过
			    
			o.focus();
		} catch (e) {
		}
	}
});


//EOP
