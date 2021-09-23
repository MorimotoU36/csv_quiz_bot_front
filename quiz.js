//各csvのデータの個数
var csv_item_list = [];

//ファイル名
let file_name = "";
//ファイル番号
let file_num = -1;
//問題番号
let question_num = "0";
//問題文
let sentense = ""
//答え
let quiz_answer = ""

//ファイル名、ファイル番号の変更を反映する
function update_file_num(event){
    fl = document.getElementById("file_list")
    file_num = Number(fl.options[fl.selectedIndex].value)
    file_name = fl.options[fl.selectedIndex].innerText
}

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
function check_input_question_num(file_index){
    if(question_num < 1 || csv_item_list[file_index] < question_num ){
        return true
    }else{
        return false
    }
}

//問題csvのリストを取得する
function get_csv_name_list(){
    //メッセージをクリア
    clear_all_message();

    //外部APIへCSVリストを取得しにいく
    post_data(getCsvNameListApi(),{"text" : ''},function(resp){
        if(resp['statusCode'] == 200){    
            // ドロップダウンリストにCSVファイルのリストを定義
            let file_list = document.getElementById("file_list");
            for(var i=0;i<resp['text'].length;i++){
                var target = document.createElement('option');
                target.innerText = resp['text'][i];
                target.setAttribute('value',i);
                file_list.appendChild(target);
                csv_item_list.push(resp['item'][i])
            }
        }else{
            //内部エラー時
            set_error_message("statusCode："+resp['statusCode']
                                +" "+resp['error_log']);
        }
    })
}

//問題取得
function get_question(){
    //メッセージをクリア
    clear_all_message();

    //エラーチェック、問題番号が範囲内か
    if(Number(file_num) == -1){
        set_error_message("問題ファイルを選択して下さい");
        return false;
    }else if(check_input_question_num(file_num)){
        set_error_message("エラー：問題("+file_name
                            +")の問題番号は1〜"+csv_item_list[file_num]
                            +"の範囲内で入力して下さい");
        return false;
    }

    //JSONデータ作成
    var data = {
        "text" : String(file_num)+'-'+String(question_num)
    }
    //外部APIへPOST通信、問題を取得しにいく
    post_data(getQuestionApi(),data,function(resp){
        if(resp['statusCode'] == 200){    
            let question = document.getElementById("question")
            let answer = document.getElementById("answer")
            sentense = resp.sentense === undefined ? "" : resp.sentense
            quiz_answer =  resp.answer === undefined ? "" : resp.answer

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

    //JSONデータ作成
    var data = {
        "text" : String(file_num)+'-'+String(question_num)
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
        "text" : String(file_num)+'-'+String(question_num)
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
        err = document.getElementById("answer_error")
        err.innerText = "問題文がありません。"
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