import style from './style.css'
document.getElementById('_successfull_').addEventListener('click', function(){
    WeixinJSBridge.call('closeWindow');
})