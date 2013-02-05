(function ($) {
    $.alerts = function (options) {
        options = $.extend({}, $.alerts.defaults, options);

        var ie6 = ($.browser.msie && $.browser.version < 7);
        var $body = $(document.body);
        var $window = $(window);

        var isOverlay = options.isOverlay && options.follow === null;
        var isFixed = options.fixed;
        if (options.follow) {
            isFixed = false;
        }
        else if (isOverlay) {
            isFixed = true;
        }

        var $outerBox, $overlay, $innerBox, $container, $title, $close, $content, $buttons, $btnOk, $btnCancel;
        // 构造HTML元素
        if (isOverlay) {
            $outerBox = $('<div></div>');
            if (options.useIframe && (($('object, applet').length > 0) || ie6)) {
                $overlay = $('<iframe src="javascript:false;" style="display:block;position:absolute;z-index:-1;"></iframe>').appendTo($outerBox);
            }
            else {
                if (ie6) { $('select').css('visibility', 'hidden'); }
                $overlay = $('<div></div>').appendTo($outerBox);
            }

        }
        $innerBox = $('<div class="' + options.cssClass + '"></div>').width(options.width);
        $container = $('<div class="container"></div>').appendTo($innerBox);
        if (options.hasTitle) {
            $title = $('<div class="title" unselectable="on">' + options.title + '</div>').appendTo($container);
            $close = $('<a href="javascript:;" class="close"></a>').appendTo($title).click(function () { removeBox(true, false, $content); });
        }
        $content = $('<div class="content" unselectable="on">' + options.message + '</div>').appendTo($container);
        if (options.type != 'none') {
            $buttons = $('<div class="buttons" unselectable="on"></div>').appendTo($container);
            $btnOk = $('<a href="javascript:;" class="btn_gray btn_ok">' + options.okButton + '</a>')
                            .appendTo($buttons)
                            .click(function () { closeBox(true, $content); })
                            .keypress(function (e) { if (e.keyCode == 13) closeBox(true, $content); });
            if (options.type == 'confirm') {
                $btnCancel = $('<a href="javascript:;" class="btn_gray btn_cancel">' + options.cancelButton + '</a>')
                                    .appendTo($buttons).click(function () { removeBox(true, false, $content); })
                                    .keypress(function (e) { if (e.keyCode == 13) removeBox(true, false, $content); });
            }
        }

        if (isOverlay) {
            $innerBox.appendTo($outerBox);
            $outerBox.appendTo($body);
        }
        else { $innerBox.appendTo($body); }

        var closeBox = function (v, o) {
            var close = options.submit(v, o);
            if (close === undefined || close) { removeBox(true, v, o); }
        };

        var removeBox = function (callCallback, v, o) {
            $innerBox.remove();
            // 删除绑定的事件
            if (ie6 && isFixed) { $body.unbind('scroll', ie6scroll); }
            $window.unbind('resize', setPosition);
            if (isOverlay) {
                $overlay.fadeOut(options.overlaySpeed, function () {
                    $overlay.unbind('click', fadeClick);
                    $overlay.remove();
                    $outerBox.unbind('keydown keypress', keyPress);
                    $outerBox.remove();
                    if (ie6 && !options.useIframe) {
                        $('select').css('visibility', 'visible');
                    }
                });
            }
            else {
                $window.unbind("keydown keypress", keyPress);
                $window.unbind("click", fadeClick);
            }
            if (callCallback) { options.callback(v, o); }
        };
        var fadeClick = function (event) {
            if (options.persistent) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                var i = 0;
                $innerBox.addClass(options.warningClass);
                var intervalid = setInterval(function () {
                    $innerBox.toggleClass(options.warningClass);
                    if (i++ > 1) {
                        clearInterval(intervalid);
                        $innerBox.removeClass(options.warningClass);
                    }
                }, 100);
            }
            else { removeBox(true, false, null); }
        };
        var keyPress = function (e) {
            var key = (window.event) ? event.keyCode : e.keyCode; // MSIE or Firefox?
            //escape key closes
            if (key == 27) {
                fadeClick();
            }
        };
        var ie6scroll = function () {
            if (isOverlay) {
                $outerBox.css({ top: $window.scrollTop() });
            }
            else {
                var t;
                try {
                    t = isNaN(options.top) ? parseFloat(options.top) / 100 * $window.height() : options.top
                } catch (e) {
                    t = ($window.height() - $outerBox.outerHeight()) / 2;
                }
                $innerBox.css({ top: $window.scrollTop() + t });
            }
        };
        var setPosition = function () {
            if (isOverlay) {
                $outerBox.css({
                    position: (ie6) ? "absolute" : "fixed",
                    height: $window.height(),
                    width: "100%",
                    top: (ie6) ? $window.scrollTop() : 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                });
                $overlay.css({
                    position: "absolute",
                    height: $window.height(),
                    width: "100%",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                });
                $innerBox.css({
                    position: "absolute",
                    top: options.top,
                    left: "50%",
                    marginLeft: (($innerBox.outerWidth() / 2) * -1)
                });
            }
            else if (options.follow != null) {
                $innerBox.css({
                    position: "absolute",
                    top: $(options.follow).offset().top + options.followY,
                    left: $(options.follow).offset().left + options.followX
                });
            }
            else {
                $innerBox.css({
                    position: (ie6) ? "absolute" : (isFixed ? "fixed" : "absolute"),
                    top: options.top,
                    left: "50%",
                    marginLeft: (($innerBox.outerWidth() / 2) * -1)
                });
            }
        };
        var setStyle = function () {
            if (isOverlay) {
                $outerBox.css({
                    zIndex: options.zIndex - 1
                });
                $overlay.css({
                    zIndex: options.zIndex - 1,
                    display: "none",
                    'background-color': options.overlayColor,
                    opacity: options.overlayOpacity
                });
            }
            $innerBox.css({
                zIndex: options.zIndex,
                display: "none"
            });
        };

        setPosition();
        setStyle();

        // 显示
        if (isOverlay) {
            $overlay.fadeIn(options.overlaySpeed, function () {
                $innerBox[options.show](options.boxSpeed, function () {
                    options.loaded({
                        width: $overlay.outerWidth(),
                        height: $overlay.outerHeight(),
                        top: $overlay.offset().top,
                        left: $overlay.offset().left
                    });
                });
            }).click(fadeClick); // 绑定遮罩点击事件
            $outerBox.bind("keydown keypress", keyPress);
        }
        else {
            $innerBox[options.show](options.boxSpeed, function () {
                options.loaded({
                    width: $innerBox.outerWidth(),
                    height: $innerBox.outerHeight(),
                    top: $innerBox.offset().top,
                    left: $innerBox.offset().left
                });
                $innerBox.hover(function () {
                    $('body').not($innerBox).unbind("click", fadeClick);
                }, function () {
                    $('body').not($innerBox).bind("click", fadeClick);
                });
                $('body').not($innerBox).bind("click", fadeClick);
                $('body').bind("keydown keypress", keyPress);
            });
        }

        if (options.autoClose > 0) {
            setTimeout(removeBox, options.autoClose);
        }
        if (ie6 && isFixed) { $window.scroll(ie6scroll); }
        $window.resize(setPosition);
    };

    $.alerts.defaults = {
        title: 'alerts',
        message: '提示信息',
        width: 250,
        cssClass: 'alerts',      // 提示框的样式
        type: 'alert',            // 对话框类型 alert 或 confirm 或 none
        okButton: '确定',         // 确定按钮的文字
        cancelButton: '取消',     // 取消按钮的文字
        isOverlay: true,          // 是否显示遮罩
        overlayColor: '#000',     // 遮罩的颜色
        overlayOpacity: 0.5,      // 遮罩透明度
        overlaySpeed: 'slow',     // 遮罩显示或隐藏的速度
        fixed: true, 		      // 是否静止定位 // 有遮罩时默认为ture
        follow: null, 		      // 是否跟随自定义元素来定位，跟踪元素时忽略遮罩
        followX: 0, 			  // 相对于自定义元素的X坐标的偏移
        followY: 0, 			  // 相对于自定义元素的Y坐标的偏移
        hasTitle: true,
        zIndex: 10000,
        boxSpeed: 'fast',         // 提示框显示或隐藏的速度
        show: 'fadeIn',           // 提示框显示的方式
        useIframe: false,
        top: "25%",
        persistent: true,
        warningClass: 'warning',
        autoClose: 0,             // 自动关闭的时间
        loaded: function () { },  // 加载完成触发的事件
        submit: function () { return true; }, // 返回false时可以阻止对话框关闭和回调函数的调用
        callback: function () { } // 回调函数
    };

    $.alerts.setDefaults = function (o) { $.alerts.defaults = $.extend({}, $.alerts.defaults, o); };

})(jQuery);
