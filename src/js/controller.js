var app = angular.module('StocklerApp',['ngRoute']);
//routing
app.config(($routeProvider)=>{
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
        .when('/reports',{
            templateUrl:'components/reports.html'
        })
});


//the main controller
app.controller('mainCtr',($scope)=>{
    //creating and fetching databses
    var Dexie = require('dexie');

    $scope.db = new Dexie('StocklerDB');
    $scope.db.version(1).stores({
        users:'++id,&name,password,email,mgr,status,startDate,permissions',
        brand:'++id,&name,date',
        items:'++id,brand,&model,qty,orderedQty,staff,price,date',
        sales:'++id,&inv,name,phone,date,*items,totalQty,totalPrice,staff'
    });
    //empty varaibles for other
$scope.users = [];
$scope.brand = [];
$scope.items = [];
$scope.sales = [];
$scope.currentUser = '';
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
        console.log($scope.items);
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
            if(!user.mgr && !user.permissions.sales){
                document.querySelector('#itemsCtrBtn').click();
            }
            jQuery('#login').hide('fast');
            $scope.login_name = "";
            $scope.login_password = "";
            $scope.$apply();
        }).catch(err=>{
            console.log(err);
        })
    })
    //4. logout
    $scope.logOut = ()=>{
        if(confirm('Deconnection ?')){
            sessionStorage.clear('user');
            jQuery('#login').show("fats",()=>{
                document.querySelector('#dashBtn').click();
            });
        }
    }

    //4. functions
    $scope.toMyDate = (dt = 'today')=>{
        var d;
        if(dt == 'today'){
            d = new Date();
        }else {
            d = new Date(dt);
        }
        return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
    }


});