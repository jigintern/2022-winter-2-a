import { fetchJSON, fetchText } from "./fetch.js";

inputButton.onclick = async () => {
  // 文字列を反転する API にアクセスする
  // JSON 形式のパラメータを送る
  // サーバからのレスポンスも JSON 形式
  const data = await fetchJSON("/api/input", {
    message: inputInput.value,
  });
  console.log(data);

  // 反転した文字列でテキストボックスを書き換える
  Result.innerText=data.message;
};



