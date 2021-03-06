app.controller('itemsCtr',($scope)=>{
    //first thin first refetch items and brands
    $scope.sortByBrand = 'All';
    $scope.item_id = '';
    $scope.items = [];
    $scope.brand = [];



    $scope.db.transaction('rw',$scope.db.brand,$scope.db.items,()=>{
        $scope.db.brand.toArray()
            .then(data=>{
                $scope.brand = data;
            })
        $scope.db.items.toArray()
            .then(data=>{
                $scope.items = data;
            })
    }).then(()=>{
        $scope.$apply();
    }).catch(err=>{
        notifications.error('Erreur de base de donnees');
        console.error(err);
    });
    //==================== FUNCTIONS ===============================
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


    //1. CREATE BRAND
    jQuery('#createBrand').on('submit',(e)=>{
        e.preventDefault()
        if($scope.brandName == '' || typeof $scope.brandName !== 'string'){
            notifications.warning('Nom est invalide');
            return;
        }
        var d = new Date();
        $scope.brandName = $scope.brandName[0].toUpperCase()+$scope.brandName.slice(1).toLowerCase();
        //
        if(typeof $scope.brand_id == 'number' && typeof $scope.brand_date == 'number'){
            //lets get thr form name
            var brand = {id:$scope.brand_id,name:$scope.brandName,date:$scope.brand_date}

        }else{
            var brand = {name:$scope.brandName,date:d.getTime()}
        }
        //transcation
        $scope.db.transaction('rw',$scope.db.brand,()=>{
            $scope.db.brand.put(brand)
            $scope.db.brand.toArray()
                .then(data=>{
                    $scope.brand = data;
                })
        }).then(()=>{
            notifications.success('Okay');
            console.log($scope.brand);
            $scope.brandName = '';
            $scope.brand_id = '';
            $scope.brand_date = '';
            $scope.updateBrandBtn = false;
            $scope.$apply();
        }).catch(err=>{
            console.error(err);
            if(err.inner.code == 0){
                notifications.warning('Cette element existe deja!');
                return;
            }
            notifications.error('Erreur de base donnees');
        })
    })
    //2.Delete brand
    $scope.deleteBrand = (i)=>{
        if(confirm('Etes vous sur des suprimmer cette Famille?')){
            //transcation
            $scope.db.transaction('rw',$scope.db.brand,$scope.db.items,()=>{
                $scope.db.brand.delete(i)
                $scope.db.items.where('brand').equals(i).delete();
                $scope.db.brand.toArray()
                    .then(data=>{
                        $scope.brand = data;
                    })
                $scope.db.items.toArray()
                    .then(data=>{
                        $scope.items = data;
                    })
            }).then(()=>{
                notifications.success("Suprimmer!");
                $scope.$apply();
            }).catch(err=>{
                notifications.error('Erreur de base donnees');
                console.error(err);
            })
        }
    }
    //3. function to preview
    $scope.previewBrand = (i,meth=true)=>{
        if(!$scope.currentUser.mgr){
            notifications.info("Vous n'etes pas autoriser a performe cette operation");
            return;
        }
        if(meth){
            $scope.brandName = $scope.brand[i].name;
            $scope.brand_id = $scope.brand[i].id;
            $scope.brand_date = $scope.brand[i].date;
            $scope.updateBrandBtn = true;
        }else{
            $scope.brandName = '';
            $scope.brand_id = '';
            $scope.updateBrandBtn = false;
        }
    }

    //=================================================ITEM ======================
    //1.create item
    jQuery('#createItemForm').on('submit',(e)=>{
        e.preventDefault();
        if($scope.item_brand == '' || typeof $scope.item_brand !== 'string'){
            $scope.item_brand = Number($scope.item_brand);
            notifications.warning('Choisir une famille!');
            return;
        }
        if($scope.model_name == '' || typeof $scope.model_name !== 'string'){
            notifications.warning('Nom de serie est invalide!');
            return;
        }
        if(typeof $scope.item_qty !== 'number' && typeof $scope.item_id !== 'number'){
            notifications.warning('La quantite est requise');
            return;
        }
        if(typeof $scope.item_price !== 'number'){
            notifications.warning('Le prix est requise');
            return;
        }
        //items:'++id,brand,&model,qty,staff,price,date',
        $scope.item_brand = Number($scope.item_brand);

        var d = new Date();
        $scope.model_name = $scope.model_name[0].toUpperCase()+$scope.model_name.slice(1).toLowerCase();
        //
        if(typeof $scope.item_id !== 'number'){
            if($scope.item_qty < 0) {
                notifications.error('Vous ne pouvez pas metre un valuer negatif!')
                return;
            }
            var status = 'active';
            if($scope.item_qty == 0){
                status = 'inactive';
            }else if($scope.item_qty > 0 && $scope.item_qty <= $scope.getLowStockVal($scope.item_price)){
                status = 'low-stock';
            }
            var item = {
                brokenStatus:false,
                brand:$scope.item_brand,
                model:$scope.model_name,
                staff:$scope.currentUser.name,
                qty:$scope.item_qty,
                price:$scope.item_price,
                date:d.getTime(),
                orderedQty:0,
                lowStockQty:$scope.getLowStockVal($scope.item_price),
                status:status
            }
            delete status;
        }else{
            //lets get its total ordered qty first
            for(let j = 0;j<$scope.items.length;j++){
                if($scope.item_id === $scope.items[j].id){
                    //console.log($scope.item_qty+($scope.items[j].qty - $scope.items[j].orderedQty))
                    //console.log($scope.item_qty,$scope.items[j].qty, $scope.items[j].orderedQty)
                    var status = 'active';
                    if(($scope.item_qty + $scope.items[j].qty) > 0
                    || ($scope.item_qty + $scope.items[j].qty) <= $scope.getLowStockVal($scope.item_price)){
                        status = 'low-stock';
                    }else if(($scope.item_qty + $scope.items[j].qty) === 0){
                        status = 'inactive';
                    }
                    if(typeof $scope.item_qty === 'number'){
                        if(($scope.items[j].qty + $scope.item_qty) < 0){
                            notifications.error('Vous ne pouvez pas supprimer une quantité supérieure a la quantité du stock');
                            return;
                        }
                        var item = {
                            brokenStatus:false,
                            id:$scope.item_id,
                            brand:$scope.item_brand,
                            model:$scope.model_name,
                            staff:$scope.currentUser.name,
                            qty:$scope.item_qty + $scope.items[j].qty,
                            status:status,
                            price:$scope.item_price,
                            date:d.getTime(),
                            orderedQty:$scope.items[j].orderedQty,
                            lowStockQty:$scope.getLowStockVal($scope.item_price)
                        }
                            break;
                    }else{
                        var item = {
                            brokenStatus:false,
                            id:$scope.item_id,
                            brand:$scope.item_brand,
                            model:$scope.model_name,
                            staff:$scope.currentUser.name,
                            qty:$scope.items[j].qty,
                            price:$scope.item_price,
                            date:$scope.item_date,
                            status:status,
                            orderedQty:$scope.items[j].orderedQty,
                            lowStockQty:$scope.getLowStockVal($scope.item_price)
                        }
                            break;
                    }
                }
            }
        }
            //console.log(item);
        //transcation
        $scope.db.transaction('rw',$scope.db.items,()=>{
            $scope.db.items.put(item)
            $scope.db.items.toArray()
                .then(data=>{
                    $scope.items = data;
                })
        }).then(()=>{
            if(typeof $scope.item_id !== 'number'){
                notifications.success('Ajoutee');
            }else{
                notifications.success('Modifier');
            }
            console.log($scope.items);
            //emptying the form
            $scope.item_id = '';
            $scope.item_date = '';
            $scope.item_brand = '';
            $scope.model_name = '';
            $scope.item_qty = '';
            $scope.item_price = '';
            $scope.prevUpdateBtn = false;
            //applying changes
            $scope.$apply();
            //document.querySelector('#createItemForm').reset();
        }).catch(err=>{
            try{
                if(err.inner.code == 0){
                    notifications.warning('Cette element existe deja!');
                    return;
                }
            }catch(e){
                notifications.error("Impossible d'ajouter/modifier la base de données, cet article existe probablement déjà.",6500);
            }
        })
    });
    //2. delete item
    $scope.deleteItem = (i)=>{
        if(confirm('Etes vous sur des suprimmer cette element?')){
            //transcation
            $scope.db.transaction('rw',$scope.db.items,()=>{
                $scope.db.items.delete(i)
                $scope.db.items.toArray()
                    .then(data=>{
                        $scope.items = data;
                    })
            }).then(()=>{
                notifications.success("Suprimmer!");
                $scope.$apply();
            }).catch(err=>{
                notifications.error('Erreur de base donnees');
                console.error(err);
            })
        }
    };
    //3. prev users
    $scope.prevItems = (i=0,mode=true)=>{
        if(!$scope.currentUser.mgr){
            notifications.info("Vous n'etes pas autoriser a performe cette operation");
            return;
        }
        if(mode){
            $scope.item_id = $scope.items[i].id;
            $scope.item_date = $scope.items[i].date;
            $scope.item_brand = `${$scope.items[i].brand}`;
            $scope.model_name = $scope.items[i].model;
            //$scope.item_qty = $scope.items[i].qty - $scope.items[i].orderedQty;
            $scope.item_qty = '';
            $scope.item_price = $scope.items[i].price;
            $scope.prevUpdateBtn = true;
        }else{
            $scope.item_id = '';
            $scope.item_brand = '';
            $scope.model_name = '';
            $scope.item_qty = '';
            $scope.item_price = '';
            $scope.prevUpdateBtn = false;
        }
    }
})