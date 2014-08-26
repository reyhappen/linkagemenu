$.extend({
    'linkage':function(opts){
        var set = $.extend({
            'target':['J_grade','J_subject','J_version','J_book'], //需要做联动处理的元素id
            'url':['test/grade.php','test/subject.php','test/version.php','test/book.php'], //每项查询的url
            'defValues':[], //第一次加载完后设置的默认值
            'relate':['J_relate1','J_relate2']||'', //可以为字符串或元素id组成的数组，默认不设置时是前面每项select拼接的查询字符串
            'type':'get', //ajax请求的方式get, post
            'load1st':true, //是否自动加载第一个，设置为false时可以直接将第一项固定下来不需要ajax请求一遍
            'cache':false, //是否缓存ajax
            'error':[], //ajax错误时的回调
            'change':[], //值被更改后的回调，可以是函数组成的数组可以是函数，在加载数据之前执行
            'callback':[], //自定义ajax返回数据处理函数，若提供了回调函数，则不会执行添加option的操作
            'beforeAdd':[], //ajax数据加载完后(添加option之前)的回调，回调函数执行后还会有添加option的操作
            'afterAdd':[], //往select里添加option后的回调
            'afterSetVal':[] //js设置默认值之后的回调
        },opts||{});
        var ajax = null, //对应联动的全局ajax
        	defaultOps = [], //下拉框第一选择项
        	els = [], //联动元素集合els[i]为push进去的dom原生对象
        	type = set.type, //请求方式
        	rel = set.relate, //关联元素id
        	defValues = set.defValues,
        	relEls = [], //存放关联元素
        	change = set.change, //当值被手动修改后的回调，可为函数组成的数组或者函数
        	cache = set.cahce,
        	load1st = defValues.length ? true : set.load1st,
        	error = set.error,
        	callback = set.callback,
        	beforeAdd = set.beforeAdd,
        	afterAdd = set.afterAdd,
        	afterSetVal = set.afterSetVal;
        if(typeof rel == 'string'){
        	relEls.push(rel);
        }else{
        	for(var i=0, il=rel.length; i<il; i++){
	        	//关联元素数组压入元素
	        	relEls.push(document.getElementById(rel[i]));
	        }
        }
        var len = set.target.length,
            loadData = function(oi, setDef){
            	var url = set.url[oi],
            		qsString = [], //ajax查询字符串数组
            		el = els[oi], //从保存的元素数组中取出需要添加新option的select元素
            		prev = els[oi-1], //获取前一个
            		relate = els.slice(0, oi).concat(relEls); //合并需要关联的元素到已绑定联动的元素上
            	if(!el) return false;
            	//排除前一个
            	if(prev){
					ajax && ajax.abort();
            		for(var i=oi;iel=els[i];){
            			//还原后续select中option的默认文字并选中，当前加载的显示加载中
            			iel.length = 1;
            			iel.options[0].text = prev.value === '' ? defaultOps[i] : (el === iel ? '\u52a0\u8f7d\u4e2d...' : defaultOps[i]);
            			i++;
            			iel.selectedIndex = 0;
            		}
            		if(prev.value === '') return;
            	}else if(!prev){
            		el.length = 1;
            		el.options[0].text = '\u52a0\u8f7d\u4e2d...';
            	}
				for(var i=0, il=relate.length; i<il; i++){
					var _el = relate[i];
					if(_el.name)
						//若该项为元素节点
						qsString.push(_el.name +'='+ _el.value);
					else
						//字符串时
						qsString.push(_el);
				}
            	ajax = $.ajax({
					url: url,
					data: qsString.join('&'),
					type: type,
					dataType: 'json',
					cache: cache,
					error:function(XMLHttpRequest, textStatus, errorThrown){
						el.options[0].text = defaultOps[oi];
						var D, cerror = error[oi];
						if(cerror){
							cerror.apply(el, [D, els, oi, XMLHttpRequest, textStatus, errorThrown]);
						}else if(typeof error == 'function'){
							error.apply(el, [D, els, oi, XMLHttpRequest, textStatus, errorThrown]);
						}
					},
					success: function(D){
						//还原第一个option的默认文字
            			el.options[0].text = defaultOps[oi];
            			var cback = callback[oi];
						if(cback){
							//自定义ajax返回数据处理函数
							cback.apply(el, [D, els, oi]);
						}else if(typeof callback == 'function'){
							callback.apply(el, [D, els, oi]);
						}else{
							//自定义数据加载完后的回调与callback的区别是它执行后还会继续往select添加option
							var bAdd = beforeAdd[oi];
							if(bAdd){
								bAdd.apply(el, [D, els, oi]);
							}else if(typeof beforeAdd == 'function'){
								beforeAdd.apply(el, [D, els, oi]);
							}
							for(var i=0, il=D.length; i<il; i++){
								/*使用原生方法添加option比用jquery更快，jquery添加select在IE6下会有bug
								*确保每一项的id都有值，便于后台数据处理
								* 如果后台输出的数据为[[id,name],[123,'语文']]这种形式的话
								* 后台就会有更大的灵活性，他们不需要考虑key值是什么，
								* 只要按键,值对的顺序输出就行
								*/
								if(D[i].id === '') continue;
								el.add((new Option(D[i].name, D[i].id)), el.options.length);
							}
							//添加完option之后的回调
							var afAdd = afterAdd[oi];
							if(afAdd){
								afAdd.apply(el, [D, els, oi, setDef]);
							}else if(typeof afterAdd == 'function'){
								afterAdd.apply(el, [D, els, oi, setDef]);
							}
							if(setDef){
								//设置默认值
								var v = defValues[oi];
								el.value = v;
								loadData(++oi, true);
								//设置默认值后的回调
								var afsetV = afterSetVal[oi];
								if(afsetV){
									afsetV.apply(el, [D, els, v, oi]);
								}else if(typeof afterSetVal == 'function'){
									afterSetVal.apply(el, [D, els, v, oi]);
								}
							}
						}
					}
				});
            };
        $(set.target).each(function(i) {
            var el = document.getElementById(this);
            els.push(el);
            defaultOps.push(el.options[0].text);
			$('#'+this).on('change',function(e){
				//查看是否有值被更改后的回调
				var changefun = change[i];
				if(changefun){
					//change为数组形式
					changefun.apply(this,[els,i]);
				}else if(typeof change == 'function'){
					//change为函数形式
					change.apply(this,[els,i]);
				}
				if(i<len-1){
					loadData(i+1);
				}
			});
        });
        if(load1st){
        	if(defValues.length>0){
				loadData(0, true);
        	}else
        		loadData(0);
        }
    }
});