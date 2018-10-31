app.controller('usersCtr',($scope)=>{
    //1. first thing first splitting users to managers snd local users
    $scope.managers = [];
    $scope.localUser = [];
    $scope.db.transaction('rw',$scope.db.users,()=>{
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
                $scope.$apply();
            })
    }).then(()=>{
        //
    }).catch((err)=>{
        console.error(err);
        notifications.error('Erreur de base des donnes!');
    })

    //administrator datagrid
    /*angular.element(document).ready(function () {
        //Angular breaks if this is done earlier than document ready.
        jQuery("#admin-table").bootgrid();
    });*/
    $scope.hideUserControl = false;

    $scope.showCreateUser = ()=>{
        $scope.hideUserControl = true;
        $scope.updateUserForm = false;
        $scope.createUserForm = true;
    }
    //preview user
    $scope.prevUser = (i,u)=>{
        if(u == 'mgr'){
            $scope.choosenUser = $scope.managers[i];
            if(JSON.parse(sessionStorage.getItem('user')).name !== $scope.choosenUser.name){
                notifications.warning('Vous pouvez pas modifier un autre manager');
                return;
            }
        }else{
            $scope.choosenUser = $scope.localUser[i];
        }
        $scope.hideUserControl = true;
        $scope.createUserForm = false;
        $scope.updateUserForm = true;
    }

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
        $scope.new_name = $scope.new_name[0].toUpperCase()+$scope.new_name.slice(1).toLowerCase();

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
        }).catch(err=>{
            console.error(err);
            if(err.inner.code == 0){
                notifications.warning('Cet Compte existe deja!');
                return;
            }
            notifications.error('Erreur de base donnees');
        })

    })
    //update user
    $scope.updateUser = ()=>{
        if(typeof $scope.choosenUser == 'object'){
            $scope.choosenUser.name = $scope.choosenUser.name[0].toUpperCase()+$scope.choosenUser.name.slice(1).toLowerCase();
            $scope.db.transaction('rw',$scope.db.users,()=>{
                $scope.db.users.put($scope.choosenUser);
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
                        $scope.$apply();
                    })
            }).then(()=>{
                notifications.success('Compte Modifier!');
            }).catch(err=>{
                console.error(err);
                if(err.inner.code == 0){
                    notifications.warning('Cette Personne existe deja!');
                    return;
                }
                notifications.error('Erreur de base donnees');
            })
        }
    }
    //delete user
    $scope.deleteUser = (i)=>{
        if(confirm('Etes vous sur de suprimmer cette compte?')){
            if(typeof i == 'number'){
                $scope.db.transaction('rw',$scope.db.users,()=>{
                    $scope.db.users.delete(i);
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
                            $scope.$apply();
                        })
                }).then(()=>{
                   notifications.success('Compte suprimmer!');
                }).catch((err)=>{
                    console.error(err);
                    notifications.error('Erreur de base des donnes!');
                })
            }else{
                notifications.error("Erreur, impossible de suprimmer cette utilisateur");
                console.log(typeof i);
            }
        }
    }
})