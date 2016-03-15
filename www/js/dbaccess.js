// This is a JavaScript file

/**
 * DB Access module
 */
// DB open
// name　　    : DB名
// version     : 指定無くてよい
// displayName : 表示名、ダイアログなどで利用される
// size        : 最大容量、バイト単位
function openDb(name, version, displayName, size){
  // DB初回作成時のみコールされる、特に仕様無し、スケルトン
  var callback = function(){
    console.log("create new db.");
  };
  return window.openDatabase(name, version, displayName, size, callback);
}
// execute sql
// db          : openDbの戻り値
// sqlBase     : 実行するSQL、パラメータ部は?
// sqlParams   : パラメータ（配列）、無い場合空[]を指定
// callback    : 処理終了時コールバック(エラー発生時；第一引数：処理結果)
// err         : 処理エラー時コールバック(エラー発生時；第一引数：エラー情報)
function execSQL(db, sqlBase, sqlParams, callback, err) {
  db.transaction(function(transaction) {
    // SQL実行
    transaction.executeSql(sqlBase, sqlParams, 
      function(transaction, result) {
        // 成功
        callback(result);
      },
      function(transaction, error) {
        // 失敗
        err(error);
      }
    );
  });
}