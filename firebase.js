<!-- firebase.js -->
<script type="module">
  // ↓ ご自身のFirebase構成情報をここにコピペ
        const firebaseConfig = {
        apiKey: "AIzaSyB56OrGZZlIAfNgR_qwqamjFpZtrKpxEDs",
        authDomain: "order-form-2025.firebaseapp.com",
        projectId: "order-form-2025",
        storageBucket: "order-form-2025.firebasestorage.app",
        messagingSenderId: "519846061654",
        appId: "1:519846061654:web:3dd3fdad301fab4cc73df7",
        measurementId: "G-Z48E2JMN1Y"
        };

  // 初期化
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import {
    getAuth,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    updateProfile
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import { 
    getFirestore, 
    doc, 
    setDoc, 
    serverTimestamp 
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  // パスワード変更通知を無効化する設定
  auth.useDeviceLanguage();
  auth.settings.appVerificationDisabledForTesting = true;
  
  // 認証の永続性を設定（ブラウザを閉じても認証を維持）
  setPersistence(auth, browserLocalPersistence)
    .catch((error) => {
      console.error("認証永続設定エラー:", error);
    });

  // ログイン関数（login.htmlから呼び出し）
  window.loginUser = async () => {
    const email = document.getElementById("email").value;
    const pw = document.getElementById("password").value;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pw);
      const user = userCredential.user;
      
      // ユーザー名が未設定の場合はメールアドレスの@前を表示名として設定
      if (!user.displayName) {
        const emailName = email.split('@')[0];
        try {
          await updateProfile(user, {
            displayName: emailName
          });
          console.log('ユーザー表示名を設定しました:', emailName);
        } catch (error) {
          console.error('ユーザー表示名設定エラー:', error);
        }
      }
      
      // Firestoreにユーザー情報を保存
      try {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          lastLogin: serverTimestamp()
        }, { merge: true });
        console.log('ユーザー情報をFirestoreに保存しました');
      } catch (error) {
        console.error('Firestore保存エラー:', error);
      }
      
      alert("ログイン成功！");
      window.location.href = 'index.html';
    } catch (error) {
      // エラーメッセージの日本語化
      let errorMessage = "ログインに失敗しました。";
      if (error.code === 'auth/invalid-credential') {
        errorMessage = "メールアドレスまたはパスワードが正しくありません。";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "このアカウントは無効化されています。";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "ログイン試行回数が多すぎます。しばらく経ってから再試行してください。";
      }
      alert(errorMessage);
    }
  }

  // ユーザープロフィール編集関数
  window.updateUserProfile = async (displayName) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('ユーザーがログインしていません');
      
      // Auth表示名を更新
      await updateProfile(user, { displayName });
      
      // Firestoreのユーザー情報も更新
      await setDoc(doc(db, "users", user.uid), {
        displayName: displayName,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return { success: true, message: 'プロフィールを更新しました' };
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      return { success: false, message: error.message };
    }
  }
</script>
