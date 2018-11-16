app.controller('todayRecordsCtr',($scope)=>{
    //vars
    var i,today = new Date();
    $scope.todaysOrders = {
        items:[],
        sales:[],
        totalPrice:0,
        totalQty:0
    };
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
        console.log($scope.sales)
        $scope.sales.reverse();
        for(i = 0;i<$scope.sales.length;i++){
            var o =new Date($scope.sales[i].date);
            if(o.toDateString() === today.toDateString()){
                $scope.todaysOrders.totalPrice += Number($scope.sales[i].totalPrice)
                $scope.todaysOrders.totalQty += Number($scope.sales[i].totalQty)
                $scope.todaysOrders.sales.push($scope.sales[i]);
                $scope.todaysOrders.items = $scope.todaysOrders.items.concat($scope.sales[i]);
            }
            delete o;
        }
        $scope.$apply();
    }).catch(err=>{
        notifications.error('Erreur de base de donnees');
        console.error(err);
    });
});