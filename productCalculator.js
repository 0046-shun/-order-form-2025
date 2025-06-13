// 商品計算モジュール
let selectedProducts = []; // 選択された商品のリスト
const TAX_RATE = 0.1; // 消費税率 10%
const MANAGEMENT_FEE = 20000; // 一般管理費 20,000円(税抜)
let includeManagementFee = true; // 一般管理費を含めるかどうかのフラグ（デフォルトはtrue）

// 商品データ（商品計算v.0のdata.jsを参照）
const productsData = {
  "消毒": {
    "再消毒": {
      "base": 70000,
      "price": 1500,
      "areaThreshold": 40,
      "unit": "㎡"
    },
    "新規予防消毒": {
      "base": 100000,
      "price": 2300,
      "areaThreshold": 40,
      "unit": "㎡"
    },
    "新規駆除消毒": {
      "base": 140000,
      "price": 3300,
      "areaThreshold": 40,
      "unit": "㎡"
    },
    "保証切予防": {
      "base": 88000,
      "price": 2000,
      "areaThreshold": 40,
      "unit": "㎡"
    },
    "増築予防消毒": {
      "base": 0,
      "price": 2100,
      "unit": "㎡"
    },
    "建前予防消毒": {
      "base": 84000,
      "price": 2100,
      "areaThreshold": 40,
      "unit": "㎡"
    },
    "ベイト新規": {
      "base": 300000,
      "price": 3600,
      "areaThreshold": 40,
      "unit": "㎡"
    },
    "ベイト継続": {
      "base": 220000,
      "price": 2000,
      "areaThreshold": 40,
      "unit": "㎡"
    },
    "カビ消毒": {
      "price": 2500,
      "unit": "㎡",
      "discountConditions": [
        { "type": "category", "value": "消毒" }
      ],
      "discount2Conditions": [
        { "type": "category", "value": "基礎" },
        { "type": "contains", "values": ["DC2", "60"] }
      ],
      "discountPrice": 1000,
      "discount2Price": 1700
    }
  },
  "床下機器": {
    "SO260新": {
      "base": 176000,
      "price": 92000,
      "unit": "台"
    },
    "SO260買": {
      "base": 165000,
      "price": 83000,
      "unit": "台"
    },
    "SO2(DC2)新": {
      "base": 77000,
      "price": 92000,
      "unit": "台"
    },
    "SO2(DC2)買": {
      "base": 77000,
      "price": 83000,
      "unit": "台"
    },
    "SO2新": {
      "base": 0,
      "price": 92000,
      "unit": "台"
    },
    "SO2買": {
      "base": 0,
      "price": 88000,
      "unit": "台"
    },
    "拡散2新": {
      "base": 0,
      "price": 66000,
      "unit": "台"
    },
    "拡散2買": {
      "base": 0,
      "price": 66000,
      "unit": "台"
    },
    "DC2": {
      "base": 0,
      "price": 77000,
      "unit": "台"
    },
    "MJ60新": {
      "base": 0,
      "price": 176000,
      "unit": "台"
    },
    "MJ60買": {
      "base": 0,
      "price": 165000,
      "unit": "台"
    }
  },
  "天井機器": {
    "天換260新": {
      "base": 176000,
      "price": 91500,
      "unit": "台"
    },
    "天換260買": {
      "base": 165000,
      "price": 83000,
      "unit": "台"
    },
    "天換(DC2)新": {
      "base": 77000,
      "price": 91500,
      "unit": "台"
    },
    "天換(DC2)買": {
      "base": 77000,
      "price": 83000,
      "unit": "台"
    },
    "天換新": {
      "base": 0,
      "price": 95000,
      "unit": "台"
    },
    "天拡2新": {
      "base": 0,
      "price": 88000,
      "unit": "台"
    },
    "天換買": {
      "base": 0,
      "price": 83000,
      "unit": "台"
    },
    "天拡2買": {
      "base": 0,
      "price": 83000,
      "unit": "台"
    },
    "DC2": {
      "base": 0,
      "price": 77000,
      "unit": "台"
    },
    "MJ60新": {
      "base": 0,
      "price": 176000,
      "unit": "台"
    },
    "MJ60買": {
      "base": 0,
      "price": 165000,
      "unit": "台"
    }
  },
  "断熱遮熱": {
    "床下断熱": {
      "base": 440000,
      "price": 6000,
      "areaThreshold": 33,
      "unit": "㎡"
    },
    "天井遮熱": {
      "base": 440000,
      "price": 7000,
      "areaThreshold": 33,
      "unit": "㎡"
    },
    "天井断熱": {
      "base": 310000,
      "price": 10000,
      "areaThreshold": 20,
      "unit": "㎡"
    },
    "廃棄物処理33平米まで": {
      "base": 50000,
      "price": 0,
      "unit": "式"
    },
    "廃棄物処理33平米以上": {
      "base": 65000,
      "price": 0,
      "unit": "式"
    }
  },
  "基礎関連": {
    "増し打ち": {
      "base": 350000,
      "price": 100000,
      "areaThreshold": 1,
      "unit": "箇所"
    },
    "表面補修": {
      "base": 60000,
      "price": 20000,
      "areaThreshold": 1,
      "unit": "箇所"
    },
    "アンカー": {
      "base": 70000,
      "price": 50000,
      "areaThreshold": 1,
      "unit": "箇所"
    }
  },
  "そのほか": {
    "カビ": {
      "price": 2500,
      "unit": "㎡",
      "discountConditions": [
        { "type": "category", "value": "消毒" }
      ],
      "discount2Conditions": [
        { "type": "category", "value": "基礎" },
        { "type": "contains", "values": ["DC2", "60"] }
      ],
      "discountPrice": 1000,
      "discount2Price": 1700
    },
    "BM": {
      "price": 3300,
        "unit": "枚",
      "discountConditions": [
        { "type": "category", "value": "消毒" },
        { "type": "category", "value": "基礎" },
        { "type": "item", "value": "SO2(DC2)新" },
        { "type": "item", "value": "SO260買" }, 
        { "type": "item", "value": "SO260新" }, 
        { "type": "item", "value": "SO2(DC2)買" } 
      ],
      "discountPrice": 2800
    },
    "家屋補強": {
      "base": 770000,
      "price": 5500,
      "areaThreshold": 100,
      "unit": "㎡"
    },
    "SS": {
      "price": 12000,
      "unit": "本"
    },
    "ドールマン": {
      "price": 350000,
      "unit": "式"
    },
    "排水管洗浄": {
      "base": 50000,
      "price": 6000,
      "areaThreshold": 5,
      "unit": "箇所"
    },
    "排水管洗浄オプション": {
      "price": 5000,
      "unit": "箇所"
    },
    "換気扇撤去": {
      "base": 40000,
      "price": 5000,
      "areaThreshold": 8,
      "unit": "式"
    },
    "島特1": {
      "price": 30000,
      "unit": "箇所"
    },
    "離島1・2": {
      "price": 20000,
      "unit": "箇所"
    },
    "離島3": {
      "price": 5000,
      "unit": "箇所"
    }
  }
};

// 基礎関連の商品データ
const kisoProductsData = {
  "新規工事": {
    "外基礎": {
      "高さ別価格": {
        "30": {
          "基本価格": 510000,
          "長さ加算": 6000
        },
        "40": {
          "基本価格": 540000,
          "長さ加算": 7000
        },
        "50": {
          "基本価格": 570000,
          "長さ加算": 8000
        },
        "60": {
          "基本価格": 600000,
          "長さ加算": 9000
        },
        "70": {
          "基本価格": 630000,
          "長さ加算": 10000
        },
        "80": {
          "基本価格": 660000,
          "長さ加算": 11000
        }
      },
      "基本長さ": 20,
      "unit": "m"
    },
    "中基礎": {
      "高さ別価格": {
        "30": {
          "基本価格": 450000,
          "長さ加算": 6000
        },
        "40": {
          "基本価格": 470000,
          "長さ加算": 7000
        },
        "50": {
          "基本価格": 490000,
          "長さ加算": 8000
        },
        "60": {
          "基本価格": 500000,
          "長さ加算": 9000
        },
        "70": {
          "基本価格": 510000,
          "長さ加算": 10000
        },
        "80": {
          "基本価格": 520000,
          "長さ加算": 11000
        }
      },
      "基本長さ": 10,
      "unit": "m"
    }
  },
  "追加工事": {
    "外基礎": {
      "高さ別価格": {
        "30": {
          "基本価格": 240000,
          "長さ加算": 6000
        },
        "40": {
          "基本価格": 270000,
          "長さ加算": 7000
        },
        "50": {
          "基本価格": 300000,
          "長さ加算": 8000
        },
        "60": {
          "基本価格": 330000,
          "長さ加算": 9000
        },
        "70": {
          "基本価格": 360000,
          "長さ加算": 10000
        },
        "80": {
          "基本価格": 390000,
          "長さ加算": 11000
        }
      },
      "基本長さ": 20,
      "unit": "m"
    },
    "中基礎": {
      "高さ別価格": {
        "30": {
          "基本価格": 240000,
          "長さ加算": 6000
        },
        "40": {
          "基本価格": 260000,
          "長さ加算": 7000
        },
        "50": {
          "基本価格": 280000,
          "長さ加算": 8000
        },
        "60": {
          "基本価格": 290000,
          "長さ加算": 9000
        },
        "70": {
          "基本価格": 300000,
          "長さ加算": 10000
        },
        "80": {
          "基本価格": 310000,
          "長さ加算": 11000
        }
      },
      "基本長さ": 10,
      "unit": "m"
    }
  },
  "クラック": {
    "外クラック": {
      "高さ別価格": {
        "30": {
          "基本価格": 10000,
          "長さ加算": 10000
        },
        "40": {
          "基本価格": 12000,
          "長さ加算": 12000
        },
        "50": {
          "基本価格": 14000,
          "長さ加算": 14000
        },
        "60": {
          "基本価格": 16000,
          "長さ加算": 16000
        },
        "70": {
          "基本価格": 18000,
          "長さ加算": 18000
        },
        "80": {
          "基本価格": 20000,
          "長さ加算": 20000
        }
      },
      "基本長さ": 1,
      "unit": "個"
    },
    "中片クラック": {
      "高さ別価格": {
        "30": {
          "基本価格": 15000,
          "長さ加算": 15000
        },
        "40": {
          "基本価格": 18000,
          "長さ加算": 18000
        },
        "50": {
          "基本価格": 21000,
          "長さ加算": 21000
        },
        "60": {
          "基本価格": 24000,
          "長さ加算": 24000
        },
        "70": {
          "基本価格": 27000,
          "長さ加算": 27000
        },
        "80": {
          "基本価格": 30000,
          "長さ加算": 30000
        }
      },
      "基本長さ": 1,
      "unit": "個"
    },
    "中両面クラック": {
      "高さ別価格": {
        "30": {
          "基本価格": 25000,
          "長さ加算": 25000
        },
        "40": {
          "基本価格": 31000,
          "長さ加算": 31000
        },
        "50": {
          "基本価格": 37000,
          "長さ加算": 37000
        },
        "60": {
          "基本価格": 43000,
          "長さ加算": 43000
        },
        "70": {
          "基本価格": 49000,
          "長さ加算": 49000
        },
        "80": {
          "基本価格": 55000,
          "長さ加算": 55000
        }
      },
      "基本長さ": 1,
      "unit": "個"
    }
  }
};

// 数値を通貨形式（3桁区切り）にフォーマットする関数
function formatCurrency(value) {
  return value.toLocaleString() + '円';
}

// 割引計算用関数
function calculateDiscount(price, discountValue) {
  if (discountValue <= 0) return 0;
  
  if (discountValue < 100) {
    // パーセント割引
    return Math.floor(price * (discountValue / 100));
  } else {
    // 金額割引
    return discountValue > price ? price : discountValue;
  }
}

// 基礎セット割引をチェック（外基礎と中基礎を両方選択している場合）
function checkKisoSetDiscount(products) {
  let hasExternalKiso = false;
  let hasInternalKiso = false;
  
  products.forEach(product => {
    if (product.category === "新規工事" || product.category === "追加工事") {
      if (product.item && product.item.includes("外基礎")) {
        hasExternalKiso = true;
      }
      if (product.item && product.item.includes("中基礎")) {
        hasInternalKiso = true;
      }
    }
  });
  
  return hasExternalKiso && hasInternalKiso;
}

// カビ処理の価格計算
function calculateKabiPrice(quantity, selectedProducts) {
  // カビ処理のデータを取得
  const kabiData = productsData["そのほか"]["カビ"] || productsData["消毒"]["カビ消毒"];
  if (!kabiData) return 0;
  
  let appliedPrice = kabiData.price; // 基本価格 2,500円/坪
  
  // 消毒系統との同時選択をチェック
  const hasDisinfection = selectedProducts.some(product => {
    return product.category === "消毒" && product.item !== "カビ消毒";
  });
  
  // 特殊条件（DC2や60を含む商品）との同時選択をチェック
  const hasSpecialProducts = selectedProducts.some(product => {
    return product.item && (product.item.includes("DC2") || product.item.includes("60"));
  });
  
  if (hasDisinfection) {
    appliedPrice = kabiData.discountPrice; // 1,000円/坪
  } else if (hasSpecialProducts) {
    appliedPrice = kabiData.discount2Price; // 1,700円/坪
  }
  
  return appliedPrice * quantity;
}

// BM処理の価格計算
function calculateBMPrice(quantity, selectedProducts) {
  const bmData = productsData["そのほか"]["BM"];
  if (!bmData) return 0;
  
  let appliedPrice = bmData.price; // 基本価格 3,300円/坪
  
  // 割引条件をチェック
  const hasDiscountCondition = selectedProducts.some(product => {
    // カテゴリによる判定
    if (bmData.discountConditions.some(condition => 
      condition.type === "category" && condition.value === product.category)) {
      return true;
    }
    // 商品名による判定
    if (bmData.discountConditions.some(condition => 
      condition.type === "item" && condition.value === product.item)) {
      return true;
    }
    return false;
  });
  
  if (hasDiscountCondition) {
    appliedPrice = bmData.discountPrice; // 割引価格 2,800円/坪
  }
  
  return appliedPrice * quantity;
}

// 基礎工事の価格計算
function calculateKisoPrice(category, item, height, length) {
  if (!kisoProductsData[category] || !kisoProductsData[category][item]) {
    return 0;
  }

  const kisoData = kisoProductsData[category][item];
  const heightPrices = kisoData["高さ別価格"][height];
  if (!heightPrices) return 0;

  const basicLength = kisoData["基本長さ"] || 0;
  let basePrice = heightPrices["基本価格"];

  if (length > basicLength) {
    const extraLength = length - basicLength;
    basePrice += extraLength * heightPrices["長さ加算"];
  }

  // 基礎セット割引の適用
  if ((category === "新規工事" || category === "追加工事") && 
      (item === "外基礎" || item === "中基礎") && 
      checkKisoSetDiscount(selectedProducts)) {
    basePrice -= 20000; // セット割引
  }

  return basePrice;
}

// 商品の価格を計算する関数
function calculatePrice(category, item, quantity, options = [], additionalParams = {}) {
  let basePrice = 0;
  let optionPrice = 0;
  let totalPrice = 0;
  let kisoDetails = null;
  
  // 基礎関連の価格計算
  if (kisoProductsData[category] && kisoProductsData[category][item]) {
    const { height, length, discount } = additionalParams;
    if (!height || !length) return { unitPrice: 0, totalPrice: 0 };
    
    basePrice = calculateKisoPrice(category, item, height, length);
    
    // 割引の適用
    if (discount > 0) {
      const discountAmount = calculateDiscount(basePrice, discount);
      basePrice -= discountAmount;
    }
    
    kisoDetails = {
      height: height,
      length: length,
      unit: kisoProductsData[category][item].unit || "m"
    };
    
    totalPrice = basePrice;
  }
  // 特殊商品の価格計算（カビ、BM）
  else if (category === "そのほか" && item === "カビ" || category === "消毒" && item === "カビ消毒") {
    basePrice = calculateKabiPrice(quantity, selectedProducts);
    totalPrice = basePrice;
  }
  else if (category === "そのほか" && item === "BM") {
    basePrice = calculateBMPrice(quantity, selectedProducts);
    totalPrice = basePrice;
  }
  // 通常商品の価格計算
  else if (productsData[category] && productsData[category][item]) {
    const productData = productsData[category][item];
    basePrice = productData.base || 0;
    
    // 数量に応じた価格計算
    if (productData.areaThreshold && quantity > productData.areaThreshold) {
      // 閾値を超える部分は単価×超過量
      const extraQuantity = quantity - productData.areaThreshold;
      basePrice += extraQuantity * productData.price;
    } else if (!productData.areaThreshold && productData.price > 0) {
      // 閾値がない場合は基本価格 + (単価×数量)
      basePrice = productData.base + (productData.price * quantity);
    }
    
    // オプション価格を加算
    options.forEach(option => {
      if (option.selected && productsData["オプション"] && productsData["オプション"][option.name]) {
        const optionData = productsData["オプション"][option.name];
        optionPrice += optionData.price * quantity;
      }
    });
    
    // 割引の適用
    if (additionalParams.discount > 0) {
      const discountAmount = calculateDiscount(basePrice, additionalParams.discount);
      basePrice -= discountAmount;
    }
    
    totalPrice = basePrice + optionPrice;
  }
  
  // 消費税計算（管理費は個別商品に含めない）
  const taxAmount = Math.floor(totalPrice * TAX_RATE);
  const totalWithTax = totalPrice + taxAmount;
  
  return {
    unitPrice: basePrice,
    optionPrice: optionPrice,
    subtotal: totalPrice,           // 商品の小計（税抜）
    tax: taxAmount,
    total: totalWithTax,
    kisoDetails: kisoDetails
  };
}

// カテゴリーのセレクトボックスを初期化する関数
function initCategorySelect() {
  const categorySelect = document.getElementById('modalCategory');
  categorySelect.innerHTML = '<option value="">カテゴリを選択してください</option>';
  
  // 通常商品カテゴリ
  Object.keys(productsData).forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
  
  // 基礎関連カテゴリを追加
  Object.keys(kisoProductsData).forEach(category => {
    const option = document.createElement('option');
    option.value = `kiso-${category}`;
    option.textContent = `基礎：${category}`;
    categorySelect.appendChild(option);
  });
}

// 商品のセレクトボックスを更新する関数
function updateProductSelect(category) {
  const productSelect = document.getElementById('modalProduct');
  productSelect.innerHTML = '<option value="">商品を選択してください</option>';
  
  // 基礎関連商品
  if (category && category.startsWith('kiso-')) {
    const kisoCategory = category.replace('kiso-', '');
    if (kisoProductsData[kisoCategory]) {
      Object.keys(kisoProductsData[kisoCategory]).forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        productSelect.appendChild(option);
      });
    }
    
    // 基礎関連商品選択時の特殊入力フィールドを表示
    showKisoInputFields(true);
  } 
  // 通常商品
  else if (category && productsData[category]) {
    Object.keys(productsData[category]).forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      productSelect.appendChild(option);
    });
    
    // 通常商品選択時は基礎入力フィールドを非表示
    showKisoInputFields(false);
  }

  // オプション表示の更新
  updateOptionsDisplay(category);
}

// 基礎関連の入力フィールド表示/非表示を切り替え
function showKisoInputFields(show) {
  const kisoFieldsContainer = document.getElementById('kisoFields');
  const quantityContainer = document.getElementById('quantityFields');
  
  if (kisoFieldsContainer && quantityContainer) {
    kisoFieldsContainer.style.display = show ? 'block' : 'none';
    quantityContainer.style.display = show ? 'none' : 'block';
  }
  
  // 初期高さ選択肢をセット
  if (show) {
    const heightSelect = document.getElementById('modalHeight');
    if (heightSelect) {
      heightSelect.innerHTML = '';
      ['30', '40', '50', '60', '70', '80'].forEach(height => {
        const option = document.createElement('option');
        option.value = height;
        option.textContent = `${height}cm`;
        heightSelect.appendChild(option);
      });
    }
  }
}

// 選択されたカテゴリに基づいてオプション表示を更新
function updateOptionsDisplay(category) {
  const optionsContainer = document.getElementById('modalOptions');
  optionsContainer.innerHTML = '';
  
  // シロアリ関連のオプションを表示
  if (category === "消毒" || category === "シロアリ防除") {
    const options = ['防カビ処理', '強化施工', '基礎保証'];
    options.forEach(optionName => {
      if (productsData["オプション"] && productsData["オプション"][optionName]) {
        const optionData = productsData["オプション"][optionName];
        const optionDiv = document.createElement('div');
        optionDiv.className = 'form-check mb-2';
        optionDiv.innerHTML = `
          <input class="form-check-input" type="checkbox" id="option_${optionName.replace(/\s/g, '_')}" data-option="${optionName}">
          <label class="form-check-label" for="option_${optionName.replace(/\s/g, '_')}">
            ${optionName} (+${optionData.price.toLocaleString()}円/${optionData.unit || '坪'})
          </label>
        `;
        optionsContainer.appendChild(optionDiv);
        
        // オプションの変更イベントリスナーを追加
        const checkbox = optionDiv.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', updateCalculation);
      }
    });
  }
}

// 計算を更新する関数
function updateCalculation() {
  const categoryValue = document.getElementById('modalCategory').value;
  const item = document.getElementById('modalProduct').value;
  
  // 基礎関連かどうかチェック
  const isKiso = categoryValue.startsWith('kiso-');
  const category = isKiso ? categoryValue.replace('kiso-', '') : categoryValue;
  
  if (!category || !item) {
    resetCalculationDisplay();
    return;
  }
  
  let additionalParams = {
    discount: parseFloat(document.getElementById('modalDiscount').value) || 0
  };
  
  let quantity = 0;
  let priceData = null;
  
  // 基礎関連商品の計算
  if (isKiso) {
    const height = document.getElementById('modalHeight').value;
    const length = parseFloat(document.getElementById('modalLength').value) || 0;
    
    if (!height || length <= 0) {
      resetCalculationDisplay();
      return;
    }
    
    additionalParams.height = height;
    additionalParams.length = length;
    
    priceData = calculatePrice(category, item, 1, [], additionalParams);
  } 
  // 通常商品の計算
  else {
    quantity = parseFloat(document.getElementById('modalQty').value) || 0;
    
    if (quantity <= 0) {
      resetCalculationDisplay();
      return;
    }
    
    // 選択されたオプションを取得
    const options = [];
    document.querySelectorAll('#modalOptions input[type="checkbox"]').forEach(checkbox => {
      options.push({
        name: checkbox.dataset.option,
        selected: checkbox.checked
      });
    });
    
    priceData = calculatePrice(category, item, quantity, options, additionalParams);
  }
  
  // 計算結果を表示
  updateCalculationDisplay(priceData);
  
  // 単位表示の更新
  updateUnitDisplay(category, item, isKiso);
}

// 計算表示をリセット
function resetCalculationDisplay() {
  document.getElementById('unitPrice').textContent = '0円';
  document.getElementById('optionPrice').textContent = '0円';
  document.getElementById('subtotalPrice').textContent = '0円';
  document.getElementById('taxAmount').textContent = '0円';
  document.getElementById('totalPrice').textContent = '0円';
}

// 計算結果表示を更新
function updateCalculationDisplay(priceData) {
  if (!priceData) {
    resetCalculationDisplay();
    return;
  }
  
  document.getElementById('unitPrice').textContent = formatCurrency(priceData.unitPrice);
  document.getElementById('optionPrice').textContent = formatCurrency(priceData.optionPrice);
  document.getElementById('subtotalPrice').textContent = formatCurrency(priceData.subtotal);
  document.getElementById('taxAmount').textContent = formatCurrency(priceData.tax);
  document.getElementById('totalPrice').textContent = formatCurrency(priceData.total);
}

// 単位表示の更新
function updateUnitDisplay(category, item, isKiso) {
  if (isKiso) {
    const kisoData = kisoProductsData[category][item];
    if (kisoData) {
      document.getElementById('lengthUnit').textContent = kisoData.unit || 'm';
    }
  } else {
    const productData = productsData[category][item];
    if (productData) {
      document.getElementById('qtyUnit').textContent = productData.unit || '坪';
    }
  }
}

// 商品情報を確定する関数
function confirmProduct() {
  const categoryValue = document.getElementById('modalCategory').value;
  const item = document.getElementById('modalProduct').value;
  
  // 基礎関連かどうかチェック
  const isKiso = categoryValue.startsWith('kiso-');
  const category = isKiso ? categoryValue.replace('kiso-', '') : categoryValue;
  
  if (!category || !item) {
    alert('カテゴリと商品を選択してください。');
    return;
  }
  
  let additionalParams = {
    discount: parseFloat(document.getElementById('modalDiscount').value) || 0
  };
  
  let productInfo = {
    category: category,
    item: item,
    isKiso: isKiso,
    options: [],
    discount: additionalParams.discount
  };
  
  // 基礎関連商品の情報
  if (isKiso) {
    const height = document.getElementById('modalHeight').value;
    const length = parseFloat(document.getElementById('modalLength').value) || 0;
    
    if (!height || length <= 0) {
      alert('高さと長さを正しく入力してください。');
      return;
    }
    
    productInfo.height = height;
    productInfo.length = length;
    productInfo.quantity = 1;
    
    additionalParams.height = height;
    additionalParams.length = length;
    
    const priceData = calculatePrice(category, item, 1, [], additionalParams);
    Object.assign(productInfo, priceData);
    
    // 表示用の商品名を設定
    if (category === "新規工事") {
      // 新規工事の場合（例: 外基礎）
      productInfo.displayName = `外基礎`;
      // 表示用の詳細情報（例: 30*20m）
      productInfo.detailInfo = `${height}*${length}m`;
    } else if (category === "追加工事") {
      // 追加工事の場合（例: 中基礎追加）
      productInfo.displayName = `中基礎追加`;
      // 表示用の詳細情報（例: 30*10m）
      productInfo.detailInfo = `${height}*${length}m`;
    } else if (category === "クラック工事") {
      // クラック工事の場合
      productInfo.displayName = `${item}`;
      // 表示用の詳細情報
      productInfo.detailInfo = `${height}*${length}m`;
    } else {
      // その他の基礎工事の場合（従来の形式を維持）
      productInfo.displayName = `${item} ${height}cm ${length}${kisoProductsData[category][item].unit || 'm'}`;
      productInfo.detailInfo = `${category}`;
    }
  } 
  // 通常商品の情報
  else {
    const quantity = parseFloat(document.getElementById('modalQty').value) || 0;
    
    if (quantity <= 0) {
      alert('数量を正しく入力してください。');
      return;
    }
    
    productInfo.quantity = quantity;
    
    // 選択されたオプションを取得
    const selectedOptions = [];
    document.querySelectorAll('#modalOptions input[type="checkbox"]:checked').forEach(checkbox => {
      selectedOptions.push(checkbox.dataset.option);
    });
    
    productInfo.options = selectedOptions.map(option => ({ name: option, selected: true }));
    
    const priceData = calculatePrice(
      category, 
      item, 
      quantity, 
      productInfo.options, 
      additionalParams
    );
    
    Object.assign(productInfo, priceData);
    
    // 表示用の商品名を設定（オプション付き）
    productInfo.displayName = item + (selectedOptions.length > 0 ? `（${selectedOptions.join('・')}）` : '');
    productInfo.detailInfo = `${category}`;
  }
  
  // 商品IDを設定（重複しないように現在時刻をつける）
  productInfo.id = Date.now().toString();
  
  // 選択済み商品リストに追加
  selectedProducts.push(productInfo);
  
  // サマリーリストを更新
  updateSummaryList();
  
  // 入力がないことを示すため初期化
  document.getElementById('modalCategory').selectedIndex = 0;
  document.getElementById('modalProduct').innerHTML = '<option value="">商品を選択してください</option>';
  document.getElementById('modalQty').value = '1';
  document.getElementById('modalHeight').selectedIndex = 0;
  document.getElementById('modalLength').value = '0';
  document.getElementById('modalDiscount').value = '0';
  document.getElementById('modalOptions').innerHTML = '';
  
  resetCalculationDisplay();
  showKisoInputFields(false);
}

// 選択された商品を削除
function removeProduct(productId) {
  const index = selectedProducts.findIndex(p => p.id === productId);
  if (index !== -1) {
    selectedProducts.splice(index, 1);
    updateSummaryList();
    updateTotalAmounts();
  }
}

// 商品情報をサマリーリストに追加する関数
function updateSummaryList() {
  const summaryList = document.getElementById('summary-list');
  if (!summaryList) return;
  
  // 既存のリストをクリア
  summaryList.innerHTML = '';
  
  if (selectedProducts.length === 0) {
    const emptyNotice = document.createElement('li');
    emptyNotice.className = 'list-group-item text-center text-muted';
    emptyNotice.textContent = '商品が選択されていません';
    summaryList.appendChild(emptyNotice);
    return;
  }
  
  // 基礎セット割引の通知
  if (checkKisoSetDiscount(selectedProducts)) {
    const setDiscountNotice = document.createElement('li');
    setDiscountNotice.className = 'list-group-item text-success';
    setDiscountNotice.innerHTML = '<i class="bi bi-tag-fill"></i> 外基礎・中基礎セット割引 40,000円 適用中';
    summaryList.appendChild(setDiscountNotice);
  }
  
  // 各商品の項目を作成
  selectedProducts.forEach(productInfo => {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.dataset.productId = productInfo.id;
    
    // 商品名と詳細情報
    const productDetails = document.createElement('div');
    productDetails.className = 'ms-2 me-auto';
    
    const productName = document.createElement('div');
    productName.className = 'fw-bold';
    productName.textContent = productInfo.displayName || productInfo.item;
    
    const productDetails2 = document.createElement('div');
    productDetails2.className = 'small';
    
    if (productInfo.isKiso) {
      // 基礎商品の場合は、詳細情報を表示
      productDetails2.textContent = productInfo.detailInfo || "";
      
      // 商品情報を適切に表示
      productDetails.appendChild(productName);
      productDetails.appendChild(productDetails2);
    } else {
      const unit = productsData[productInfo.category][productInfo.item].unit || '坪';
      productDetails2.textContent = `${productInfo.quantity}${unit}`;
      
      // オプション情報
      if (productInfo.options && productInfo.options.length > 0) {
        const optionsText = document.createElement('div');
        optionsText.className = 'small text-muted';
        optionsText.textContent = `オプション: ${productInfo.options.map(o => o.name).join('・')}`;
        productDetails.appendChild(productName);
        productDetails.appendChild(productDetails2);
        productDetails.appendChild(optionsText);
      } else {
        productDetails.appendChild(productName);
        productDetails.appendChild(productDetails2);
      }
    }
    
    // 割引情報があれば表示
    if (productInfo.discount > 0) {
      const discountText = document.createElement('div');
      discountText.className = 'small text-danger';
      discountText.textContent = `割引: ${productInfo.discount < 100 ? productInfo.discount + '%' : formatCurrency(productInfo.discount)}`;
      productDetails.appendChild(discountText);
    }
    
    // 価格情報（税抜き表示）
    const priceSpan = document.createElement('span');
    priceSpan.className = 'badge bg-primary rounded-pill';
    priceSpan.textContent = formatCurrency(productInfo.subtotal); // 税抜き価格を表示
    
    // 削除ボタン
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger ms-2';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.onclick = function() {
      removeProduct(productInfo.id);
    };
    
    // 項目を組み合わせてリストに追加
    listItem.appendChild(productDetails);
    listItem.appendChild(priceSpan);
    listItem.appendChild(deleteBtn);
    summaryList.appendChild(listItem);
  });
  
  // 合計金額の表示を更新
  updateTotalAmounts();
}

// 合計金額表示を更新
function updateTotalAmounts() {
  if (selectedProducts.length === 0) {
    // メインフォームの入力欄に反映（空に）
    document.getElementById('product').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('total').value = '';
    
    // スタイルをリセット
    document.getElementById('product').classList.remove('is-valid');
    document.getElementById('quantity').classList.remove('is-valid');
    document.getElementById('amount').classList.remove('is-valid');
    document.getElementById('total').classList.remove('is-valid');
    return;
  }
  
  // 合計金額の計算
  const subtotal = selectedProducts.reduce((sum, p) => sum + p.subtotal, 0);
  
  // 一般管理費を適用（1契約につき1回）
  const managementFee = includeManagementFee ? MANAGEMENT_FEE : 0;
  
  // 管理費込みの小計（税抜）
  const subtotalWithFee = subtotal + managementFee;
  
  // 消費税計算
  const tax = Math.floor(subtotalWithFee * TAX_RATE);
  const total = subtotalWithFee + tax;
  
  // 合計表示の更新
  const totalDisplay = document.getElementById('calculationTotal');
  if (totalDisplay) {
    totalDisplay.innerHTML = `
      <div class="row mb-3">
        <div class="col-md-12">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="totalManagementFeeSwitch" ${includeManagementFee ? 'checked' : ''}>
            <label class="form-check-label" for="totalManagementFeeSwitch">一般管理費を含める（20,000円）</label>
          </div>
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-md-6">商品小計（税抜）：</div>
        <div class="col-md-6 text-end">${formatCurrency(subtotal)}</div>
      </div>
      <div class="row mb-2">
        <div class="col-md-6">一般管理費：</div>
        <div class="col-md-6 text-end">${formatCurrency(managementFee)}</div>
      </div>
      <div class="row mb-2">
        <div class="col-md-6">合計（税抜）：</div>
        <div class="col-md-6 text-end">${formatCurrency(subtotalWithFee)}</div>
      </div>
      <div class="row mb-2">
        <div class="col-md-6">消費税（10%）：</div>
        <div class="col-md-6 text-end">${formatCurrency(tax)}</div>
      </div>
      <div class="row mb-2 fw-bold">
        <div class="col-md-6">合計（税込）：</div>
        <div class="col-md-6 text-end">${formatCurrency(total)}</div>
      </div>
    `;
    
    // 一般管理費スイッチのイベントリスナー
    document.getElementById('totalManagementFeeSwitch').addEventListener('change', function() {
      includeManagementFee = this.checked;
      updateTotalAmounts();
    });
  }
  
  // メインフォームの入力欄に反映（税抜き金額に変更）
  let productNames = selectedProducts.map(p => {
    let name = p.displayName || p.item;
    
    // 値引きがある場合はそれを商品名に追加
    if (p.discount > 0) {
      if (p.discount < 100) {
        // パーセント割引の場合
        name += `▲${p.discount}％`;
      } else {
        // 円割引の場合
        name += `▲${p.discount}円`;
      }
    }
    
    return name;
  }).join('・');
  
  // 管理費有りの場合は商品名の末尾に「・管有」を追加
  if (includeManagementFee) {
    productNames += '・管有';
  }
  
  // 複数商品の数量を「/」区切りで設定
  let quantities = selectedProducts.map(p => {
    // 基礎商品の場合は詳細情報（例: 30*20m）を数量として使用
    if (p.isKiso && p.detailInfo) {
      return p.detailInfo;
    }
    return p.quantity;
  }).join('/');
  
  document.getElementById('product').value = productNames;
  document.getElementById('quantity').value = quantities; // 各商品の数量を「/」区切りで
  document.getElementById('amount').value = subtotalWithFee; // 税抜き合計金額（管理費込み）
  document.getElementById('total').value = total; // 税込み合計
  
  // 入力完了スタイルを適用
  document.getElementById('product').classList.add('is-valid');
  document.getElementById('quantity').classList.add('is-valid');
  document.getElementById('amount').classList.add('is-valid');
  document.getElementById('total').classList.add('is-valid');
  
  // form.jsから担当者情報を取得して設定
  if (window.selectedStaff) {
    // 担当者情報が選択されていれば、その情報をフォームに反映
    const staffInfo = window.selectedStaff;
    
    // フォーム内の担当者情報フィールドに値を設定
    if (!document.getElementById('staff_name').value) {
      document.getElementById('staff_name').value = staffInfo.lastName || ''; // 苗字を使用
      document.getElementById('district_no').value = staffInfo.districtNo || '';
      document.getElementById('department_no').value = staffInfo.departmentNo || '';
      document.getElementById('department_name').value = staffInfo.departmentName || '';
      
      // 入力完了スタイルを適用
      document.getElementById('staff_name').classList.add('is-valid');
      document.getElementById('district_no').classList.add('is-valid');
      document.getElementById('department_no').classList.add('is-valid');
      document.getElementById('department_name').classList.add('is-valid');
      
      console.log('Transferred staff info from modal to form:', staffInfo);
    } else {
      console.log('Staff info already exists in form, not overwriting');
    }
  } else {
    console.log('No selectedStaff information available');
  }
}

// 初期化関数
function initProductCalculator() {
  // カテゴリ選択の初期化
  initCategorySelect();
  
  // イベントリスナーの設定
  document.getElementById('modalCategory').addEventListener('change', function() {
    updateProductSelect(this.value);
    updateCalculation();
  });
  
  document.getElementById('modalProduct').addEventListener('change', updateCalculation);
  document.getElementById('modalQty').addEventListener('input', updateCalculation);
  document.getElementById('modalHeight').addEventListener('change', updateCalculation);
  document.getElementById('modalLength').addEventListener('input', updateCalculation);
  document.getElementById('modalDiscount').addEventListener('input', updateCalculation);
  
  // 追加ボタンのイベントリスナー
  document.getElementById('addProductBtn').addEventListener('click', confirmProduct);
  
  // 決定ボタンのイベントリスナー
  document.getElementById('confirmProductBtn').addEventListener('click', function() {
    // 担当者情報がフォームにあれば、それを保存しておく
    const staffName = document.getElementById('staff_name').value;
    const districtNo = document.getElementById('district_no').value;
    const departmentNo = document.getElementById('department_no').value;
    const departmentName = document.getElementById('department_name').value;
    
    // 担当者情報が既に入力されている場合は、それをグローバル変数に保存
    if (staffName && districtNo && departmentNo && departmentName) {
      window.selectedStaff = {
        districtNo: districtNo,
        departmentNo: departmentNo,
        departmentName: departmentName,
        lastName: staffName, // 苗字を保存
        fullName: staffName // フルネームがない場合は苗字として扱う
      };
      
      console.log('Stored staff info on confirm button click:', window.selectedStaff);
    }
    
    const modalEl = document.getElementById('productModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
      modal.hide();
    }
  });
  
  // モーダルを初期化
  resetCalculationDisplay();
  showKisoInputFields(false);
}

// DOMが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', function() {
  // 商品選択モーダルが表示されたときに初期化
  const productModal = document.getElementById('productModal');
  if (productModal) {
    productModal.addEventListener('shown.bs.modal', function() {
      // 担当者情報を保存（商品選択モーダルでの利用のため）
      const staffName = document.getElementById('staff_name').value;
      const districtNo = document.getElementById('district_no').value;
      const departmentNo = document.getElementById('department_no').value;
      const departmentName = document.getElementById('department_name').value;
      
      // 担当者情報がある場合は、それをグローバル変数に保存
      if (staffName && districtNo && departmentNo && departmentName) {
        if (!window.selectedStaff) {
          window.selectedStaff = {};
        }
        window.selectedStaff.districtNo = districtNo;
        window.selectedStaff.departmentNo = departmentNo;
        window.selectedStaff.departmentName = departmentName;
        window.selectedStaff.lastName = staffName; // 苗字として保存
        window.selectedStaff.fullName = staffName; // 全体の名前が不明なので苗字と同じものを使用
        
        console.log('Stored staff info when modal shown:', window.selectedStaff);
      }
      
      // すでに選択されている商品があれば表示
      updateSummaryList();
      
      // 初期化
      initProductCalculator();
    });
  }
});