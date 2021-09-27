//英語問題のデータの個数
let question_total_num = 0;

//問題番号
let question_num = -1;
//問題文
let sentense = ""
//答え
let quiz_answer = ""

//問題番号の変更を反映する
function update_question_num(event){
    question_num = Number(document.getElementById("question_number").value)
}

//エラーメッセージの設定・表示
function set_error_message(msg){
    err = document.getElementById("error")
    err.innerText = msg
}

//エラーメッセージのクリア
function clear_error_message(){
    err = document.getElementsByClassName("error")
    for(i=0;i<err.length;i++){
        err[i].innerText = ""
    }
}

//表示されているメッセージのクリア
function clear_all_message(){
    msg = document.getElementsByClassName("message")
    for(i=0;i<msg.length;i++){
        msg[i].innerText = ""
    }
}

//エラーチェック①,入力した問題番号がcsvにある問題番号の範囲内か調べる
function check_input_question_num(){
    if(question_num < 1 || question_total_num < question_num ){
        return true
    }else{
        return false
    }
}

//min以上max未満の数値をランダムに取得
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

//min以上max以下の数値をランダムに取得
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

//英語問題取得
function get_english_question(flag){
    //メッセージをクリア
    clear_all_message();

    //入力値エラーチェック
    if(flag=='' && question_num == -1){
        set_error_message("問題番号を入力して下さい");
        return false;
    }

    //JSONデータ作成
    var data = {
        "text" : String(question_num),
        "random": flag
    }
    //外部APIへPOST通信、問題を取得しにいく
    post_data(getEnglishQuizApi(),data,function(resp){
        if(resp['statusCode'] == 200){    
            let question = document.getElementById("question")
            let answer = document.getElementById("answer")
            sentense = resp.sentense === undefined ? "" : resp.sentense
            quiz_answer =  resp.answer === undefined ? "" : resp.answer
            question_num = Number(resp['quiz_id'])

            question.textContent = sentense
            answer.textContent = ""
        }else{
            //内部エラー時
            set_error_message(resp['statusCode']
                                +" : "+resp['error_log']);
        }
    })
}

//問題に正解したときに正解データ登録
function correct_register(){
    //メッセージをクリア
    clear_all_message();
    console.log(question_num)
    //JSONデータ作成
    var data = {
        "text" : 'E-'+String(question_num)
    }
    //外部APIに指定した問題の正解数を登録しに行く
    post_data(getCorrectRegisterApi(),data,function(resp){
        if(resp['statusCode'] == 200){    
            //問題と答えは削除
            let question = document.getElementById("question")
            let answer = document.getElementById("answer")
            sentense = ""
            quiz_answer = ""

            question.textContent = ""
            answer.textContent = ""

            //正解登録完了メッセージ
            let result = document.getElementById("result")
            result.textContent = resp['message']
        }else{
            //内部エラー時
            set_error_message(resp['statusCode']
                                +" : "+resp['error_log']);
        }
    })
}

//問題に不正解のときに正解データ登録
function incorrect_register(){
    //メッセージをクリア
    clear_all_message();

    //JSONデータ作成
    var data = {
        "text" : String(question_num)
    }
    //外部APIに指定した問題の正解数を登録しに行く
    post_data(getIncorrectRegisterApi(),data,function(resp){
        if(resp['statusCode'] == 200){    
            //問題と答えは削除
            let question = document.getElementById("question")
            let answer = document.getElementById("answer")
            sentense = ""
            quiz_answer = ""

            question.textContent = ""
            answer.textContent = ""

            //正解登録完了メッセージ
            let result = document.getElementById("result")
            result.textContent = resp['message']
        }else{
            //内部エラー時
            set_error_message(resp['statusCode']
                                +" : "+resp['error_log']);
        }
    })
}

//答えの文を表示
function display_answer(){
    //メッセージをクリア
    clear_all_message();

    if(sentense == ""){
        set_error_message("問題文がありません。")
    }else{
        let answer = document.getElementById("answer")
        answer.textContent = quiz_answer
    }
}

//Ajaxで指定したurlにPOST通信を送る、受け取った後の処理関数も定義して引数に入力
function post_data(url,jsondata,responsed_func){
    //XMLHttpRequest用意
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');

    //送信
    xhr.send( JSON.stringify(jsondata) );

    //受信して結果を表示
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 && xhr.status === 200) {
            const jsonObj = JSON.parse(xhr.responseText);
            //受信したデータを処理する      
            responsed_func(jsonObj);
        }
    }
}


//(クイズ追加画面)入力したCSVデータを送信して追加する
function add_quiz(){
    //メッセージをクリア
    clear_all_message();

    let input_data = document.getElementById("input_data").value

    //JSONデータ作成
    var data = {
        "file" : "E",
        "data" : input_data
    }

    post_data(getAddQuizApi(),data,function(resp){
        //正解登録完了メッセージ
        let log = document.getElementById("add_log")
        log.innerHTML = resp['log'].join('<br>')
    })

    //入力データをクリア
    document.getElementById("input_data").value = ""
}