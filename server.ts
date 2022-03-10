import { serve } from "https://deno.land/std@0.127.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.127.0/http/file_server.ts";
import { format } from "https://deno.land/std@0.127.0/datetime/mod.ts";
import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts";

console.log("Listening on http://localhost:8000");
const databaseUrl = Deno.env.get("DATABASE_URL")!;

const pool = new postgres.Pool(databaseUrl, 3, true);

// Connect to the database
const connection = await pool.connect();
try {
  // Create the table
  await connection.queryObject`
    CREATE TABLE IF NOT EXISTS problems (
      lat SERIAL PRIMARY KEY,
      lng SERIAL,
      timestamp TEXT NOT NULL,
      subject TEXT NOT NULL
    )
  `;
} finally {
  // Release the connection back into the pool
  connection.release();
}

serve((req) => {
    const url = new URL(req.url);
    const pathname = url.pathname;

    console.log("Request:", req.method, pathname);
    console.log(Deno.env.get("DATABASE_URL"));


    // /api/ で始まる場合、API サーバっぽく処理して返す
    if (pathname.startsWith("/api/")) {
        switch (pathname) {
            case "/api/time":
                return apiTime(req);
            case "/api/asmd": // addition, subtraction, multiplication, division の頭文字
                return apiFourArithmeticOperations(req);
            case "/api/reverse":
                return apiReverse(req);
            case "/api/getjson":
                return apiGetJSON(req);
        }
    }

    // pathname に対応する static フォルダのファイルを返す（いわゆるファイルサーバ機能）
    // / → static/index.html
    // /hoge → static/hoge/index.html
    // /fuga.html → static/fuga.html
    // /img/piyo.jpg → static/img/piyo.jpg
    return serveDir(req, {
        fsRoot: "static",
        urlRoot: "",
        showDirListing: true,
        enableCors: true
    });
});

// 従来の function を使った関数宣言
// 現在の日時を返す API
function apiTime(req: Request) {
    return new Response(format(new Date(), "yyyy-MM-dd HH:mm:ss"));
}

// アロー関数を使った関数宣言
// クエリパラメータの x と y の四則演算の結果を JSON で返す API
const apiFourArithmeticOperations = (req: Request) => {
    const params = parseSearchParams(new URL(req.url));
    const x = params.x;
    const y = params.y;

    let addition = 0;
    let subtraction = 0;
    let multiplication = 0;
    let division = 0;
    if (typeof x === "number" && typeof y === "number") {
        addition = x + y;
        subtraction = x - y;
        multiplication = x * y;
        division = x / y;
    }
    return createJsonResponse({ x, y, addition, subtraction, multiplication, division });
}

// URL のクエリパラメータをパースする
const parseSearchParams = (url: URL) => {
    const params: Record<string, string | number | boolean> = {};
    for (const p of url.searchParams) {
        const n = p[0], v = p[1];
        if (v === "")
            params[n] = true;
        else if (v === "true")
            params[n] = true;
        else if (v === "false")
            params[n] = false;
        else if (!isNaN(Number(v)))
            params[n] = +v;
        else
            params[n] = v;
    }
    return params;
};

// JSON のレスポンスを生成する
const createJsonResponse = (obj: any) => new Response(JSON.stringify(obj), {
    headers: {
        "content-type": "application/json; charset=utf-8"
    }
});

// クライアントから送られてきた JSON の message の文字列を反転して返す API
// curl -X POST -d '{ "message": "hello" }' http://localhost:8000/api/reverse
// → {"message":"olleh"}
const apiReverse = async (req: Request) => {
    const json = (await req.json()) as ApiReversePayload;
    const message = json.message;
    const reversedMessage = message.split("").reverse().join("");
    return createJsonResponse({ message: reversedMessage });
};

type ApiReversePayload = {
    message: string;
};
type point = {
    lat: string;
    lng: string;
}
type SOSdata = {
    subject: string;
    currentLocation: point;
    timestamp: string;
}
const apiGetJSON = async (req: Request) =>{
    const connection = await pool.connect();
    const json = (await req.json()) as SOSdata;
    // Insert the new todo into the database
    try{
        await connection.queryObject`
        INSERT INTO problems (lat,lng,timestamp,subject) VALUES (${json.currentLocation.lat,json.currentLocation.lng,json.timestamp,json.subject})
        `;
    }finally {
        connection.release();
    }
    
    return createJsonResponse({message: json});
}

/*
// データベースに保存
const connection = await pool.connect();
try {
  await connection.queryObject`
    INSERT INTO todos (title) VALUES (${title})
  `;
} finally {
  connection.release();
}
*/
