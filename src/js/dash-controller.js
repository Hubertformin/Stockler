app.controller('dashCtr',($scope)=>{
    //Modal
    jQuery('.modal').modal();
    //invoice num
    //$scope.sales_inv = Math.floor(Math.random() * (9999999 - 1000000) ) + 1000000;
    $scope.sortByBrand = 'All';
    $scope.item_id = '';
    $scope.items = [];
    $scope.brand = [];
    $scope.checkout = {
        inv:Math.floor(Math.random() * (9999999 - 1000000) ) + 1000000,
        date:'',
        name:'',
        phone:'',
        items:[],
        totalQty:0,
        totalPrice:0,
        staff:$scope.currentUser.name
    }

    var checkoutModal = M.Modal.getInstance(jQuery('#checkOutModal'));;




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
    //================================== FUNCTION =====================

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

    $scope.addToCart = (e,i)=>{
        for(let j = 0;j<$scope.checkout.items.length;j++){
            if($scope.checkout.items[j].id == $scope.items[i].id){
                notifications.warning('Cette element est deja inclu');
                return false;
            }
        };
        //console.log(e.target);
        if(jQuery(e.target).is('tr')){
            jQuery(e.target).addClass('selected');
        }else{
            jQuery(e.target).parent().addClass('selected');
        }


        var currentItem = $scope.items[i];
        currentItem.order_qty = 1;
        currentItem.order_price = currentItem.price;
        $scope.checkout.items.push(currentItem);
    }
    //
    $scope.removeFromCart = (i)=>{
        if(i == 'all'){
            $scope.checkout.items = [];
            jQuery("tr").removeClass('selected');
        }else{
            jQuery(`tr[data-id="${$scope.checkout.items[i].model}"]`).removeClass('selected');
            //console.log(jQuery(`tr[data-id="${$scope.checkout.items[i]}"]`))
            $scope.checkout.items.splice(i,1);



        }
    }
    //min price
    $scope.minPrice = (e,i)=>{
        if(e.target.value < $scope.checkout.items[i].price){
            e.target.style.borderColor = "red";
            e.target.style.backgroundColor = "#ffebee";
        }else{
            e.target.style.borderColor = "green";
            e.target.style.backgroundColor = "#e8f5e9";
        }

    }
    //proceed check out
    $scope.proceedCheckout = ()=>{
        if(typeof $scope.checkout.name !== 'string' || $scope.checkout.name == ''){
            notifications.warning('Entrez le nom du client');
            return;
        }
        for(var i = 0;i<$scope.checkout.items.length;i++){
            if(typeof $scope.checkout.items[i].order_price !== 'number' || $scope.checkout.items[i].order_price < $scope.checkout.items[i].price){
                notifications.warning(`Le prix de ${$scope.toBrandName($scope.checkout.items[i].brand)} ${$scope.checkout.items[i].model} est plus petite que le minimum`,6000);
                return;
            }
            if(typeof $scope.checkout.items[i].order_qty !== 'number'){
                notifications.warning(`La quantite de ${$scope.toBrandName($scope.checkout.items[i].brand)} ${$scope.checkout.items[i].model} est invalide`,6000);
                return;
            }
        }
        //to the rest
        $scope.checkout.name = $scope.checkout.name[0].toUpperCase()+$scope.checkout.name.slice(1).toLowerCase();
        $scope.checkout.items.forEach((el)=>{
            el.totalOrderPrice = Number(el.order_qty) * Number(el.order_price);
            $scope.checkout.totalQty += Number(el.order_qty);
            $scope.checkout.totalPrice += Number(el.totalOrderPrice);
        })
        //console.log($scope.checkout);
        //$scope.$apply();
        //finally displaying modal
        checkoutModal.open();
    }
    //complete order
    $scope.completeOrder = (e)=>{
        jQuery(e.target).waitMe({
            effect:'bounce',
            bg:'rgba(255,255,255,0.9)',
            color:'#009688'
        });
        var d = new Date();

        $scope.checkout.date = d.getTime();
        $scope.checkout.staff = $scope.currentUser.name;
        //&inv,date,*items,totalQty,totalPrice,staff
        $scope.db.transaction('rw',$scope.db.sales,$scope.db.items,()=>{
            $scope.db.sales.add($scope.checkout)
            //updating items
            $scope.db.sales.toArray().then(data=>{
                $scope.sales = data;
            })
            for(var i=0;i<$scope.checkout.items.length;i++){
                for(var j = 0;j<$scope.items.length;j++){
                    if($scope.items[j].id == $scope.checkout.items[i].id){
                        $scope.items[j].orderedQty += Number($scope.checkout.items[i].order_qty);
                    }
                }
            }
            $scope.db.items.bulkPut($scope.items);

            $scope.db.items.toArray().then(data=>{
                $scope.items = data;
                console.log($scope.items)
            })

        }).then(()=>{
            $scope.checkout = {
                inv:Math.floor(Math.random() * (9999999 - 1000000) ) + 1000000,
                date:'',
                name:'',
                phone:'',
                items:[],
                totalQty:0,
                totalPrice:0,
                staff:$scope.currentUser.name
            }
            jQuery("tr").removeClass('selected');
            $scope.$apply();
            notifications.success("L'achat complete, Imprimmer le recu");
            checkoutModal.close();
        }).catch(err=>{
            console.error(err);
            notifications.error('Erreur de base des donnes!');
        })
        jQuery(e.target).waitMe("hide");

    }

});//end of controller