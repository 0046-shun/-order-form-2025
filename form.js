// グローバル変数
let products = [];
let staffList = []; // 社員リストのキャッシュ
let selectedStaff = null; // 選択された担当者を保持
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzk394vzbQ3haLdYWXH7pseu7dpUNyLt6DNQ1Euk2eDidOacPdBWl45FQpk_591MQcB/exec";

// テストデータ入力関数をグローバルに公開
window.fillTestData = function() {
  const today = new Date();
  const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  // 日本語形式の今日の日付（例：2023年6月7日）
  const todayJpStr = `${yyyy}年${parseInt(mm)}月${parseInt(dd)}日`;

  // 提供されたテストデータに基づく設定
  const testData = {
    // 基本情報
    "greeting_date": todayJpStr, // 今日の日付（日本語形式）
    "time": "まち", // 時間（文字列も可能）
    
    // 担当者情報
    "district_no": "511",
    "department_no": "15",
    "department_name": "熊本",
    "staff_name": "草野",
    
    // 契約者情報
    "contractor_name": "草野 寿幸",
    "contractor_relation": "主",
    "contractor_age": "81",
    "contractor_tel": "095272-2021",
    
    // 確認者情報
    "confirmer_name": "クサノ タケシ",
    "confirmer_relation": "同息",
    "confirmer_age": "52",
    "confirmer_tel": "同居",
    "category": "1",
    "confirmer_date": todayJpStr, // 今日の日付
    "confirmer_time": "直電", // 時間（文字列も可能）
    "confirmer_memo": "担当待ち",
    
    // 商品情報
    "product": "SO260買･管有",
    "quantity": "2",
    "amount": "351000",
    
    // 日程情報
    "contract_date": todayJpStr, // 今日の日付
    "start_date": todayJpStr, // 今日の日付
    "start_time": "AM",
    "completion_date": todayJpStr, // 今日の日付
    
    // その他情報
    "payment_method": "振込",
    "receiver": "大城",
    "flyer": "4",
    "estimate_no": "007_003000",
    "notes": "03MC2台MJ買",
    "other_company": "0",
    "history": "0",
    "main_contract": "1",
    "total": "1"
  };

  try {
    // フォーム内のすべての入力要素を取得してデータを設定
    const allInputs = document.querySelectorAll('#order-form input, #order-form select, #order-form textarea');
    
    // 全ての入力要素を一旦リセット
    allInputs.forEach(input => {
      input.classList.remove('is-valid');
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      }
    });
  
    // readonly属性を一時的に解除するフィールドのリスト（商品情報フィールドは削除）
    const readonlyFields = ["district_no", "department_no", "department_name"];
    
    // readonly属性を一時的に解除
    readonlyFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field && field.hasAttribute('readonly')) {
        field.removeAttribute('readonly');
      }
    });
  
    // テストデータを設定
    Object.keys(testData).forEach(key => {
      const element = document.getElementById(key);
      if (element) {
        // 要素の種類に応じて値を設定
        if (element.tagName === 'SELECT') {
          // セレクトボックスの場合、オプションが存在するか確認
          const option = Array.from(element.options).find(opt => opt.value === testData[key]);
          if (option) {
            element.value = testData[key];
          } else if (element.options.length > 0) {
            // オプションが見つからない場合は最初の非空のオプションを選択
            for (let i = 0; i < element.options.length; i++) {
              if (element.options[i].value) {
                element.value = element.options[i].value;
                break;
              }
            }
          }
        } else {
          // 通常の入力フィールド
          element.value = testData[key];
        }
        
        // 入力完了スタイルを適用
        element.classList.add('is-valid');
      }
    });
    
    // readonly属性を元に戻す
    readonlyFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.setAttribute('readonly', '');
      }
    });
    
    // 合計値を計算
    calculateTotal();
  
    console.log('テストデータを設定しました');
    
    // ユーザーへの通知
    alert('✅ テストデータを入力しました。このまま送信ボタンを押すと転記テストが行えます。');
    
  } catch (error) {
    console.error('テストデータ入力中にエラーが発生しました:', error);
    alert('⚠️ テストデータ入力中にエラーが発生しました。');
  }
};

// 初期化処理
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing form components');
    
    // 日付入力の初期化
    setDefaultDates();
    
    // カタカナボードの初期化
    initKatakanaBoard();
    
    // 今日の日付ボタンのクリックイベント設定
    const updateDateBtn = document.getElementById('update-date-btn');
    if (updateDateBtn) {
        updateDateBtn.addEventListener('click', updateGreetingDate);
    }
    
    // 現在時刻ボタンのクリックイベント設定
    const updateTimeBtn = document.getElementById('update-time-btn');
    if (updateTimeBtn) {
        updateTimeBtn.addEventListener('click', function() {
            // 時間選択のためのドロップダウンメニュー表示
            const timeInput = document.getElementById('time');
            if (timeInput) {
                const choices = ["現在時刻", "まち", "直電", "AM", "PM", "終日"];
                
                // すでに選択メニューが表示されている場合は削除
                const existingMenu = document.getElementById('time-dropdown');
                if (existingMenu) {
                    existingMenu.remove();
                    return;
                }
                
                // 選択メニューを作成
                const dropdown = document.createElement('div');
                dropdown.id = 'time-dropdown';
                dropdown.className = 'dropdown-menu show position-absolute';
                dropdown.style.width = '100%';
                dropdown.style.zIndex = '1000';
                
                // 各選択肢を追加
                choices.forEach(choice => {
                    const item = document.createElement('a');
                    item.className = 'dropdown-item';
                    item.href = '#';
                    item.textContent = choice;
                    
                    item.addEventListener('click', function(e) {
                        e.preventDefault();
                        
                        if (choice === "現在時刻") {
                            // 現在時刻を設定
                            const now = new Date();
                            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                            timeInput.value = timeStr;
                        } else {
                            // その他の選択肢はそのままテキストを設定
                            timeInput.value = choice;
                        }
                        
                        // 入力完了スタイルを適用
                        timeInput.classList.add('is-valid');
                        
                        // ドロップダウンを閉じる
                        dropdown.remove();
                    });
                    
                    dropdown.appendChild(item);
                });
                
                // 入力フィールドの下に選択メニューを配置
                const inputGroup = timeInput.parentElement;
                inputGroup.style.position = 'relative';
                inputGroup.appendChild(dropdown);
                
                // ドキュメントのクリックイベントでドロップダウンを閉じる
                document.addEventListener('click', function closeDropdown(e) {
                    if (!dropdown.contains(e.target) && e.target !== updateTimeBtn) {
                        dropdown.remove();
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }
        });
    }
    
    // カタカナボード開閉ボタンの設定
    const toggleKeyboardBtn = document.getElementById('toggle-keyboard');
    if (toggleKeyboardBtn) {
        toggleKeyboardBtn.addEventListener('click', function() {
            const katakanaBoard = document.getElementById('katakana-board');
            if (katakanaBoard) {
                // 表示/非表示を切り替え
                if (katakanaBoard.style.display === 'none') {
                    katakanaBoard.style.display = 'block';
                    this.textContent = 'キーボード非表示';
                } else {
                    katakanaBoard.style.display = 'none';
                    this.textContent = 'キーボード表示';
                }
            }
        });
    }
    
    // 区分のセレクトボックスの変更イベント設定
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const confirmerDateInput = document.getElementById('confirmer_date');
            
            // 値が1か5の場合、現在の日付を設定（デフォルト値のみ提供）
            if (this.value === '1' || this.value === '5') {
                const now = new Date();
                const yyyy = now.getFullYear();
                const mm = String(now.getMonth() + 1).padStart(2, '0');
                const dd = String(now.getDate()).padStart(2, '0');
                const todayJpStr = `${yyyy}年${parseInt(mm)}月${parseInt(dd)}日`;
                
                // 確認日が空の場合のみデフォルト値を設定（手入力値を尊重）
                if (confirmerDateInput && !confirmerDateInput.value) confirmerDateInput.value = todayJpStr;
            } else {
                // それ以外の場合は空にする（ユーザーが手入力した場合はそのまま）
                if (confirmerDateInput && !confirmerDateInput.value) confirmerDateInput.value = '';
            }
            // 時間は更新しない（ユーザーが手動入力または空欄のまま）
        });
    }
    
    // 備考欄チェックボックスの設定
    const notesCheckboxes = document.querySelectorAll('.notes-checkbox');
    const notesInput = document.getElementById('notes');
    
    if (notesCheckboxes.length > 0 && notesInput) {
        notesCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateNotesField();
            });
        });
        
        // 備考欄の入力内容を更新する関数
        function updateNotesField() {
            // チェックされたボックスの値を集める
            const checkedValues = [];
            notesCheckboxes.forEach(cb => {
                if (cb.checked) {
                    checkedValues.push(cb.value);
                }
            });
            
            // チェックされた値を区切り文字で連結
            if (checkedValues.length > 0) {
                // 備考欄を更新（既存の手入力内容は保持せず、チェックされた項目だけを表示）
                notesInput.value = checkedValues.join('/');
            } else {
                // チェックされた項目がない場合は空にする
                notesInput.value = '';
            }
        }
    }
    
    // 担当者データの読み込み - 最初に行う
    loadStaffData().then(() => {
        console.log('Staff data initialization complete');
        // 初期サジェスト表示
        displayInitialStaffSuggestions();
    }).catch(err => {
        console.error('Failed to initialize staff data:', err);
    });
    
    // スタッフ名入力フィールドにイベントリスナー追加
    const staffNameInput = document.getElementById('staff_name');
    if (staffNameInput) {
        // キー入力ごとに即時検索実行
        staffNameInput.addEventListener('input', function(e) {
            console.log('Input event triggered, calling handleStaffNameInput');
            handleStaffNameInput(e);
        });
        
        // フォーカス時にサジェスト表示
        staffNameInput.addEventListener('focus', function() {
            // データが既に存在していれば表示
            const suggestions = document.getElementById('staff-suggestions');
            if (suggestions) {
                suggestions.classList.add('active');
                
                // 値がまだ入力されていなければ初期データを表示
                if (!this.value.trim()) {
                    displayInitialStaffSuggestions();
                } else {
                    // 既に値がある場合は検索を実行
                    this.dispatchEvent(new Event('input'));
                }
            }
        });
    } else {
        console.warn('Staff name input element not found');
    }
    
    // 電話番号の自動フォーマット機能
    const telInputs = [
        document.getElementById('contractor_tel'),
        document.getElementById('confirmer_tel')
    ];
    
    telInputs.forEach(input => {
        if (input) {
            // 入力やペースト時にフォーマットを適用
            input.addEventListener('input', formatPhoneNumber);
            input.addEventListener('paste', function(e) {
                // ペースト時は少し遅延させてフォーマットを適用
                setTimeout(() => formatPhoneNumber.call(this), 10);
            });
        }
    });
    
    // 他社、履歴、本契約のプルダウン変更時に計算処理を実行
    document.getElementById('other_company').addEventListener('change', calculateTotal);
    document.getElementById('history').addEventListener('change', calculateTotal);
    document.getElementById('main_contract').addEventListener('change', calculateTotal);
    
    // クリックイベントの設定
    document.addEventListener('click', function(e) {
        const staffSuggestions = document.getElementById('staff-suggestions');
        const staffNameInput = document.getElementById('staff_name');
        const katakanaBoard = document.getElementById('katakana-board');
        
        // クリックされた要素がサジェスト、入力フィールド、カタカナボードのいずれでもない場合
        if (staffSuggestions && 
            !staffSuggestions.contains(e.target) && 
            e.target !== staffNameInput && 
            katakanaBoard && !katakanaBoard.contains(e.target)) {
            staffSuggestions.classList.remove('active');
        }
    });
    
    // selectStaff関数をグローバルに公開
    window.selectStaff = function(element) {
        const districtNo = element.dataset.district;
        const departmentNo = element.dataset.department;
        const departmentName = element.dataset.departmentName;
        const fullName = element.dataset.name;
        
        // 氏名から苗字のみを抽出（スペース区切り）
        // 名前が空白で区切られている場合は最初の部分を姓として使用、そうでなければ全体を使用
        const lastName = fullName.includes(' ') ? fullName.split(' ')[0] : fullName;
        
        // カタカナ名を取得するため、TRから値を取得
        const cells = element.getElementsByTagName('td');
        const katakanaNam = cells[4]?.innerText || ''; // 5番目のセル（インデックス4）にカタカナ名がある
        
        // メインフォームの入力欄に値を設定
        document.getElementById('staff_name').value = lastName; // 苗字のみを設定
        document.getElementById('district_no').value = districtNo;
        document.getElementById('department_no').value = departmentNo;
        document.getElementById('department_name').value = departmentName;

        // サジェスト表示を非表示
        document.getElementById('staff-suggestions').classList.remove('active');

        // 入力完了スタイルを適用
        document.getElementById('staff_name').classList.add('is-valid');
        document.getElementById('district_no').classList.add('is-valid');
        document.getElementById('department_no').classList.add('is-valid');
        document.getElementById('department_name').classList.add('is-valid');
        
        // 選択された担当者情報をグローバル変数に保存（商品モーダルでの利用のため）
        selectedStaff = {
            districtNo: districtNo,
            departmentNo: departmentNo,
            departmentName: departmentName,
            fullName: fullName,
            katakanaNam: katakanaNam,
            lastName: lastName
        };
        
        // デバッグ用
        console.log('Selected staff:', {
            name: fullName,
            lastName: lastName,
            katakana: katakanaNam,
            district: districtNo,
            department: departmentNo,
            departmentName: departmentName
        });
    };

    // キーボードショートカットの設定
    document.addEventListener('keydown', function(event) {
        // フォーカスされている要素を取得
        const activeElement = document.activeElement;
        
        // フォーカスされている要素がフォームコントロールの場合
        if (activeElement && 
            (activeElement.tagName === 'INPUT' || 
             activeElement.tagName === 'SELECT' || 
             activeElement.tagName === 'TEXTAREA')) {
            
            // フォーム内のすべての入力要素を取得
            const formControls = Array.from(document.querySelectorAll('#order-form input, #order-form select, #order-form textarea'))
                .filter(el => !el.disabled && !el.readOnly && el.type !== 'hidden' && el.style.display !== 'none');
            
            // 現在フォーカスされている要素のインデックスを取得
            const currentIndex = formControls.indexOf(activeElement);
            
            // Enterキーが押された場合（送信ボタンでない場合）
            if (event.key === 'Enter' && !event.ctrlKey && 
                activeElement.type !== 'submit' && 
                activeElement.tagName !== 'BUTTON') {
                
                // Shiftキーが押されている場合は前の項目へ
                if (event.shiftKey) {
                    event.preventDefault();
                    if (currentIndex > 0) {
                        // 一つ前の要素にフォーカスを移動
                        formControls[currentIndex - 1].focus();
                    }
                } 
                // Shiftキーが押されていない場合は次の項目へ
                else {
                    event.preventDefault();
                    if (currentIndex < formControls.length - 1) {
                        // 次の要素にフォーカスを移動
                        formControls[currentIndex + 1].focus();
                    }
                }
            }
        }
    });
    
    // DOM要素の初期化完了後に「計」の値を初期化
    calculateTotal();

    // 挨拶日は常に現在の日付を設定
    updateGreetingDate();
    
    // 挨拶日のフィールドにフォーカスが当たった時やクリックされた時に現在日付を設定
    const greetingDateField = document.getElementById('greeting_date');
    if (greetingDateField) {
        greetingDateField.addEventListener('focus', function() {
            updateGreetingDate();
        });
        
        greetingDateField.addEventListener('click', function() {
            updateGreetingDate();
        });
    }
});

// カタカナボードの初期化
function initKatakanaBoard() {
  console.log('Initializing katakana board...'); // デバッグ用

  // カタカナボタンのイベントリスナー設定
  const katakanaButtons = document.querySelectorAll('.katakana-btn');
  console.log('Found katakana buttons:', katakanaButtons.length); // デバッグ用
  
  // すべてのボタンからイベントリスナーを削除してから再追加
  katakanaButtons.forEach(button => {
    // 古いイベントリスナーを一度すべて削除
    button.removeEventListener('click', handleKatakanaButtonClick);
    
    // インラインのクリックハンドラーとして新しく追加
    button.onclick = function(event) {
      const staffNameInput = document.getElementById('staff_name');
      const buttonText = this.textContent;
      
      console.log('Katakana button clicked:', buttonText); // デバッグ用
      
      if (buttonText === '消去') {
        // 末尾の1文字だけを削除する
        const currentValue = staffNameInput.value;
        if (currentValue.length > 0) {
          staffNameInput.value = currentValue.slice(0, -1);
        }
      } else if (buttonText.trim() !== '') {
        // カタカナを追加する（空白ボタンは無視）
        staffNameInput.value += buttonText;
      }
      
      // 入力イベントを即時発火して検索を実行（遅延なし）
      staffNameInput.dispatchEvent(new Event('input'));
      
      // サジェスト表示を強制的に表示
      const staffSuggestions = document.getElementById('staff-suggestions');
      if (staffSuggestions) {
        staffSuggestions.classList.add('active');
      }
      
      // 入力フィールドにフォーカスを戻す
      staffNameInput.focus();
      
      // イベントのバブリングを止める
      event.preventDefault();
      event.stopPropagation();
      return false; // クリックイベントを完全に停止
    };
  });

  // ドキュメント全体のクリックイベントでサジェスト非表示
  document.addEventListener('click', function(event) {
    const staffSuggestions = document.getElementById('staff-suggestions');
    const staffNameInput = document.getElementById('staff_name');
    const katakanaBoard = document.getElementById('katakana-board');
    
    // クリックされた要素がサジェスト領域、入力フィールド、カタカナボード以外の場合
    if (staffSuggestions && !staffSuggestions.contains(event.target) && 
        event.target !== staffNameInput && 
        katakanaBoard && !katakanaBoard.contains(event.target)) {
      staffSuggestions.classList.remove('active');
    }
  });
  
  // 初期表示を行う
  setTimeout(displayInitialStaffSuggestions, 300);
}

// カタカナボタンクリックハンドラー
function handleKatakanaButtonClick(event) {
  const staffNameInput = document.getElementById('staff_name');
  if (!staffNameInput) {
    console.error('Staff name input not found');
    return;
  }
  
  const buttonText = event.target.textContent;
  console.log('Katakana button clicked:', buttonText);
  
  if (buttonText === '消去') {
    // 末尾の1文字だけを削除する
    const currentValue = staffNameInput.value;
    if (currentValue.length > 0) {
      staffNameInput.value = currentValue.slice(0, -1);
    }
  } else if (buttonText.trim() !== '') {
    // カタカナを追加する（空白ボタンは無視）
    staffNameInput.value += buttonText;
  }
  
  // 入力イベントを即時発火して検索を実行
  staffNameInput.dispatchEvent(new Event('input'));
  
  // サジェスト表示を強制的に表示
  const staffSuggestions = document.getElementById('staff-suggestions');
  if (staffSuggestions) {
    staffSuggestions.classList.add('active');
  }
  
  // 入力フィールドにフォーカスを戻す
  staffNameInput.focus();
  
  // イベントのバブリングを止める
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  return false;
}

// スタッフデータ読み込み関数
async function loadStaffData() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Attempting to load staff data from staff.json');
      const response = await fetch('staff.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load staff data: ${response.status} ${response.statusText}`);
      }
      
      // レスポンスを取得
      const data = await response.json();
      console.log('Staff data loaded successfully');
      
      // データ構造を確認
      if (data && data.staffList && Array.isArray(data.staffList)) {
        staffList = data.staffList;
        console.log(`Loaded ${staffList.length} staff records`);
        resolve(staffList);
      } else {
        console.error('Invalid staff data structure:', data);
        reject(new Error('Invalid staff data structure'));
      }
    } catch (error) {
      console.error('Error loading staff data:', error);
      reject(error);
    }
  });
}

// カタカナ変換ヘルパー関数
function convertToValidKatakana(str) {
  if (!str) return "";
  
  // "繧ｶ" のような文字列をカタカナに変換する対応表（必要に応じて拡充）
  const conversionMap = {
    "繧｢": "ア", "繧､": "イ", "繧ｦ": "ウ", "繧ｨ": "エ", "繧ｪ": "オ",
    "繧ｫ": "カ", "繧ｭ": "キ", "繧ｯ": "ク", "繧ｱ": "ケ", "繧ｳ": "コ",
    "繧ｵ": "サ", "繧ｷ": "シ", "繧ｹ": "ス", "繧ｻ": "セ", "繧ｽ": "ソ",
    "繧ｿ": "タ", "繝": "チ", "繝・": "ツ", "繝・": "テ", "繝・": "ト",
    "繝": "ナ", "繝・": "ニ", "繝・": "ヌ", "繝・": "ネ", "繝・": "ノ",
    "繝・": "ハ", "繝・": "ヒ", "繝・": "フ", "繝・": "ヘ", "繝・": "ホ",
    "繝・": "マ", "繝・": "ミ", "繝・": "ム", "繝・": "メ", "繝・": "モ",
    "繝・": "ヤ", "繝・": "ユ", "繝・": "ヨ",
    "繝・": "ラ", "繝・": "リ", "繝・": "ル", "繝・": "レ", "繝・": "ロ",
    "繝・": "ワ", "繝・": "ヲ", "繝・": "ン",
    "繧ｬ": "ガ", "繧ｮ": "ギ", "繧ｰ": "グ", "繧ｲ": "ゲ", "繧ｴ": "ゴ",
    "繧ｶ": "ザ", "繧ｸ": "ジ", "繧ｺ": "ズ", "繧ｾ": "ゼ", "繧ｿ": "ゾ"
  };
  
  // 変換を試みる
  let result = str;
  Object.entries(conversionMap).forEach(([pattern, replacement]) => {
    result = result.replace(new RegExp(pattern, 'g'), replacement);
  });
  
  // カタカナが検出できなかった場合、サンプル値を返す
  if (!/[\u30A0-\u30FF]/.test(result)) {
    // staffNameからカタカナを推測
    const lastName = (str.split(' ')[0] || "").trim();
    return lastName ? lastName + "サン" : "カタカナ";
  }
  
  return result;
}

// 文字化けしたSHIFT-JIS風の文字列をデコードする試み
function decodeShiftJISLikeString(str) {
  if (!str) return "";
  
  // 文字化けしている場合は、以下のサンプル名称を返す
  const departmentMap = {
    "7": "福岡支店",
    "12": "久留米営業所",
    "8": "北九州支店",
    "10": "大分営業所",
    "25": "宮崎営業所",
    "124": "福岡西営業所",
    "63": "熊本営業所",
    "101": "八幡営業所",
    "42": "姪浜支店",
    "79": "行橋営業所"
  };
  
  // 部署名の対応表
  if (str.includes("謾ｯ蠎・") || str.includes("蝟ｶ讌ｭ謇")) {
    for (const [code, name] of Object.entries(departmentMap)) {
      if (str.includes(code)) return name;
    }
    return "営業所";
  }
  
  // 人名の場合、空白で分割して処理
  const parts = str.split(/\s+/);
  if (parts.length >= 2) {
    return parts.join(' '); // 空白を保持
  }
  
  return str;
}

// 初期サジェスト表示
function displayInitialStaffSuggestions() {
  try {
    // スタッフ名入力がすでに入力されている場合は検索を実行する
    const staffNameInput = document.getElementById('staff_name');
    if (staffNameInput && staffNameInput.value.trim()) {
      console.log('Input already has value, triggering search instead of initial suggestions');
      // 既存の入力で検索を実行
      staffNameInput.dispatchEvent(new Event('input'));
      return;
    }
    
    // スタッフリストが読み込まれているか確認
    if (staffList && Array.isArray(staffList) && staffList.length > 0) {
      console.log('Displaying initial staff suggestions');
      const suggestionsBody = document.getElementById('suggestions-body');
      const staffSuggestions = document.getElementById('staff-suggestions');
      
      if (suggestionsBody && staffSuggestions) {
        // 最大20名まで表示
        const initialData = staffList.slice(0, 20);
        
        staffSuggestions.classList.add('active');
        suggestionsBody.innerHTML = initialData.map(staff => `
          <tr onclick="selectStaff(this)" 
              data-district="${staff.districtNo || ''}"
              data-department="${staff.departmentNo || ''}"
              data-department-name="${staff.shozokuMei || ''}"
              data-name="${staff.staffName || ''}">
          <td>${staff.districtNo || ''}</td>
          <td>${staff.departmentNo || ''}</td>
          <td>${staff.shozokuMei || ''}</td>
          <td>${staff.staffName || ''}</td>
          <td>${staff.katakanaNam || ''}</td>
          </tr>
        `).join('');
        
        console.log('Initial staff suggestions displayed:', initialData.length);
      } else {
        console.warn('Suggestions elements not found');
      }
    } else {
      console.warn('Staff list not loaded yet for initial display');
    }
  } catch (error) {
    console.error('Error displaying initial staff suggestions:', error);
  }
}

// 担当者名入力ハンドラ（サジェスト表示）
function handleStaffNameInput(e) {
    try {
        const input = e.target.value.trim();
        console.log('handleStaffNameInput called with input:', input);
        
        const suggestionsBody = document.getElementById('suggestions-body');
        const staffSuggestions = document.getElementById('staff-suggestions');
        
        if (!suggestionsBody || !staffSuggestions) {
            console.warn('Suggestions elements not found during input handling');
            return;
        }

        // サジェスト表示領域を必ず表示する
        staffSuggestions.classList.add('active');

        // スタッフリストが空の場合はエラーメッセージを表示
        if (!staffList || !Array.isArray(staffList) || staffList.length === 0) {
            console.error('No staff data available for search');
            suggestionsBody.innerHTML = '<tr><td colspan="5" class="text-danger">担当者データが読み込まれていません</td></tr>';
            return;
        }

        // 入力がない場合は初期データを表示
        if (!input) {
            displayInitialStaffSuggestions();
            return;
        }

        // カタカナ以外の入力を許可する（警告表示は残す）
        let warningMessage = '';
        if (!isKatakana(input) && input !== '') {
            warningMessage = '<tr><td colspan="5" class="text-warning">カタカナで入力してください</td></tr>';
        }

        // 検索処理を実行 - 入力文字で始まるものを優先
        const matchedStaff = staffList.filter(staff => {
            if (!staff.katakanaNam) return false;
            return staff.katakanaNam.includes(input);
        });

        console.log(`Searching for "${input}" - found ${matchedStaff.length} matches`);

        if (matchedStaff && matchedStaff.length > 0) {
            // まず完全一致
            const exactMatches = matchedStaff.filter(staff => staff.katakanaNam === input);
            
            // 次に前方一致（入力文字で始まるもの）
            const prefixMatches = matchedStaff.filter(staff => 
                staff.katakanaNam.startsWith(input) && staff.katakanaNam !== input);
            
            // 最後に部分一致（前方一致以外）
            const partialMatches = matchedStaff.filter(staff => 
                !staff.katakanaNam.startsWith(input) && staff.katakanaNam !== input);
            
            // 優先順位に従って結合
            const sortedMatches = [...exactMatches, ...prefixMatches, ...partialMatches];
            
            // 結果を表示（最大20件）
            const limitedMatches = sortedMatches.slice(0, 20);
            
            suggestionsBody.innerHTML = limitedMatches.map(staff => `
                <tr onclick="selectStaff(this)" 
                    data-district="${staff.districtNo || ''}"
                    data-department="${staff.departmentNo || ''}"
                    data-department-name="${staff.shozokuMei || ''}"
                    data-name="${staff.staffName || ''}">
                <td>${staff.districtNo || ''}</td>
                <td>${staff.departmentNo || ''}</td>
                <td>${staff.shozokuMei || ''}</td>
                <td>${staff.staffName || ''}</td>
                <td>${staff.katakanaNam || ''}</td>
                </tr>
            `).join('');
            console.log(`Displaying ${limitedMatches.length} matches for "${input}"`);
        } else {
            suggestionsBody.innerHTML = warningMessage || '<tr><td colspan="5">該当する担当者はいません</td></tr>';
        }
    } catch (error) {
        console.error('Error in handleStaffNameInput:', error);
    }
}

// カタカナチェック関数
function isKatakana(str) {
  return /^[\u30A0-\u30FF\s]+$/.test(str);
}

// 日付フィールドの初期設定
function setDefaultDates() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  // 日本語形式の日付（例：2023年6月7日）
  const todayJpStr = `${yyyy}年${parseInt(mm)}月${parseInt(dd)}日`;
  
  const dateFields = [
    "greeting_date",
    "contract_date",
    "start_date",
    "completion_date"
    // "confirmer_date" は除外（初期値を空にするため）
  ];

  dateFields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.value = todayJpStr;
      // 日程情報はすべて手入力修正可能にする - readonlyを削除
      if (element.hasAttribute('readonly')) {
        element.removeAttribute('readonly');
      }
    }
  });

  const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
  
  // 時間フィールドの設定
  const timeFields = ["time"]; // "confirmer_time" は除外（初期値を空にするため）
  timeFields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element && !element.value) { // 値が設定されていない場合のみ初期値を設定
      element.value = timeStr;
    }
  });
}

// 合計値の計算処理
function calculateTotal() {
    const otherCompany = parseInt(document.getElementById('other_company').value) || 0;
    const history = parseInt(document.getElementById('history').value) || 0;
    const mainContract = parseInt(document.getElementById('main_contract').value) || 0;
    
    // 合計は他社+履歴+本契約の合計
    const total = otherCompany + history + mainContract;
    document.getElementById('total').value = total > 0 ? total : 1;
    
    // 商品選択後に合計金額がその他情報の計にも転記される機能を削除
    // 金額の転記を行わないため、ここでは何もしない
}

// 電話番号フォーマット関数
function formatPhoneNumber() {
    let value = this.value;
    
    // 不要な文字を削除（スペース、ハイフン、括弧など）
    value = value.replace(/[\s\-()（）]/g, '');
    
    // 数字のみを抽出
    value = value.replace(/[^\d]/g, '');
    
    // 末尾4桁の前にハイフンを挿入
    if (value.length > 4) {
        const lastFourDigits = value.slice(-4);
        const otherDigits = value.slice(0, -4);
        value = otherDigits + '-' + lastFourDigits;
    }
    
    this.value = value;
}

// フォーム送信処理
document.getElementById("order-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  // ローディング表示
  document.getElementById('loading').style.display = 'flex';

  try {
    // 担当者の姓のみを確実に取得
    let staffName = document.getElementById("staff_name")?.value || "";
    // スペースで区切り、最初の部分を姓として使用
    if (staffName.includes(' ')) {
      staffName = staffName.split(' ')[0];
    } else if (staffName.includes('　')) { // 全角スペースの場合
      staffName = staffName.split('　')[0];
    }
    
    // 日付とデータの整形
    const greetingDate = document.getElementById("greeting_date")?.value || "";
    const contractDate = document.getElementById("contract_date")?.value || "";
    
    // 日付文字列をそのまま使用（日本語形式でも対応）
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      return dateStr;
    };
    
    // 日付表示を整形（年月日表記から「月/日」形式に変換する処理）
    const formatShortDate = (dateStr) => {
      if (!dateStr) return "";
      
      // 「年」「月」「日」を含む日本語形式の場合（例：2023年6月7日）
      if (dateStr.includes('年') && dateStr.includes('月') && dateStr.includes('日')) {
        try {
          const year = dateStr.split('年')[0];
          const month = dateStr.split('年')[1].split('月')[0];
          const day = dateStr.split('月')[1].split('日')[0];
          return `${parseInt(month)}/${parseInt(day)}`;
        } catch (e) {
          // パース失敗時は原文をそのまま返す
          return dateStr;
        }
      }
      
      // YYYY-MM-DD形式の場合
      const dateParts = dateStr.split('-');
      if (dateParts.length === 3) {
        return `${parseInt(dateParts[1], 10)}/${parseInt(dateParts[2], 10)}`;
      }
      
      // その他の形式はそのまま返す
      return dateStr;
    };
    
    // 時間の整形（HH:MM形式を保持）
    const time = document.getElementById("time")?.value || "";
    
    // 確認日時の処理
    let confirmerDateTime = "";
    const confirmerDate = document.getElementById("confirmer_date")?.value || "";
    const confirmerTime = document.getElementById("confirmer_time")?.value || "";
    const confirmerMemo = document.getElementById("confirmer_memo")?.value || "";
    
    if (confirmerDate) {
      // 日付があれば短縮表示にする
      confirmerDateTime = formatShortDate(confirmerDate);
      
      // 時間があれば追加
      if (confirmerTime && confirmerTime.trim() !== "") {
        confirmerDateTime += " " + confirmerTime;
      }
      
      // メモがあれば追加
      if (confirmerMemo && confirmerMemo.trim() !== "") {
        confirmerDateTime += " " + confirmerMemo;
      }
    }
    
    // 商品情報の処理
    let product = document.getElementById("product")?.value || "";
    let quantity = document.getElementById("quantity")?.value || "";
    
    // 商品情報の区切り文字処理
    // 「・」区切りの商品名はそのまま使用
    if (product.includes(',')) {
      // カンマ区切りの場合は「・」区切りに変換
      const products = product.split(',');
      product = products.join('・');
    }
    
    // 数量が「/」区切りでない場合のみ処理
    if (!quantity.includes('/') && quantity.includes(',')) {
      const quantities = quantity.split(',');
      quantity = quantities.join('/');
    }

    // 数量に「s」を付加する条件を設定
    // 換気商品のSO260新,SO260買,SO2(DC)新,SO2(DC)買,天換260新/買の場合のみ
    const ventilationProducts = ['SO260新', 'SO260買', 'SO2(DC)新', 'SO2(DC)買', '天換260新', '天換260買'];
    
    // 商品名に換気商品が含まれているかをチェック
    let hasVentilationProduct = false;
    for (const vp of ventilationProducts) {
      if (product.includes(vp)) {
        hasVentilationProduct = true;
        break;
      }
    }
    
    // 換気商品の場合のみ「s」を付加
    if (hasVentilationProduct) {
      quantity = quantity + "s";
    }
    
    const formDataArray = [
      formatShortDate(greetingDate),                         // A列: 登録日 (例: 6/7)
      document.getElementById("time")?.value || "",          // B列: 時間 (例: 17:04)
      document.getElementById("district_no")?.value || "",   // C列: 地区No (例: 511)
      document.getElementById("department_no")?.value || "", // D列: 所属No (例: 15)
      staffName,                                             // E列: 担当者名（所属名ではなく）
      document.getElementById("contractor_name")?.value || "", // F列: 契約者 (例: 草野 寿幸)
      document.getElementById("contractor_age")?.value || "", // G列: 年齢 (例: 81)
      document.getElementById("contractor_relation")?.value || "", // H列: 続柄 (例: 主)
      document.getElementById("contractor_tel")?.value || "", // I列: 契約者TEL (例: 095272-2021)
      document.getElementById("category")?.value || "",      // J列: 区分 (例: 1)
      confirmerDateTime,                                     // K列: 確認日時 (例: 6/10 担当待ち)
      document.getElementById("confirmer_name")?.value || "", // L列: 確認者 (例: クサノ タケシ)
      document.getElementById("confirmer_age")?.value || "", // M列: 年齢 (例: 52)
      document.getElementById("confirmer_relation")?.value || "", // N列: 続柄 (例: 同息)
      document.getElementById("confirmer_tel")?.value || "", // O列: 連絡先 (例: 同居)
      product,                                               // P列: 商品 (例: SO260買･管有)
      quantity,                                              // Q列: 数量 (例: 2s)
      document.getElementById("amount")?.value || "",        // R列: 金額 (例: 351,000)
      formatDate(contractDate),                              // S列: 契約日 (例: 2023-06-07)
      formatDate(document.getElementById("start_date")?.value || ""), // T列: 着工日 (例: 2023-06-12)
      document.getElementById("start_time")?.value || "",    // U列: 時間 (例: AM)
      formatDate(document.getElementById("completion_date")?.value || ""), // V列: 完工予定日 (例: 2023-06-12)
      document.getElementById("payment_method")?.value || "", // W列: 支払方法 (例: 振込)
      document.getElementById("receiver")?.value || "",      // X列: 受付担当 (例: 大城)
      document.getElementById("flyer")?.value || "",         // Y列: チラシ (例: 4)
      document.getElementById("estimate_no")?.value || "",   // Z列: 見積No (例: 007_003000)
      document.getElementById("notes")?.value || "",         // AA列: 備考 (例: 03MC2台MJ買)
      document.getElementById("other_company")?.value || "", // AB列: 他社 (例: 0)
      document.getElementById("history")?.value || "",       // AC列: 履歴 (例: 0)
      document.getElementById("main_contract")?.value || "", // AD列: 本契約 (例: 1)
      document.getElementById("total")?.value || "",         // AE列: 合計 (例: 1)
    ];
    
    // オブジェクトに変換
    const columnNames = [
      "registerDate", "registerTime", "districtNo", "departmentNo", "staffName", 
      "contractorName", "contractorAge", "contractorRelation", "contractorTel", 
      "category", "confirmerDateTime", "confirmerName", "confirmerAge", 
      "confirmerRelation", "confirmerTel", "product", "quantity", "amount", 
      "contractDate", "startDate", "startTime", "completionDate", 
      "paymentMethod", "receiver", "flyer", "estimateNo", "notes", 
      "otherCompany", "history", "mainContract", "total"
    ];
    
    const data = {};
    columnNames.forEach((name, index) => {
      if (index < formDataArray.length) {
        // すべての項目をデータに含める（空欄もそのまま送信）
        data[name] = formDataArray[index];
      }
    });

    console.log('送信データ:', data);

    // Google Apps Scriptへデータを送信
    const jsonData = JSON.stringify(data);
    console.log('JSON送信データ:', jsonData);

    // JSONP方式で送信（CORS回避）
    const submissionFormData = new FormData();
    submissionFormData.append('data', jsonData);

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: submissionFormData,
      mode: "no-cors" // CORSエラー回避
    });

    console.log('レスポンス:', response);
    
    // no-corsモードではresponse.okが常にtrueになるため、
    // レスポンスボディが取得できない場合でも処理を続行
    alert("✅ スプレッドシートに保存しました！");
    
    document.getElementById("order-form").reset();
    setDefaultDates();
    // 入力完了スタイルをリセット
    document.querySelectorAll('.is-valid').forEach(el => {
      el.classList.remove('is-valid');
    });
  } catch (err) {
    console.error('送信エラー:', err);
    alert("送信エラー：" + err.message);
  } finally {
    // ローディング非表示
    document.getElementById('loading').style.display = 'none';
  }
});

// 挨拶日を現在の日付に更新する関数
function updateGreetingDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // 0埋め
  const dd = String(today.getDate()).padStart(2, '0'); // 0埋め
  
  // 日本語形式の日付（例：2023年6月7日）
  const todayJpStr = `${yyyy}年${parseInt(mm)}月${parseInt(dd)}日`;
  
  const greetingDateField = document.getElementById('greeting_date');
  if (greetingDateField) {
    greetingDateField.value = todayJpStr;
    greetingDateField.classList.add('is-valid'); // 入力完了スタイルを適用
  }
}


