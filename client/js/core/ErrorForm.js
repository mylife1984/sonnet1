/**
 * 显示后台完整的错误信息
 */
divo.ErrorForm = function() {

	return {

		show : function(_errorMsg,_errorType) {
			var errorMsg = _errorMsg?_errorMsg:'<br />无详细信息。</h3>'
			var m = new Ext.WindowGroup();
			m.zseed = 10000; //防止ExceptionDialog显示在窗口后面！
			
			var win = new divo.window.ExceptionDialog({
				manager : m,
				errorMsg : _errorType?_errorType+":<br/>":""+errorMsg	
			})				
			win.show()
		}

	} // return

}()

divo.showError = divo.ErrorForm.show

// EOP

