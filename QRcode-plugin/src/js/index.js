$(function(){
    // 获取url
    window.addEventListener("load", function() {
        chrome.tabs.query({
            currentWindow: true,
            active: true
        }, function(tabs) {
            init(tabs[0].url);
        })
    });

    var getEncodeUrl = function (url) {
        var urlArr = url.split('?');
        // var baseUrl = ~url.indexOf('?') ? urlArr[0] + '?' + encodeURIComponent(urlArr[1]) : url;
        if (urlArr.length > 0) {
            url = url.replace(/&/g, '$');
        }
        
        return encodeURIComponent(url);
    };

    var init = function (url) {
        var defaultConfig = {
            QRcodeColor: '#000000',
            titleId: '1'
        };
        var $select = $('select');
        var $body = $('body');
        var bodyWidth = 280;
        var $qrCode = $('#qrcode');
        var $setBtn = $('.set-btn');
        var $picker = $('#picker');
        var $urlBox = $('#url-box');
        var baseUrl = getEncodeUrl(url), realUrl, qrCodeColor = defaultConfig.QRcodeColor, titleId = defaultConfig.titleId, timerId;

        var toQRcode = function (url, foreground) {
            $qrCode.html('');
            $('#qrcode').qrcode({
                render: "canvas", //也可以替换为table
                width: 600,
                height: 600,
                foreground: foreground || qrCodeColor,
                background: "#FFF",
                text: url
            });
        };

        var showSetConfig = function() {
            $setBtn.fadeIn('slow');
            $setBtn.find('span').removeClass('animation-small').addClass('animation-big');
            clearTimeout(timerId);
            timerId = setTimeout( function () {
                clearTimeout(timerId);
                $setBtn.find('span').removeClass('animation-big').addClass('animation-small');
                $setBtn.fadeOut('slow');
            }, 6500);
        };


        var getUrl = function (val) {
            if (val === '1') {
                realUrl = url;
            } else if (val === '2') {
                realUrl = 'baidumap://map/cost_share?url=' + baseUrl;
            } else if (val === '3') {
                realUrl = 'baidumap://map/cost_share?url=' + baseUrl + '&hiddenTitle=1';
            } else if (val === '4') {
                realUrl = 'baidumap://map/component?comName=carowner&target=open_web_page&popRoot=no&param=%7B%22url%22%3A%22' + baseUrl + '%22%2C%22from%22%3A%22chrome-qrcode%22%2C%22showShare%22%3A0%7D';
            } else if (val === '5') {
                realUrl = 'baidumap://map/component?comName=lbc&target=webshell_login_page&param=%7B%22url%22%3A%22' + baseUrl + '%22%7D';
            } else if (val === '6') {
                realUrl = 'baiduboxapp://v1/easybrowse/open?upgrade=1&type=tags&url=' + baseUrl + '&append=1&slog=%7b%22from%22%3a%22feed%22%7d&toolbaricons=%7B%22toolids%22%3A%5B%222%22%2C%223%22%5D%7D&newbrowser=1';
            } else if (val === '7') {
                realUrl = 'baiduboxapp://v1/easybrowse/open?upgrade=1&type=video&append=1&slog=%7b%22from%22%3a%22feed%22%7d&style=%7b%22toolbaricons%22%3a%7b%22toolids%22%3a%5b%221%22%2c%222%22%2c%223%22%5d%7d%2c+%22menumode%22%3a%222%22%7d&newbrowser=1&url=' + baseUrl;
            }
            return realUrl;
        };

        $select.change( function () {
            var val = $(this).find(':selected').val();
            titleId = val;
            showSetConfig();
            toQRcode(getUrl(val), qrCodeColor);
        });

        // 初始化二维码颜色等
        (function(){
            var config = JSON.parse(localStorage.getItem('QRcodeTrans'));
            defaultConfig = config || defaultConfig;
            qrCodeColor = defaultConfig.QRcodeColor;
            titleId = defaultConfig.titleId;
            $select.find('option[value=' + titleId + ']').attr('selected', true);
            $select.change();
            $picker.find('span').css('background', qrCodeColor);
        })();

        $picker.colpick({
            flat:false,
            color: qrCodeColor,
            layout: 'hex',
            onChange: function (color, color2) {
                qrCodeColor = '#' + color2;
                toQRcode(realUrl || baseUrl, qrCodeColor);
                $picker.find('span').css('background', qrCodeColor);
                showSetConfig();
            }
        });

        $body.on('click', '[data-action]', function() {
            var $this = $(this);
            var action = $this.data('action');
            switch(action) {
                case 'big':
                    toBig();
                    break;
                case 'small':
                    toSmall();
                    break;
                case 'copy':
                    copyQRcodeUrl($this);
                    break;
                case 'showUrl':
                    showUrl();
                    break;
                case 'setConfig':
                    setConfig();
                    break;
                default:
                    break;
            }

        });

        var toBig = function() {
            bodyWidth = bodyWidth + 80;
            if (bodyWidth > 512) bodyWidth = 512;
            $qrCode.css({
                width: bodyWidth + 'px'
            })
        };

        var toSmall = function () {
            bodyWidth = bodyWidth - 80;
            if (bodyWidth < 280) bodyWidth = 280;
            $qrCode.css({
                width: bodyWidth + 'px'
            })
        };

        var clipboard = new ClipboardJS('.copy');
        clipboard.on('success', function(e) {
            e.clearSelection();
        });

        var copyQRcodeUrl = function ($el) {
            $el.find('span').text('复制成功');
            $el.css('color', 'red');
            $el.attr('data-clipboard-text', realUrl || baseUrl);

            setTimeout( function () {
                $el.find('span').text('复制URL');
                $el.css('color', '#000');
            }, 2000)
        };

        var showUrl = function () {
            $urlBox.show();
            $urlBox.text(decodeURIComponent(realUrl || baseUrl));
            setTimeout( function () {
                $urlBox.hide();
            }, 60000);
        };

        var setConfig = function () {
            defaultConfig = {
                QRcodeColor: qrCodeColor,
                titleId: titleId
            };
            localStorage.setItem('QRcodeTrans', JSON.stringify(defaultConfig));
        }
    }

});
