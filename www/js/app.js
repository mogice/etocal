// This is a JavaScript file

(function() {
  'use strict';
  var module = angular.module('myApp', ['onsen.directives']);
  
  //app
  module.controller('AppController', function($scope, $timeout) {
    $scope.doSomething = function() {
      $timeout(function() {
        alert('tappaed');
      }, 100);
    };
  });
  
  //day
  module.controller('CalendarControllerD', function($scope, $timeout, $dataDays) {
    $scope.day = $dataDays.data.selectedDay;
  });
  
  //month
  module.controller('CalendarControllerM', function($scope, $timeout, $dataDays) {
    $scope.days = $dataDays.data.days;
    $scope.showDay = function(index) {
      $timeout(function() {
        var selectedDay = $dataDays.data.days[index];
        $dataDays.data.selectedDay = selectedDay;
        $scope.navi.pushPage('day.html', {title : selectedDay.title});
      }, 100);
    };
  });
  
  //year
  module.controller('CalendarControllerY', function($scope, $timeout, $dataYM, $dataDays) {
    $scope.months = $dataYM.months;
    $scope.showMonth = function(index) {
      $timeout(function() {
        var selectedYM = $dataYM.months[index];
        $dataYM.selectedYM = selectedYM;
        $dataDays.data.days = $dataDays.getData(selectedYM);
        $scope.navi.pushPage('month.html');
      }, 100);
    };
    // pull hookのデータロード(見た目の追加のみ）
    $scope.refreshListView = function($done) {
      $timeout(function() {
        var months = $scope.months;
        var now = new Date();
        var to = {year  : now.getFullYear(),
                  month : now.getMonth() + 1};
        var from={};
        
        // 開始年月を決定
        if (months.length === 0 ) {
          from.year = now.getFullYear();
          from.month = now.getMonth();
        } else {
          from = months[0];
        }
        // 開始年月から現在の年月までを差し込む
        for(var year = from.year; year <= to.year; year++) {
          for(var month = 1; month <= 12; month++) {
            // 開始年月より過去日付は読み飛ばす
            if (year <= from.year &&  month <= from.month) {
              continue;
            }
            // 終了年月より先日付は読み飛ばす
            if ( year >= to.year &&  month > to.month) {
              continue;
            }
            // 追加
            $scope.months.unshift({year: year, month: month});
          }    
        }
        //終了したのでコールバックを呼ぶ
        $done();
      }, 100);
    };
  });
  
  //data
  //List days
  //data:{days:[{}...],selectedDay:{}}
  module.factory('$dataDays', function() {
    var service = {
      data : {},
      getData : function(selectedYM) {
        var days = [
          {
            date    : new Date(2015, 2, 17, 0, 0, 0, 0),
            food    : [{date:new Date(2015, 2, 16, 9, 0, 0, 0), amount: 'たくさん', memo: ''},
                       {date:new Date(2015, 2, 16, 18, 0, 0, 0), amount: 'ふつう', memo: 'おやつ少しとかメモってみたり。おやつ枠は別に作ったがいいかなあ。'}],
            medicine: [{date:new Date(2015, 2, 16, 9, 0, 0, 0), amount: '2', memo: '調子が悪かったのでお薬大目。'},
                       {date:new Date(2015, 2, 16, 18, 0, 0, 0), amount: '1', memo: '予防接種。'}],
            excreta : [{date:new Date(2015, 2, 16, 8, 0, 0, 0), amount: 'ふつう', memo: ''}],
            memo    : 'あいうえお。メモ欄です。'
          },
          { 
            date    : new Date(2015, 2, 16),
            food    : [],
            medicine: [],
            excreta : [],
            memo    : 'かきくけこ。メモ欄です。'
          },
          { 
            date    : new Date(2015, 2, 15),
            food    : [],
            medicine: [],
            excreta : [],
            memo    : 'さしすせそ。メモ欄です。'
          },
          { 
            date    : new Date(2015, 2, 14),
            food    : [],
            medicine: [],
            excreta : [],
            memo    : 'たちつてと。メモ欄です。'
          }
        ];
        return days;
      }
    };
    return service;
  });
  
  //List Year,Month(order by date desc)
  //{months:[{year:,month:}...],selectedYM:{}}
  module.value('$baseDate', new Date());  // 先日付が必要になったら改修すること
  module.factory('$dataYM', ['$baseDate', function($baseDate) {
    var dataYM = {};
    var periodY = 20;
    
    // 基準日と範囲
    var today = $baseDate;
    var fromYear = today.getFullYear() - periodY;
    var toYear = today.getFullYear();
    var currentYear = toYear;
    
    // 収集する値
    var months = [];
    var years =[];
    
    // ひと月ずつ加算
    while(currentYear >= fromYear) {
      // 12か月を追加
      for(var currentMonth =  11; currentMonth >= 0; currentMonth--) {
        // 基準年月より先日付は読み飛ばす
        if (currentYear === today.getFullYear() &&  currentMonth > today.getMonth()) {
          continue;
        }
        months.push({ year : currentYear, month: currentMonth + 1});
      }
      years.push(currentYear);
      // カウントダウン
      currentYear--;
    }
    
    // 整形
    dataYM = {
      years : years,
      today : today,
      months : months
    };
    
    // 復帰
    return dataYM;
  }]);
})();

ons.bootstrap(['myApp']);
