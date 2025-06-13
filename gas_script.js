/**
 * フォームデータをスプレッドシートに転記するGoogle Apps Script
 * 
 * 使用方法:
 * 1. Google Spreadsheetを開く
 * 2. ツール > スクリプトエディタを選択
 * 3. このコードをコピーペーストして保存
 * 4. デプロイ > 新しいデプロイからWebアプリとしてデプロイ
 *    - アクセスできるユーザー: 全員（匿名を含む）
 *    - 実行するユーザー: 自分
 * 5. 生成されたURLをform.jsのSCRIPT_URL変数に設定
 */

// POSTリクエスト時の処理
function doPost(e) {
  try {
    // リクエストデータの取得
    const jsonData = e.parameter.data;
    const data = JSON.parse(jsonData);
    
    // データをスプレッドシートに転記
    const result = writeToSheet(data);
    
    // 結果を返す
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: result
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // エラー発生時
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// スプレッドシートへの書き込み処理
function writeToSheet(data) {
  try {
    // アクティブなスプレッドシートを取得
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('受注データ') || spreadsheet.getActiveSheet();
    
    // データを配列に変換（スプレッドシートの列順に合わせる）
    // 画像の下2段のデータ形式に合わせて調整
    const rowData = [
      data.registerDate || '',               // A列: 登録日 (例: 6/7)
      data.registerTime || '',               // B列: 時間 (例: 17:04)
      data.districtNo || '',                 // C列: 地区No (例: 511)
      data.departmentNo || '',               // D列: 所属No (例: 15)
      data.staffName || '',                  // E列: 担当者名 (例: 草野) - 所属名ではなく担当者名を転記
      data.contractorName || '',             // F列: 契約者 (例: 草野 寿幸)
      data.contractorAge || '',              // G列: 年齢 (例: 81)
      data.contractorRelation || '',         // H列: 続柄 (例: 主)
      data.contractorTel || '',              // I列: 契約者TEL (例: 095272-2021)
      data.category || '',                   // J列: 区分 (例: 1)
      data.confirmerDateTime || '',          // K列: 確認日時 (例: 6/10 担当待ち)
      data.confirmerName || '',              // L列: 確認者 (例: クサノ タケシ)
      data.confirmerAge || '',               // M列: 年齢 (例: 52)
      data.confirmerRelation || '',          // N列: 続柄 (例: 同息)
      data.confirmerTel || '',               // O列: 連絡先 (例: 同居)
      data.product || '',                    // P列: 商品 (例: SO260買･管有)
      data.quantity || '',                   // Q列: 数量 (例: 2s)
      data.amount || '',                     // R列: 金額 (例: 351,000)
      data.contractDate || '',               // S列: 契約日 (例: 2023-06-07)
      data.startDate || '',                  // T列: 着工日 (例: 2023-06-12)
      data.startTime || '',                  // U列: 時間 (例: AM)
      data.completionDate || '',             // V列: 完工予定日 (例: 2023-06-12)
      data.paymentMethod || '',              // W列: 支払方法 (例: 振込)
      data.receiver || '',                   // X列: 受付担当 (例: 大城)
      data.flyer || '',                      // Y列: チラシ (例: 4)
      data.estimateNo || '',                 // Z列: 見積No (例: 007_003000)
      data.notes || '',                      // AA列: 備考 (例: 03MC2台MJ買)
      data.otherCompany || '',               // AB列: 他社 (例: 0)
      data.history || '',                    // AC列: 履歴 (例: 0)
      data.mainContract || '',               // AD列: 本契約 (例: 1)
      data.total || ''                       // AE列: 合計 (例: 1)
    ];
    
    // 最終行に追加
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, rowData.length).setValues([rowData]);
    
    return `データが正常に転記されました（行: ${lastRow + 1}）`;
    
  } catch (error) {
    throw new Error(`スプレッドシートへの書き込み中にエラーが発生しました: ${error.toString()}`);
  }
}

// GETリクエスト時の処理（テスト用）
function doGet(e) {
  return ContentService.createTextOutput('This service is running correctly. Please use POST method to submit data.');
}

// スプレッドシート設定用の関数
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('受注データ');
  
  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet('受注データ');
  }
  
  // ヘッダー行の設定
  const headers = [
    'タイムスタンプ',
    '挨拶日',
    '時間',
    '地区№',
    '所属№',
    '担当者',
    '契約者',
    '契約者年齢',
    '契約者関係',
    '契約者TEL',
    '確認者',
    '確認者年齢',
    '確認者関係',
    '確認日時',
    '確認者TEL',
    '商品',
    '数量',
    '金額',
    '契約予定日',
    '着工日',
    '着工時間',
    '完工予定日',
    '支払方法',
    '受付者',
    'チラシ/CO',
    '設計見積番号',
    '備考',
    '他社',
    '履歴',
    '本契約',
    '合計'
  ];
  
  // ヘッダーを設定
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // デザイン調整
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4285F4').setFontColor('#FFFFFF').setFontWeight('bold');
  
  // 各列の幅を調整
  for (let i = 0; i < headers.length; i++) {
    sheet.setColumnWidth(i+1, 120);
  }
  
  SpreadsheetApp.flush();
}

// Webアプリとして公開する方法
// 1. スクリプトエディタで「デプロイ」→「新しいデプロイ」をクリック
// 2. 「種類の選択」で「ウェブアプリ」を選択
// 3. 「次のユーザーとして実行」→「自分」
// 4. 「アクセスできるユーザー」→「全員」
// 5. 「デプロイ」をクリック
// 6. 生成されたURLをコピーして、form.jsのSCRIPT_URLに設定 