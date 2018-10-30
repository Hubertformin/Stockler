app.controller('usersCtr',($scope)=>{
    //1. first thing first splitting users to managers snd local users
    $scope.managers = [];
    $scope.localUser = [];
    $scope.users.forEach(el=>{
        if(el.mgr == true){
            $scope.managers.push(el);
        }else{
            $scope.localUser.push(el);
        }
    })

    //administrator datagrid
    /*angular.element(document).ready(function () {
        //Angular breaks if this is done earlier than document ready.
        jQuery("#admin-table").bootgrid();
    });*/
    $scope.user_sales = false;$scope.user_create = true;
    jQuery('#createUserForm').on('submit',(e)=>{
        e.preventDefault();
        if($scope.new_name == '' || typeof $scope.new_name !== 'string'){
            notifications.warning('Nom incorrect');
            return;
        }
        if($scope.new_password == '' || typeof $scope.new_password !== 'string'){
            notifications.warning('Mot de passe invalide, réessayez');
            return;
        }
        if($scope.new_password !==$scope.new_cpassword){
            notifications.warning('Les mots de passe ne correspondent pas');
            return;
        }
        var d = new Date();
        const user = {
            name:$scope.new_name,
            email:'utilisateur@2018',
            password:$scope.new_password,
            startDate:d.getTime(),
            mgr:false,
            status:'active',
            permissions:{create:$scope.user_create,sales:$scope.user_sales}
        }
        $scope.db.transaction('rw',$scope.db.users,()=>{
            //add user
            $scope.db.users.add(user);
            //fetch
            $scope.db.users.toArray()
                .then(data=>{
                    $scope.users = data;
                    $scope.managers = [];
                    $scope.localUser = [];
                    $scope.users.forEach(el=>{
                        if(el.mgr == true){
                            $scope.managers.push(el);
                        }else{
                            $scope.localUser.push(el);
                        }
                    })
                });
        }).then(()=>{
            $scope.$apply();
            notifications.success('Utilisateur créé');
        })

    })
})