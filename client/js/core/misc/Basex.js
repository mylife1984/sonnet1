 /* global Ext */

 /*
    ext-basex 3.0
  ************************************************************************************

    Ext.lib.Ajax enhancements:
     - adds EventManager Support to Ext.lib.Ajax (if Ext.util.Observable is present in the stack)
     - adds Synchronous Ajax Support ( options.async =false )
     - Permits IE7 to Access Local File Systems using IE's older ActiveX interface
       via the forceActiveX property
     - Pluggable Form encoder (encodeURIComponent is still the default encoder)
     - Corrects the Content-Type Headers for posting JSON (application/json)
       and XML (text/xml) data payloads and sets only one value (per RFC)
     - Adds fullStatus:{ isLocal, proxied, isOK, isError, isTimeout, isAbort, error, status, statusText}
       object to the existing Response Object.
     - Adds standard HTTP Auth support to every request (XHR userId, password config options)
     - options.method prevails over any method derived by the lib.Ajax stack (DELETE, PUT, HEAD etc).
     - Adds named-Priority-Queuing for Ajax Requests
     - adds Script=Tag support for foreign-domains (proxied:true) with configurable callbacks.

  ************************************************************************************
  * Author: Doug Hendricks. doug[always-At]theactivegroup.com
  * Copyright 2007-2008, Active Group, Inc.  All rights reserved.
  ************************************************************************************

  License: ext-basex is licensed under the terms of : GNU Open Source GPL 3.0 license:

  Commercial use is prohibited without contacting licensing[at]theactivegroup.com.

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see < http://www.gnu.org/licenses/gpl.html>.

  * Donations are welcomed: http://donate.theactivegroup.com

  */


(function(){
var A = Ext.lib.Ajax;


A.Queue = function(config){

     config = config ? (config.name? config : {name:config}) :{} ;
     Ext.apply(this,config,
     {
        name     : 'q-default'
       ,priority : 5
       ,FIFO     : true //false implies LIFO
       ,callback : null //optional callback when queue is emptied
       ,scope    : null //scope of callback
       ,suspended: false
       ,progressive : false //if true, one queue item is dispatched per poll interval
      });
      this.requests = [];
      this.pending = false;
      //assert/resolve to 0-9
      this.priority = this.priority>9 ? 9 : (this.priority<0?0:this.priority );

};

Ext.extend(A.Queue, Object ,{

     add      : function(req){

        var permit = A.events? A.fireEvent('beforequeue', this, req) : true;
        if(permit !== false){
            this.requests.push(req);
            this.pending = true;
            A.pendingRequests++;
            if(this.manager){
               this.manager.start();
            }
        }
     }
    ,suspended : false
    ,activeRequest : null
    ,next     : function(){
        var req = this.requests[this.FIFO?'shift':'pop']();
        this.pending = !!this.requests.length;
        return req;
        }

    ,clear    : function(){
        this.requests.length = 0;
        this.pending = false;
        if(A.events){A.fireEvent('queueempty', this)};
        }
     // suspend/resume from dispatch control
    ,suspend  : function(){this.suspended = true;}
    ,resume   : function(){this.suspended = false;}
    ,requestNext : function(){
       var req;
       this.activeRequest = null;
       if(!this.suspended && (req = this.next())){
           A.pendingRequests--;
           this.activeRequest = req.active ? A.request.apply(A,req) : null;
           if(this.requests.length==0){

               //queue emptied callback
               if(this.callback)
                 {this.callback.call(this.scope||null,this);}
               this.clear();
           }

       }
       return this.activeRequest;
    }
 });


A.QueueManager = function(config){

    Ext.apply(this, config||{},
    {  quantas      : 10, //adjustable milliseconds deferred dispatch value
      priorityQueues: [[],[],[],[],[],[],[],[],[],[]], //iterable array (0-9) of prioritized queues:
       queues       :{}
    });
};


Ext.extend(A.QueueManager, Object,{

     getQueue     : function(name){ return this.queues[name]; }

    ,createQueue  : function(config){
        if(!config){return null;}

        var q = new A.Queue(config);
        q.manager = this;
        this.queues[q.name] = q;

        var pqa = this.priorityQueues[q.priority];
        if(pqa && pqa.indexOf(q.name)==-1){pqa.push(q.name);}

        return q;
     }
     //Remove a Queue by passed name or Queue Object reference
    ,removeQueue  : function(q){
        if(q && (q = this.getQueue(q.name||q) )){
            q.suspend();
            q.clear();  //purge any pending requests
            this.priorityQueues[q.priority].remove(q);
            delete this.queues[q.name];
        }
    }
    ,start   :function(){
        if(!this.started){
         this.started = true;
         this.dispatch();
        }
    }

    ,suspendAll : function(){
        forEach(this.queues, function(Q){ Q.suspend(); });
    }
    ,resumeAll : function(){
        forEach(this.queues, function(Q){ Q.resume(); });
        this.start();
    }


   /* Default Dispatch mode: progressive
    * false to exhaust a priority queue until empty during dispatch (sequential)
    * true to dispatch a single request from each priority queue until all queues exhausted.
    * This option may be set on the Queue itself as well.
    */
    ,progressive : false

    ,stop    :function(){ this.started = false; }

    /* main Request dispatch loop.  This keeps the maximum allowed number of requests
     * going at any one time (based on defined queue priority and dispatch mode (see progressive).
     */
    ,dispatch   : function(){
        var qm = this, qmq = qm.queues;
        var disp = function(qName){
             var q = qmq[qName];
             if(q && !q.suspended){
                 while(q.pending && !q.suspended && A.pendingRequests && A.activeRequests < A.maxConcurrentRequests){
                    q.requestNext();
                    if(q.progressive || qm.progressive){ break;} //progressive, take the first one off each queue only
                 }
                 //keep going?
                 return !!A.pendingRequests ? (A.activeRequests < A.maxConcurrentRequests) :false;
             }
        };

        Ext.each(this.priorityQueues ,function(queues){
            //queues == array of queue names
            if(!A.pendingRequests ){return false;}
            return Ext.each(queues||[],disp,this) === undefined?true:false;
        }, this);

        !!A.pendingRequests ? this.dispatch.defer(this.quantas,this): this.stop();

     }
});



Ext.apply( A ,
{

  queueManager      : new A.QueueManager(),

  //If true (or queue config object) ALL requests are queued
  queueAll          : false,

  //the Current number of active Ajax requests.
  activeRequests    : 0,

  //the Current number of pending Queued requests.
  pendingRequests   : 0,

  //Specify the maximum allowed during concurrent Queued browser (XHR) requests
  maxConcurrentRequests : 10,

  /* set True as needed, to coerce IE to use older ActiveX interface */
  forceActiveX      :false,

  /* Global default may be toggled at any time */
  async       :true,

  createXhrObject:function(transactionId)
        {
            var obj={  status:{isError:false}
                     , tId:transactionId}, http;
            try
            {
              if(Ext.isIE7 && !!this.forceActiveX){throw("IE7forceActiveX");}
              obj.conn= new XMLHttpRequest();
            }
            catch(eo)
            {
                for (var i = 0; i < this.activeX.length; ++i) {
                    try
                    {
                        obj.conn= new ActiveXObject(this.activeX[i]);

                        break;
                    }
                    catch(e) {
                    }
                }
            }
            finally
            {
                obj.status.isError = typeof(obj.conn) == 'undefined';
            }
            return obj;

        }

        /* Replaceable Form encoder */
    ,encoder : encodeURIComponent

    ,serializeForm : function(form) {
                if(typeof form == 'string') {
                    form = (document.getElementById(form) || document.forms[form]);
                }

                var el, name, val, disabled, data = '', hasSubmit = false;
                for (var i = 0; i < form.elements.length; i++) {
                    el = form.elements[i];
                    disabled = form.elements[i].disabled;
                    name = form.elements[i].name;
                    val = form.elements[i].value;

                    if (!disabled && name){
                        switch (el.type)
                                {
                            case 'select-one':
                            case 'select-multiple':
                                for (var j = 0; j < el.options.length; j++) {
                                    if (el.options[j].selected) {
                                        if (Ext.isIE) {
                                            data += this.encoder(name) + '=' + this.encoder(el.options[j].attributes['value'].specified ? el.options[j].value : el.options[j].text) + '&';
                                        }
                                        else {
                                            data += this.encoder(name) + '=' + this.encoder(el.options[j].hasAttribute('value') ? el.options[j].value : el.options[j].text) + '&';
                                        }
                                    }
                                }
                                break;
                            case 'radio':
                            case 'checkbox':
                                if (el.checked) {
                                    data += this.encoder(name) + '=' + this.encoder(val) + '&';
                                }
                                break;
                            case 'file':

                            case undefined:

                            case 'reset':

                            case 'button':

                                break;
                            case 'submit':
                                if(hasSubmit === false) {
                                    data += this.encoder(name) + '=' + this.encoder(val) + '&';
                                    hasSubmit = true;
                                }
                                break;
                            default:
                                data += this.encoder(name) + '=' + this.encoder(val) + '&';
                                break;
                        }
                    }
                }
                data = data.substr(0, data.length - 1);
                return data;
    }
    ,getHttpStatus: function(reqObj){

            var statObj = {
                     status:0
                    ,statusText :''
                    ,isError    :false
                    ,isLocal    :false
                    ,isOK       :false
                    ,error      :null
                    ,isAbort    :false
                    ,isTimeout  :false};

            try {
                if(!reqObj){throw('noobj');}
                statObj.status = reqObj.status;
                statObj.readyState = reqObj.readyState;
                statObj.isLocal = (!reqObj.status && location.protocol == "file:") ||
                          ( Ext.isSafari && reqObj.status === undefined);

                statObj.isOK = (
                    statObj.isLocal ||
                      (statObj.status == 304 || statObj.status == 1223 ||
                      (statObj.status > 199 && statObj.status < 300) )
                    );

                statObj.statusText = reqObj.statusText || '';
               } catch(e){} //status may not avail/valid yet (or called too early).

            return statObj;

     }
    ,handleTransactionResponse:function(o, callback, isAbort){

        callback = callback || {};
        var responseObject=null;
        this.activeRequests--;

        if(!o.status.isError){
            o.status = this.getHttpStatus(o.conn);
            /* create and enhance the response with proper status and XMLDOM if necessary */
            responseObject = this.createResponseObject(o, callback.argument, isAbort);
        }

        if(o.status.isError){
         /* checked again in case exception was raised - ActiveX was disabled during XML-DOM creation?
          * And mixin everything the XHR object had to offer as well
          */
           responseObject = Ext.apply({},responseObject||{},this.createExceptionObject(o.tId, callback.argument, (isAbort ? isAbort : false)));

        }

        responseObject.options = o.options;
        responseObject.fullStatus = o.status;

        if(!this.events || this.fireEvent('status:'+o.status.status ,o.status.status, o, responseObject, callback, isAbort) !== false){

             if (o.status.isOK && !o.status.isError) {
                if(!this.events || this.fireEvent('response',o, responseObject, callback, isAbort) !== false){
                    if (callback.success) {
                        callback.success.call(callback.scope||null,responseObject);
                    }
                }
             } else {
                  if(!this.events || this.fireEvent('exception',o ,responseObject, callback, isAbort) !== false){
                    if (callback.failure) {
                        callback.failure.call(callback.scope||null,responseObject);
                    }
                  }
             }
        }

        if(o.options.async){
            this.releaseObject(o);
            responseObject = null;
        }else{
            this.releaseObject(o);
            return responseObject;
        }

    },

    createResponseObject:function(o, callbackArg, isAbort){
        var obj = {responseXML   :null,
                   responseText  :'',
                   responseStream : null,
                   getResponseHeader : {},
                   getAllResponseHeaders : ''
                   };

        var headerObj = {},headerStr='';

        if(isAbort !== true){
            try{  //to catch bad encoding problems here
                obj.responseText = o.conn.responseText;
                obj.responseStream = o.conn.responseStream||null;
            }catch(e){
                o.status.isError = true;
                o.status.error = e;
            }

            try{
                obj.responseXML = o.conn.responseXML || null;
            } catch(ex){}

            try{
                headerStr = o.conn.getAllResponseHeaders()||'';
            } catch(ex1){}

            if((o.status.isLocal || o.proxied) && typeof obj.responseText == 'string' ){

               o.status.isOK = !o.status.isError && ((o.status.status = (!!obj.responseText.length)?200:404) == 200);

               if(o.status.isOK && (!obj.responseXML || (obj.responseXML && obj.responseXML.childNodes.length === 0))){

                    var xdoc=null;
                    try{   //ActiveX may be disabled
                        if(window.ActiveXObject){
                            xdoc=new ActiveXObject("MSXML2.DOMDocument.3.0");
                            xdoc.async=false;

                            xdoc.loadXML(obj.responseText);
                        }else{
                            var domParser=null;
                            try{  //Opera 9 will fail parsing non-XML content, so trap here.
                                domParser = new DOMParser();
                                xdoc = domParser.parseFromString(obj.responseText, 'application\/xml');
                            }catch(exP){}
                            finally{domParser = null;}
                        }
                    } catch(exd){
                        o.status.isError = true;
                        o.status.error = exd;
                    }
                    obj.responseXML = xdoc;
                }
                if(obj.responseXML){
                    var parseBad =  (obj.responseXML.documentElement && obj.responseXML.documentElement.nodeName == 'parsererror') ||
                                (obj.responseXML.parseError || 0) !== 0 ||
                                obj.responseXML.childNodes.length === 0;
                    if(!parseBad){
                        headerStr = 'Content-Type: ' + (obj.responseXML.contentType || 'text\/xml') + '\n' + headerStr ;
                    }
                }
            }
        } //isAbort?

        var header = headerStr.split('\n');
        for (var i = 0; i < header.length; i++) {
            var delimitPos = header[i].indexOf(':');
            if (delimitPos != -1) {
                headerObj[header[i].substring(0, delimitPos)] = header[i].substring(delimitPos + 2);
            }
        }
        o.status.proxied    = !!o.proxied;

        Ext.apply(obj,{
           tId                  : o.tId,
           status               : o.status.status,
           statusText           : o.status.statusText,
           getResponseHeader    : headerObj,
           getAllResponseHeaders: headerStr,
           fullStatus           : o.status
        });

        if (typeof callbackArg != 'undefined') {
            obj.argument = callbackArg;
        }

        return obj;
    },
    setDefaultPostHeader:function(contentType){
        this.defaultPostHeader = contentType;
    },

    setDefaultXhrHeader:function(bool){
        this.useDefaultXhrHeader = bool||false;
    },

    request : function(method, uri, cb, data, options) {

        options = Ext.apply({
               async    :this.async || false,
               headers  :false,
               userId   :null,
               password :null,
               xmlData  :null,
               jsonData :null,
               queue    :null,
               proxied  :false
               }, options||{});

        if(!this.events || this.fireEvent('request', method, uri, cb, data, options) !== false){

               //Named priority queues
               if((options.queue || (options.queue = this.queueAll||null))  && !options.queued){
                   var q = options.queue, qname = q.name || 'default', qm=this.queueManager;
                   q = qm.getQueue(qname) || qm.createQueue(q);
                   options.queue  = q;
                   options.queued = true;

                   var req= [method, uri, cb, data, options];
                   req.active=true;
                   q.add(req);

                   return { tId:this.transactionId++
                        ,queued: true
                        ,request:req
                        ,options:options
                        };
               }

               var hs = options.headers;
               if(hs){
                    for(var h in hs){
                        if(hs.hasOwnProperty(h)){
                            this.initHeader(h, hs[h], false);
                        }
                    }
               }
               var cType = this.headers['Content-Type']||null;
               //remove to ensure only ONE is passed later.(per RFC)
               delete this.headers['Content-Type'];
               if(options.xmlData){
                    cType || (cType = 'text/xml');
                    method = 'POST';
                    data = options.xmlData;
               } else if(options.jsonData){
                    cType || (cType = 'application/json');
                    method = 'POST';
                    data = typeof options.jsonData == 'object' ? Ext.encode(options.jsonData) : options.jsonData;
               }
               if(data){
                    cType || (cType = this.useDefaultHeader?this.defaultPostHeader:null );
                    if(cType){this.initHeader('Content-Type', cType , false );}
               }

                //options.method prevails over any derived method.
               return this.makeRequest(options.method || method, uri, cb, data, options);
        }
        return null;

    }
    ,getConnectionObject:function(uri, options)
        {
            var o,f,e=Ext.emptyFn;
            var tId = this.transactionId;

            try
            {
              if(f = options.proxied){ /*scriptTag Support */

                o = { tId: tId,
                      status  : {},
                      proxied : true,
                      conn: {
                          el            : null,
                          send          : function(){
                                var doc= (f.target||window).document, head = doc.getElementsByTagName("head")[0];
                                if(head && this.el){head.appendChild(this.el);}
                          },
                          abort             : function(){this.readyState = 0;},
                          setRequestHeader  : e,
                          getAllResponseHeaders: e,
                          onreadystatechange: null,
                          readyState        : 0,
                          status            : 0,
                          responseText      : null,
                          responseXML       : null
                       },
                       debug   : f.debug,
                       cbName  : f.callbackName  || 'basexCallback' + tId,
                       cbParam : f.callbackParam || null
                    };

                window[o.cbName] = o.cb = function(content,request){
                     this.responseText = !!content?content:null;

                     this.readyState = 4;
                     this.status     = !!content?200:404;

                     if(typeof this.onreadystatechange == 'function')
                        {this.onreadystatechange();}

                     if(!request.debug){
                         Ext.removeNode(this.el);
                         this.el = null;
                     }

                     window[request.cbName] = undefined;
                     try{delete window[request.cbName];}catch(ex){}


                }.createDelegate(o.conn,[o],true);

                o.conn.open = function(){
                   this.el= domNode(f.tag || 'script'
                                     ,{type :"text/javascript"
                                      , src :o.cbParam?uri + (uri.indexOf("?") != -1 ? "&" : "?") + String.format("{0}={1}", o.cbParam , o.cbName):uri
                                      }
                                     , null
                                     , f.target
                                     , true);

                   };

                o.conn.readyState = 1; //show CallInProgress
                if(typeof o.conn.onreadystatechange == 'function')
                    {o.conn.onreadystatechange();}

                options.async = true;  //force timeout support

              }else{
                o = this.createXhrObject(tId);
              }
              if (o) {
                   this.transactionId++;
              }
            }
            catch(ex3) {
            }
            finally
            {
                return o;
            }
    }
    ,makeRequest:function(method, uri, callback, postData, options){

        var o = this.getConnectionObject(uri ,options);

        if (!o || o.status.isError) {
                return Ext.apply(o,this.handleTransactionResponse(o, callback));
        } else {

                o.options = options;
                try{
                    o.conn.open(method.toUpperCase(), uri, options.async, options.userId, options.password);
                    o.conn.onreadystatechange=this.onReadyState ?
                           this.onReadyState.createDelegate(this,[o],0):Ext.emptyFn;
                } catch(ex){
                    o.status.isError = true;
                    o.status.error = ex;
                    return Ext.apply(o,this.handleTransactionResponse(o, callback));
                }
                this.activeRequests++;
                if (this.useDefaultXhrHeader) {
                    if (!this.defaultHeaders['X-Requested-With']) {
                    this.initHeader('X-Requested-With', this.defaultXhrHeader, true);
                    }
                }

                if (this.hasDefaultHeaders || this.hasHeaders) {
                    this.setHeader(o);
                }

                if(o.options.async){ //Timers for syncro calls won't work here, as it's a blocking call
                    this.handleReadyState(o, callback);
                }

                try{
                  if(!this.events || this.fireEvent('beforesend', o, method, uri, callback, postData, options) !== false){
                       o.conn.send(postData || null);
                  }
                } catch(exr){
                    o.status.isError = true;
                    o.status.error = exr;

                    return Ext.apply(o,this.handleTransactionResponse(o, callback));
                    }

                return options.async?o:Ext.apply(o,this.handleTransactionResponse(o, callback));
            }
    }

   ,abort:function(o, callback, isTimeout){

            if(o && o.queued && o.request){
                o.request.active = o.queued = false;
                if(this.events){
                    this.fireEvent('abort', o, callback);
                }
            }
            else if (o && this.isCallInProgress(o)) {
                o.conn.abort();
                window.clearInterval(this.poll[o.tId]);
                delete this.poll[o.tId];
                if (isTimeout) {
                    delete this.timeout[o.tId];
                }

                o.status.isAbort = !(o.status.isTimeout = isTimeout||false);
                if(this.events){
                    this.fireEvent(isTimeout?'timeout':'abort', o, callback);
                }

                this.handleTransactionResponse(o, callback, true);

                return true;
            }
            else {
                return false;
            }
    }

    ,clearAuthenticationCache:function(url) {

       try{

         if (Ext.isIE) {
           // IE clear HTTP Authentication, (but ALL realms though)
           document.execCommand("ClearAuthenticationCache");
         }
         else {
           // create an xmlhttp object
           var xmlhttp;
           if( xmlhttp = new XMLHttpRequest()){
               // prepare invalid credentials
               xmlhttp.open("GET", url || '/@@' , true, "logout", "logout");
               // send the request to the server
               xmlhttp.send("");
               // abort the request
               xmlhttp.abort.defer(100,xmlhttp);
           }
         }
       } catch(e) {        // There was an error

       }
     }

});
 /* private --
 <script and link> tag support
 */
 var domNode = function(tag, attributes, callback, context, deferred){
        attributes = Ext.apply({},attributes||{});
        context || (context = window);

        var node = null, doc= context.document, head = doc.getElementsByTagName("head")[0];

        if(doc && head && (node = doc.createElement(tag))){
            for(var attrib in attributes){
                  if(attributes.hasOwnProperty(attrib) && attrib in node){
                      node.setAttribute(attrib, attributes[attrib]);
                  }
            }

            if(callback){
                var cb = (callback.success||callback).createDelegate(callback.scope||null,[callback],0);
                if(Ext.isIE){
                     node.onreadystatechange = function(){
                          if(/loaded|complete|4/i.test(String(this.readyState))){
                                 cb();
                          }
                      }.createDelegate(node);
                }else if(Ext.isSafari3 && tag == 'script'){
                    //has DOM2 support
                    node.addEventListener("load", cb );
                }else if(Ext.isSafari) {
                    cb.defer(50);
                }else{
                    /* Gecko/Safari has no event support for link tag
                       so just defer the callback 50ms (optimistic)
                    */
                    tag !== 'link' || Ext.isOpera ? Ext.get(node).on('load',cb) : cb.defer(50);
                }

            }
            if(!deferred){head.appendChild(node);}
       }
       return node;

    };

if(Ext.util.Observable){

  Ext.apply( A ,{

   events:{request     :true,
           beforesend  :true,
           response    :true,
           exception   :true,
           abort       :true,
           timeout     :true,
      readystatechange :true,
           beforequeue :true,
           queue       :true,
           queueempty  :true
    }

   /*
     onStatus
     define eventListeners for a single (or array) of HTTP status codes.
   */
   ,onStatus:function(status,fn,scope,options){
        var args = Array.prototype.slice.call(arguments, 1);
        status = [].concat(status||[]);
        Ext.each(status,function(statusCode){
            statusCode = parseInt(statusCode,10);
            if(!isNaN(statusCode)){
                var ev = 'status:'+statusCode;
                this.events[ev] || (this.events[ev] = true);
                this.on.apply(this,[ev].concat(args));
            }
        },this);
   }
   /*
        unStatus
        unSet eventListeners for a single (or array) of HTTP status codes.
   */
   ,unStatus:function(status,fn,scope,options){
           var args = Array.prototype.slice.call(arguments, 1);
           status = [].concat(status||[]);
           Ext.each(status,function(statusCode){
                statusCode = parseInt(statusCode,10);
                if(!isNaN(statusCode)){
                    var ev = 'status:'+statusCode;
                    this.un.apply(this,[ev].concat(args));
                }
           },this);
      }
    ,onReadyState : function(){
         this.fireEvent.apply(this,['readystatechange'].concat(Array.prototype.slice.call(arguments, 0)));
    }

  }, new Ext.util.Observable());

  Ext.hasBasex = true;
}

})();

//Array, object iteration support
(function(){
    Ext.stopIteration = {stopIter:true};

    /* Fix for Opera, which does not seem to include the map function on Array's */

    Ext.applyIf( Array.prototype,{
       map : function(fun,scope){
        var len = this.length;
        if(typeof fun != "function"){
            throw new TypeError();
        }
        var res = new Array(len);

        for(var i = 0; i < len; i++){
            if(i in this){
                res[i] = fun.call(scope||this, this[i], i, this);
            }
        }
        return res;
      }
       /*
       Array forEach Iteration
         based on previous work by: Dean Edwards (http://dean.edwards.name/weblog/2006/07/enum/)
         Gecko already supports forEach for Arrays : see http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:forEach
       */
      ,forEach : function(block, scope) {

        if(typeof block  != "function"){
            throw new TypeError();
        }
        var i=0,length = this.length;
        while(i < length ){ block.call(scope||null, this[i], i++, this ); }
       },

       include: function(value) {               //Boolean: is value present in Array
           //use native indexOf if available
           if(typeof this.indexOf == 'function'){ return this.indexOf(value) != -1; }
           var found = false;
           try{
             this.forEach(function(item,index) { if(found = (item == value))throw Ext.stopIteration; });
           }catch(exc){if(exc != Ext.stopIteration){ throw exc;} }
           return found;
       },
       // Using iterFn, traverse the array, push the current element value onto the
       // result if the iterFn returns true
       filter: function(iterFn, scope) {
           var a = [];
           this.forEach( function(value, index) {
             if (iterFn.call(scope, value, index)){ a.push(value);}
           });
           return a;
       },

       compact: function(deep){                     //Remove null, undefined array elements
          var a=[];
          this.forEach(function(v){
              (v ===null || v=== undefined) || a.push(deep && Ext.isArray(v)?v.compact(): v );
          },this);
          return a;
       },

       flatten : function(){                    //flatten: [1,2,3,[4,5,6]]  -> [1,2,3,4,5,6]
         var a=[];
         this.forEach(function(v){
               Ext.isArray(v) ? (a = a.concat(v)) : a.push(v);
          },this);
         return a;
       },
       unique: function(sorted /* sort optimization */) {  //unique: [1,3,3,4,4,5]  -> [1,3,4,5]
           var a = [];
           this.forEach(function(value, index){
             if (0 == index || (sorted ? a.last() != value : !a.include(value))){a.push(value);}
           },this);
           return a;
       },
       // search array values based on regExpression pattern returning
       // test (and optionally execute function(value,index) on test before returned)
       grep: function(pattern, iterFn, scope) {
           var a = [];
           iterFn || (iterFn = function(value){ return value; });
           var fn = scope? iterFn.createDelegate(scope): iterFn ;

           if (typeof pattern == 'string'){ pattern = new RegExp(pattern); }
           this.forEach(function(value, index) {
             if(pattern.test(value)){ a.push( fn(value, index)); }
           });
           return a;
       },
       first: function() { return this[0]; },

       last: function() { return this[this.length - 1]; },

       clone: function() { return [].concat(this); },

       clear: function() { this.length = 0; }

    });

       // enumerate custom class properties (not prototypes)
       // usually only called by the global forEach function
    Ext.applyIf(Function.prototype,{
       forEach : function( object, block, context) {
        if(typeof block != "function"){
            throw new TypeError();
        }
        for (var key in object) {
               if (typeof this.prototype[key] == "undefined") {  //target instance properties
                  try{block.call(context || null, object[key], key, object);}catch(e){}
               }
        }
      }
    });

       // character enumeration
    Ext.applyIf(String.prototype,{
       forEach : function(block, context) {
            if(typeof block != "function"){
                throw new TypeError();
            }
            var str = this.toString();
            context = context || this;
            var ar = str.split("")||[];
            ar.forEach( function(chr, index) {
                try{block.apply(context,[ chr, index, str]);}catch(e){}
            },ar);
       },
       trim : function(){
           var re = /^\s+|\s+$/g;
           return function(){ return this.replace(re, ""); };
         }()

    });

       // globally resolve forEach enumeration
    window.forEach = function(object, block, context) {
        context = context || object;
        if (object) {
            if(typeof block != "function"){
                throw new TypeError();
            }
            var resolve = Object; // default
            if (object instanceof Function) {
                // functions have a "length" property
                resolve = Function;
            } else if (object.forEach instanceof Function) {
                // the object implements a custom forEach method so use that
                object.forEach(block, context);
                return;
            }
            return resolve.forEach(object, block, context);
        }
     };
})();
