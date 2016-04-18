// This is a JavaScript file

(function(lib) {
  // 日数とミリ秒を変換する係数
  var COEFFICIENT = 24 * 60 * 60 * 1000;
  // 「1900/1/0」～「1970/1/1」 (日数)
  var DATES_OFFSET = 70 * 365 + 17 + 2;
  // UTCとJSTの時差 (ミリ秒)
  var MILLIS_DIFFERENCE = 9 * 60 * 60 * 1000;
  // 年家九星情報
  var KYUSEIDATA_Y = ['二黒土星', '一白水星', '九紫火星', '八白土星', '七赤金星', '六白金星', '五黄土星', '四緑木星', '三碧木星'];
  // 月家九星情報
  var KYUSEIDATA_M = ['四緑木星', '三碧木星', '二黒土星', '一白水星', '九紫火星', '八白土星', '七赤金星', '六白金星', '五黄土星'];
  // 日家九星情報
  var KYUSEIDATA_D = ['一白水星', '二黒土星', '三碧木星', '四緑木星', '五黄土星', '六白金星', '七赤金星', '八白土星', '九紫火星'];
  // コンストラクタ
  lib.EtoObj = function(date) {
    // 日付セット
    var hiduke = new Date(date);
    hiduke.setHours(0);
    hiduke.setMinutes(0);
    hiduke.setSeconds(0);
    hiduke.setMilliseconds(0);
    // 年の干支計算
    var yTrunkNum = (hiduke.getFullYear() + 6) % 10 + 1;
    var yBranchNum = (hiduke.getFullYear() + 8) % 12 + 1;
    this.yJikkan = this.trunk(yTrunkNum);
    this.yJyunishi = this.branch(yBranchNum);
    // 月の干支計算
    var mTrunkNum = ((hiduke.getFullYear() + 6) * 12 + hiduke.getMonth() + 1) % 10 + 1;
    var mBranchNum = ((hiduke.getFullYear() + 8) * 12 + hiduke.getMonth() + 1) % 12 + 1;
    this.mJikkan = this.trunk(mTrunkNum);
    this.mJyunishi = this.branch(mBranchNum);
    // 日の干支計算
    var dTrunkNum = (((hiduke.getTime() + MILLIS_DIFFERENCE) / COEFFICIENT + DATES_OFFSET) - 2) % 10 + 1;
    var dBranchNum = (((hiduke.getTime() + MILLIS_DIFFERENCE) / COEFFICIENT + DATES_OFFSET) + 8) % 12 + 1;
    this.dJikkan = this.trunk(dTrunkNum);
    this.dJyunishi = this.branch(dBranchNum);
    // 年家九星計算
    var yKyuseiNum = hiduke.getFullYear() % 9;
    this.yKyusei = KYUSEIDATA_Y[yKyuseiNum];
    // 月家九星計算
    var mKyuseiNum = hiduke.getFullYear() % 3 * 3 + (hiduke.getMonth() + 1);
    if (mKyuseiNum > 8) {
      mKyuseiNum = mKyuseiNum - 9;
      if (mKyuseiNum > 8) {
        mKyuseiNum = mKyuseiNum - 9;
      }
    }
    this.mKyusei = KYUSEIDATA_M[mKyuseiNum];
    // 日家九星計算
    var jd = hiduke.getJD();
    this.dKyusei = '';
  };
  var p = lib.EtoObj.prototype;
  p.trunk = function(trunkNum) {
    var trunkList = {
      1 : { 'kanji' : '甲', 'yomi' : 'きのえ', 'imi' : '木の兄', },
      2 : { 'kanji' : '乙', 'yomi' : 'きのと', 'imi' : '木の弟', },
      3 : { 'kanji' : '丙', 'yomi' : 'ひのえ', 'imi' : '火の兄', },
      4 : { 'kanji' : '丁', 'yomi' : 'ひのと', 'imi' : '火の弟', },
      5 : { 'kanji' : '戊', 'yomi' : 'つちのえ', 'imi' : '土の兄', },
      6 : { 'kanji' : '己', 'yomi' : 'つちのと', 'imi' : '土の弟', },
      7 : { 'kanji' : '庚', 'yomi' : 'かのえ', 'imi' : '金の兄', },
      8 : { 'kanji' : '辛', 'yomi' : 'かのと', 'imi' : '金の弟', },
      9 : { 'kanji' : '壬', 'yomi' : 'みずのえ', 'imi' : '水の兄', },
      10 : { 'kanji' : '癸', 'yomi' : 'みずのと', 'imi' : '水の弟', },
    };
    return trunkList[trunkNum];
  };
  p.branch = function(branchNum) {
    var branchList = {
      1 : { 'kanji' : '子', 'yomi' : 'ね', },
      2 : { 'kanji' : '丑', 'yomi' : 'うし', },
      3 : { 'kanji' : '寅', 'yomi' : 'とら', },
      4 : { 'kanji' : '卯', 'yomi' : 'う', },
      5 : { 'kanji' : '辰', 'yomi' : 'たつ', },
      6 : { 'kanji' : '巳', 'yomi' : 'み', },
      7 : { 'kanji' : '午', 'yomi' : 'うま', },
      8 : { 'kanji' : '未', 'yomi' : 'ひつじ', },
      9 : { 'kanji' : '申', 'yomi' : 'さる', },
      10 : { 'kanji' : '酉', 'yomi' : 'とり', },
      11 : { 'kanji' : '戌', 'yomi' : 'いぬ', },
      12 : { 'kanji' : '亥', 'yomi' : 'い', },
    };
    return branchList[branchNum];
  };
})(lib = lib || {});