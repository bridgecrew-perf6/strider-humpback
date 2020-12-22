"use strict";

const app = window.app;
const configDefaults = `{
  GroupId: '153792ac-d72c-45c9-b6a7-86231757c492',
  Instances: 1,
  Config: {
    Name: 'xxxx',
    Image: 'ipaddress:5000/xxxx',
    Ports: [
      {
        PrivatePort: 80,
        PublicPort: 12980,
        Type: 'tcp',
      },
    ],
    Env: [],
    NetworkMode: 'bridge',
    RestartPolicy: 'always'
  }
}`;

/*
 * $scope.configs, $scope.branch and $scope.pluginConfig, among others are available from the parent scope
 * */
app.controller("HumpbackController", [
  "$scope",
  function ($scope) {
    $scope.saving = false;

    $scope.$watch("configs[branch.name].humpback.config", function (value) {
      $scope.config = {
        ...value,
        group: (value && value.group) || configDefaults,
      };
    });

    $scope.save = function () {
      $scope.saving = true;
      $scope.pluginConfig("humpback", $scope.config, function () {
        $scope.saving = false;
      });
    };
  },
]);
