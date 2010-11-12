/**
 * 登录
 * 
 * --------------------------------------------------------------
 * 消息：
 * 登录成功，显示主页
 * 
 * 消息名：                 
 * j.showHome    
 * 
 * 消息内容：
 * 无
 * --------------------------------------------------------------
*/
divo.home.Login = function() {
    var user_remember = divo.utils.base64.encode("user_remember")
    var user_loginName = divo.utils.base64.encode("user_loginName")
    var user_password  = divo.utils.base64.encode("user_password")
    var authToken = divo.utils.base64.encode("token")
    var authKey = divo.AUTH_KEY;
    
    return {
        loginUrl : '/login',
        //Thanks: http://www.netlobo.com/url_query_string_javascript.html
        gup : function( name )
        {
          name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
          var regexS = "[\\?&]"+name+"=([^&#]*)";
          var regex = new RegExp( regexS );
          var results = regex.exec( window.location.href );
          if( results == null )
            return "";
          else
            return divo.utils.base64.decode(results[1]);
        },
        loginFormConfig : {
            labelAlign : 'right',
            labelWidth : 75,
            frame : false,
            defaultType : 'textfield',
            //cls          : 'x-small-editor login-window-formPanel',
            items : [new divo.form.FormIntro({
                style   : 'margin:10px 15px 0 10px;', //上 右 下 左
                label   : "登录",
                text    : "请输入您的用户名和密码，然后直接回车，或点击登录按钮。"
            }),{
                xtype : 'spacer',
                height : 12
            },{
                fieldLabel : '用户名',
                name : 'username',
                tabIndex : 1,
                width : 180
            }, {
                fieldLabel : '密码',
                name : 'password',
                tabIndex : 2,
                inputType : 'password',
                width : 180
            },{
                xtype : 'checkbox',
                name : 'isPersistent',
                boxLabel: '下次自动登录',
                labelSeparator: '',
                listener : {
                    check : this.onRememberCheck,
                    scope : this
                }
            },{
                xtype : 'spacer',
                height : 12
            }]
        },
        init : function() {
            var urls = location.href.split("/")
            var qs = urls[urls.length-1]
            if (qs.indexOf("username")>0) {
                this.autoLogin(this.gup('username'),this.gup('password'))
                return
            } //通过url后自动登录
            var mem = divo.find(user_remember)
            if (mem && mem == "1") {
                this.autoLogin()
                return
            } //自动登录
            this.removeLoading()
            
            this.loginForm = new Ext.form.FormPanel(this.loginFormConfig)
            this.loginWindow = new Ext.Window({
                cls : 'login-window',               
                closable : false,
                closeAction : 'hide',
                autoWidth : false,
                width : 490,
                height : 250,
                modal : false,
                constrain : true,
                resizable : false,
                draggable : false,
                items : [{
                    xtype  :'box',
                    cls    : 'login-window-softwareLabel',
                    autoEl : {
                        tag  : 'div',
                        html : divo.appContext.productName
                }}, this.loginForm],
                buttons : [{
                        text : '登录',
                        scope : this,
                        handler : this.loginHandler
                }],
                keys : {
                    key : Ext.EventObject.ENTER,
                    fn : this.loginHandler,
                    scope : this
            }})

            this.loginWindow.on('show', function() {
                this.loginForm.find('name', 'username')[0].focus(true, 100)
            }, this)

            this.loginWindow.on('close', function() {
                this.loginForm.getForm().reset()
            }, this)

            this.loginForm.getForm().clearInvalid()
            this.loginWindow.show()
            
            this.loginForm.find('name', 'isPersistent')[0].setValue(false)
            divo.utils.CapsLock.init()
        },
        onRememberCheck : function(o, checked) {
            checked || divo.home.clearRememberUserInfo()
        },
        loginHandler :function() {
            this.addMask()
            var username = this.loginForm.find('name', 'username')[0].getValue().trim()
            var password = this.loginForm.find('name', 'password')[0].getValue()
            var remember = this.loginForm.find('name', 'isPersistent')[0].getValue()
            var up = divo.utils.base64.encode(username + ':'+ password)
            
            Ext.Ajax.request({
                scope : this,
                url : this.loginUrl,
                method : 'GET',
                headers : {
                    Authorization : up
                },
                success : function(response, options) {
                    var resp = Ext.decode(response.responseText)
                    if (!resp.success) {
                        this.unmask()
                        alert(resp.errors.reason)
                        return
                    }
                    Ext.Ajax.defaultHeaders.Authorization = up
                    //Ext.getBody().removeClass('startup-body')
                    this.loginWindow.hide()
                    this.loginForm.getForm().reset() //防止密码泄露

                    divo.save(user_remember, remember ? "1" : "0")
                    if (remember) {
                        divo.save(user_loginName, divo.utils.base64.encode(username))
                        divo.save(user_password, divo.utils.base64.encode(password))
                    } else {
                        divo.home.clearRememberUserInfo()
                    }
                    divo.save(authToken,resp.authToken)
                    divo.save(authKey,up)
                    
                    if (!resp.passwordChanged) {
                        this.unmask()
                        var win = new divo.home.ChangePasswordWindow({
                            userId:resp.id,
                            userName:resp.name,
                            userFullName:resp.fullName,
                            passwordTimeout : resp.passwordTimeout,
                            firstChangePassword : true
                        })
                        win.show()
                        return
                    }
                    divo.publish("j.showHomepage",{
                        userId : resp.id,
                        userName : resp.name
                    })
                },
                failure : function(response, options) {
                    this.unmask()
                    divo.showError(response.responseText)
                    this.loginForm.find('name', 'password')[0].focus(true)
                }
            }) //Ext.Ajax.request
        }, //loginHandler
        autoLogin : function(u,p) {
            //Ext.getBody().removeClass('startup-body')
            if (!u) {
                var username = divo.utils.base64.decode(divo.find(user_loginName))
                var password = divo.utils.base64.decode(divo.find(user_password))
                var up = divo.utils.base64.encode(username + ':'+ password)
            } else {
                var up = divo.utils.base64.encode(u + ':'+ p)
            }

            Ext.Ajax.request({
                scope : this,
                url : this.loginUrl,
                method : 'GET',
                headers : {
                    Authorization : up
                },
                success : function(response, options) {
                    var resp = Ext.decode(response.responseText)
                    if (!resp.success || !resp.passwordChanged) {
                        divo.home.clearRememberUserInfo()
                        location.reload(false)
                        return
                    }
                    divo.save(authToken,resp.authToken)
                    divo.save(authKey,up)
                    
                    this.addMask()
                    divo.publish("j.showHomepage",{
                        userId : resp.id,
                        userName : resp.name
                    })
                },
                failure : function(response, options) {
                    this.unmask()
                    divo.showError(response.responseText)
                    divo.home.clearRememberUserInfo()
                    location.reload(false)
                }
            })
        },
        removeLoading : function() {
            Ext.get('loading').setStyle('display', 'none')
        },
        addMask : function() {
            Ext.get('loading-info').update("“上海市消防中队战备执勤信息管理系统”正在登录...")
            Ext.get('loading').setStyle('display', 'block') 
        },
        unmask : function() {
            this.removeLoading()
        }
    }
}()
// EOP
