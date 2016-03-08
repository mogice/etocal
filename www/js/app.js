// This is a JavaScript file

(function() {
  // strictモード
  'use strict';
  
  // myAppモジュール
  var module = angular.module('myApp', ['onsen.directives']);
    
  // 基準日（先日付が必要になったら改修すること）
  module.value('$baseDate', new Date());

  // List Year, Month(order by date asc)
  // {months: [{year: , month: }...], selectedYM: {}}
  module.factory('$dataYM', ['$baseDate', function($baseDate) {
    var dataYM = {};
    var periodY = 2;
    
    // 基準日と範囲
    var today = $baseDate;
    var fromYear = today.getFullYear();
    var toYear = today.getFullYear() + periodY;
    var currentYear = fromYear;
    
    // 収集する値
    var months = [];
    var years =[];
    
    // ひと月ずつ加算
    while(currentYear <= toYear) {
      // 12か月を追加
      for(var currentMonth =  0; currentMonth <= 11; currentMonth++) {
        // 基準年月より先月は読み飛ばす
        if (currentYear === today.getFullYear() &&  currentMonth > today.getMonth()) {
          continue;
        }
        months.push({ year : currentYear, month: currentMonth + 1});
      }
      years.push(currentYear);
      // 年カウントアップ
      currentYear++;
    }
    
    // 整形
    dataYM = {
      years : years,
      months : months,
      today : today,
    };
    
    // 復帰
    return dataYM;
  }]);
  
  // List days
  // data: {days: [{}...], selectedDay: {}}
  module.factory('$dataDays', function() {
    var service = {
      data : {},
      getData : function(selectedYM) {
        var days = [
          { 
            date    : new Date(2015, 2, 14),
            food    : [],
            medicine: [],
            excreta : [],
            memo    : 'たちつてと。メモ欄です。'
          },
          { 
            date    : new Date(2015, 2, 15),
            food    : [],
            medicine: [],
            excreta : [],
            memo    : 'さしすせそ。メモ欄です。'
          },
          { 
            date    : new Date(2015, 2, 16),
            food    : [],
            medicine: [],
            excreta : [],
            memo    : 'かきくけこ。メモ欄です。'
          },
          {
            date    : new Date(2015, 2, 17, 0, 0, 0, 0),
            food    : [{date:new Date(2015, 2, 16, 9, 0, 0, 0), amount: 'たくさん', memo: ''},
                       {date:new Date(2015, 2, 16, 18, 0, 0, 0), amount: 'ふつう', memo: 'おやつ少しとかメモってみたり。おやつ枠は別に作ったがいいかなあ。'}],
            medicine: [{date:new Date(2015, 2, 16, 9, 0, 0, 0), amount: '2', memo: '調子が悪かったのでお薬大目。'},
                       {date:new Date(2015, 2, 16, 18, 0, 0, 0), amount: '1', memo: '予防接種。'}],
            excreta : [{date:new Date(2015, 2, 16, 8, 0, 0, 0), amount: 'ふつう', memo: ''}],
            memo    : 'あいうえお。メモ欄です。'
          },
        ];
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
    $scope.months = [];
    // ons-lazy-repeat用デリゲート
    $scope.MyDelegate = {
      configureItemScope: function(index, itemScope) {
        // repeatItemの中身を替えればリフレッシュされる
        itemScope.item = $scope.months[index];
      },
      calculateItemHeight: function(index) {
        // 要素の高さをpx指定
        return 55;
      },
      countItems: function() {
        // 全体の要素数
        return $scope.months.length;
      },
      destroyItemScope: function(index, scope) {
        // 画面外に移動した要素を削除
        console.log('Destroyed item with index: ' + index);
      }
    };
    // 年月クリック時処理
    $scope.showMonth = function(index) {
      $timeout(function() {
        var selectedYM = $scope.months[index];
        alert('index:' + index + '\nym:' + selectedYM.year + '/' + selectedYM.month);
        $dataYM.selectedYM = selectedYM;
        $dataDays.data.days = $dataDays.getData(selectedYM);
        $scope.navi.pushPage('month.html');
      }, 100);
    };
    /*
    // pull hookのデータロード(現在+1年追加）
    $scope.refreshListView = function($done) {
      $timeout(function() {
        var months = $scope.months;
        var now = new Date();
        var to = {year  : now.getFullYear() + 1,
                  month : now.getMonth() + 1};
        var from = {};
        
        // 開始年月を決定
        if (months.length === 0 ) {
          from.year = now.getFullYear();
          from.month = now.getMonth();
        } else {
          from = months[months.length - 1];
        }
        // 開始年月から現在の年月までを差し込む.
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
            $scope.months.push({year: year, month: month});
          }
        }
        // 処理終了後にコールバックを呼ぶ
        $done();
      }, 100);
    };
    */
    // pull hookのデータロード(現在-1年追加）
    $scope.refreshListView = function($done) {
      $timeout(function() {
        var months = $scope.months;
        var now = new Date();
        var from = {};
        var to = {};
        // 開始年月を決定
        if (months.length === 0 ) {
          // 年月リスト未設定の場合
          // 開始・終了年月取得
          from = {year : now.getFullYear(),
                  month: now.getMonth() + 1};
          to = {year : now.getFullYear() + 2,
                month: now.getMonth() + 1};
          // 現在の年月から1年後の年月までを追加
          for(var year = from.year; year <= to.year; year++) {
            for(var month = 1; month <= 12; month++) {
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
          // 開始・終了年月取得
          from = {year : months[0].year - 1,
                  month: months[0].month};
          to = {year : months[0].year,
                month: months[0].month - 1};
          // 1年前の年月から現在の年月までを挿入
          for(var year = to.year; year >= from.year; year--) {
            for(var month = 12; month >= 1; month--) {
              // 開始年月より過去日付は読み飛ばす
              if (year <= from.year && month < from.month) {
                continue;
              }
              // 終了年月より先日付は読み飛ばす
              if (year >= to.year && month > to.month) {
                continue;
              }
              // 挿入
              $scope.months.unshift({year: year, month: month});
            }
          }
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
