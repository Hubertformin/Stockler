//main js file
var $  = jQuery = require('jquery');
M.AutoInit();

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

//function search table
function searchTable(e,tb,num){
    var val = $(e.target).val().toLowerCase(),
        table = $(tb),
        tr = table.children('tbody').children('tr'),
        td = [];

    //now seraching throught tables
    for(let j=0;j<tr.length;j++) {
        var i = 0;
        td = [];
        while (i < num){
            td.push(tr[j].getElementsByTagName('td')[i])
            i++
        }
        for(var k = 0;k<td.length;k++){
            if(td[k].innerText.toLowerCase().indexOf(val) > -1){
                tr[j].style.display = 'table-row';
                break;
            }else{
                tr[j].style.display = 'none';
            }

        }
    }


}