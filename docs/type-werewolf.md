# 類型人狼 仕様メモ

## キャラクター

初期版ではDBテーブル化せず、固定配列で管理する。

画像配置:

```text
public/assets/games/type-werewolf/characters/
├─ james.png
├─ victoria.png
├─ ijun.png
├─ catherine.png
├─ masayoshi.png
├─ clara.png
├─ xiyue.png
└─ mohamed.png
```

キャラクター:

- james: ジェームズ
- victoria: ヴィクトリア
- ijun: イジュン
- catherine: カトリーヌ
- masayoshi: マサヨシ
- clara: クララ
- xiyue: シーユエ
- mohamed: モハメド

## 選択ルール

- 参加者は部屋への参加時にキャラクターを1人選択する
- 同じ部屋内で同一キャラクターを複数人が選択することは禁止
- 選択済みキャラクターは選択不可として表示する
- 待機中であれば自分のキャラクターを変更可能
- ゲーム開始後はキャラクター変更不可
- 部屋から退出した場合、そのキャラクターは再び選択可能
- 最大参加人数は8人
- キャラクター画像とキャラクター名はゲーム中も公開する
- キャラクターとTypring上のプロフィール情報はゲーム中に結び付けて表示しない
- ゲーム終了後の結果ページでは、キャラクター名と実際のプロフィール表示名を対応付けて表示する

## ゲーム中に公開してよい情報

- ゲーム専用の player_id
- 選択したキャラクターコード
- キャラクター名
- キャラクター画像
- 生存中または脱落済みの状態
- 残り推理チケット数
- チャット投稿
- 投票結果の通知

## ゲーム中に公開してはいけない情報

- auth.users の user_id
- profiles の user_id
- Typring上の表示名
- Xのハンドル
- プロフィール画像
- 自己紹介
- 登録済みの類型
- 過去の戦績から本人を特定できる情報

## DB方針

実装時は `game_room_players` に以下のカラムを持たせる。

```text
player_id uuid primary key
room_id uuid not null
character_code text not null
is_alive boolean not null default true
remaining_guess_tickets integer not null
joined_at timestamptz not null default now()
eliminated_at timestamptz null
```

`character_code` は固定8種のみ許可する。

同じ部屋内で `character_code` が重複しないように、`(room_id, character_code)` に unique 制約を設定する。

キャラクター選択処理はクライアント側だけで完結させず、RPCまたはサーバー側処理で競合を防止する。
