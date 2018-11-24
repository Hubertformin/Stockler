//Requiring modules
//1. export
var TableToExcel = require('./js/modules/TableToExcel');
//2 print
//const remote = require('electron').remote;
const print = remote.require('electron-thermal-printer');
//declaring
var Stockler = angular.module('StocklerApp',['ngRoute','ngAnimate']);
//routing
Stockler.config(($routeProvider)=>{
    $routeProvider
        .when('/',{
            templateUrl:'components/dashboard.html'
        })
        .when('/items',{
            templateUrl:'components/items.html'
        })
        .when('/users',{
            templateUrl:'components/users.html'
        })
        .when('/reports/:tab',{
            templateUrl:'components/reports.html'
        })
        .when('/rep-dash',{
            templateUrl:'components/reports-dashboard.html'
        })
        .when('/stock-reports/:type/:redir',{
            templateUrl:'components/stocks-reports.html'
        })
        .when('/today-records',{
            templateUrl:'components/today-records.html'
        })
});
//the main controller
Stockler.controller('mainCtr',($scope,$filter)=>{
    //creating and fetching databses
    var Dexie = require('dexie');

    $scope.db = new Dexie('StocklerDB');
    $scope.db.version(1).stores({
        users:'++id,&name,password,email,mgr,status,startDate,permissions',
        brand:'++id,&name,date',
        items:'++id,brand,&model,qty,orderedQty,staff,price,date,status,lowStockQty,brokenStatus',
        sales:'++id,&inv,name,phone,date,*items,totalQty,totalPrice,staff',
        syncRemote:'&id,date',
        syncImport:'&id,date,range',
        itemRecords:'++id,brand,model,qty,date'
    });
    //excel
    $scope.excel = new TableToExcel();
    ////alert
    $scope.alertMsg = [];
    //empty varaibles for other
    $scope.users = [];
    $scope.brand = [];
    $scope.items = [];
    $scope.sales = [];
    $scope.notificatonMsg = [];
    $scope.currentUser = '';
    $scope.sync = {
        online:'',
        import:''
    }
    $scope.db.transaction('rw',$scope.db.users,$scope.db.brand,$scope.db.items,$scope.db.sales,()=>{
        $scope.db.users.toArray()
        .then((data)=>{
            $scope.users = data;
         });
        //
        $scope.db.brand.toArray()
            .then((data)=>{
                $scope.brand = data;
            })
        $scope.db.items.toArray()
        .then((data)=>{
            $scope.items = data;
         });
        //
        $scope.db.sales.toArray()
        .then((data)=>{
            $scope.sales = data;
         });
        //
    })
    .then(()=>{
        //hide splash screen
        jQuery('#splashScreen').remove();
        //console.log($scope.items);
        //show manager or login depending on user length
        if($scope.users.length == 0){
            jQuery('#manager').show();
        }else{
            if(sessionStorage.getItem('user') === null){
                jQuery('#login').show();
                return;
            }
            $scope.currentUser = JSON.parse(sessionStorage.getItem('user'));
        }

    })
    .catch(()=>{
        notifications.error('Erreur de la base de donnees');
    })
    //1.2 Database hooks
    //1.2.1 Item hook to filter items as low stock,broken,inactive,active
    $scope.filterItems = {
        lowStock:[],
        broken:[],
        inactive:[],
        active:[]
    };
    //function to add into items records
    $scope.addItemsRecords = function(obj) {
        $scope.db.itemRecords.add({
            brand:obj.brand,
            model:obj.model,
            date:obj.date,
            qty:obj.qty,
            staff:obj.staff
        })
    }
    //Hooks
    $scope.db.items.hook('reading',(obj)=>{
        //firt we modify accordingly
        if(obj.qty == 0) {
            obj.status = 'inactive';
            var o = new Date(obj.date).getTime(),d = new Date().getTime();
            var diff = Math.floor((d - o)/(1000*60*60*24));
            obj.brokenStatus = (diff >= 30)?true:false;
            diff = o = d = null;
            //
        }
        //conditions to pass in to filer array
        if(obj.qty > 0 && obj.qty <= obj.lowStockQty){
            var exist = $scope.filterItems.lowStock.some((el)=>{
                return el.id === obj.id;
            })
            if(!exist){
                obj.status = 'low-stock'
                $scope.filterItems.lowStock.push(obj);
                $scope.alertMsg.push({
                    type:obj.status,
                    broken:obj.brokenStatus,
                    brand:obj.brand,
                    action:'#!stock-reports/low_stock/none',
                    msg:': stock est faible',
                    model:obj.model,
                    qty:obj.qty,
                })
            }
            delete exist;
        }
        if(obj.brokenStatus === true){
            var exist = $scope.filterItems.broken.some((el)=>{
                return el.id === obj.id;
            })
            if(!exist){
                $scope.filterItems.broken.push(obj);
                $scope.alertMsg.push({
                    type:obj.status,
                    broken:obj.brokenStatus,
                    brand:obj.brand,
                    action:'#!stock-reports/broken_stocks/none',
                    msg:'est en rupture de stock depuis plus de 30 jours+',
                    model:obj.model,
                    qty:obj.qty,
                })
            }
            delete exist;
        }
        if(obj.status === 'inactive'){
            var exist = $scope.filterItems.inactive.some((el)=>{
                return el.id === obj.id;
            })
            if(!exist){
                $scope.filterItems.inactive.push(obj);
                $scope.alertMsg.push({
                    type:obj.status,
                    broken:obj.brokenStatus,
                    brand:obj.brand,
                    action:'#!stock-reports/out_of_stock/none',
                    msg:'est epuise',
                    model:obj.model,
                    qty:obj.qty,
                })
            }
            delete exist;
        }
        if(obj.status === 'active' && obj.qty > 0  || obj.status > 0){
            var exist = $scope.filterItems.active.some((el)=>{
                return el.id === obj.id;
            })
            if(!exist){
                $scope.filterItems.active.push(obj);
            }
            delete exist;
        }
        return obj;
    });
    $scope.db.items.hook('updating',(mod,pk,obj)=>{
        $scope.filterItems = {
            lowStock:[],
            broken:[],
            inactive:[],
            active:[]
        };
        $scope.alertMsg = [];
        var keys = Object.getOwnPropertyNames(mod);
        var qty_exist = keys.some(el=>{
            return el == 'qty';
        });
        if(qty_exist){
            if((mod.qty+obj.qty)<0){
                throw 'negative_qty';
            }
        }
        
    });
    

    //2. Manager account creation
    jQuery('#manager-form').on('submit',(e)=>{
        e.preventDefault();
        if($scope.mgr_name == '' || typeof $scope.mgr_name !== 'string'){
            notifications.warning('Nom incorrect');
            return;
        }
        if($scope.mgr_email == '' || typeof $scope.mgr_email !== 'string'){
            notifications.warning('Email incorrect');
            return;
        }
        if($scope.mgr_password == '' || typeof $scope.mgr_password !== 'string'){
            notifications.warning('Mot de passe incorrect');
            return;
        }
        if($scope.mgr_password !== $scope.mgr_cpassword){
            notifications.warning('Les mots de passe ne correspondent pas');
            return;
        }
        //now create object inserting into users database
        var d = new Date();
        $scope.mgr_name = $scope.mgr_name[0].toUpperCase()+$scope.mgr_name.slice(1).toLowerCase();
        const mgr = {
            name:$scope.mgr_name,
            email:$scope.mgr_email,
            password:$scope.mgr_password,
            mgr:true,
            status:'active',
            startDate:d.getTime(),
            permissions:{create:true,sales:true}
        };

        $scope.db.transaction('rw',$scope.db.users,()=>{
           $scope.db.users.add(mgr);
           //now refetching users
            $scope.db.users.toArray()
                .then((data)=>{
                    $scope.users = data;
                })
        }).then(()=>{
            //finally loggin in
            $scope.currentUser = mgr;
            sessionStorage.setItem('user',JSON.stringify($scope.currentUser));
            jQuery('#manager').hide();
            $scope.$apply();
        }).catch((err)=>{
            notifications.error("l'utilisateur existe deja");
            console.log(err);
        })

    });

    //3. Login
    jQuery('#login-form').on('submit',(e)=>{
        e.preventDefault();
        if(typeof $scope.login_name !== 'string' || $scope.login_name == ''){
            notifications.warning("Nom d'utilisateur invalide");
            return;
        }
        if(typeof $scope.login_password !== 'string' || $scope.login_password == ''){
            notifications.warning("Mot de passe invalide");
            return;
        }
        //get current user
        $scope.login_name = $scope.login_name[0].toUpperCase()+$scope.login_name.slice(1).toLowerCase();
        $scope.db.users.where({name:$scope.login_name,password:$scope.login_password}).first((user)=>{
            if(typeof user !== 'object'){
                notifications.error("Nom d'utilisateur ou mot de passe invalide",6000);
                return;
            }
            if(user.status !== 'active'){
                notifications.warning('Votre compte est inactif, Contactez votre responsable');
            }
            //finally loggin in
            $scope.currentUser = user;
            sessionStorage.setItem('user',JSON.stringify(user));
            document.querySelector('#dashBtn').style.display = 'block';
            if(user.mgr || user.permissions.sales){
                document.querySelector('#dashBtn').click();
            }
            if(!user.mgr && !user.permissions.sales){
                document.querySelector('#itemsCtrBtn').click();
            }
            jQuery('#login').fadeOut('fast');
            $scope.login_name = "";
            $scope.login_password = "";
            $scope.$apply();
        }).catch(err=>{
            console.error(err);
        })
    })
    //4. logout
    $scope.logOut = ()=>{
        if(confirm('Deconnection ?')){
            sessionStorage.clear('user');
            jQuery('#login').fadeIn("fast");
        }
    }

    //4. functions for globall
    $scope.toBrandName = (id)=>{
        var name = 'Indisponible';
        for(let i = 0;i<$scope.brand.length;i++){
            if(Number($scope.brand[i].id) === Number(id)){
                name = $scope.brand[i].name;
                break;
            }
        }
        return name;
    }
    $scope.toMyDate = (dt = 'today',t = null)=>{
        var d;
        if(dt == 'today'){
            d = new Date();
        }else {
            d = new Date(dt);
        }
        if(t !== null){
            var hour = (d.getHours() < 10)? `0${d.getHours()}`:d.getHours(),
                min = (d.getMinutes() < 10)? `0${d.getMinutes()}`:d.getMinutes();
            return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} - ${hour}:${min}`;
        }
        return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
    }
    //to calculate low stock value
    $scope.getLowStockVal  = (val)=>{
        var price = Number(val);
        if(price <= 6000){
            return 15;
        }else if(6000 < price && price < 25){
            return 5;
        }else if(price >= 25){
            return 3;
        }
    }
    //printer
    var p2 = require('electron').remote.require('electron-thermal-printer');
    $scope.printOrders = (data)=>{
        data.date = new Date(data.date);
        //console.log(data.inv);
        const date = `${data.date.getDate()}/${data.date.getMonth()+1}/${data.date.getFullYear()} - ${data.date.getHours()}:${data.date.getMinutes()}`;
        var print_data = [
            {type: 'bodyInit', css: {"margin": "0 0 0 0", "width": '250px'}},
            {type: 'text', value:'Emelie Telecom' , style: `font-size: 24px;font-weight:600;text-align:center;text-decoration:underline;`},
            {type: 'text', value: date, style: `font-size: 14px;text-align:center;`},
            {type: 'text', value: `Client : ${data.name}`, style: `font-size: 18px;margin-top:10px;border-bottom:1px solid #ddd;text-align:left;font-weight:600;`}
      ]
      data.items.forEach(el=>{
        print_data.push({type: 'text', value:`- ${$scope.toBrandName(el.brand)} ${el.model}          ${el.order_qty} X ${$filter('currency')(el.order_price, "", 0)}`, style: `padding:5px;font-size: 15px;`})
      })
      print_data  = print_data.concat([
         {type: 'text', value: `Total: ${$filter('currency')(data.totalPrice, "FCFA ", 0)}`, style: `margin:25px 0 0 0;font-size: 17px;font-weight:bold;text-decoration:underline;`},
         {
             type: 'qrcode',
             value:`${data.inv}`,
             height: 66,
             width: 66,
             style: `text-align:center;width:64px;margin: 25px 0 0 0;float:right`
         },
         {type: 'text', value: 'Garantie 7 jours', style: `text-align:left;font-size:8px;font-weight:600;`},
         {type: 'text', value: 'emelie Telecom', style: `text-align:center;font-size: 12px`},
      ])
        //printing....
        p2.print58m( {
            data: print_data,
            preview:true,
            deviceName: 'EPSON TM-T20II Receipt',
            timeoutPerLine: 400
        }).then((data)=>{
            if(data){
                notifications.info('Added to printing que');
            }else{
                notifications.warning('Failed to print!')
            }
        }).catch(err=>{
            notifications.error("Print error: Make sure printer is connected to PC<br>-Check if printer drivers are up-to-date");
        })
    }
    


});