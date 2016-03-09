// This is a JavaScript file

(function() {
  // strictモード
  'use strict';
  
  // myAppモジュール
  var module = angular.module('myApp', ['onsen.directives']);

  // List Year, Month(order by date asc)
  // {months: [{year: , month: }...], selectedYM: {}}
  module.factory('$dataYM', function() {
    // 基準日と範囲
    var periodY = 2;
    var now = new Date();
    var from = {year : now.getFullYear(),
                month: now.getMonth() + 1};
    var to = {year : now.getFullYear() + periodY,
              month: now.getMonth() + 1};
    
    // 収集する値
    var dataYM = {};
    var months = [];
    var years =[];
    
    // 現在の年月から指定期間（periodY）の年月までを追加
    for(var year = from.year; year <= to.year; year++) {
      // 12か月を追加
      for(var month = 1; month <= 12; month++) {
        // 開始年月より過去日付は読み飛ばす
        if (year <= from.year && month < from.month) {
          continue;
        }
        // 終了年月より先日付は読み飛ばす
        if (year >= to.year && month > to.month) {
          continue;
        }
        // 年月追加
        months.push({year: year, month: month});
      }
      // 年追加
      years.push(year);
    }
    
    // 整形
    dataYM = {
      years: years,
      months: months,
      now: now,
    };
    
    // 復帰
    return dataYM;
  });
  
  // List days
  // data: {days: [{}...], selectedDay: {}}
  module.factory('$dataDays', function() {
    var service = {
      data : {},
      getData : function(selectedYM) {
        var day_ja = ['日', '月', '火', '水', '木', '金', '土'];
        var days = [];
        var first = new Date(selectedYM.year, selectedYM.month - 1, 1);
        var last = new Date(selectedYM.year, selectedYM.month, 0);
        var first_day = first.getDay();
        var last_date = last.getDate();
        for (var date = 1; date <= last_date; date++) {
          var currentDate = new Date(selectedYM.year, selectedYM.month - 1, date);
          var etoObj = new lib.EtoObj(currentDate);
          var eto = etoObj.dJikkan.kanji + etoObj.dJyunishi.kanji + 
                    '(' + etoObj.dJikkan.yomi + etoObj.dJyunishi.yomi + ')';
          days.push({
            date    : currentDate,
            day     : day_ja[currentDate.getDay()],
            eto     : eto,
            food    : [{date:new Date(2015, 2, 16, 9, 0, 0, 0), amount: 'たくさん', memo: ''},
                       {date:new Date(2015, 2, 16, 18, 0, 0, 0), amount: 'ふつう', memo: 'おやつ少しとかメモってみたり。おやつ枠は別に作ったがいいかなあ。'}],
            medicine: [{date:new Date(2015, 2, 16, 9, 0, 0, 0), amount: '2', memo: '調子が悪かったのでお薬大目。'},
                       {date:new Date(2015, 2, 16, 18, 0, 0, 0), amount: '1', memo: '予防接種。'},
                       {date:new Date(2015, 2, 16, 18, 0, 0, 0), amount: '9', memo: 'とくべつ。'}],
            memo    : '予定'
          });
        }
        return days;
      }
    };
    return service;
  });
  
  // 共通コントローラ
  module.controller('AppController', ['$scope', '$timeout', function($scope, $timeout) {
    $scope.doSomething = function() {
      $timeout(function() {
        alert('tappaed');
      }, 100);
    };
  }]);
  
  // year用コントローラ
  module.controller('CalendarControllerY', ['$scope', '$timeout', '$dataYM', '$dataDays', function($scope, $timeout, $dataYM, $dataDays) {
    $scope.months = $dataYM.months;
    // ons-lazy-repeat用デリゲート
    $scope.MyDelegate = {
      configureItemScope: function(index, itemScope) {
        // repeatItemの中身を替えればリフレッシュされる
        // 未来年月追加
        if (index >= $scope.months.length - 12) {
          var year = $scope.months[$scope.months.length - 1].year;
          var month = $scope.months[$scope.months.length - 1].month + 1;
          if (month > 12) {
            year++;
            month = 1;
          }
          $scope.months.push({year: year, month: month});
        }
        // 表示アイテムセット
        itemScope.item = $scope.months[index];
      },
      calculateItemHeight: function(index) {
        // 要素の高さをpx指定
        return 50;
      },
      countItems: function() {
        // 全体の要素数
        return $scope.months.length;
      },
      destroyItemScope: function(index, itemScope) {
        // 画面外に移動した要素削除後の処理
        console.log('Destroyed item with index: ' + index);
      }
    };
    // 年月クリック時処理
    $scope.showMonth = function(index) {
      $timeout(function() {
        var selectedYM = $scope.months[index];
        $dataYM.selectedYM = selectedYM;
        $dataDays.data.days = $dataDays.getData(selectedYM);
        $scope.navi.pushPage('month.html');
      }, 100);
    };
    // pull hookのデータロード(現在-1年追加）
    $scope.refreshListView = function($done) {
      $timeout(function() {
        // 開始年月を決定
        if ($scope.months.length === 0 ) {
          // 年月リスト未設定の場合
          // 基準日と範囲
          var periodY = 2;
          var now = new Date();
          var from = {year : now.getFullYear(),
                      month: now.getMonth() + 1};
          var to = {year : now.getFullYear() + periodY,
                    month: now.getMonth() + 1};
          // 現在の年月から1年後の年月までを追加
          for (var year = from.year; year <= to.year; year++) {
            for (var month = 1; month <= 12; month++) {
              // 開始年月より過去日付は読み飛ばす
              if (year <= from.year && month < from.month) {
                continue;
              }
              // 終了年月より先日付は読み飛ばす
              if (year >= to.year && month > to.month) {
                continue;
              }
              // 追加
              $scope.months.push({year: year, month: month});
            }
          }
        } else {
          // 年月リスト設定済みの場合
          // 一か月前の年月を追加
          var year = $scope.months[0].year;
          var month = $scope.months[0].month - 1;
          if (month < 1) {
            year--;
            month = 12;
          }
          $scope.months.unshift({year: year, month: month});
        }
        // 処理終了後にコールバックを呼ぶ
        $done();
      }, 100);
    };
  }]);
  
  // month用コントローラ
  module.controller('CalendarControllerM', ['$scope', '$timeout', '$dataDays', function($scope, $timeout, $dataDays) {
    $scope.days = $dataDays.data.days;
    $scope.showDay = function(index) {
      $timeout(function() {
        var selectedDay = $dataDays.data.days[index];
        $dataDays.data.selectedDay = selectedDay;
        $scope.navi.pushPage('day.html', {title : selectedDay.title});
      }, 100);
    };
  }]);
  
  // day用コントローラ
  module.controller('CalendarControllerD', ['$scope', '$timeout', '$dataDays', function($scope, $timeout, $dataDays) {
    $scope.day = $dataDays.data.selectedDay;
  }]);
})();

ons.bootstrap(['myApp']);
