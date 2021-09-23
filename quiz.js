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
    //エラーメッセージをクリア
    clear_error_message();

    //XMLHttpRequest用意
    var xhr = new XMLHttpRequest();
    
    xhr.open('POST', getCsvNameListApi());
    xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8');
    //JSONデータ作成
    var data = {
        "text" : ''
    }
    //送信
    xhr.send( JSON.stringify(data) );

    //受信して結果を表示
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 && xhr.status === 200) {
            const text = JSON.parse(xhr.responseText);  
            if(text['statusCode'] == 200){    
                // ドロップダウンリストにCSVファイルのリストを定義
                let file_list = document.getElementById("file_list");
                for(var i=0;i<text['text'].length;i++){
                    var target = document.createElement('option');
                    target.innerText = text['text'][i];
                    target.setAttribute('value',i);
                    file_list.appendChild(target);
                    csv_item_list.push(text['item'][i])
                }
            }else{
                //内部エラー時
                set_error_message("statusCode："+text['statusCode']
                                    +" "+text['error_log']);
            }
        }
    }
}

function ajax_post(url){
    //エラーメッセージをクリア
    clear_error_message();
    
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

    //XMLHttpRequest用意
    var xhr = new XMLHttpRequest();

    xhr.open('POST', url);
    xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');
    //JSONデータ作成
    var data = {
        "text" : String(file_num)+'-'+String(question_num)
    }
    //送信
    xhr.send( JSON.stringify(data) );

    //受信して結果を表示
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 && xhr.status === 200) {
            const jsonObj = JSON.parse(xhr.responseText);      
            if(jsonObj['statusCode'] == 200){    
                let question = document.getElementById("question")
                let answer = document.getElementById("answer")
                sentense = jsonObj.sentense === undefined ? "" : jsonObj.sentense
                quiz_answer =  jsonObj.answer === undefined ? "" : jsonObj.answer

                question.textContent = sentense
                answer.textContent = ""
            }else{
                //内部エラー時
                set_error_message(jsonObj['statusCode']
                                    +" : "+jsonObj['error_log']);
            }
        }
    }
}

//答えの文を表示
function display_answer(){
    //エラーメッセージをクリア
    clear_error_message();

    if(sentense == ""){
        err = document.getElementById("answer_error")
        err.innerText = "問題文がありません。"
    }else{
        let answer = document.getElementById("answer")
        answer.textContent = quiz_answer
    }
}