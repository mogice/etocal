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
  // 月の日数
  var MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // 日本の時差 + 最近のΔT :: 手抜き
  var JISA_JP = (65.0 / 3600.0 + 9.0) / 24.0;
  var SLA = [36000.7695, 280.4659, 1.9147, 0.0200, -0.0048, 0.0020, 0.0018, 0.0018, 0.0015, 0.0013, 0.0007, 0.0007, 0.0007, 0.0006, 0.0005, 0.0005, 0.0004, 0.0004];
  var SLB = [0, 0, 35999.05, 71998.1, 35999, 32964, 19, 445267, 45038, 22519, 65929, 3035, 9038, 33718, 155, 2281, 29930, 31557];
  var SLC = [0, 0, 267.52, 265.1, 268, 158, 159, 208, 254, 352, 45, 110, 64, 316, 118, 221, 48, 161];
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
    this.dKyusei = jd2KyuuseiName(jd);
    // --JD から九星の呼び名を得る
    function jd2KyuuseiName(JD) {
      var ans;
      // JD から日家9星を求める（答えは 0-8）
      ans = jd2Kyuusei(JD);
      if (ans >= 0) {
        return (KYUSEIDATA_D[ans]);
      }
      return '';
    }
    // --JD から日家9星を求める（答えは 0-8）
    function jd2Kyuusei(JD) {
      var tenton_inf = new Array(3);
      var flag, base;
      JD = Math.floor(JD);
      // 現在の遁の開始、期間、開始星を取得
      tenton_inf = getTenton(JD);
      if (tenton_inf[0] < 0) {
        // 計算範囲外の日付
        return -1;
      }
      if (tenton_inf[2] < 0) {
        flag = -1;
      } else {
        flag = 1;
      }
      base = flag * tenton_inf[2] - 1 + 270;
      base += (JD - tenton_inf[0]) * flag;
      return base % 9;
    }
    // --JDを含む9星の転遁開始のユリウス日と期間、開始の星番号を得る
    // --星番号が負なら、陰遁。正なら陽遁
    // --戻り値はtenton_inf[0,1,2]を、2450830, 210, -1のようにして返す
    // --冬至、夏至の日が甲子(0)～癸巳(29)なら、直前の甲子、
    // --甲午(30)～癸亥(59)なら、直後の甲子が転遁日
    function getTenton(JD) {
      var KJD = new Array(2);
      var n, yy, yyt, yyn, dd, days, flag, lg;
      var tenton_inf = new Array(3);
      // ユリウス日から小数点以下を切り捨て
      JD = Math.floor(JD);
      // およその西暦計算
      yy = Math.floor(JD / 365.2422 - 4712);
      // 転遁日検索フラグ初期化
      n = false;
      yyt = yy + 0.25;
      // ---------- 転遁のJD を探索 ------------
      while (!n) {
        yyn = Math.floor(yyt);
        lg = (yyt - Math.floor(yyt)) * 360.0;
        dd = sunLongDays(yyn, lg) + JISA_JP;
        days = ymd2Jd(yyn, 1, dd);
        // 夏至・冬至のJD 整数
        KJD[0] = Math.floor(days);
        days = Math.floor(days - Math.floor(days / 60.0) * 60.0);
        // 六十干支番号
        days = (days + 50) % 60;
        if (days < 30) {
          KJD[0] -= days;
        } else {
          KJD[0] += (60 - days);
        }
        if (KJD[0] > JD) {
          // 半年前の転遁時期計算
          yyt -= 0.5;
        } else {
          yyt += 0.5;
          yyn = Math.floor(yyt);
          lg = (yyt - yyn) * 360.0;
          dd = sunLongDays(yyn, lg) + JISA_JP;
          days = ymd2Jd(yyn, 1, dd);
          // 夏至・冬至のJD 整数
          KJD[1] = Math.floor(days);
          days = Math.floor(days - Math.floor(days / 60.0) * 60.0);
          // 六十干支番号
          days = (days + 50) % 60;
          if (days < 30) {
            KJD[1] -= days;
          } else {
            KJD[1] += (60 - days);
          }
          if (KJD[1] <= JD) {
            // 半年後の転遁時期計算
            yyt += 0.5;
          } else {
            // 転遁日発見
            n = true;
          }
        }
      }
      // ---------- 転遁の情報をセット ------------
      tenton_inf[0] = KJD[0];
      tenton_inf[1] = 180;
      if ((yyt - yyn) > 0.5) {
        // 夏至～冬至：陰遁
        flag = -9;
        if (JD - tenton_inf[0] >= 180) {
          // 閏処理
          flag = -9;
          tenton_inf[1] = 30;
          tenton_inf[0] += 180;
          if (JD - tenton_inf[0] >= 30) {
            flag = 7;
            tenton_inf[0] += 30;
          }
        }
        tenton_inf[2] = flag;
      } else {
        // 冬至～夏至：陽遁
        flag = 1;
        if (JD - tenton_inf[0] >= 180) {
          // 閏処理
          flag = 1;
          tenton_inf[1] = 30;
          tenton_inf[0] += 180;
          if (JD - tenton_inf[0] >= 30) {
            flag = -3;
            tenton_inf[0] += 30;
          }
        }
        tenton_inf[2] = flag;
      }
      // 転遁の情報を復帰
      return tenton_inf;
    }
    function sunLongDays(year, kaku) {
      var t0, t, sl, dsl, bsl, ofs;
      t0 = ymd2Jd(year, 1, 0) - ymd2Jd(2000, 1, 1.5);
      bsl = sunLong(t0);
      if (kaku < bsl) ofs = -360.0;
      else ofs = 0.0;
      t = kaku - bsl - ofs;
      t = Math.floor(t * 0.9);
      for (;;) {
        sl = sunLong(t + t0);
        if (sl < bsl) bsl += ofs;
        if ((sl >= kaku) && (bsl < kaku)) {
          t += (kaku - sl) / (sl - bsl);
          t += (kaku - sunLong(t + t0)) / (sl - bsl);
          break;
        }
        bsl = sl;
        t++;
      }
      return t;
    }
    function sunLong(T) {
      var d2r, ans, dans;
      d2r = Math.PI / 180.0;
      dans = -0.0057 + 0.0048 * Math.cos((1934 * T / 36525.0 + 145) * d2r);
      ans = sunMLong(T);
      ans += dans;
      while (ans < 0.0) ans += 360.0;
      while (ans >= 360.0) ans -= 360.0;
      return ans;
    }
    function sunMLong(T) {
      var d2r, kaku, i, ans;
      d2r = Math.PI / 180.0;
      T /= 36525.0;
      ans = 0.0;
      for (i = 17; i >= 0; i--) {
        kaku = (SLB[i] * T + SLC[i]) * d2r;
        if ((i == 0) || (i == 4)) ans += SLA[i] * T * Math.cos(kaku);
        else ans += SLA[i] * Math.cos(kaku);
      }
      ans = ans - Math.floor(ans / 360.0) * 360.0;
      return ans;
    }
    // --年月日から JD を求める
    function ymd2Jd(yy, mm, dd) {
      var days, tmp, yym1;
      yym1 = yy - 1;
      // BC1年の末日
      days = 1721422;
      // 2月の調整
      MDAYS[1] = 28;
      if (yy % 4 === 0) {
        MDAYS[1] = 29;
        if (yy > 1582) {
          if (yy % 100 === 0) {
            MDAYS[1] = 28;
            if (yy % 400 === 0) {
              MDAYS[1] = 29;
            }
          }
        }
      }
      // JD計算
      // --紀元後からの経過日数加算(対象年の前年まで)
      days += Math.floor(365.25 * yym1 + 0.1);
      // --対象年1日からの経過日数加算(対象月の前月まで)
      for (m = 0; m < (mm - 1); m++) {
        days += MDAYS[m];
      }
      // --対象月1日からの経過日数加算
      days += dd;
      // --グレゴリオ暦以降の場合、10日のズレを調整
      // --(ユリウス暦終了:1582年10月04日/グレゴリオ暦開始:1582年10月15日)
      if (days >= 2299160) {
        days -= 10;
      }
      // --グレゴリオ暦以降、400年に3回の閏年を調整(初回の100で割り切れる年が1600年)
      // --(年数が100で割り切れ、かつ400では割り切れない年は平年とする)
      if (yym1 >= 1600) {
        days -= Math.floor((yym1 - 1600 + 0.1) / 100);
        days += Math.floor((yym1 - 1600 + 0.1) / 400);
      }
      return days;
    }
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