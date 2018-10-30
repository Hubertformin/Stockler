//main js file

jQuery('#splashLoader').waitMe({
    effect : 'stretch',
    text : 'chargement...',
    bg : 'rgba(255,255,255,0)',
    color : '#ffc107',
    maxSize : '',
    waitTime : -1,
    textPos : 'vertical',
    fontSize : ''
});
//notifications class
class Notify {
    error(msg,time = 4000){
        M.toast({html:`<i class="left material-icons red-text text-darken-3">cancel</i>${msg}`,displayLength:time});
    }
    success(msg,time = 4000){
        M.toast({html:`<i class="left material-icons green-text text-darken-3">check_circle</i>${msg}`,displayLength:time});
    }
    info(msg,time = 4000){
        M.toast({html:`<i class="left material-icons light-blue-text text-darken-3">error</i>${msg}`,displayLength:time});
    }
    warning(msg,time = 4000){
        M.toast({html:`<i class="left material-icons amber-text text-darken-3">warning</i>${msg}`,displayLength:time});
    }

}
//calling the notifications class
const notifications = new Notify();
//i. active nav links
jQuery('#main-navbar a').click((e)=>{
    jQuery('#main-navbar a').removeClass('active');
    jQuery(e.target).addClass('active');
})