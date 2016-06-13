// This is a JavaScript file

(function() {
  // strictモード
  'use strict';
  
  // myAppモジュール
  var module = angular.module('myApp', ['onsen']);
  
  // データベースの準備
  module.factory('$db', function() {
    // データベース接続
    var db = openDb('etocal_db', '', 'etocal db', 1024 * 1024 * 20);
    var sql = "";
    // テーブル削除
    // var dropsql = "DROP TABLE IF EXISTS testtbl;";
    // var dropsql = "DROP TABLE IF EXISTS cal_data;";
    // execSQL(db, sql, [], function(rs) {
    //  alert('table drop!');
    // }, function(error) {
    //  alert(error.message);
    // });
    // テーブル作成
    sql = "CREATE TABLE IF NOT EXISTS cal_data("
        + "id INTEGER PRIMARY KEY,"
        + "start_yaer INTEGER,"
        + "start_month INTEGER,"
        + "start_date INTEGER,"
        + "start_time TEXT,"
        + "end_yaer INTEGER,"
        + "end_month INTEGER,"
        + "end_date INTEGER,"
        + "end_time TEXT,"
        + "title TEXT,"
        + "location TEXT,"
        + "description TEXT"
        + ");";
    execSQL(db, sql, [], function(rs) {
      // テーブル作成成功
      // sql = "SELECT * FROM cal_data";
      // execSQL(db, sql, [], function(rs) {
      //   console.log('cal_data件数:' + rs.rows.length);
      // }, function(error) {
      //   alert(error.message);
      // });
      // sql = "SELECT id from cal_data where id = 1";
      // execSQL(db, sql, [], function(rs) {
      //   if (rs.rows.length === 0 ) {
      //     sql = "INSERT INTO testtbl values(1, 'memo1')";
      //     execSQL(db, sql, [], function(rs) {
      //       alert(sql);
      //     }, function(error) {
      //       alert(error.message);
      //     });
      //   }
      // }, function(error) {
      //   alert(error.message);
      // });
      // // 
      // sql = "SELECT id from cal_data where id = 2";
      // execSQL(db, sql, [], function(rs) {
      //   if (rs.rows.length === 0 ) {
      //     sql = "INSERT INTO testtbl values(2, 'memo2')";
      //     execSQL(db, sql, [], function(rs) {
      //       alert(sql);
      //     }, function(error) {
      //       alert(error.message);
      //     });
      //   }
      // }, function(error) {
      //   alert(error.message);
      // });
    }, function(error) {
      // テーブル作成失敗
      alert(error.message);
    });
    return db;
  });
  
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
        // 九星取得
        // --対象日取得
        var currentDate = new Date(year, month - 1, 1);
        // --干支算出
        var etoObj = new lib.EtoObj(currentDate);
        // 月の干支編集
        var eto_m = etoObj.mJikkan.kanji + etoObj.mJyunishi.kanji + 
                    '(' + etoObj.mJikkan.yomi + etoObj.mJyunishi.yomi + ')';
        // 年月追加
        months.push({year: year, month: ('0' + month).slice(-2), kyusei: etoObj.mKyusei, eto: eto_m});
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
  module.factory('$dataDays', ['$db', function($db) {
    var service = {
      data : {},
      getData : function(selectedYM) {
        // // 年の干支情報
        // var jkdata = ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'];
        // var jkdataYomi = ['かのえ', 'かのと', 'みずのえ', 'みずのと', 'きのえ', 'きのと', 'ひのえ', 'ひのと', 'つちのえ', 'つちのと'];
        // var jshidata = ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未'];
        // var jshidataYomi = ['さる', 'とり', 'いぬ', 'い', 'ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ'];
        // // 年家九星情報
        // var kyuseidata_y = ['二黒土星', '一白水星', '九紫火星', '八白土星', '七赤金星', '六白金星', '五黄土星', '四緑木星', '三碧木星'];
        // // 月家九星情報
        // var kyuseidata_m = ['四緑木星', '三碧木星', '二黒土星', '一白水星', '九紫火星', '八白土星', '七赤金星', '六白金星', '五黄土星'];
        // 曜日情報
        var day_ja = ['日', '月', '火', '水', '木', '金', '土'];
        // 日の情報
        var days = [];
        var first = new Date(selectedYM.year, selectedYM.month - 1, 1);
        var last = new Date(selectedYM.year, selectedYM.month, 0);
        var first_day = first.getDay();
        var last_date = last.getDate();
        
        // var sql = "SELECT memo from testtbl where id = ?";
        var sql = "SELECT id from cal_data ORDER BY id DESC;";
        var params = [];
        // params.push(1);
        execSQL($db, sql, params, function(rs) {
          for (var i=0; i < rs.rows.length; i++) {
            var row = rs.rows.item(i);
            alert(row.id);
          }
        }, function(error) {
          alert(error.message);
        });
        
        for (var date = 1; date <= last_date; date++) {
          // 対象日取得
          var currentDate = new Date(selectedYM.year, selectedYM.month - 1, date);
          // 干支算出
          var etoObj = new lib.EtoObj(currentDate);
          // 年の干支編集
          var eto_y = etoObj.yJikkan.kanji + etoObj.yJyunishi.kanji + 
                      '(' + etoObj.yJikkan.yomi + etoObj.yJyunishi.yomi + ')';
          // var eto_y = jkdata[kr.year % 10] + jshidata[kr.year % 12] + 
          //             '(' + jkdataYomi[kr.year % 10] + jshidataYomi[kr.year % 12] + ')';
          // 月の干支編集
          var eto_m = etoObj.mJikkan.kanji + etoObj.mJyunishi.kanji + 
                      '(' + etoObj.mJikkan.yomi + etoObj.mJyunishi.yomi + ')';
          // 日の干支編集
          var eto_d = etoObj.dJikkan.kanji + etoObj.dJyunishi.kanji + 
                      '(' + etoObj.dJikkan.yomi + etoObj.dJyunishi.yomi + ')';
          // 旧暦情報取得
          var kr = new kyureki(currentDate.getJD());
          // // 年家九星の取得（旧暦）
          // var yKyuseiNum = kr.year % 9;
          // var yKyusei = kyuseidata_y[yKyuseiNum];
          // // 月家九星の取得（旧暦）
          // var mKyuseiNum = kr.year % 3 * 3 + kr.month;
          // if (mKyuseiNum > 8) {
          //   mKyuseiNum = mKyuseiNum - 9;
          // }
          // var mKyusei = kyuseidata_m[mKyuseiNum];
          // 日の情報を追加
          days.push({
            date        : currentDate,
            day         : day_ja[currentDate.getDay()],
            eto_y       : eto_y,
            eto_m       : eto_m,
            eto_d       : eto_d,
            rokuyo      : kr.rokuyo,
            kyusei_y    : etoObj.yKyusei,
            kyusei_y_num: etoObj.yKyuseiNum,
            kyusei_m    : etoObj.mKyusei,
            kyusei_m_num: etoObj.mKyuseiNum,
            kyusei_d    : etoObj.dKyusei,
            kyusei_d_num: etoObj.dKyuseiNum,
            schedule    : [{title: '食事', date: new Date(2015, 2, 16, 9, 0, 0, 0), amount: 'たくさん', memo: ''},
                           {title: '食事', date: new Date(2015, 2, 16, 18, 0, 0, 0), amount: 'ふつう', memo: 'おやつ少しとかメモってみたり。おやつ枠は別に作ったがいいかなあ。'},
                           {title: '薬', date: new Date(2015, 2, 16, 9, 0, 0, 0), amount: '2', memo: '調子が悪かったのでお薬大目。'},
                           {title: '薬', date: new Date(2015, 2, 16, 18, 0, 0, 0), amount: '1', memo: '予防接種。'},
                           {title: '薬', date: new Date(2015, 2, 16, 18, 0, 0, 0), amount: '9', memo: 'とくべつ。'}]
          });
        }
        return days;
      }
    };
    return service;
  }]);
  
  // 共通コントローラ
  module.controller('AppController', ['$scope', '$timeout', '$db', function($scope, $timeout, $db) {
    // 起動時処理
    ons.ready(function() {
      if (!window.localStorage.getItem('themesetting')) {
        var obj = {name: 'default', value: 'mythemestyle:css/theme-default.css', selected: 'checked'};
        window.localStorage.setItem('themesetting', JSON.stringify(obj));
      } else {
        var str = window.localStorage.getItem('themesetting');
        var obj = JSON.parse(str);
        var params = obj.value.split(':');
        document.getElementById(params[0]).href = params[1];
      }
    });
    // ボタンクリック時
    $scope.doSomething = function() {
      $timeout(function() {
        alert('tappaed');
      }, 100);
    };
  }]);
  
  // home用コントローラ
  module.controller('homeController', ['$scope', '$timeout', '$dataDays', function($scope, $timeout, $dataDays) {
    ons.ready(function() {
      var now = new Date();
      $dataDays.data.days = $dataDays.getData({year: now.getFullYear(), month: now.getMonth() + 1});
      var selectedDay = $dataDays.data.days[now.getDate() - 1];
      $dataDays.data.selectedDay = selectedDay;
      $scope.day = $dataDays.data.selectedDay;
    });
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
          // 最終年取得
          var year = $scope.months[$scope.months.length - 1].year;
          // 最終月+1月を取得
          var month = $scope.months[$scope.months.length - 1].month + 1;
          if (month > 12) {
            // 最終月+1月が12を超える場合、年をインクリメント・月を1月にセット
            year++;
            month = 1;
          }
          // 九星取得
          // --対象日取得
          var currentDate = new Date(year, month - 1, 1);
          // --干支算出
          var etoObj = new lib.EtoObj(currentDate);
          // 月の干支編集
          var eto_m = etoObj.mJikkan.kanji + etoObj.mJyunishi.kanji + 
                      '(' + etoObj.mJikkan.yomi + etoObj.mJyunishi.yomi + ')';
          // 追加
          $scope.months.push({year: year, month: ('0' + month).slice(-2), kyusei: etoObj.mKyusei, eto: eto_m});
        }
        // 表示アイテムセット
        itemScope.item = $scope.months[index];
      },
      calculateItemHeight: function(index) {
        // 要素の高さをpx指定
        return 65;
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
              // 九星取得
              // --対象日取得
              var currentDate = new Date(year, month - 1, 1);
              // --干支算出
              var etoObj = new lib.EtoObj(currentDate);
              // 月の干支編集
              var eto_m = etoObj.mJikkan.kanji + etoObj.mJyunishi.kanji + 
                          '(' + etoObj.mJikkan.yomi + etoObj.mJyunishi.yomi + ')';
              // 追加
              $scope.months.push({year: year, month: ('0' + month).slice(-2), kyusei: etoObj.mKyusei, eto: eto_m});
            }
          }
        } else {
          // 年月リスト設定済みの場合
          // 一か月前の年月を追加
          // --先頭の年を取得
          var year = $scope.months[0].year;
          // --先頭の月-1月を取得
          var month = $scope.months[0].month - 1;
          if (month < 1) {
            // 先頭の月-1月が1を下回る場合、年をデクリメント・月を12月にセット
            year--;
            month = 12;
          }
          // 九星取得
          // --対象日取得
          var currentDate = new Date(year, month - 1, 1);
          // --干支算出
          var etoObj = new lib.EtoObj(currentDate);
          // 月の干支編集
          var eto_m = etoObj.mJikkan.kanji + etoObj.mJyunishi.kanji + 
                      '(' + etoObj.mJikkan.yomi + etoObj.mJyunishi.yomi + ')';
          // 挿入
          $scope.months.unshift({year: year, month: ('0' + month).slice(-2), kyusei: etoObj.mKyusei, eto: eto_m});
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
  
  // 予定追加用コントローラ
  module.controller('AddScheduleController', ['$scope', '$timeout', '$db', function($scope, $timeout, $db) {
  }]);
  
  // inputタグのchecked属性を有効にするディレクティブ
  module.directive("radioCheck", function() {
    return {
      restrict : "A",
      scope : {checkOn : "="},
      link : function(scope, elem, attr) {
        if (scope.checkOn) {
          elem[0].checked = true;
        }
      }
    };
  });
  
  // dialog用コントローラ
  module.controller('DialogController', function($scope) {
    // ダイアログモデル
    $scope.dialogs = {};
    // ダイアログ表示
    $scope.show = function(dlg) {
      if (!$scope.dialogs[dlg]) {
        ons.createDialog(dlg).then(function(dialog) {
          $scope.dialogs[dlg] = dialog;
          dialog.show();
        });
      } else {
        $scope.dialogs[dlg].show();
      }
    };
  });
  
  // Themelist用コントローラ
  module.controller('ThemelistController', function($scope) {
    // テーマ設定内容
    $scope.config = {
      theme: [
        {name: 'default', value: 'mythemestyle:css/theme-default.css', selected: 'checked'},
        {name: 'blue', value: 'mythemestyle:css/theme-blue.css', selected: ''},
        {name: 'dark', value: 'mythemestyle:css/theme-dark.css', selected: ''},
        {name: 'purple', value: 'mythemestyle:css/theme-purple.css', selected: ''},
        {name: 'sunshine', value: 'mythemestyle:css/theme-sunshine.css', selected: ''},
      ]
    };
    // 起動時処理
    ons.ready(function() {
      var str = window.localStorage.getItem('themesetting');
      var obj = JSON.parse(str);
      for (var cnt = 0; cnt < $scope.config.theme.length; cnt++) {
        if (obj.name === $scope.config.theme[cnt].name) {
          $scope.config.theme[cnt].selected = 'checked';
        } else {
          $scope.config.theme[cnt].selected = '';
        }
      }
    });
    // テーマ選択
    $scope.select = function(themeList) {
      // 選択内容反映
      var params = themeList.value.split(':');
      document.getElementById(params[0]).href = params[1];
      // 設定書き込み
      var obj = themeList;
      window.localStorage.setItem('themesetting', JSON.stringify(obj));
      // ダイアログ非表示
      dialog.hide();
    };
  });
})();

ons.bootstrap(['myApp']);
