import style from './style.css'

if(sessionStorage.getItem('_money')){
    document.getElementById('_money').innerHTML = sessionStorage.getItem('_money');
}

document.addEventListener('DOMContentLoaded', function(){
    sessionStorage.setItem('successfull', 'true');
    try {
        if(location.href.split('?')[1] == 0o767){
            document.getElementById('_successfull_goto').addEventListener('click', function(){
                window.location.href = 'https://mp.weixin.qq.com/s/xlUZ3C5_bcdRoOGsyordqg'; // 跳转问下图文
            });
            document.getElementById('_successfull_').addEventListener('click', function(){
                window.location.href = 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzI4NjkxMDE2Ng==#wechat_redirect'
            });
        }else{
            alert('Error not supported or defined');
        }
    } catch (error) {
        alert(error);
    }
});