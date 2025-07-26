// 推しウマ記録アプリ - メインスクリプト

// データ管理クラス
class OshiumaDataManager {
    constructor() {
        this.storageKey = 'oshiuma_data';
    }

    // 全データ取得
    getAllData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { horses: [] };
        } catch (error) {
            console.error('データ読み込みエラー:', error);
            this.showErrorMessage('データの読み込みに失敗しました。ブラウザを再読み込みしてください。');
            return { horses: [] };
        }
    }

    // データ保存
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('データ保存エラー:', error);
            alert('データの保存に失敗しました。容量制限に達している可能性があります。');
            return false;
        }
    }

    // 推しウマ追加
    addHorse(horseData) {
        const data = this.getAllData();
        const newHorse = {
            id: this.generateUUID(),
            name: horseData.name,
            comment: horseData.comment || '',
            jraUrl: horseData.jraUrl || '',
            images: horseData.images || [],
            records: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        data.horses.push(newHorse);
        return this.saveData(data) ? newHorse : null;
    }

    // 推しウマ更新
    updateHorse(horseId, updatedData) {
        const data = this.getAllData();
        const horseIndex = data.horses.findIndex(h => h.id === horseId);
        
        if (horseIndex === -1) return false;
        
        data.horses[horseIndex] = {
            ...data.horses[horseIndex],
            ...updatedData,
            updatedAt: new Date().toISOString()
        };
        
        return this.saveData(data);
    }

    // 推しウマ削除
    deleteHorse(horseId) {
        const data = this.getAllData();
        data.horses = data.horses.filter(h => h.id !== horseId);
        return this.saveData(data);
    }

    // 推しウマ取得
    getHorse(horseId) {
        const data = this.getAllData();
        return data.horses.find(h => h.id === horseId);
    }

    // 記録追加
    addRecord(horseId, recordData) {
        const data = this.getAllData();
        const horse = data.horses.find(h => h.id === horseId);
        
        if (!horse) return false;
        
        const newRecord = {
            id: this.generateUUID(),
            type: recordData.type,
            title: recordData.title,
            content: recordData.content || '',
            date: recordData.date || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        
        horse.records.push(newRecord);
        horse.updatedAt = new Date().toISOString();
        
        return this.saveData(data) ? newRecord : null;
    }

    // 記録更新
    updateRecord(horseId, recordId, updatedData) {
        const data = this.getAllData();
        const horse = data.horses.find(h => h.id === horseId);
        
        if (!horse) return false;
        
        const recordIndex = horse.records.findIndex(r => r.id === recordId);
        if (recordIndex === -1) return false;
        
        horse.records[recordIndex] = {
            ...horse.records[recordIndex],
            ...updatedData
        };
        horse.updatedAt = new Date().toISOString();
        
        return this.saveData(data);
    }

    // 記録削除
    deleteRecord(horseId, recordId) {
        const data = this.getAllData();
        const horse = data.horses.find(h => h.id === horseId);
        
        if (!horse) return false;
        
        horse.records = horse.records.filter(r => r.id !== recordId);
        horse.updatedAt = new Date().toISOString();
        
        return this.saveData(data);
    }

    // UUID生成
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // エラーメッセージ表示
    showErrorMessage(message) {
        // 既存のエラーメッセージを削除
        const existingError = document.getElementById('errorMessage');
        if (existingError) {
            existingError.remove();
        }

        // エラーメッセージを作成
        const errorDiv = document.createElement('div');
        errorDiv.id = 'errorMessage';
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 70px;
                left: 1rem;
                right: 1rem;
                background: #f44336;
                color: white;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 1001;
                display: flex;
                justify-content: space-between;
                align-items: center;
                animation: slideDown 0.3s ease-out;
            ">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0.25rem;
                ">&times;</button>
            </div>
        `;

        // スタイルを追加（初回のみ）
        if (!document.getElementById('errorStyles')) {
            const style = document.createElement('style');
            style.id = 'errorStyles';
            style.textContent = `
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(errorDiv);

        // 5秒後に自動で削除
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // 成功メッセージ表示
    showSuccessMessage(message) {
        // 既存のメッセージを削除
        const existingMessage = document.getElementById('successMessage');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 成功メッセージを作成
        const messageDiv = document.createElement('div');
        messageDiv.id = 'successMessage';
        messageDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 70px;
                left: 1rem;
                right: 1rem;
                background: #4CAF50;
                color: white;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 1001;
                animation: slideDown 0.3s ease-out;
            ">
                ${message}
            </div>
        `;

        document.body.appendChild(messageDiv);

        // 3秒後に自動で削除
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 3000);
    }
}

// データマネージャーのインスタンス
const dataManager = new OshiumaDataManager();

// 画像処理ユーティリティ
class ImageProcessor {
    static async resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                // アスペクト比を保持してリサイズ
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }

    static async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// グローバル変数
let currentHorseId = null;
let currentJraUrl = null;
let selectedImages = [];

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('horseList')) {
        // index.html の場合
        loadHorseList();
    }
});

// 推しウマ一覧読み込み
function loadHorseList() {
    const data = dataManager.getAllData();
    const horseList = document.getElementById('horseList');
    const emptyState = document.getElementById('emptyState');
    
    if (data.horses.length === 0) {
        horseList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    horseList.style.display = 'block';
    emptyState.style.display = 'none';
    
    horseList.innerHTML = data.horses.map(horse => `
        <div class="horse-card" onclick="goToDetail('${horse.id}')">
            <div class="horse-image">
                ${horse.images.length > 0 ? 
                    `<img src="${horse.images[0].data}" alt="${horse.name}">` :
                    '<div class="no-image">📷</div>'
                }
            </div>
            <div class="horse-info">
                <h3>${escapeHtml(horse.name)}</h3>
                <p>${escapeHtml(horse.comment)}</p>
                <div class="horse-meta">
                    <span>記録: ${horse.records.length}件</span>
                    ${horse.jraUrl ? '<span>JRA成績あり</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// 検索機能
function searchHorses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const data = dataManager.getAllData();
    
    const filteredHorses = data.horses.filter(horse => 
        horse.name.toLowerCase().includes(searchTerm) ||
        horse.comment.toLowerCase().includes(searchTerm)
    );
    
    const horseList = document.getElementById('horseList');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredHorses.length === 0) {
        horseList.innerHTML = '<div class="no-results">検索結果が見つかりません</div>';
        return;
    }
    
    horseList.innerHTML = filteredHorses.map(horse => `
        <div class="horse-card" onclick="goToDetail('${horse.id}')">
            <div class="horse-image">
                ${horse.images.length > 0 ? 
                    `<img src="${horse.images[0].data}" alt="${horse.name}">` :
                    '<div class="no-image">📷</div>'
                }
            </div>
            <div class="horse-info">
                <h3>${escapeHtml(horse.name)}</h3>
                <p>${escapeHtml(horse.comment)}</p>
                <div class="horse-meta">
                    <span>記録: ${horse.records.length}件</span>
                    ${horse.jraUrl ? '<span>JRA成績あり</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// 詳細画面へ遷移
function goToDetail(horseId) {
    window.location.href = `detail.html?id=${horseId}`;
}

// 戻る
function goBack() {
    window.location.href = 'index.html';
}

// 登録フォーム表示
function showAddForm() {
    resetForm();
    document.getElementById('modalTitle').textContent = '推しウマ登録';
    document.getElementById('addModal').style.display = 'block';
}

// 編集フォーム表示
function editHorse() {
    if (!currentHorseId) return;
    
    const horse = dataManager.getHorse(currentHorseId);
    if (!horse) return;
    
    // フォームに現在の値を設定
    document.getElementById('editHorseId').value = horse.id;
    document.getElementById('horseName').value = horse.name;
    document.getElementById('horseComment').value = horse.comment;
    document.getElementById('jraUrl').value = horse.jraUrl;
    
    // 既存画像をプレビューに表示
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = horse.images.map((img, index) => `
        <div class="preview-item">
            <img src="${img.data}" alt="プレビュー">
            <button type="button" onclick="removeImage(${index})">削除</button>
        </div>
    `).join('');
    
    selectedImages = [...horse.images];
    
    document.getElementById('modalTitle').textContent = '推しウマ編集';
    document.getElementById('addModal').style.display = 'block';
}

// フォーム非表示
function hideAddForm() {
    document.getElementById('addModal').style.display = 'none';
    resetForm();
}

// フォームリセット
function resetForm() {
    document.getElementById('horseForm').reset();
    document.getElementById('editHorseId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    selectedImages = [];
}

// 画像プレビュー
async function previewImages(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById('imagePreview');
    
    // 既存の画像に新しい画像を追加
    for (const file of files) {
        try {
            // 画像をリサイズ
            const resizedFile = await ImageProcessor.resizeImage(file);
            const base64 = await ImageProcessor.fileToBase64(resizedFile);
            
            const imageData = {
                id: dataManager.generateUUID(),
                data: base64,
                caption: '',
                createdAt: new Date().toISOString()
            };
            
            selectedImages.push(imageData);
            
            // プレビューに追加
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${base64}" alt="プレビュー">
                <button type="button" onclick="removeImage(${selectedImages.length - 1})">削除</button>
            `;
            preview.appendChild(previewItem);
            
        } catch (error) {
            console.error('画像処理エラー:', error);
            dataManager.showErrorMessage('画像の処理に失敗しました。ファイル形式を確認してください。');
        }
    }
}

// 画像削除
function removeImage(index) {
    selectedImages.splice(index, 1);
    updateImagePreview();
}

// 画像プレビュー更新
function updateImagePreview() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = selectedImages.map((img, index) => `
        <div class="preview-item">
            <img src="${img.data}" alt="プレビュー">
            <button type="button" onclick="removeImage(${index})">削除</button>
        </div>
    `).join('');
}

// フォーム送信
document.addEventListener('DOMContentLoaded', function() {
    const horseForm = document.getElementById('horseForm');
    if (horseForm) {
        horseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('horseName').value.trim(),
                comment: document.getElementById('horseComment').value.trim(),
                jraUrl: document.getElementById('jraUrl').value.trim(),
                images: selectedImages
            };
            
            if (!formData.name) {
                alert('馬名を入力してください');
                return;
            }
            
            const editId = document.getElementById('editHorseId').value;
            
            if (editId) {
                // 更新
                if (dataManager.updateHorse(editId, formData)) {
                    dataManager.showSuccessMessage('推しウマ情報を更新しました');
                    hideAddForm();
                    if (document.getElementById('horseList')) {
                        loadHorseList();
                    } else {
                        loadHorseDetail(editId);
                    }
                } else {
                    dataManager.showErrorMessage('更新に失敗しました');
                }
            } else {
                // 新規追加
                const newHorse = dataManager.addHorse(formData);
                if (newHorse) {
                    dataManager.showSuccessMessage('推しウマを登録しました');
                    hideAddForm();
                    if (document.getElementById('horseList')) {
                        loadHorseList();
                    }
                } else {
                    dataManager.showErrorMessage('登録に失敗しました');
                }
            }
        });
    }
});

// JRAモーダル表示
function showJraModal(url = null) {
    currentJraUrl = url || (currentHorseId ? dataManager.getHorse(currentHorseId)?.jraUrl : null);
    if (currentJraUrl) {
        document.getElementById('jraModal').style.display = 'block';
    }
}

// JRAモーダル非表示
function hideJraModal() {
    document.getElementById('jraModal').style.display = 'none';
}

// JRA URL を新しいタブで開く
function openJraUrl() {
    if (currentJraUrl) {
        window.open(currentJraUrl, '_blank');
        hideJraModal();
    }
}

// HTML エスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 詳細画面用の関数
function loadHorseDetail(horseId) {
    currentHorseId = horseId;
    const horse = dataManager.getHorse(horseId);
    
    if (!horse) {
        alert('指定された推しウマが見つかりません');
        window.location.href = 'index.html';
        return;
    }
    
    // 基本情報表示
    document.getElementById('horseNameTitle').textContent = horse.name;
    document.getElementById('horseName').textContent = horse.name;
    document.getElementById('horseComment').textContent = horse.comment || '応援コメントなし';
    
    // 画像表示
    const imagesContainer = document.getElementById('horseImages');
    if (horse.images.length > 0) {
        imagesContainer.innerHTML = horse.images.map((img, index) => `
            <img src="${img.data}" alt="${horse.name}" onclick="showImageModal('${img.data}', '${img.caption || horse.name}')">
        `).join('');
    } else {
        imagesContainer.innerHTML = '<div class="no-image">📷 画像なし</div>';
    }
    
    // JRAリンクボタン
    const jraBtn = document.getElementById('jraLinkBtn');
    if (horse.jraUrl) {
        jraBtn.style.display = 'block';
        jraBtn.onclick = () => showJraModal(horse.jraUrl);
    } else {
        jraBtn.style.display = 'none';
    }
    
    // 記録表示
    loadRecords(horseId);
}

// 記録読み込み
function loadRecords(horseId) {
    const horse = dataManager.getHorse(horseId);
    if (!horse) return;
    
    const recordsList = document.getElementById('recordsList');
    const emptyRecords = document.getElementById('emptyRecords');
    
    if (horse.records.length === 0) {
        recordsList.style.display = 'none';
        emptyRecords.style.display = 'block';
        return;
    }
    
    recordsList.style.display = 'block';
    emptyRecords.style.display = 'none';
    
    // 記録を日付順にソート
    const sortedRecords = [...horse.records].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    recordsList.innerHTML = sortedRecords.map(record => `
        <div class="record-card">
            <div class="record-header">
                <span class="record-type record-type-${record.type}">${getRecordTypeLabel(record.type)}</span>
                <span class="record-date">${formatDate(record.date)}</span>
            </div>
            <h4>${escapeHtml(record.title)}</h4>
            <p>${escapeHtml(record.content)}</p>
            <div class="record-actions">
                <button onclick="editRecord('${record.id}')">編集</button>
                <button onclick="deleteRecord('${record.id}')" class="delete-btn">削除</button>
            </div>
        </div>
    `).join('');
}

// 記録タイプラベル取得
function getRecordTypeLabel(type) {
    const labels = {
        race: 'レース',
        training: '調教',
        other: 'その他'
    };
    return labels[type] || 'その他';
}

// 日付フォーマット
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
}

// 記録追加フォーム表示
function showAddRecordForm() {
    resetRecordForm();
    document.getElementById('recordModalTitle').textContent = '応援記録追加';
    document.getElementById('recordModal').style.display = 'block';
}

// 記録編集フォーム表示
function editRecord(recordId) {
    const horse = dataManager.getHorse(currentHorseId);
    const record = horse.records.find(r => r.id === recordId);
    
    if (!record) return;
    
    document.getElementById('editRecordId').value = recordId;
    document.getElementById('recordType').value = record.type;
    document.getElementById('recordTitle').value = record.title;
    document.getElementById('recordDate').value = record.date;
    document.getElementById('recordContent').value = record.content;
    
    document.getElementById('recordModalTitle').textContent = '応援記録編集';
    document.getElementById('recordModal').style.display = 'block';
}

// 記録フォーム非表示
function hideRecordForm() {
    document.getElementById('recordModal').style.display = 'none';
    resetRecordForm();
}

// 記録フォームリセット
function resetRecordForm() {
    document.getElementById('recordForm').reset();
    document.getElementById('editRecordId').value = '';
    document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];
}

// 記録フォーム送信
document.addEventListener('DOMContentLoaded', function() {
    const recordForm = document.getElementById('recordForm');
    if (recordForm) {
        recordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                type: document.getElementById('recordType').value,
                title: document.getElementById('recordTitle').value.trim(),
                date: document.getElementById('recordDate').value,
                content: document.getElementById('recordContent').value.trim()
            };
            
            if (!formData.title) {
                alert('タイトルを入力してください');
                return;
            }
            
            const editId = document.getElementById('editRecordId').value;
            
            if (editId) {
                // 更新
                if (dataManager.updateRecord(currentHorseId, editId, formData)) {
                    dataManager.showSuccessMessage('記録を更新しました');
                    hideRecordForm();
                    loadRecords(currentHorseId);
                } else {
                    dataManager.showErrorMessage('記録の更新に失敗しました');
                }
            } else {
                // 新規追加
                const newRecord = dataManager.addRecord(currentHorseId, formData);
                if (newRecord) {
                    dataManager.showSuccessMessage('記録を追加しました');
                    hideRecordForm();
                    loadRecords(currentHorseId);
                } else {
                    dataManager.showErrorMessage('記録の追加に失敗しました');
                }
            }
        });
    }
});

// 記録削除
function deleteRecord(recordId) {
    if (confirm('この記録を削除しますか？')) {
        if (dataManager.deleteRecord(currentHorseId, recordId)) {
            dataManager.showSuccessMessage('記録を削除しました');
            loadRecords(currentHorseId);
        } else {
            dataManager.showErrorMessage('記録の削除に失敗しました');
        }
    }
}

// 画像拡大表示
function showImageModal(imageSrc, caption) {
    document.getElementById('enlargedImage').src = imageSrc;
    document.getElementById('imageCaption').textContent = caption;
    document.getElementById('imageModal').style.display = 'block';
}

// 画像モーダル非表示
function hideImageModal() {
    document.getElementById('imageModal').style.display = 'none';
}

// モーダル外クリックで閉じる
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});