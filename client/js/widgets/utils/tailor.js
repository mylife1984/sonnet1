Ext.ns("utils")

utils.zd = function() {
  
  return {
  	//是否滚动
  	INDEX_ALLOW_ROLL : 'index.allow.roll',
  	CHART_ALLOW_ROLL : 'chart.allow.roll',
  	DATA_ALLOW_ROLL : 'data.allow.roll',
  	HONOR_ALLOW_ROLL : 'honor.allow.roll',
  	//滚动停留时间
  	INDEX_ROLL_TIME : 'index.roll.time',
  	CHART_ROLL_TIME : 'chart.roll.time',
  	DATA_ROLL_TIME : 'data.roll.time',
  	HONOR_ROLL_TIME : 'honor.roll.time',
  	//跳菜谱
  	RECIPE_ALLOW_JUMP : 'recipe.allow.jump',
  	RECIPE_JUMP_START_TIME : 'recipe.jump.start.time', 
  	RECIPE_JUMP_END_TIME : 'recipe.jump.end.time', 
  	//跳菜谱设置值
  	recipeJumpSetup : null,
  	//手工选择某个模块，而且本模块不滚动，则过了本间隔后会自动跳转到其他模块
  	stayInterval : 60, 
  	//获取跳菜谱的设置
  	getRecipeJumpSetup : function() {
  		var startTime = this.getSetupValue(this.RECIPE_JUMP_START_TIME)
  		if (!startTime) startTime = "11:00"

  		var endTime = this.getSetupValue(this.RECIPE_JUMP_END_TIME)
  		if (!endTime) endTime = "11:30"

  		return {
  			allowJump : this.getSetupValue(this.RECIPE_ALLOW_JUMP),
  			startTime : startTime,
  			endTime : endTime
  		}
  	},
  	//获取循环滚动设置
  	getRollSetup : function() {
  		//执勤动态
  		var indexAllowRoll = this.getSetupValue(this.INDEX_ALLOW_ROLL)
  		if(typeof(indexAllowRoll)=="string" && indexAllowRoll.length==0) indexAllowRoll = true  //默认值
  		var indexRollTime = this.getSetupValue(this.INDEX_ROLL_TIME)
  		if(!indexRollTime) indexRollTime = 10
  		
  		//辖区图示
  		var chartAllowRoll = this.getSetupValue(this.CHART_ALLOW_ROLL)
  		if(typeof(chartAllowRoll)=="string" && chartAllowRoll.length==0) chartAllowRoll = false  //默认值
  		var chartRollTime = this.getSetupValue(this.CHART_ROLL_TIME)
  		if(!chartRollTime) chartRollTime = 15

  		//装备数据
  		var dataAllowRoll = this.getSetupValue(this.DATA_ALLOW_ROLL)
  		if(typeof(dataAllowRoll)=="string" && dataAllowRoll.length==0) dataAllowRoll = false  //默认值
  		var dataRollTime = this.getSetupValue(this.DATA_ROLL_TIME)
  		if(!dataRollTime) dataRollTime = 10

  		//历史荣誉
  		var honorAllowRoll = this.getSetupValue(this.HONOR_ALLOW_ROLL)
  		if(typeof(honorAllowRoll)=="string" && honorAllowRoll.length==0) honorAllowRoll = false  //默认值
  		var honorRollTime = this.getSetupValue(this.HONOR_ROLL_TIME)
  		if(!honorRollTime) honorRollTime = 10

  		return {
  			indexAllowRoll : indexAllowRoll,
  			indexRollTime : indexRollTime,
  			chartAllowRoll : chartAllowRoll,
  			chartRollTime : chartRollTime,
  			dataAllowRoll : dataAllowRoll,
  			dataRollTime : dataRollTime,
  			honorAllowRoll : honorAllowRoll,
  			honorRollTime : honorRollTime
  		}
  	},
	//补上前导0
	numberPad : function(number, length) {
		var str = '' + number;
		while (str.length < length) {
			str = '0' + str;
		}
		return str;
	},
  	//自动跳菜谱
	recipeJump : function(place) {
		if(!this.recipeJumpSetup) {
			this.recipeJumpSetup = this.getRecipeJumpSetup()
		}
		if(!this.recipeJumpSetup.allowJump) return
		
		var d = new Date()
		var hh = this.numberPad(d.getHours(),2)
		var mm = this.numberPad(d.getMinutes(),2)
		var ss = this.numberPad(d.getSeconds(),2)
		
		//自动跳菜谱	
		var n = hh+":"+mm
		if(n==this.recipeJumpSetup.startTime && place!="recipe") {
			window.location.href = "/zd/recipe.html"
			return true
		}
        if(n==this.recipeJumpSetup.endTime && place!="index") {
            window.location.href = "/zd/index.html"
            return true
        }
        return false
	},
    //是否在显示菜谱期间
	remainInRecipe : function() {
        if(!this.recipeJumpSetup) {
            this.recipeJumpSetup = this.getRecipeJumpSetup()
        }
        if(!this.recipeJumpSetup.allowJump) return
        
        var d = new Date()
        var hh = this.numberPad(d.getHours(),2)
        var mm = this.numberPad(d.getMinutes(),2)
        var ss = this.numberPad(d.getSeconds(),2)
        
        var n = hh+":"+mm+ss
        return (n>=this.recipeJumpSetup.startTime+"00" && n<=this.recipeJumpSetup.endTime+"00")
    },
	//获取指定标识符的配置项值
	getSetupValue : function(code) {
		var data = ""  //如果没有设置过，则后台也返回空串
		Ext.Ajax.request({
			scope : this,
			url : "/zd/setups/" + code,
			method : 'GET',
			async : false,
			success : function(response, options) {
				var resp = Ext.decode(response.responseText);
				data = resp.value
			},
			failure : function(response, options) {
				alert(response.responseText);
			}
		})
		if(data && data=="1") return true
		if(data && data=="0") return false
		return data		
	},
	//保存指定标识符的配置项值
	saveSetupValue : function(code,value) {
		var v = value+""  //后台要求全部是字符串
		if(value==true) v = "1"
		if(value==false) v = "0"
		
		Ext.Ajax.request({
			scope : this,
			url : "/zd/setups",
			async : false,		
			method : 'POST',
			jsonData : {
				code : code,
				value : v
			},
			failure : function(response, options) {
				alert(response.responseText)
			}
		})
	},
	//获取车辆总数
	getCarTotalCount : function() {
		var data = 0
		Ext.Ajax.request({
			scope : this,
			url : "/zd/vehicles/count",
			method : 'GET',
			async : false,
			success : function(response, options) {
				var resp = Ext.decode(response.responseText);
				data = resp.count
			},
			failure : function(response, options) {
				alert(response.responseText);
			}
		})
		return data		
	},
    //获取车辆总数
    getEquipmentTotalCount : function() {
        var data = 0
        Ext.Ajax.request({
            scope : this,
            url : "/zd/equipments/count",
            method : 'GET',
            async : false,
            success : function(response, options) {
                var resp = Ext.decode(response.responseText);
                data = resp.count
            },
            failure : function(response, options) {
                alert(response.responseText);
            }
        })
        return data     
    },
    //轮询车辆出警状态
    queryVehicleOutStatus : function() {
        Ext.Ajax.request({
            scope : this,
            url : "/zd/vehicle/statuschanges/lastest?outOnly=1",
            method : 'GET',
            async : false,
            success : function(response, options) {
                var resp = Ext.decode(response.responseText);
                if(resp.length==0) return
                
          		divo.publish("divo.header.stopRollAll")  
				utils.zd.openLayer('tipsDiv')
          		
				var timeCount = 60
				var task = {
					run: function() {
						if(timeCount==0) {
							window.location.reload()
							return
						}
						Ext.get("tipsContent").update(timeCount)
						timeCount -= 1
					},
					scope : this,
					interval: 1000 //1秒 
				}
				Ext.TaskMgr.start(task);
            }
        })
    },
    //============ DIV弹出层处理 ===========
	openLayer : function (conId){	
		//获取滚动条的高度
		var getPageScroll = function() {
			var yScroll;
			if (self.pageYOffset) {
				yScroll = self.pageYOffset;
			} else if (document.documentElement && document.documentElement.scrollTop){
				yScroll = document.documentElement.scrollTop;
			} else if (document.body) {
				yScroll = document.body.scrollTop;
			}
			arrayPageScroll = new Array('',yScroll)
			return arrayPageScroll;
		}
		//获取页面实际大小
		var getPageSize = function() {
			var xScroll,yScroll;
			if (window.innerHeight && window.scrollMaxY){
				xScroll = document.body.scrollWidth;
				yScroll = window.innerHeight + window.scrollMaxY;
			} else if (document.body.scrollHeight > document.body.offsetHeight){
				sScroll = document.body.scrollWidth;
				yScroll = document.body.scrollHeight;
			} else {
				xScroll = document.body.offsetWidth;
				yScroll = document.body.offsetHeight;
			}
			var windowWidth,windowHeight;
			//var pageHeight,pageWidth;
			if (self.innerHeight) {
				windowWidth = self.innerWidth;
				windowHeight = self.innerHeight;
			} else if (document.documentElement && document.documentElement.clientHeight) {
				windowWidth = document.documentElement.clientWidth;
				windowHeight = document.documentElement.clientHeight;
			} else if (document.body) {
				windowWidth = document.body.clientWidth;
				windowHeight = document.body.clientHeight;
			}
			var pageWidth,pageHeight
			if(yScroll < windowHeight){
				pageHeight = windowHeight;
			} else {
				pageHeight = yScroll;
			}
			if(xScroll < windowWidth) {
				pageWidth = windowWidth;
			} else {
				pageWidth = xScroll;
			}
			arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight)
			return arrayPageSize;
		}
		
		var arrayPageSize   = getPageSize();
		var arrayPageScroll = getPageScroll();
		var popupDiv = document.getElementById(conId)
		
		//创建弹出背景层以及设置属性与样式
		if(!document.getElementById("bodybg")){
			var bodyBack = document.createElement("div");	
			document.body.appendChild(bodyBack);	
			bodyBack.setAttribute("id","bodybg")
			bodyBack.style.position = "absolute";
			bodyBack.style.width = (arrayPageSize[0] + 0 + 'px');
			bodyBack.style.height = (arrayPageSize[1] + 35 + 'px');
			bodyBack.style.zIndex = 2999;
			bodyBack.style.top = 0;
			bodyBack.style.left = 0;
			bodyBack.style.filter = "alpha(opacity=50)";
			bodyBack.style.opacity = 0.5;
			bodyBack.style.background = "#000";
		}
		//显示背景层
		document.getElementById("bodybg").style.display = "";
		//显示内容层
		popupDiv.style.display = "";
		//设置弹出层属性与样式
		popupDiv.style.top = arrayPageScroll[1] + (arrayPageSize[3] - popupDiv.offsetHeight) / 2 + 'px';
		popupDiv.style.left = (arrayPageSize[0] - popupDiv.offsetWidth) / 2 + 'px';
		popupDiv.style.zIndex = 3000;	
	},
	//关闭弹出层
	closeLayer : function(conId){
		document.getElementById(conId).style.display = "none";
		document.getElementById("bodybg").style.display = "none";
		return false;
	}	
    
  }
}()
//EOP
