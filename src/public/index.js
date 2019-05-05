import style from './style.css'

const _conf = {
    httpJoin: 'http://test.cbcoffee.cn:8086/',  //http://mapi.cbcoffee.cn:8080/
    _wx_httpJoin: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx71c7dc4f5208bb07&redirect_uri=http://www.cbcoffee.cn/sharedcoffee/tran/transfer.html&response_type=code&scope=snsapi_userinfo&state=' + location.href.split('?')[0],
}

class _wx_secret {
    constructor(_secret) {
        this.secret = _secret.secret
        this.code = _secret.code
    }

    get(_code) {
        var req = new RegExp("(^|&)" + _code + "=([^&]*)(&|$)", "i"), res = window.location.search.substr(1).match(req);
        if (res != null) return decodeURI(res[2]);
        return null;
    }

    login() {
        let it = this;
        this._xml({
            method: 'GET',
            uri: _conf.httpJoin + 'WeChat_login',
            async: true,
            xmldata: {
                code: this.get('code')
            },
            done: function (res) {
                sessionStorage.setItem('token', JSON.stringify({
                    _name: res.user_token,
                    _id: res.user_id
                }));
                if (res.type === '1') {
                    try {
                        it.record(res.user_id);
                    } catch (error) {
                        alert(error);
                    }
                }
            }
        })
    }

    record(_userid) {
        this._xml({
            method: 'GET',
            uri: _conf.httpJoin + 'record_user_source',
            async: true,
            xmldata: {
                userId: _userid,
                machineNumber: JSON.parse(sessionStorage.getItem('_token')).machineNumber,
                source: 1
            },
            done: function (res) {
                console.log('已成功提交用户信息');
            }
        })
    }

    unpaid(){
        this._xml({
            method: 'GET',
            uri: _conf.httpJoin + 'unpaid_order_detail',
            async: true,
            xmldata: {
                userId: JSON.parse(sessionStorage.getItem('token'))._id,
                orderId: JSON.parse(sessionStorage.getItem('_token')).orderId
            },
            done: function (res) {
                if(res.statusCode.status === '6666'){
                    document.getElementById('_money').innerHTML = parseFloat(res.unpaidOrder.productPrice / 100).toFixed(2)
                }else{
                    console.log(res.statusCode.msg);
                }
            }
        })
    }

    post() {
        let it = this;
        this._xml({
            method: 'POST',
            uri: _conf.httpJoin + 'weChat_pay_machine',
            async: false,
            xmldata: {
                orderId: JSON.parse(sessionStorage.getItem('_token')).orderId,
                userId: JSON.parse(sessionStorage.getItem('token'))._id
            },
            done: function (res) {
                if (res.statusCode.status == '1009') {
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
                            res.err_msg == "get_brand_wcpay_request:ok" ? console.log(res)/*/ 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。/*/ : (() => {
                                it._xml({
                                    method: 'GET',
                                    uri: _conf.httpJoin + 'client_order_cancel',
                                    async: true,
                                    xmldata: {
                                        orderId: JSON.parse(sessionStorage.getItem('_token')).orderId
                                    },
                                    done: function (res) {
                                        console.log('已提交取消订单信息');
                                    }
                                })
                            });
                        }
                    )
                } else {
                    alert(res.statusCode.msg);
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
var _wx_ = new _wx_secret({
    secret: 'cnzmg',
    code: '_mac_18'
});

!sessionStorage.getItem('token') ? (_wx_.get('code') ? _wx_.login() : (() => {
    try {
        if (!_wx_.get('orderId')) {
            throw 'Error  orderId not empty';
        } else {
            sessionStorage.setItem('_token', JSON.stringify({
                machineNumber: _wx_.get('machineNumber'),
                orderId: _wx_.get('orderId')
            }))
            location.href = _conf._wx_httpJoin;
        }
    } catch (error) {
        alert(error);
    }
})()) : null;

document.getElementById('_submit').addEventListener('click', () => {
    _wx_.post();
}, true)
//查询 订单金额
_wx_.unpaid();