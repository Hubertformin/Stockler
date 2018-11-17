app.controller('stocks-reportsCtr',($scope,$routeParams)=>{
    $scope.type = $routeParams.type;
    $scope.redirection = $routeParams.redir;
    if($scope.redirection !== 'none'){
        $scope.redirectionBtn = true;
        //fefixing
        $scope.redirection = $scope.redirection.replace('-','/');
        //redirect link
        $scope.redir = {url:`#!${$scope.redirection}`}
        //console.log($scope.redir);
    }
    //vars
    $scope.displayMode = $routeParams.type;
    $scope.previewedItem = {};
    $scope.itemView=false;
    //functions
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
    /*$('.dial')
    .val(27)
    .trigger('change');*/
    $scope.db.transaction('rw',$scope.db.sales,$scope.db.items,$scope.db.brand,()=>{
        $scope.db.brand.toArray()
            .then(data=>{
                $scope.brand = data;
            })
        $scope.db.items.toArray()
            .then(data=>{
                $scope.items = data;
            })
        $scope.db.sales.toArray()
            .then(data=>{
                $scope.sales = data;
            })
    }).then(()=>{
            //get uniqie date sal
            /*for(let i =0;i<$scope.sales.length;i++){
                $scope.salesItems = $scope.salesItems.concat($scope.sales[i].items);
                if(i>0 && myDateString($scope.sales[i-1].date) === myDateString($scope.sales[i].date)){
                    continue;
                }
                //$scope.sales[i].date = new Date($scope.sales[i].date)
                //$scope.sales[i].date = $scope.toFrenchDateString($scope.sales[i].date);
                $scope.uniquesSalesDate.push($scope.sales[i].date);
            }
        
        $scope.salesItems.sort(function (a, b) {
            return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);
        });*/
        jQuery('button.excel').on('click',()=>{
            console.log('okay');
            var url='data:application/vnd.ms-excel,' + encodeURIComponent($('#all_table').html()) 
            location.href=url
            return false;
        })
        $scope.$apply();
    }).catch(err=>{
        notifications.error('Erreur de base de donnees');
        console.error(err);
    });
    //dash.js $
    
    //function
    $scope.previewItem = (array,index)=>{
        $scope.itemView = true;
        $scope.editable = false;
        switch(array){
            case 'items':
            $scope.previewedItem = $scope.items[index];
            break;
            case 'inactive':
            $scope.previewedItem = $scope.filterItems.inactive[index];
            break;
            case 'active':
            $scope.previewedItem = $scope.filterItems.active[index];
            break;
            case 'low-stock':
            $scope.previewedItem = $scope.filterItems.lowStock[index];
            break;
            case 'broken-stock':
            $scope.previewedItem = $scope.filterItems.broken[index];
            break;
        }
        $scope.previewedItem.brand = `${$scope.previewedItem.brand}`;
    }
    //2modificatons on items
    //2.1 Updating
    $scope.updateItem = ()=>{
            //transcation
            $scope.db.transaction('rw',$scope.db.items,()=>{
                $scope.previewedItem.brand = Number($scope.previewedItem.brand);
                if(typeof $scope.previewedItem.model !== 'string' || $scope.previewedItem.model == ''){
                    notifications.warning('Un nom de serie valide requise!');
                    return;
                }

                if(typeof $scope.previewedItem.qty == 'number'){
                    $scope.previewedItem.date = new Date().getTime();
                    if($scope.previewedItem.qty > 0 && 
                        $scope.previewedItem.qty > $scope.getLowStockVal($scope.previewedItem.price)){
                            $scope.previewedItem.status = 'active';
                    }else if($scope.previewedItem.qty > 0 && 
                        $scope.previewedItem.qty <= $scope.getLowStockVal($scope.previewedItem.price)){
                        $scope.previewedItem.status = 'low-stock';
                    }else if($scope.previewedItem.qty == 0){
                        $scope.previewedItem.status = 'inactive';
                    }
                }
                $scope.db.items.put($scope.previewedItem)
                $scope.db.items.toArray()
                    .then(data=>{
                        $scope.items = data;
                    })
            }).then(()=>{
                notifications.success("Modifier!");
                $scope.previewedItem = {};
                $scope.itemView = false;
                $scope.$apply();
            }).catch(err=>{
                try{
                    if(err.failures[0] === "negative_qty"){
                        notifications.error('Vous ne pouvez pas supprimer une quantité supérieure a la quantité du stock');
                    }
                }catch(e){
                    notifications.error('Erreur de base donnees');
                }
                console.error(err);
            })
    };
    //2.2 deleting
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
                $scope.previewedItem = {};
                $scope.itemView = false;
                $scope.$apply();
            }).catch(err=>{
                notifications.error('Erreur de base donnees');
                console.error(err);
            })
        }
    };



})