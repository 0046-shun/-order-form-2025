// グローバル変数と基本的なユーティリティ関数
let selectedProducts = [];

// 金額を3桁区切りにする関数
function formatNumber(num) {
    if (Number.isInteger(num)) {
        return num.toLocaleString();
    } else {
        return num.toLocaleString(undefined, { 
            minimumFractionDigits: 1, 
            maximumFractionDigits: 1 
        });
    }
}

// カビの価格を計算する関数
function calculateKabiPrice(quantity, selectedProducts) {
    // カビまたはカビ消毒のデータを取得
    const kabiData = productsData["そのほか"]["カビ"];  // データ構造は同じなので、どちらを参照しても良い
    let appliedPrice = kabiData.price;

    for (const product of selectedProducts) {
        if (product.category === "消毒") {
            appliedPrice = kabiData.discountPrice;
            break;
        }

        if (product.category === "床下機器" && 
            (product.item.includes("DC2") || product.item.includes("60"))) {
            appliedPrice = kabiData.discount2Price;
            break;
        }
    }

    return appliedPrice * quantity;
}


// 基礎セット値引きをチェックする関数
function checkKisoSetDiscount(selectedProducts) {
    const hasGaiKiso = selectedProducts.some(p => 
        p.category === "新規工事" && p.item.includes("外基礎"));
    const hasNakaKiso = selectedProducts.some(p => 
        p.category === "新規工事" && p.item.includes("中基礎"));
    
    return hasGaiKiso && hasNakaKiso;
}

// 入力ラベルを更新する関数
function updateInputLabel(category, item, lengthElement) {
    if (category === "クラック") {
        const label = lengthElement.previousElementSibling;
        if (label) {
            label.textContent = "数量(個):";
        }
        lengthElement.placeholder = "個数を入力";
        lengthElement.title = "クラックの個数を入力してください";
    } else {
        const label = lengthElement.previousElementSibling;
        if (label) {
            label.textContent = "長さ(m):";
        }
        lengthElement.placeholder = "";
        lengthElement.title = "";
    }
}

// カテゴリの選択肢を生成する関数
function populateCategories(products, selectElementId) {
    const selectElement = document.getElementById(selectElementId);
    const currentValue = selectElement.value; // 現在の選択値を保存
    
    selectElement.innerHTML = '<option value="">項目選択</option>';

    const categories = Object.keys(products);
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        selectElement.appendChild(option);
    });

    // 以前の選択値があれば復元
    if (currentValue) {
        selectElement.value = currentValue;
    }
}


// サブカテゴリの選択肢を更新する関数
function updateSubCategory(products, mainCategoryId, subCategoryId) {
    const mainCategory = document.getElementById(mainCategoryId).value;
    const subCategory = document.getElementById(subCategoryId);
    
    subCategory.innerHTML = '<option value="">項目を選択してください</option>';

    if (mainCategory && products[mainCategory]) {
        const subOptions = Object.keys(products[mainCategory]);
        subOptions.forEach(option => {
            const newOption = document.createElement('option');
            newOption.value = option;
            newOption.textContent = option;
            subCategory.appendChild(newOption);
        });
    }
}

// 次の商品フォームを表示する関数
function showNextProduct(currentProductNum, productType = 'product') {
    const prefix = productType === 'product' ? '' : 'kiso-';
    const nextProduct = document.getElementById(`${prefix}product${currentProductNum + 1}`);
    if (nextProduct) {
        nextProduct.style.display = 'block';
    }
}

// 値引き計算を行う関数
function calculateDiscount(price, discountValue) {
    if (!discountValue || discountValue <= 0) return 0;
    
    if (discountValue < 100) {
        return Math.floor(price * (discountValue / 100));
    }
    return Math.min(discountValue, price);
}

function calculateProduct(productId, productType = 'product') {
    try {
        const productNum = parseInt(productId.replace(/[^0-9]/g, ''));
        const prefix = productType === 'product' ? '' : 'kiso-';
        
        const goodsElement = document.getElementById(prefix + 'goods' + productNum);
        const listElement = document.getElementById((productType === 'product' ? 'list' : 'kiso-list') + productNum);
        
        if (!goodsElement || !listElement) {
            console.log('Required elements not found:', productId);
            return;
        }

        const category = goodsElement.value;
        const item = listElement.value;

        let priceExTax = 0;
        let priceInTax = 0;
        let kisoName = "";

        if (productType === 'kiso-product') {
            const heightElement = document.getElementById(`kiso-height${productNum}`);
            const lengthElement = document.getElementById(`kiso-length${productNum}`);
            const discountElement = document.getElementById(`kiso-discount_value${productNum}`);

            if (!heightElement || !lengthElement || !discountElement) {
                console.log('Required kiso elements not found:', productNum);
                return;
            }

            const height = heightElement.value;
            const length = parseFloat(lengthElement.value) || 0;
            const discountValue = parseFloat(discountElement.value) || 0;

            if (category && item && kisoProductsData[category] && kisoProductsData[category][item]) {
                const productData = kisoProductsData[category][item];
                if (productData && productData["高さ別価格"] && productData["高さ別価格"][height]) {
                    const heightData = productData["高さ別価格"][height];
                    let basePrice = heightData["基本価格"];
                    let lengthPrice = heightData["長さ加算"];

                    if (category === "クラック") {
                        // クラックの場合は長さを数量として扱う
                        basePrice = lengthPrice * length;
                    } else {
                        // 通常の基礎商品の場合
                        const basicLength = productData["基本長さ"] || 20;
                        if (length > basicLength) {
                            const extraLength = length - basicLength;
                            basePrice += extraLength * lengthPrice;
                        }
                    }

                    const discount = calculateDiscount(basePrice, discountValue);
                    priceExTax = basePrice - discount;

                    if (category === "新規工事" && (item.includes("外基礎") || item.includes("中基礎"))) {
                        if (checkKisoSetDiscount(selectedProducts)) {
                            priceExTax -= 20000;
                        }
                    }

                    priceInTax = Math.floor(priceExTax * 1.1);
                    kisoName = category === "クラック" 
                        ? `${item} ${height}cm ${length}個`
                        : `${item} ${height}cm ${length}m`;
                }
            }
        } else {
            const quantityElement = document.getElementById('quantity' + productNum);
            const discountElement = document.getElementById('discount_value' + productNum);

            if (!quantityElement || !discountElement) {
                console.log('Required product elements not found:', productNum);
                return;
            }

            if (category && item && productsData[category] && productsData[category][item]) {
                const productData = productsData[category][item];
                const quantity = parseFloat(quantityElement.value) || 0;
                const discountValue = parseFloat(discountElement.value) || 0;

                if ((category === "そのほか" && item === "カビ") || 
                    (category === "消毒" && item === "カビ消毒")) {
                    priceExTax = calculateKabiPrice(quantity, selectedProducts);
                } else if (category === "そのほか" && item === "BM") {
                    priceExTax = calculateBMPrice(quantity, selectedProducts);
                } else if (category === "床下機器" && item === "SO2買") {
                    // 他の選択商品をチェック
                    const hasSpecialDiscount = selectedProducts.some(product => 
                        product.item && (product.item.includes("DC2") || product.item.includes("60"))
                    );

                    // 特別割引価格または通常価格を適用
                    const unitPrice = hasSpecialDiscount ? 83000 : productData.price;
                    priceExTax = unitPrice * quantity;
                } else {
                    let totalPrice = productData.base || 0;

                    if (productData.areaThreshold) {
                        if (quantity > productData.areaThreshold) {
                            totalPrice += productData.price * (quantity - productData.areaThreshold);
                        }
                    } else {
                        totalPrice += productData.price * quantity;
                    }
                    priceExTax = totalPrice;
                }

                const discount = calculateDiscount(priceExTax, discountValue);
                priceExTax -= discount;
                priceInTax = Math.floor(priceExTax * 1.1);
            }
        }

        const priceExTaxElement = document.getElementById(prefix + 'price_ex_tax' + productNum);
        const priceInTaxElement = document.getElementById(prefix + 'price_in_tax' + productNum);

        if (priceExTaxElement) priceExTaxElement.innerText = formatNumber(priceExTax);
        if (priceInTaxElement) priceInTaxElement.innerText = formatNumber(priceInTax);

        if (priceExTax > 0) {
            updateSelectedProducts(productId, category, item, kisoName, priceExTax, priceInTax);
        }

    } catch (error) {
        console.error("calculateProductでエラーが発生しました:", error);
    }
}


function setupEventListeners(i, productType = 'product') {
    const prefix = productType === 'product' ? '' : 'kiso-';
    const elements = {
        goods: document.getElementById(`${prefix}goods${i}`),
        list: document.getElementById(`${prefix}list${i}`),
        height: document.getElementById(`${prefix}height${i}`),
        length: document.getElementById(`${prefix}length${i}`),
        discount: document.getElementById(`${prefix}discount_value${i}`),
        quantity: document.getElementById(`quantity${i}`)
    };

    let productsDataToUse = (productType === 'product') ? productsData : kisoProductsData;
    if (elements.goods) {
        populateCategories(productsDataToUse, `${prefix}goods${i}`);
        elements.goods.addEventListener('change', () => {
            updateSubCategory(productsDataToUse, `${prefix}goods${i}`, `${prefix}list${i}`);
            
            if (productType === 'kiso-product') {
                const lengthElement = document.getElementById(`kiso-length${i}`);
                if (lengthElement) {
                    updateInputLabel(elements.goods.value, null, lengthElement);
                }
            }
            
            calculateProduct(`${prefix}product${i}`, productType);
        });
    }

    if (elements.list) {
        elements.list.addEventListener('change', () => {
            calculateProduct(`${prefix}product${i}`, productType);
            const nextProductNum = i + 1;
            const nextProduct = document.getElementById(`${prefix}product${nextProductNum}`);
            
            if (nextProduct) {
                nextProduct.style.display = 'block';
                
                const currentGoodsElement = document.getElementById(`${prefix}goods${i}`);
                const nextGoodsElement = document.getElementById(`${prefix}goods${nextProductNum}`);
                
                if (currentGoodsElement && nextGoodsElement) {
                    const selectedCategory = currentGoodsElement.value;
                    
                    // 次の商品の大項目を設定して表示を更新
                    nextGoodsElement.value = selectedCategory;
                    populateCategories(productsDataToUse, `${prefix}goods${nextProductNum}`);
                    nextGoodsElement.value = selectedCategory; // 再度値を設定
    
                    if (selectedCategory) {
                        // 小項目の選択肢を更新
                        updateSubCategory(
                            productType === 'product' ? productsData : kisoProductsData,
                            `${prefix}goods${nextProductNum}`,
                            `${prefix}list${nextProductNum}`
                        );
    
                        if (productType === 'kiso-product' && selectedCategory === 'クラック') {
                            const nextLengthElement = document.getElementById(`kiso-length${nextProductNum}`);
                            if (nextLengthElement) {
                                updateInputLabel(selectedCategory, null, nextLengthElement);
                            }
                        }
                    }
                }
                
                setupEventListeners(nextProductNum, productType);
            }
        });
    }
    

    function setupNumberInput(element) {
        if (element) {
            element.addEventListener('input', () => {
                calculateProduct(`${prefix}product${i}`, productType);
            });
        }
    }

    if (productType === 'kiso-product') {
        setupNumberInput(elements.height);
        setupNumberInput(elements.length);
        setupNumberInput(elements.discount);
    } else {
        setupNumberInput(elements.quantity);
        setupNumberInput(elements.discount);
    }
}

function updateSelectedProducts(productId, category, item, kisoName, priceExTax, priceInTax) {
    const productNum = parseInt(productId.replace(/[^0-9]/g, ''));
    const isKiso = productId.includes('kiso');
    const quantity = isKiso ? 1 : (parseFloat(document.getElementById('quantity' + productNum).value) || 0);
    const discount = parseFloat(document.getElementById((isKiso ? 'kiso-' : '') + 'discount_value' + productNum).value) || 0;

    const discountText = discount > 0 
        ? (discount < 100 ? `${discount}%` : `${formatNumber(discount)}円`)
        : '0円';

    const newProduct = {
        productId: productId,
        category: category,
        item: isKiso ? kisoName : item,
        quantity: quantity,
        discountValue: discount,
        discountText: discountText,
        priceExTax: priceExTax,
        priceInTax: priceInTax
    };

    const existingIndex = selectedProducts.findIndex(p => p.productId === productId);
    if (existingIndex !== -1) {
        selectedProducts[existingIndex] = newProduct;
    } else {
        selectedProducts.push(newProduct);
    }

    updateSummary();
}

function updateSummary() {
    const summaryList = document.getElementById('summary-list');
    if (!summaryList) return;
    
    summaryList.innerHTML = '';
    
    // 基礎セット割引の通知
    if (checkKisoSetDiscount(selectedProducts)) {
        const setDiscountNotice = document.createElement('li');
        setDiscountNotice.className = 'summary-notice';
        setDiscountNotice.textContent = '※ 外基礎・中基礎セット値引き 40,000円 適用中';
        summaryList.appendChild(setDiscountNotice);
    }

    const validProducts = selectedProducts.filter(product => product.priceExTax > 0);
    if (validProducts.length > 0) {
        // 商品名のグループ
        const productGroup = document.createElement('li');
        productGroup.className = 'summary-group';
        const productNames = validProducts.map(p => {
            if (p.productId.includes('kiso-')) {
                const fullName = p.item;
                const match = fullName.match(/(外基礎|中基礎)/);
                return match ? match[0] : fullName;
            }
            return p.item;
        }).join('・');

        productGroup.innerHTML = `
            <button class="copy-button" data-copy="${productNames}">コピー</button>
            <div class="summary-label">商品：</div>
            <div class="summary-content">${productNames}</div>
        `;
        summaryList.appendChild(productGroup);

        // 数量のグループ
        const quantityGroup = document.createElement('li');
        quantityGroup.className = 'summary-group';
        const quantities = validProducts.map(p => {
            if (p.productId.includes('kiso-')) {
                const productNum = p.productId.replace(/[^0-9]/g, '');
                const heightElement = document.getElementById(`kiso-height${productNum}`);
                const lengthElement = document.getElementById(`kiso-length${productNum}`);
                
                if (heightElement && lengthElement) {
                    const height = heightElement.value;
                    const length = lengthElement.value;
                    return `${height}*${length}m`;
                }
                return p.quantity;
            }
            return p.quantity;
        }).join('/');

        quantityGroup.innerHTML = `
            <button class="copy-button" data-copy="${quantities}">コピー</button>
            <div class="summary-label">数量：</div>
            <div class="summary-content">${quantities}</div>
        `;
        summaryList.appendChild(quantityGroup);

        // 合計金額のグループ
        let totalExTax = validProducts.reduce((sum, p) => sum + p.priceExTax, 0);
        if (document.getElementById('management-fee-switch').checked) {
            totalExTax += 20000;
        }
        const totalGroup = document.createElement('li');
        totalGroup.className = 'summary-group';
        const formattedTotal = formatNumber(totalExTax);
        totalGroup.innerHTML = `
            <button class="copy-button" data-copy="${formattedTotal}">コピー</button>
            <div class="summary-label">合計金額(抜)：</div>
            <div class="summary-content">${formattedTotal}円</div>
        `;
        summaryList.appendChild(totalGroup);

        // コピーボタンのイベントリスナーを設定
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', function() {
                const textToCopy = this.getAttribute('data-copy');
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // コピー成功時の視覚的フィードバック
                    this.textContent = 'コピー完了';
                    setTimeout(() => {
                        this.textContent = 'コピー';
                    }, 2000);
                });
            });
        });
    }


    // 既存の合計金額更新処理
    const totalExTaxElement = document.getElementById('total-ex-tax');
    const totalInTaxElement = document.getElementById('total-in-tax');
    let finalTotalExTax = validProducts.reduce((sum, p) => sum + p.priceExTax, 0);
    let finalTotalInTax = validProducts.reduce((sum, p) => sum + p.priceInTax, 0);
    
    if (document.getElementById('management-fee-switch').checked) {
        finalTotalExTax += 20000;
        finalTotalInTax += 22000;
    }
    
    if (totalExTaxElement) totalExTaxElement.textContent = formatNumber(finalTotalExTax);
    if (totalInTaxElement) totalInTaxElement.textContent = formatNumber(finalTotalInTax);
}


function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const tabId = button.dataset.tab;
            const activeContent = document.getElementById(tabId);
            if (activeContent) {
                activeContent.classList.add('active');
            }

            if (tabId === 'kiso-products') {
                // 基礎商品の表示制御
                let shouldShowNext = true;
                for (let i = 1; i <= 4; i++) {
                    const kisoProduct = document.getElementById('kiso-product' + i);
                    if (kisoProduct) {
                        const hasProduct = selectedProducts.some(p => p.productId === `kiso-product${i}`);
                        
                        // 最初の商品か、選択済み商品か、前の商品が表示されている場合に表示
                        if (i === 1 || hasProduct || shouldShowNext) {
                            kisoProduct.style.display = 'block';
                            // 商品が選択されているか、入力中の場合は次の商品も表示
                            const kisoGoodsElement = document.getElementById(`kiso-goods${i}`);
                            shouldShowNext = hasProduct || (kisoGoodsElement && kisoGoodsElement.value);
                        } else {
                            kisoProduct.style.display = 'none';
                        }
                    }
                }

                // 通常商品は非表示
                for (let i = 1; i <= 6; i++) {
                    const product = document.getElementById('product' + i);
                    if (product) {
                        product.style.display = 'none';
                    }
                }
            } else {
                // 通常商品の表示制御
                let shouldShowNext = true;
                for (let i = 1; i <= 6; i++) {
                    const product = document.getElementById('product' + i);
                    if (product) {
                        const hasProduct = selectedProducts.some(p => p.productId === `product${i}`);
                        
                        // 最初の商品か、選択済み商品か、前の商品が表示されている場合に表示
                        if (i === 1 || hasProduct || shouldShowNext) {
                            product.style.display = 'block';
                            // 商品が選択されているか、入力中の場合は次の商品も表示
                            const goodsElement = document.getElementById(`goods${i}`);
                            shouldShowNext = hasProduct || (goodsElement && goodsElement.value);
                        } else {
                            product.style.display = 'none';
                        }
                    }
                }

                // 基礎商品は非表示
                for (let i = 1; i <= 4; i++) {
                    const kisoProduct = document.getElementById('kiso-product' + i);
                    if (kisoProduct) {
                        kisoProduct.style.display = 'none';
                    }
                }
            }
        });
    });
}



// 初期化処理
window.onload = function() {
    try {
        setupTabs();
        setupEventListeners(1, "product");
        setupEventListeners(1, "kiso-product");

        const calculateButton = document.getElementById('calculate-button');
        if(calculateButton) {
            calculateButton.addEventListener('click', function() {
                selectedProducts.forEach(product => {
                    const productNum = parseInt(product.productId.replace(/[^0-9]/g, ''));
                    const isKiso = product.productId.includes('kiso');
                    calculateProduct(product.productId, isKiso ? 'kiso-product' : 'product');
                });
                updateSummary();
            });
        }
        
        const managementFeeCheckbox = document.getElementById('management-fee-switch');
        if(managementFeeCheckbox) {
            managementFeeCheckbox.addEventListener('change', updateSummary);
        }

        const resetButton = document.getElementById('reset-button');
        if(resetButton) {
            resetButton.addEventListener('click', function() {
                selectedProducts = [];
                resetForms();
                updateSummary();
            });
        }

        hideInitialProducts();

    } catch (error) {
        console.error("初期化エラー:", error);
        alert("ページの初期化に失敗しました。");
    }

    // 商品フォーム追加ボタンの処理
const addProductButton = document.getElementById('add-product-button');
if(addProductButton) {
    addProductButton.addEventListener('click', function() {
        const activeTab = document.querySelector('.tab-button.active');
        const isKisoTab = activeTab.dataset.tab === 'kiso-products';
        
        if (isKisoTab) {
            // 基礎商品の追加
            for (let i = 1; i <= 4; i++) {
                const kisoProduct = document.getElementById('kiso-product' + i);
                if (kisoProduct && kisoProduct.style.display === 'none') {
                    kisoProduct.style.display = 'block';
                    setupEventListeners(i, 'kiso-product');
                    break;
                }
            }
        } else {
            // 通常商品の追加
            for (let i = 1; i <= 6; i++) {
                const product = document.getElementById('product' + i);
                if (product && product.style.display === 'none') {
                    product.style.display = 'block';
                    setupEventListeners(i, 'product');
                    break;
                }
            }
        }
    });
}

};

function resetForms() {
    // 通常商品のリセット
    for (let i = 1; i <= 6; i++) {
        resetProductForm(i, false);
        const product = document.getElementById('product' + i);
        if (product) {
            product.style.display = i === 1 ? 'block' : 'none';
        }
    }
    
    // 基礎商品のリセット
    for (let i = 1; i <= 4; i++) {
        resetProductForm(i, true);
        const kisoProduct = document.getElementById('kiso-product' + i);
        if (kisoProduct) {
            kisoProduct.style.display = 'none';
        }
    }

    // タブの状態をリセット
    const productTab = document.querySelector('.tab-button[data-tab="products"]');
    const kisoTab = document.querySelector('.tab-button[data-tab="kiso-products"]');
    const productContent = document.getElementById('products');
    const kisoContent = document.getElementById('kiso-products');

    if (productTab && kisoTab && productContent && kisoContent) {
        productTab.classList.add('active');
        kisoTab.classList.remove('active');
        productContent.classList.add('active');
        kisoContent.classList.remove('active');
    }

    // イベントリスナーを再設定
    setupEventListeners(1, "product");
    setupEventListeners(1, "kiso-product");
}

function resetProductForm(index, isKiso) {
    const prefix = isKiso ? 'kiso-' : '';
    const elements = {
        goods: document.getElementById(`${prefix}goods${index}`),
        list: document.getElementById(`${prefix}list${index}`),
        quantity: document.getElementById(`${prefix}quantity${index}`),
        height: document.getElementById(`${prefix}height${index}`),
        length: document.getElementById(`${prefix}length${index}`),
        discount: document.getElementById(`${prefix}discount_value${index}`),
        priceExTax: document.getElementById(`${prefix}price_ex_tax${index}`),
        priceInTax: document.getElementById(`${prefix}price_in_tax${index}`)
    };

    Object.values(elements).forEach(element => {
        if (element) {
            if (element.tagName === 'SELECT') {
                element.selectedIndex = 0;
            } else if (element.tagName === 'INPUT') {
                element.value = '0';
            } else if (element.tagName === 'SPAN') {
                element.innerText = '0';
            }
        }
    });

    if (elements.list) {
        elements.list.innerHTML = '<option value="">項目を選択してください</option>';
    }

    if (isKiso) {
        const lengthElement = document.getElementById(`kiso-length${index}`);
        if (lengthElement) {
            const label = lengthElement.previousElementSibling;
            if (label) {
                label.textContent = "長さ(m):";
            }
            lengthElement.placeholder = "";
            lengthElement.title = "";
        }
    }
}

function hideInitialProducts() {
    for (let i = 2; i <= 6; i++) {
        const product = document.getElementById('product' + i);
        if(product) {
            product.style.display = 'none';
        }
    }
    for (let i = 2; i <= 4; i++) {
        const kisoProduct = document.getElementById('kiso-product' + i);
        if(kisoProduct) {
            kisoProduct.style.display = 'none';
        }
    }
    const kisoProduct1 = document.getElementById('kiso-product1');
    if (kisoProduct1) {
        kisoProduct1.style.display = 'none';
    }
}

// 追加のイベントリスナー設定
for (let i = 1; i <= 6; i++) {
    setupEventListeners(i, 'product');
}
for (let i = 1; i <= 4; i++) {
    setupEventListeners(i, 'kiso-product');
}

// BMの価格を計算する関数
function calculateBMPrice(quantity, selectedProducts) {
    const bmData = productsData["そのほか"]["BM"];
    let appliedPrice = bmData.price; // 基本価格 3,300円

    // 既存の割引条件チェック
    const hasExistingDiscount = selectedProducts.some(product => {
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

    // 基礎工事との同時選択チェック（新規追加の条件）
    const hasKiso = selectedProducts.some(product => 
        (product.item && (product.item.includes("外基礎") || product.item.includes("中基礎")))
    );

    // いずれかの条件に該当する場合、割引価格を適用
    if (hasExistingDiscount || hasKiso) {
        appliedPrice = bmData.discountPrice; // 割引価格 2,800円
    }

    return appliedPrice * quantity;
}

// 商品選択モーダルの機能
class ProductModal {
    constructor() {
        this.modal = new bootstrap.Modal(document.getElementById('product-modal'));
        this.categorySelect = document.getElementById('modal-category');
        this.productSelect = document.getElementById('modal-product');
        this.quantityInput = document.getElementById('modal-quantity');
        this.discountInput = document.getElementById('modal-discount');
        this.optionsContainer = document.getElementById('modal-options');
        this.confirmButton = document.getElementById('modal-confirm');
        this.currentProductId = null;

        this.initializeEventListeners();
        this.initializeCategories();
    }

    initializeEventListeners() {
        // カテゴリ選択時のイベント
        this.categorySelect.addEventListener('change', () => {
            this.updateProductList();
            this.updateOptions();
        });

        // 商品選択時のイベント
        this.productSelect.addEventListener('change', () => {
            this.updateOptions();
            this.updateCalculation();
        });

        // 数量・割引入力時のイベント
        this.quantityInput.addEventListener('input', () => this.updateCalculation());
        this.discountInput.addEventListener('input', () => this.updateCalculation());

        // 決定ボタンのイベント
        this.confirmButton.addEventListener('click', () => this.handleProductSelection());

        // モーダルを開くボタンのイベントリスナー
        document.querySelectorAll('.product').forEach(product => {
            const listSelect = product.querySelector('select[id^="list"]');
            if (listSelect) {
                listSelect.addEventListener('click', (e) => {
                    this.currentProductId = e.target.id.replace('list', '');
                    this.openModal();
                });
            }
        });
    }

    initializeCategories() {
        // カテゴリの初期化
        this.categorySelect.innerHTML = '<option value="">カテゴリを選択してください</option>';
        
        // 通常商品カテゴリ
        if (typeof productsData !== 'undefined') {
            Object.keys(productsData).forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                this.categorySelect.appendChild(option);
            });
        }

        // 基礎関連カテゴリを追加
        if (typeof kisoProductsData !== 'undefined') {
            Object.keys(kisoProductsData).forEach(category => {
                const option = document.createElement('option');
                option.value = `kiso-${category}`;
                option.textContent = `基礎：${category}`;
                this.categorySelect.appendChild(option);
            });
        }
    }

    updateProductList() {
        const category = this.categorySelect.value;
        this.productSelect.innerHTML = '<option value="">商品を選択してください</option>';

        if (category && window.productData && window.productData[category]) {
            Object.entries(window.productData[category]).forEach(([id, product]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = product.name;
                option.dataset.price = product.price;
                option.dataset.unit = product.unit || '坪';
                this.productSelect.appendChild(option);
            });
        }

        this.updateCalculation();
    }

    updateOptions() {
        this.optionsContainer.innerHTML = '';
        const category = this.categorySelect.value;
        const productId = this.productSelect.value;

        if (category && productId && window.productData && window.productData['オプション']) {
            const options = window.productData['オプション'];
            Object.entries(options).forEach(([optionId, option]) => {
                if (this.isOptionAvailableForProduct(category, productId, optionId)) {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'form-check mb-2';
                    optionDiv.innerHTML = `
                        <input class="form-check-input" type="checkbox" id="option_${optionId}" 
                               data-option-id="${optionId}" data-price="${option.price}">
                        <label class="form-check-label" for="option_${optionId}">
                            ${option.name} (+${option.price.toLocaleString()}円/${option.unit || '坪'})
                        </label>
                    `;
                    this.optionsContainer.appendChild(optionDiv);

                    // オプション選択時のイベント
                    const checkbox = optionDiv.querySelector('input[type="checkbox"]');
                    checkbox.addEventListener('change', () => this.updateCalculation());
                }
            });
        }

        this.updateCalculation();
    }

    isOptionAvailableForProduct(category, productId, optionId) {
        // オプションの適用条件をチェック
        const product = window.productData[category]?.[productId];
        const option = window.productData['オプション']?.[optionId];

        if (!product || !option) return false;

        // カテゴリや商品に応じたオプションの表示条件を設定
        if (optionId === '防カビ処理' || optionId === '強化施工') {
            return category === '消毒' || category === 'シロアリ防除';
        }

        return true;
    }

    updateCalculation() {
        const category = this.categorySelect.value;
        const productId = this.productSelect.value;
        const quantity = parseFloat(this.quantityInput.value) || 0;
        const discount = parseFloat(this.discountInput.value) || 0;

        if (!category || !productId || quantity <= 0) {
            this.resetCalculationDisplay();
            return;
        }

        const product = window.productData[category]?.[productId];
        if (!product) {
            this.resetCalculationDisplay();
            return;
        }

        // 基本価格の計算
        let unitPrice = product.price;
        let subtotal = unitPrice * quantity;

        // オプション価格の加算
        const selectedOptions = Array.from(this.optionsContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => ({
                id: checkbox.dataset.optionId,
                price: parseFloat(checkbox.dataset.price) || 0
            }));

        selectedOptions.forEach(option => {
            subtotal += option.price * quantity;
        });

        // 割引の適用
        let discountAmount = 0;
        if (discount > 0) {
            if (discount < 100) {
                discountAmount = subtotal * (discount / 100);
            } else {
                discountAmount = discount;
            }
        }

        const finalPrice = Math.max(0, subtotal - discountAmount);
        const taxIncludedPrice = Math.floor(finalPrice * 1.1);

        // 計算結果を表示
        this.updateCalculationDisplay({
            unitPrice,
            quantity,
            subtotal,
            discountAmount,
            finalPrice,
            taxIncludedPrice,
            displayName: product.name + (selectedOptions.length > 0 ? 
                `（${selectedOptions.map(o => window.productData['オプション'][o.id].name).join('・')}）` : ''),
            category
        });
    }

    updateCalculationDisplay(priceData) {
        if (!priceData) {
            this.resetCalculationDisplay();
            return;
        }

        // 選択商品リストの更新
        const summaryList = document.getElementById('summary-list');
        summaryList.innerHTML = `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${priceData.displayName}</strong>
                    <br>
                    <small class="text-muted">${priceData.category}</small>
                </div>
                <div class="text-end">
                    <div>${priceData.quantity}坪</div>
                    <div>${priceData.finalPrice.toLocaleString()}円</div>
                </div>
            </li>
        `;

        // 合計金額の更新
        const calculationTotal = document.getElementById('calculation-total');
        calculationTotal.innerHTML = `
            <div class="row">
                <div class="col-6">
                    <p>小計（税抜）: ${priceData.subtotal.toLocaleString()}円</p>
                    <p>割引額: ${priceData.discountAmount.toLocaleString()}円</p>
                </div>
                <div class="col-6">
                    <p>合計（税込）: ${priceData.taxIncludedPrice.toLocaleString()}円</p>
                </div>
            </div>
        `;
    }

    resetCalculationDisplay() {
        document.getElementById('summary-list').innerHTML = '';
        document.getElementById('calculation-total').innerHTML = '';
    }

    openModal() {
        // フォームのリセット
        this.categorySelect.selectedIndex = 0;
        this.productSelect.innerHTML = '<option value="">商品を選択してください</option>';
        this.quantityInput.value = '1';
        this.discountInput.value = '0';
        this.optionsContainer.innerHTML = '';
        this.resetCalculationDisplay();

        // モーダルを表示
        this.modal.show();
    }

    handleProductSelection() {
        const category = this.categorySelect.value;
        const productId = this.productSelect.value;
        const quantity = parseFloat(this.quantityInput.value) || 0;
        const discount = parseFloat(this.discountInput.value) || 0;

        if (!category || !productId || quantity <= 0) {
            alert('商品と数量を正しく選択してください。');
            return;
        }

        const product = window.productData[category]?.[productId];
        if (!product) return;

        // 選択されたオプションを取得
        const selectedOptions = Array.from(this.optionsContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => ({
                id: checkbox.dataset.optionId,
                name: window.productData['オプション'][checkbox.dataset.optionId].name,
                price: parseFloat(checkbox.dataset.price) || 0
            }));

        // 商品情報をフォームに反映
        const productForm = document.getElementById(`product${this.currentProductId}`);
        if (productForm) {
            const goodsSelect = productForm.querySelector(`#goods${this.currentProductId}`);
            const listSelect = productForm.querySelector(`#list${this.currentProductId}`);
            const quantityInput = productForm.querySelector(`#quantity${this.currentProductId}`);
            const discountInput = productForm.querySelector(`#discount_value${this.currentProductId}`);
            const priceExTax = productForm.querySelector(`#price_ex_tax${this.currentProductId}`);
            const priceInTax = productForm.querySelector(`#price_in_tax${this.currentProductId}`);

            // 商品情報を設定
            if (goodsSelect) goodsSelect.value = category;
            if (listSelect) listSelect.value = productId;
            if (quantityInput) quantityInput.value = quantity;
            if (discountInput) discountInput.value = discount;

            // 価格を計算して表示
            let totalPrice = product.price * quantity;
            selectedOptions.forEach(option => {
                totalPrice += option.price * quantity;
            });

            // 割引の適用
            if (discount > 0) {
                if (discount < 100) {
                    totalPrice *= (1 - discount / 100);
                } else {
                    totalPrice -= discount;
                }
            }

            totalPrice = Math.max(0, totalPrice);

            if (priceExTax) priceExTax.textContent = Math.floor(totalPrice).toLocaleString();
            if (priceInTax) priceInTax.textContent = Math.floor(totalPrice * 1.1).toLocaleString();

            // 計算を実行
            calculateTotal();
        }

        this.modal.hide();
    }
}

// モーダルのインスタンスを作成
const productModal = new ProductModal();

function initCategorySelect() {
    const categorySelect = document.getElementById('modalCategory');
    categorySelect.innerHTML = '<option value="">カテゴリを選択してください</option>';

    // 通常商品カテゴリ
    if (typeof productsData !== 'undefined') {
        Object.keys(productsData).forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // 基礎関連カテゴリを追加
    if (typeof kisoProductsData !== 'undefined') {
        Object.keys(kisoProductsData).forEach(category => {
            const option = document.createElement('option');
            option.value = `kiso-${category}`;
            option.textContent = `基礎：${category}`;
            categorySelect.appendChild(option);
        });
    }
}

function updateProductSelect(category) {
    const productSelect = document.getElementById('modalProduct');
    productSelect.innerHTML = '<option value="">商品を選択してください</option>';

    // 基礎関連商品
    if (category && category.startsWith('kiso-')) {
        const kisoCategory = category.replace('kiso-', '');
        if (typeof kisoProductsData !== 'undefined' && kisoProductsData[kisoCategory]) {
            Object.keys(kisoProductsData[kisoCategory]).forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                productSelect.appendChild(option);
            });
        }
    } 
    // 通常商品
    else if (category && typeof productsData !== 'undefined' && productsData[category]) {
        Object.keys(productsData[category]).forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            productSelect.appendChild(option);
        });
    }
}


