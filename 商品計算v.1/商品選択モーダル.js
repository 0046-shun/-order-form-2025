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
    }

    initializeCategories() {
        // カテゴリの初期化
        this.categorySelect.innerHTML = '<option value="">カテゴリを選択してください</option>';
        
        // 通常商品カテゴリ
        Object.keys(window.productData || {}).forEach(category => {
            if (category !== 'オプション') {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                this.categorySelect.appendChild(option);
            }
        });
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

    openModal(productId) {
        this.currentProductId = productId;
        
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
            if (typeof calculateTotal === 'function') {
                calculateTotal();
            }
        }

        this.modal.hide();
    }
}

// モーダルのインスタンスを作成
const productModal = new ProductModal();

// グローバル関数として公開
window.openProductModal = function(productId) {
    productModal.openModal(productId);
}; 