$(function() {
	var flag = ""; //全局ID
	var dataFlag = "";
	var flagUsername = "";
	var friendIdFlag = "";
	var user_info = null;
	var myfriend_list = [];
	var myGroupList = [];
	var mymsg_list = [];
	var myTime = new Date();
	var user_Id = "";
	var dataChat = '';
	var chat_id = '';
	var Message_id = "";
	var Messagechat_id = '';
	var otherId = '';
	var flieId = '';
	var Extra = '';

	//WEBSocket链接
	var ws = new WebSocket("ws://192.168.20.147:7001/");
	var output;
	window.addEventListener("load", init, false);

	function init() {
		output = document.getElementById("output");
		WebSocketTest();
	}

	function WebSocketTest() {
		if ("WebSocket" in window) {
			//alert("WebSocket is supported by your Browser!");
			// Let us open a web socket
			ws.onopen = function() {
				// Web Socket is connected, send data using send()
				console.log("连接成功！")
				ws.send('{"username":"' + sessionStorage['username'] + '", "password":"' + sessionStorage['password'] + '", "channel":"ichat"}');
			};
			ws.onmessage = function(evt) {
				mymsg_list = evt.data
				Message(mymsg_list);
			};
			ws.onclose = function() {
				// websocket is closed.
				alert("Connection is closed...");
			};
		} else {
			// The browser doesn't support WebSocket
			alert("WebSocket NOT supported by your Browser!");
		}
	}
	//选择群组函数

	function changeChat(id, name) {
		if (id == 0) {
			return;
		}
		$.ajax({
			type: "post",
			url: "/get_group_chat_msg_by_count",
			data: JSON.stringify({
				"group_id": id,
				"offset": "0",
				"size": "50"
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				console.log(data);
				if (data['status'] == 'ok') {
					$('.msg_text').text("");
					var len = data["msg_list"].length;
					if (len == 0) {
						$('.msg_text').text("");
					} else {
						$('.title_text').text(name);
						for (var i = len - 1; i >= 0; i--) {
							//var receiver_id = data['msg_list'][i]['receiver_id']; //接受者id
							//var send_id = data['msg_list'][i]['sender_id']; //发送者id
							var sender_icon_id = data['msg_list'][i]['sender_icon_id'];
							if (data['msg_list'][i]['sender_id'] == user_info.user_id) {
								$('.msg_text').append("<div class='msg_my_style'>" + "<div class='myimg'>" + "<img src='./img/headimg.jpg'/>" + "</div>" + "<div class='msg_my'>" + "<div class='arrow'></div>" + "<div class='remsg'>" + Base64.decode(data['msg_list'][i]['data']) +
									"</div>" + "</div>" + "<br />" + "</div>");
								$('.myimg>img').attr('src', /downloadPublicFile/ + sender_icon_id);
							} else {
								$('.msg_text').append("<div class='msg_my_style'>" + "<div class='yourimg'>" + "<img src='./img/headimg.jpg'/>" + "</div>" + "<div class='msg_fr'>" + "<div class='arrow'></div>" + "<div class='remsg'>" + Base64.decode(data['msg_list'][i]['data']) +
									"</div>" + "</div>" + "<br />" + "</div>");
								console.log(sender_icon_id);
								if (sender_icon_id !== "") {
									$("div.yourimg>img").attr('src', /downloadPublicFile/ + sender_icon_id);
								}
							}
							//动态添加好友列表
						}

						$('.msg_text').scrollTop($('.msg_text')[0].scrollHeight);
					}
				}
			},
			error: function(data) {
				// view("异常！");  
				alert("异常！");
			}
		});
	}
	//处理消息函数

	//好友函数
	function changeFriend(id, name) {
		if (id == 0) {
			return;
		}
		$.ajax({
			type: "post",
			url: "/get_chat_msg_by_count",
			data: JSON.stringify({
				"friend_id": id,
				"offset": "0",
				"size": "20"
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['status'] == 'ok') {
					$('.title_text').text(name);
					var len = data["msg_list"].length;
					if (len == 0) {
						$('.msg_text').text("");
					} else {
						console.log(data);

						$('.msg_text').text("");
						for (var i = len - 1; i >= 0; i--) {
							var receiver_id = data['msg_list'][i]['receiver_id']; //接受者id
							var send_id = data['msg_list'][i]['sender_id']; //发送者id
							//消息
							if (data['msg_list'][i]['extra'] != "") { //不等于空    有图
								msg_type = Base64.decode(data['msg_list'][i]['extra']);
								if (msg_type == 'image') {
									if (receiver_id == user_info.user_id) {
										$('.msg_text').append("<div class='msg_my_style'>" + "<div class='yourimg'>" + "<img src='./img/headimg.jpg'/>" + "</div>" + "<div class='msg_fr'>" + "<div class='arrow'></div>" + "<div class='remsg'>" +
											"<img src=" + '/downloadTempFileFromOther/' + Base64.decode(data['msg_list'][i]['data']) + '/' + receiver_id + ">" + "</div>" + "</div>" + "<br />" + "</div>");
										$(".yourimg>img").attr('src', /downloadPublicFile/ + data['msg_list'][i]['sender_icon_id']);
									} else if (send_id == user_info.user_id) {
										$('.msg_text').append("<div class='msg_my_style'>" + "<div class='myimg'>" + "<img src='./img/headimg.jpg'/>" + "</div>" + "<div class='msg_my'>" + "<div class='arrow'></div>" + "<div class='remsg'>" +
											"<img src=" + '/downloadTempFileFromOther/' + Base64.decode(data['msg_list'][i]['data']) + '/' + send_id + ">" + "</div>" + "</div>" + "<br />" + "</div>");
										$(".myimg>img").attr('src', /downloadPublicFile/ + data['msg_list'][i]['sender_icon_id']);
									}
								}

							} else { //没图
								if (receiver_id == user_info.user_id) {
									$('.msg_text').append("<div class='msg_my_style'>" + "<div class='yourimg'>" + "<img src='./img/headimg.jpg'/>" + "</div>" + "<div class='msg_fr'>" + "<div class='arrow'></div>" + "<div class='remsg'>" +
										Base64.decode(data['msg_list'][i]['data']) + "</div>" + "</div>" + "<br />" + "</div>");
									$(".yourimg>img").attr('src', /downloadPublicFile/ + data['msg_list'][i]['sender_icon_id']);
									//									$('.p').text(Base64.decode(data['msg_list'][0]['data']));

								} else if (send_id == user_info.user_id) {
									$('.msg_text').append("<div class='msg_my_style'>" + "<div class='myimg'>" + "<img src='./img/headimg.jpg'/>" + "</div>" + "<div class='msg_my'>" + "<div class='arrow'></div>" + "<div class='remsg'>" +
										Base64.decode(data['msg_list'][i]['data']) + "</div>" + "</div>" + "<br />" + "</div>");
									$(".myimg>img").attr('src', /downloadPublicFile/ + data['msg_list'][i]['sender_icon_id']);
									//									$('.p').text(Base64.decode(data['msg_list'][0]['data']));
								}

							}


						}


					}

				}

				// $('.msg_text').scrollTop( $('.rb_text')[0].offsetHeight);
				$('.msg_text').scrollTop($('.msg_text')[0].scrollHeight);
			},
			error: function(data) {
				alert("异常！");
			}
		});
	}
	//推送消息盒子

	function MessagePush(data) {
		if (data["group_id"] == "") {
			var x = data["sender_id"];
			var lens = myfriend_list["friend_list"].length;
			for (var i = 0; i < lens; i++) {
				var k = myfriend_list["friend_list"][i]["friend_id"];
				if (x === k) {
					//k是好友ID
					var name = myfriend_list["friend_list"][i]["username"]; //发送过来的好友名字	
					if ($('.title_text').text() == name) {
						changeFriend(k, name);
					} else {

						$('.box').append("<div class='messagePush_box'>" + "<span class='closeimg'>" + "<img src='img/close_box.png'/>" + "</span>" +
							"<div class='push_message'>" + name + "<br />" + "向您发送了新消息！" + "<br/>" + "点击查看" + "</div>" + "</div>");
						$('.push_message').on("click", function() {
							changeFriend(k, name);
							friendIdFlag = k;
							$(this).parent(".messagePush_box").fadeOut(1000);
						})
					}
				}
			}
		} else {
			if (data["group_id"] == null) {
				return;
			} else {
				console.log(data)
				var x = data["group_id"];
				var len = myGroupList["group_list"].length;
				for (var i = 0; i < len; i++) {
					var y = myGroupList["group_list"][i]["group_id"];
					if (x === y) {
						//k是群组ID
						var name = myGroupList["group_list"][i]["group_name"]; //发送过来的群组名字
						if ($('.title_text').text() == name) {
							changeChat(y, name);
						} else {
							$('.box').append("<div class='messagePush_box'>" + "<span class='closeimg'>" + "<img src='img/close_box.png'/>" + "</span>" +
								"<div class='push_message'>" + "群组:" + name + "<br />" + "向您发送了新消息！" + "<br/>" + "点击查看" + "</div>" + "</div>");
							$('.push_message').on("click", function() {
								changeChat(y, name);
								chat_id = y;
								$(this).parent(".messagePush_box").fadeOut(1000);
							})
						}
					}
				}
			}
		}
	}

	//消息函数
	function Message(data) {

		if (typeof(data) == "string") {
			var aa = JSON.parse(data)
			MessagePush(aa);
		}
	}
	//推送盒子函数

	function showPushbox() {
		$('.push_box').slideDown();
	}
	//按回车发送消息 
	$(document).keydown(function(event) {

		if (event.keyCode == 13 && event.ctrlKey) {
			// 这里实现换行 按ctrl+enter
			document.getElementById("sendtext").value += "\n";
		} else if (event.keyCode == 13) {
			event.preventDefault();
			sendbtn();
		}
	});

	//得到用户信息
	$.ajax({
		url: '/get_user_info',
		type: 'post',
		dataType: 'json',
		contentType: 'application/json',
		success: function(data) {
			console.log(data);
			//			$('.h3').text(data.username);
			$('.title_text').text("未选择聊天");
			//						var len = data.length;
			flagUsername = data.username;
			user_Id = data.user_id;
			if (data.icon_id == "") {
				$('.left_header div.user img').attr('src', "./img/headimg.jpg");
			} else {
				$('.left_header div.user img').attr('src', /downloadPublicFile/ + data.icon_id);
			}

			user_info = data;
		},
		error: function(data) {
			// view("异常！");  
			alert("异常！");
		}
	});


	//得到添加好友响应
	$.ajax({
		url: '/get_add_friend_req',
		type: 'post',
		data: JSON.stringify({
			"type": "unprocessed", //unprocessed ,processed, all
			"owner": "others", //others myself
			"offset": "0", //
			"size": "100" //
		}),
		dataType: 'json',
		contentType: 'application/json',
		success: function(data) {
			if (data['status'] == 'ok') {
				var len = data['add_friend_req_list'].length;
				if (len !== 0) {
					var name = data['add_friend_req_list']['0'].requester_name;
					var msg = data['add_friend_req_list']['0'].msg;
					var req_id = data['add_friend_req_list']['0'].req_id;
					showPushbox();
					console.log(data);
					flag = req_id;
					data = name;
					$('.push_box').append('<span class="addf_r_list">' + 'username :' + name + '<br />' + '想要加你为好友' + '<br />' + '消息 :' + msg + '</span>' + '<br />')
				}
			} else {
				console.log(data);
			}
		},
		error: function(data) {
			alert("异常！");
		}
	});
	//得到好友列表
	function getFriendList() {
		$.ajax({
			type: "post",
			url: "/get_friend_list",
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['status'] == 'ok') {
					myfriend_list = data;
					var len = data['friend_list'].length;
					dataFlag = data;
					$('.ul_touch>ul').children("li").remove();
					for (var i = 0; i < len; i++) {
						var icon_id = data['friend_list'][i].icon_id
						if (icon_id == "") {
							if (data['friend_list'][i].note_name == "") {
								$('.ul_touch>ul').append('<li>' + '<div class="user">' + "<img src='./img/headimg.jpg'" + '</div>' + '<div class="info">' + '<h3>' + data['friend_list'][i].username + '</h3>' + '<p class="p">' +
									'</p>' + '</div>' + '</li>');
							} else {
								$('.ul_touch>ul').append('<li>' + '<div class="user">' + "<img src='./img/headimg.jpg'" + '</div>' + '<div class="info">' + '<h3>' + data['friend_list'][i].note_name + '</h3>' + '<p class="p">' +
									'</p>' + '</div>' + '</li>');
							}
						} else {

							if (data['friend_list'][i].note_name == "") {

								$('.ul_touch>ul').append('<li>' + '<div class="user">' + "<img src='./img/headimg.jpg'" + '</div>' + '<div class="info">' + '<h3>' + data['friend_list'][i].username + '</h3>' + '<p class="p">' + '</p>' + '</div>' + '</li>');

							} else {

								$('.ul_touch>ul').append('<li>' + '<div class="user">' + "<img src='./img/headimg.jpg'" + '</div>' + '<div class="info">' + '<h3>' + data['friend_list'][i].note_name + '</h3>' + '<p class="p">' + '</p>' + '</div>' + '</li>');

							}
							$('.ul_touch>ul div.user').eq(i).find('img:first').attr('src', '/downloadPublicFile/' + icon_id);
							//$('.ul_touch>ul div.user>img').attr("src", '/downloadPublicFile/'+ icon_id);
						}
					}
				} else {
					console.log(data);
				}
			},
			error: function(data) {
				alert("异常！");
			}
		});
	}
	getFriendList();
	get_group_list();

	//<!---------左边样式--------->
	$('#left .tab ul>li').click(function() {
		$('#left div').removeClass('current');
		$('.tab ul li>span').removeClass('imgborder');
		$('.chat').css({
			'display': 'none'
		});
		var tabNum = $('#left .tab ul>li').index(this);
		if (tabNum == 2) {
			$('#left div.ul_talk').addClass('current');
			$('.tab_talk').addClass('imgborder');

		}
		if (tabNum == 1) {
			$('#left div.ul_chat').addClass('current');
			$('.tab_chat').addClass('imgborder');

			get_group_list();
		}
		if (tabNum == 0) {
			$('#left div.ul_touch').addClass('current');
			$('.tab_touch').addClass('imgborder');
			getFriendList()
		}
	});
	//注销/退出
	$('.exit').click(function() {
		$('.exitrd').slideDown();
		$('#exit_y').click(function() {
			var aj = $.ajax({
				url: '/logout',
				method: 'get',
				dataType: 'json',
				contentType: 'application/json',
				success: function(data) {

					location.href = "login.html"
				},
				error: function(data) {
					alert("异常！");
				}
			});
		})
		$('#exit_n').click(function() {
			$('.exitrd').slideUp();
		});
	});
	//添加
	$('.add_box>ul>li').click(function() {
		$(this).addClass("showbox").siblings("li").removeClass("showbox");
		$(this).children().addClass("show").parent().siblings().children('div').removeClass('show');

	});
	//创建群组
	$('.setchat').click(function() {
		console.log(11)
		var chattext = $('.chat_text').val();
		$.ajax({
			type: "post",
			url: "/regist_group",
			data: JSON.stringify({
				"group_name": chattext
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['status'] == 'ok') {
					console.log(data)
					$('.ul_chat>ul').append("<li><div class='chater'><img scr='' /></div><div class='info'><h3>" + chattext + "</h3></div></li>")
					alert("创建成功！");
					$('.chat_text').val("");
				}
			},
			error: function(data) {
				alert("创建的群组名称已存在！");
			}

		});
	});
	//查看群组
	function get_group_list() {
		$.ajax({
			type: 'get',
			url: "/get_group_list",
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['status'] == 'ok') {
					myGroupList = data;
					console.log(data);
					var len = data["group_list"].length;
					$('.ul_chat>ul>li').remove();
					for (var i = 0; i < len; i++) {
						//						
						icon_id = data['group_list'][i].icon_id;

						$('.ul_chat>ul').append("<li><div class='chater'>" + "<img src='./img/headimg.jpg'/>" + "</div><div class='info'><h3>" + data['group_list'][i].group_name+"</h3></div></li>")

						//$('.chater').eq(i).find('img:first').attr('src',/downloadPublicFile/+icon_id);

					}
					dataChat = data;
				}
			}

		});
	}
	//添加和关闭好友盒子

	$('.addFriend').click(function() {
		$('div.mask').addClass('now');
		$('.addFriend1').slideToggle(200);
		event.stopPropagation();
		//		$('.addleft').addClass('effect-0');
		//		$('.addright').addClass('effect-0');

	});
	//搜索好友
	$('.search').click(function() {
		$('.search_box').slideDown();
		$('.search_box').on('click',function(){
			event.stopPropagation();
		})
		event.stopPropagation();
		
		
	});
	//搜索好友TEXT框  自动匹配搜索结果
	$('.searchFriend').keyup(function(){
		$(this).change(searchFriend());
	})
	function searchFriend(){
		var searchText=$('.searchFriend').val();
		if(searchText){
			$matches1 = $(".ul_touch ul li").find('h3:Contains('+searchText+')').parent().parent().parent();
//			console.log($matches);
			$matches2=$(".ul_chat ul li").find('h3:Contains('+searchText+')').parent().parent();
			$("li",".ul_touch ul").not($matches1).slideUp();
			$("li",".ul_chat ul").not($matches2).slideUp();
		 	 $matches1.slideDown();
		 	 $matches2.slideDown();
		}else {
         get_group_list();
         getFriendList();
        }
	}
	//添加好友  旧
	$('.addpeople_box').click(function() {
		event.stopPropagation();
	});
	$('.close').click(function() {
		$('.addpeople_box').slideUp();
	});
	//查询好友函数

	//	function findfriend(data) {
	//		var len = data['user_list'].length
	//		$(".find_list").children().remove();
	//		for (i = 0; i < len; i++) {
	//			var user_id = data['user_list'][i]['user_id']
	//			var username = data['user_list'][i]['username']
	//			var er = $('<span class="span">' + '　username　' + '　:　' + username + '　　|　　' + 'userid　　' + '　:' + user_id + '</span>')
	//			$(".find_list").append(er);
	//			//	点击查询内容获取赋值全局变量
	//			er.on('click', function(e) {
	//				$(this).addClass('border').siblings("span").removeClass('border');
	//				var aa = $(this).text().split(":")[2];
	//				console.log(aa);
	//				flag = aa;
	//			})
	//		}
	//	}

	//搜索群组
	$('.sech_chat_btn').click(function() {
		var id = $('.add_chat_id').val();
		console.log(id);
		$.ajax({
			type: "post",
			url: "/get_group_info",
			data: JSON.stringify({
				'group_id': id
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				console.log(data);
				$(".find_chat_list").children().remove();
				var el = $('<span class="span">' + '　群组名称　' + '　:　' + data["group_name"] + '　　|　　' + '群组ID　　' + '　:' + data["group_id"] + '</span>' + '<br>')
				$(".find_chat_list").append(el);
				el.on('click', function(e) {
					//	点击查询内容获取赋值全局变量
					var aa = $(this).text().split(":")[2];
					$(this).addClass('border').siblings("span").removeClass('border');
					console.log(aa);
					flag = aa;
				})
			},
			error: function(data) {
				alert("异常！");
			}
		});
	});
	//查询好友
	function findFriend() {
		var addtext = $('.searchText').val();
		console.log(addtext);
		$.ajax({
			type: "post",
			url: "/find_user",
			data: JSON.stringify({
				'username': addtext
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['status'] == 'ok') {
					console.log(data);
					var len = data['user_list'].length;

					$('.addleft_userList>ul').children("li").remove();
					for (var i = 0; i < len; i++) {
						var icon_id = data['user_list'][i].icon_id;
						var aa = data['user_list'][i].user_id;
						var er = $('<li>' + '<div class="user">' + "<img src='./img/headimg.jpg'" + '</div>' + '<div class="info">' + '<h3>' + data['user_list'][i].username + '</h3>' +
							'</div>' + '</li>');
						if (icon_id == "") {
							$('.addleft_userList>ul').append(er);

						} else {
							$('.addleft_userList>ul').append(er);
							$('.addleft_userList>ul div.user').eq(i).find('img:first').attr('src', '/downloadPublicFile/' + icon_id);
						}
						er.on('click', function(e) {
							var len = $(this).index();
							var id = data['user_list'][len].user_id
							flag = id;
						})

					}
					console.log(dataFlag);
				}
			},
			error: function(data) {
				alert("异常！");
			}
		})
	}
	$('.searchText').keyup(function() {
			$(this).change(findFriend());
		})
		//	$('.sechf_btn').click(function() {
		//		var addtext = $('.add_text_id').val();
		//		$.ajax({
		//			type: "post",
		//			url: "/find_user",
		//			data: JSON.stringify({
		//				'username': addtext
		//			}),
		//			dataType: 'json',
		//			contentType: 'application/json',
		//			success: function(data) {
		//				if (data['status'] == 'ok') {
		//					var obj = JSON.stringify(data);
		//					findfriend(data);
		//				}
		//			},
		//			error: function(data) {
		//				alert("异常！");
		//			}
		//		});
		//	});


	//添加群组
	$(".add_chat_btn").click(function(data) {
		console.log(user_Id);
		console.log(flag);
		$.ajax({
			type: 'post',
			url: '/add_member_join_group',
			data: JSON.stringify({
				'member_id': user_Id,
				'group_id': flag
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['startus'] == 'ok') {
					alert("成功！点击群组聊天吧！")
				}
				console.log("成功加入群组")
			}
		});
	});
	//添加好友
	$('.vali_btn').click(function(data) {
			var addtext = $('.valiText>textarea').val();
			$.ajax({
				type: "post",
				url: "/add_friend_req",
				data: JSON.stringify({
					'invitee_id': flag,
					'msg': addtext
				}),
				dataType: 'json',
				contentType: 'application/json',
				success: function(data) {
					if (data['status'] == 'ok') {
						alert("添加好友请求成功！")
						console.log("申请好友成功")
							//					getFriendList();
						$('.valiText>textarea').text("");
					} else {
						$('.valiText>textarea').val("");
						alert("你们已经是好友咯")

						console.log(data);
					}
				},
				error: function(data) {
					alert("异常！");
				}
			});
		})
		//	$('.addf_btn').click(function(data) {
		//		var addf = $('.add_text_text').val();
		//		//					var userid=$('.title_text').text(data.user_id);
		//		console.log(addf);
		//
		//		$.ajax({
		//			type: "post",
		//			url: "/add_friend_req",
		//			data: JSON.stringify({
		//				'invitee_id': flag,
		//				'msg': addf
		//			}),
		//			dataType: 'json',
		//			contentType: 'application/json',
		//			success: function(data) {
		//				if (data['status'] == 'ok') {
		//					alert("添加好友请求成功！")
		//					console.log("申请好友成功")
		//					getFriendList();
		//				} else {
		//					console.log(data);
		//				}
		//			},
		//			error: function(data) {
		//				alert("异常！");
		//			}
		//		});
		//	});
		//关闭pushBox


	$(document).on('click', '.messagePush_box .closeimg', function() {
		$(this).parent(".messagePush_box").fadeOut();
	});
	$(document).on('click', '.push_box .closeimg', function() {
		$('.push_box').slideUp();
	});

	//拒绝好友申请
	$(document).on('click', '.add_no', function() {

		$.ajax({
			type: "post",
			url: "/res_add_friend_req",
			data: JSON.stringify({
				"req_id": flag,
				"result": "no" //yes no
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['status'] == 'ok') {
					alert("您已拒接好友申请！");
					$('.push_box').slideUp();
				}
			},
			error: function(data) {
				alert("异常！");
			}
		})
	});
	//备注好友
	$(document).on('click', 'li.notename', function() {
		$('.note_box').slideDown();
	});
//备注界面退出
	$(document).on('click', '.note_btn_n', function() {
		$('.note_box').slideUp();
		event.stopPropagation();
	});

	$(document).on('click', '.note_btn_y', function() {
			var name = $('#note_name').val();
			console.log(dataFlag);
			var len = dataFlag['friend_list'].length;
			var aa = $('.title_text').text();
			for (var i = 0; i < len; i++) {
				console.log(dataFlag['friend_list'][i].note_name);
				console.log(dataFlag['friend_list'][i].username);
				console.log(aa);
				if (aa == (dataFlag['friend_list'][i].note_name) || aa == (dataFlag['friend_list'][i].username)) {
					$.ajax({
						type: "post",
						url: "/change_friend_notename",
						data: JSON.stringify({
							"friend_id": friendIdFlag,
							"note_name": name
						}),
						dataType: 'json',
						contentType: 'application/json',
						success: function(data) {
							if (data['status'] == 'ok') {
								alert("备注修改成功！");
								$('#note_name').text("");
								getFriendList();
							}
						}
					});
				}

			}


		})
		//备注群组


	//展开群组
	$(document).on('click', '.numpeople', function() {
		$('.peoples').slideDown();
		$('.numpeople>div').css({
			'transform': 'rotate(135deg)'
		})
//		$('.exit_chat').css({
//											"display": "block"
//										});

		event.stopPropagation();
	});
	$(document).on('click', '.chat', function() {
		$('.userSet').slideToggle();
		$(this).css({
			'transform': 'rotate(135deg)'
		});


	});
	//退出群组
	$(document).on('click', '.exit_chat', function() {

		$.ajax({
			type: "post",
			url: "/remove_member_from_group",
			data: JSON.stringify({
				"member_id": user_Id,
				"group_id": chat_id
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['status'] == 'ok') {
					alert("您已推出这个群组！")
					get_group_list();
				} else {
					console.log(data);
				}
			},
			error: function(data) {
				alert("异常！");
			}
		});
	});


	//删除好友
	$(document).on('click', '.delfriend', function() {
		var index = $('.ul_touch>ul>li').index();
		var friend = dataFlag['friend_list'][index].friend_id;
		var username = dataFlag['friend_list'][index].username;
		$(this).parent('li').remove();
		$.ajax({
			type: "post",
			url: "/remove_friend",
			data: JSON.stringify({
				"friend_id": friend
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['status'] == 'ok') {
					$(this).parent('li').remove();
					alert(username + '好友已删除');
					getFriendList();
				} else {
					console.log(data);
				}
			},
			error: function(data) {
				alert("异常！");
			}
		});
	});
	//确定添加好友
	$('span.add_yes').click(function(data) {
		console.log(flag);
		$.ajax({
			type: "post",
			url: "/res_add_friend_req",
			data: JSON.stringify({
				"req_id": flag,
				"result": "yes" //yes no
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['status'] == 'ok') {
					alert("添加成功！");
					$('.push_box').slideUp();
					$('.ul_touch>ul>li').append('<div class="user">' + '<img src="" />' + '</div>' + '<div class="info">' + '<h3>' + name + '</h3>' + '</div>')
					getFriendList();
				} else {
					console.log(data);
				}
			},
			error: function(data) {
				alert("异常！");
			}
		});
	});


	//发送消息



	function sendbtn() {
		var aa = $('.sendtext').val();
		if (friendIdFlag == "" && chat_id == "" && aa == "") {
			event.preventDefault();
		} else if (aa == "") {

			alert("请选择好友！");

		} else {
			sendMsg();
		}
	}
	$('.send_btn').click(function() {
		sendbtn();

	});

	//选择群组
	$(document).on('click', '.ul_chat>ul>li', function() {
		$('.chat').css({
			"display": "none"
		});

		var index = $('.ul_chat>ul>li').index(this);
		chat_id = dataChat['group_list'][index].group_id;
		$('.right_header_title').children(".numpeople").remove();
		$(".peoples").children().remove();
		$(this).addClass('libackground').siblings("li").removeClass('libackground');
		$('.title_text').text(dataChat['group_list'][index].group_name);
		$('.peoples').append("<span>" + "ID:" + chat_id + "</span>" + "<br/>");
		$.ajax({
			type: "post",
			url: "/get_group_info",
			data: JSON.stringify({
				"group_id": chat_id,
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				console.log(data);
				if (data['status'] == 'ok') {
					var numpeople = data['member_list'].length;
					$('.right_header_title').append("<div class='numpeople'>" + "(" + numpeople + ")" + "<div></div>" + "</div>");

					for (var i = 0; i < numpeople; i++) {
						$('.peoples').append("<span>" + "    " + data['member_list'][i].nickname + "  |" + "</span>")
					}
					$('.exit_chat').css({
						"display":"block"
					})
					changeChat(chat_id);
				}
			}
		});
	});
	//选择好友
	$(document).on('click', '.ul_touch>ul>li', function() {
		$('.chat').css({
			"display": "block"
		});
		$('.exit_chat').css({
			"display": "none"
		});
		$('.right_header_title').children(".numpeople").remove();
		var index = $(this).index();
		$(this).addClass('libackground').siblings("li").removeClass('libackground');
		var friend_id = myfriend_list['friend_list'][index].friend_id;
		$('.title_text').text(myfriend_list['friend_list'][index].username);
		chat_id = '';
		//得到聊天信息
		$.ajax({
			type: "post",
			url: "/get_chat_msg_by_count",
			data: JSON.stringify({
				"friend_id": friend_id,
				"offset": "0",
				"size": "30"
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['status'] == 'ok') {
					$('.msg_text').text("");
					friendIdFlag = friend_id;
					changeFriend(friend_id);
				}
			}

		});
	});
	//添加好友界面
	$('.add_friend1').click(function() {
		$('.addleft').addClass('effect-0');
		$('.addright').addClass('effect-0');
	})
	$('.addback').click(function() {
			$('.addleft').removeClass('effect-0');
			$('.addright').removeClass('effect-0');
			$('.addleft_userList ul li').remove();
			$('.searchText').val("");
		})
		//表情栏  
	$(document).on('click', '.face', function() {
		$('.rf_tool ul li div.face_box').slideDown(200);
		$('.face').css({
			'display': 'none'
		});
	});
	$("body").click(function() {
		$('.rf_tool ul li div.face_box').slideUp(200);
		$('.face').css({
			'display': 'block'
		});
		$('.addFriend1').slideUp(200);
		$('.mask').removeClass('now');
		$(".userSet").slideUp();
		$('.peoples').slideUp();
		$("#headimg").slideUp();
		$('.search_box').slideUp();
		$('.addpeople_box').slideUp();
		$('.chat').css({
			'transform': 'rotate(-45deg)'
		});
		$('.numpeople>div').css({
			'transform': 'rotate(-45deg)'
		})
	});
	//修改头像
	$('.h3').on("click", function() {
		$("#headimg").slideToggle();
		event.stopPropagation();
	});
	$("#headimg").on("click", function() {
		event.stopPropagation();
	});

	function sendMsg() {
		var msg = $('.sendtext').val();
		console.log(chat_id);
		console.log(friendIdFlag);
		console.log(Extra);
		$.ajax({
			type: "post",
			url: "/send_msg",
			data: JSON.stringify({
				"group_id": chat_id,
				"receiver_id": [friendIdFlag],
				"data": Base64.encode(msg), //base64 encode
				//				"extra": Base64.encode(Extra) //base64 encode
			}),
			dataType: 'json',
			contentType: 'application/json',
			success: function(data) {
				if (data['status'] == 'ok') {
					$('.sendtext').val("");
					if (Extra == '') {
						$('.msg_text').append("<div class='msg_my_style'>" + "<div class='myimg'>" + "<img src=''/>" + "</div>" + "<div class='msg_my'>" + "<div class='arrow'></div>" + "<div class='remsg'>" + msg +
							"</div></div><br /></div>");
						$(".myimg>img").attr('src', /downloadPublicFile/ + user_info.icon_id);
					} else {
						$('.msg_text').append("<div class='msg_my_style'>" + "<div class='myimg'>" + "<img src=''/>" + "</div>" + "<div class='msg_my'>" + "<div class='arrow'></div>" + "<div class='remsg'>" + "<img src='' />" +
							"</div></div><br /></div>");
						$(".myimg>img").attr('src', /downloadPublicFile/ + user_info.icon_id);
						$('.myimg').siblings('.msg_my').children('.remsg').find('img').attr('src', '/downloadTempFileFromOther/' + fileId + '/' + user_Id);
					}

					$('.msg_text').scrollTop($('.msg_text')[0].scrollHeight);
				}
			},
			error: function(data) {
				alert("异常！");
			}
		});

	}

	$('#sendimgflie').on('change', (function() {

		sendImg();
	}));

	function sendImg() {

		var imgPath = $('#sendimgflie').val()
		msg_type = imgPath;

		if (imgPath == "") {
			alert("请选择上传图片！");
			return;
		}
		//判断上传文件的后缀名
		var strExtension = imgPath.substr(imgPath.lastIndexOf('.') + 1);
		if (strExtension != 'jpg' && strExtension != 'gif' && strExtension != 'png' && strExtension != 'PNG' && strExtension != 'bmp') {
			alert("请选择图片文件");
			return;
		} else {
			$.ajaxFileUpload({
				url: "/uploadTempFileToOther/" + user_Id,
				secureuri: false,
				dataType: 'text',
				fileElementId: "sendimgflie",
				success: function(data) {
					console.log(user_Id)
					var reg = /<pre.+?>(.+)<\/pre>/g;
					var result = data.match(reg);
					data = RegExp.$1;
					console.log(data);
					data = JSON.parse(data);
					console.log(data);
					if (data['status'] == 'ok') {
						console.log(data);
						fileId = data['fileId'];

						$('.sendtext').val("");
						$.ajax({
							type: "post",
							url: "/send_msg",
							data: JSON.stringify({
								"group_id": chat_id,
								"receiver_id": [friendIdFlag],
								"data": Base64.encode(fileId), //base64 encode
								"extra": Base64.encode("image") //base64 encode
							}),
							dataType: 'json',
							contentType: 'application/json',
							success: function(data) {
								console.log(Extra);
								console.log(data);
								if (data['status'] == 'ok') {
									$('.msg_text').append("<div class='msg_my_style'>" + "<div class='myimg'>" + "<img src=''/>" + "</div>" + "<div class='msg_my'>" + "<div class='arrow'></div>" + "<div class='remsg'>" +
										"<img src=" + '/downloadTempFileFromOther/' + fileId + "/" + user_Id + ">" + "</div></div><br /></div>");
									$(".myimg>img").attr('src', /downloadPublicFile/ + user_info.icon_id);
									$('.msg_text').scrollTop($('.msg_text')[0].scrollHeight);
								}

								$('#sendimgflie').on('change', (function() {
									sendImg();
								}));
							}
						});
					}
				},
				error: function(data) {
					console.log(data);
					alert("上传失败，请检查网络后重试");
				}
			});
		}
	}


	//jquery结束
});

//登陆文件服务器

$.ajax({
	type: "post",
	url: "/file_login",
	type: 'post',
	data: JSON.stringify({
		"username": sessionStorage['username'],
		"password": sessionStorage['password'],
	}),
	dataType: 'json',
	contentType: 'application/json',
	success: function(data) {
		console.log(data);
	}
});
//发送图片


//上传头像
function uploadImage() {
	//判断是否有选择上传文件
	var imgPath = $('#uploadFile').val()
	console.log(imgPath);
	if (imgPath == "") {
		alert("请选择上传图片！");
		return;
	}
	//判断上传文件的后缀名
	var strExtension = imgPath.substr(imgPath.lastIndexOf('.') + 1);
	if (strExtension != 'jpg' && strExtension != 'gif' && strExtension != 'png' && strExtension != 'PNG' && strExtension != 'bmp') {
		alert("请选择图片文件");
		return;
	} else {
		$.ajaxFileUpload({
			url: "/uploadPublic",
			secureuri: false,
			dataType: 'text',
			fileElementId: "uploadFile",
			success: function(data) {

				console.log(data);
				var reg = /<pre.+?>(.+)<\/pre>/g;
				var result = data.match(reg);
				data = RegExp.$1;
				console.log(data);
				data = JSON.parse(data);
				console.log(data);
				if (data['status'] == 'ok') {

					var icon_id = data['fileId'];
					$.ajax({
						type: "post",
						url: "/update_user_info",
						dataType: 'json',
						contentType: 'application/json',
						data: JSON.stringify({
							"icon_id": icon_id
						}),
						success: function(data) {
							if (data['status'] == 'ok')
								$(".left_header div.user img").attr("src", /downloadPublicFile/ + icon_id);
							alert("头像修改成功");
							console.log(data);
						}
					});


				}

			},
			error: function(data) {

				console.log(data);

				alert("上传失败，请检查网络后重试");
			}
		});
	}
}