const { ipcRenderer,shell,remote } = require('electron');
  const {Menu, MenuItem} = remote;
  //menu items
  

const { Notify,Alert }  = require('./js/modules/Notifications');
//funtion to controll custom tittle bar
/*function titleBarBtns(type) {
    ipcRenderer.sendSync('synchronous-message', type);
}*/

//main js file
const fs = require('fs');


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

var data = ipcRenderer.sendSync('get-file-data');
if (data ===  null) {
    console.log("There is no file");
} else {
    console.log(data);
}
//
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');
//drpdowns
jQuery('#notificationsIcon').on('click',(e)=>{
    var data = jQuery(e.currentTarget).siblings('.drop-content');
    jQuery(data).slideToggle('fast');
    data = null;
})
jQuery(window).on('click',(e)=>{
    //if(jQuery(e.target).is('.drop-content'))
    if(jQuery('.drop-content').css('display') == 'block'){
        if(jQuery(e.target).is('.drop-content') ||
        jQuery(e.target).is('.dropdownTrigger')){
            return;
        }
        jQuery('.drop-content').slideUp();
    }
})
//navbar
jQuery('#sideNav li.dropdown').on('click',(e)=>{
    if(jQuery(e.target).is('.subMenuLink') || jQuery(e.target).is('.subMenuLink i')) return;
    jQuery(e.currentTarget).children('ul.sub-menu').slideToggle();
})
//modals
class Hmodals{
    constructor(el){
        this.el = jQ(el);
    }
    show(){
        return new Promise((resolve,reject)=>{
            this.el.fadeIn('fast',()=>{
                resolve(this.el);
            })
        })
    }
    hide(){
        return new Promise((resolve,reject)=>{
            this.el.fadeOut('slow',()=>{
                resolve(this.el);
            })
        })
    }
    toogle(){
        return new Promise((resolve,reject)=>{
            this.el.fadeToggle('fast',()=>{
                resolve(this.el);
            })
        })
    }
}
jQuery('.hmodal').on('click','.close',(e)=>{
    jQuery(e.currentTarget).parents('.hmodal').fadeOut();
})
function showModal(el){
    if(jQuery(el).is('.hmodal')){
        jQuery(el).fadeIn("fast");
    }
}
