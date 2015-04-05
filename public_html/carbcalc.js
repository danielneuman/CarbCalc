/*global angular*/
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



(function () {
    'use strict';
    var app, math;
    math = angular.module('GenericMath', []);
    math.service('calcFn', function () {
        this.decimalAdjust = function(type, value, exp) {
          // If the exp is undefined or zero...
          if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
          }
          value = +value;
          exp = +exp;
          // If the value is not a number or the exp is not an integer...
          if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
          }
          // Shift
          value = value.toString().split('e');
          value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
          // Shift back
          value = value.toString().split('e');
          return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
        };
    });
    app = angular.module('CarbCalc', ['GenericMath']);
    app.service('resultStatus', function () {
        this.get = function (result) {
            var result_status = null;
            switch (result) {
            case undefined:
            case null:
                result_status = 'warning';
                break;
            default:
                result_status = 'success';
            }
            return result_status;
        };
    });
    app.service('appCalc', ['$filter', function ($filter) {
        this.calcResult = function (amount, base_carb, base_weight) {
            var result, rounded;
            result = amount * (base_carb / base_weight);
            rounded = $filter('roundCalc')(result, -1);
            if (isNaN(rounded)) {
                return null;
            }
            return rounded;
        };
    }]);
    app.filter('roundCalc', ['calcFn', function (calcFn) {
        return function (value, decimals) {
            if (decimals === undefined) {
                decimals = 0;
            }
            return calcFn.decimalAdjust('round', value, +decimals);
        };
    }]);
    app.controller('CalcCtrl', ['$scope', 'appCalc', 'resultStatus',
        function ($scope, appCalc, resultStatus) {
            $scope.unit = 'g';
            $scope.base_weight = 100;
            $scope.$watch('amount', function (amount) {
                $scope.result = appCalc.calcResult(amount, $scope.base_carb, $scope.base_weight);
            });
            $scope.$watch('base_carb', function (base_carb) {
                $scope.result = appCalc.calcResult($scope.amount, base_carb, $scope.base_weight);
            });
            $scope.$watch('base_weight', function (base_weight) {
                $scope.result = appCalc.calcResult($scope.amount, $scope.base_carb, base_weight);
            });
            $scope.$watch('result', function (result) {
                $scope.result_status = resultStatus.get(result);
            });
        }]);
}());