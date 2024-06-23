$(document).ready(function() {
  $('#paymentDate').daterangepicker({
      singleDatePicker: true,
      maxDate: new Date(),
      locale: {
          format: "DD-MM-YYYY"
      },
  });
});

function bindAjs($scope) {
  if (!$scope.$$phase) {
    $scope.$apply();
  }
}

document.addEventListener("wheel", function (event) {
  if (document.activeElement.type === "number") {
    document.activeElement.blur();
  }
});

document.addEventListener("input", function (event) {
  if (event.target.type === "number") {
    event.target.addEventListener("wheel", function (e) {
      e.preventDefault();
    });
  }
});

var app = angular.module("myNewApp", []);

app.controller("organizationForm", function ($scope, $http) {
  $scope.allOrganizations = [];
  $scope.organizationData = {};
  // $scope.organizationRides = {};

  $scope.formData = {
    org_id: "",
    received_amt: 0,
    payment_date: $('#paymentDate').val(),
    bank_charges: "",
    payment_mode: "cash",
    reference: "",
    amount_data: [],
  };

  $scope.convertStringToNum = function(numString) {
    var floatValue = parseFloat(numString).toFixed(2);
    floatValue = parseFloat(floatValue);
    console.log(floatValue);
    return floatValue;
  }

  // Fetch Organizations
  $scope.fetchAllOrganizations = function () {
    $http({
      method: "GET",
      url: `/api/org_list.json`,
    }).then(
      function successCallback(response) {
        console.log("succ response fetchAllOrganizations", response);
        $scope.allOrganizations = response.data.data;

        // Assign ORG ID then fetch all data
        $scope.formData.org_id = $scope.allOrganizations[0].id;
        $scope.fetchOrganizationData($scope.allOrganizations[0].id);

        bindAjs($scope);
      },
      function errorCallback(response) {
        console.log("error response", response);
      }
    );
  };


  $scope.fetchOrganizationData = function (org_id) {
    console.log("received ID", org_id);
    $http({
      method: "GET",
      url: `/api/org/${org_id}.json`,
    }).then(
      function successCallback(response) {
        console.log("succ response", response);
        $scope.organizationData = response.data.data;
        // $scope.organizationRides = response.data.data.rides.data;
        // this callback will be called asynchronously
        // when the response is available
        bindAjs($scope);
      },
      function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log("error response", response);
      }
    );
  };

  // Submit the Form
  $scope.submitInvoice = function(){
    $scope.formData.amount_data = [];
    
    // add ride data in the amount_data
    $scope.organizationData.rides.data.forEach(ride => {
      console.log('each ride', ride);
      if(ride['payable_summary']['amount'] >= 0){
          $scope.formData.amount_data.push({
              ride_id: ride['ride_id'],
              pay_amount: ride['payable_summary']['amount']
          });
      }
    }); 

    // Get the Payment Date
    $scope.formData.payment_date = $('#paymentDate').val();
    
    console.log('rides data', $scope.formData);

    // $http({
    //   method: "POST",
    //   url: `/api/updateInvoice/org-1`,
    //   data: $scope.formData,
    // }).then(
    //   function successCallback(response) {
    //     console.log("succ response", response);
    //     $scope.organizationData = response.data.data;
    //   },
    //   function errorCallback(response) {
    //     console.log("error response", response);
    //   }
    // );
  }

  angular.element(document).ready(function () {
    $scope.fetchAllOrganizations();
  });
});
