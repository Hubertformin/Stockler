app.controller('reportsCtr',($scope)=>{
    $scope.db.transaction('rw',$scope.db.sales,()=>{
        $scope.db.sales.toArray()
            .then(data=>{
                $scope.sales = data;
            })
    }).then(()=>{
        console.log($scope.brand);
        console.log($scope.items);
        console.log($scope.sales);
        $scope.$apply();
    }).catch(err=>{
        notifications.error('Erreur de base de donnees');
        console.error(err);
    });



});